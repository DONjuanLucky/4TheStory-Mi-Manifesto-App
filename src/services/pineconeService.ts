
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Interface for what we store
interface MemoryMetadata {
    projectId: string;
    userId: string;
    type: 'interaction' | 'chapter_content' | 'summary';
    summary: string;
    timestamp: string;
}

export class PineconeService {
    private client: Pinecone | null = null;
    private indexName: string = "mi-manifesto-memory";
    private genAi: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.PINECONE_API_KEY;
        if (apiKey) {
            this.client = new Pinecone({ apiKey });
        } else {
            console.warn("Pinecone API Key missing. Memory features will be disabled.");
        }

        // Using stable SDK for embeddings
        this.genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    private async getEmbedding(text: string): Promise<number[]> {
        if (!text) return [];
        try {
            const model = this.genAi.getGenerativeModel({ model: "text-embedding-004" });
            const result = await model.embedContent(text);
            return result.embedding.values;
        } catch (e) {
            console.error("Embedding Error:", e);
            return [];
        }
    }

    async storeMemory(
        id: string,
        text: string,
        metadata: MemoryMetadata
    ): Promise<void> {
        if (!this.client) return;

        const vector = await this.getEmbedding(text);
        if (vector.length === 0) return;

        const index = this.client.index(this.indexName);

        try {
            await index.upsert([{
                id,
                values: vector,
                metadata: {
                    ...metadata,
                    text: text // We store text in metadata to retrieve it later (Pinecone supports this)
                } as any
            }]);
            console.log(`[Pinecone] Stored memory: ${id}`);
        } catch (error) {
            console.error("Pinecone Upsert Error:", error);
        }
    }

    async retrieveRelevantContext(
        query: string,
        projectId: string,
        limit: number = 3
    ): Promise<string[]> {
        if (!this.client) return [];

        const vector = await this.getEmbedding(query);
        if (vector.length === 0) return [];

        const index = this.client.index(this.indexName);

        try {
            const result = await index.query({
                vector,
                topK: limit,
                filter: { projectId: projectId }, // Filter by project to ensure privacy/relevance
                includeMetadata: true
            });

            return result.matches
                .map(match => (match.metadata as any)?.text)
                .filter(text => !!text);

        } catch (error) {
            console.error("Pinecone Query Error:", error);
            return [];
        }
    }
}

export const pineconeService = new PineconeService();
