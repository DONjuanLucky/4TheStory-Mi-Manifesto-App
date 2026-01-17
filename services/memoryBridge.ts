
import { pineconeService } from './pineconeService';

// This simulates the "WebSocket" or async worker that the user requested.
// It acts as a buffer between the high-speed voice conversation and the slower DB operations.

interface MemoryEvent {
    id: string;
    projectId: string;
    userId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

class MemoryBridge {
    private eventQueue: MemoryEvent[] = [];
    private isProcessing: boolean = false;
    private processingInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        // Start a background "worker" loop
        this.startWorker();
    }

    private startWorker() {
        if (this.processingInterval) return;
        this.processingInterval = setInterval(() => {
            this.processQueue();
        }, 5000); // Process every 5 seconds to batch updates (simulating a detached service)
    }

    public pushInteraction(projectId: string, userId: string, role: 'user' | 'assistant', content: string) {
        if (!content || content.trim().length < 5) return; // Ignore noise

        this.eventQueue.push({
            id: Math.random().toString(36).substring(7),
            projectId,
            userId,
            role,
            content,
            timestamp: new Date()
        });
        console.log(`[MemoryBridge] Queued ${role} interaction for async processing.`);
    }

    private async processQueue() {
        if (this.isProcessing || this.eventQueue.length === 0) return;

        this.isProcessing = true;
        const batch = [...this.eventQueue];
        this.eventQueue = []; // Clear queue

        console.log(`[MemoryBridge] Processing batch of ${batch.length} memories...`);

        // In a real "third party extraction" scenario, this might send data to a separate server via WebSocket.
        // Here, we process it asynchronously in the client.

        for (const event of batch) {
            try {
                // We combine metadata for better context retrieval later
                await pineconeService.storeMemory(
                    event.id,
                    event.content,
                    {
                        projectId: event.projectId,
                        userId: event.userId,
                        type: 'interaction',
                        summary: `${event.role} said: ${event.content.substring(0, 50)}...`,
                        timestamp: event.timestamp.toISOString()
                    }
                );
            } catch (e) {
                console.error("[MemoryBridge] Failed to store memory:", e);
                // Ideally, push back to queue or dead-letter queue
            }
        }

        this.isProcessing = false;
    }

    public async retrieveContextForSession(projectId: string, currentContext: string): Promise<string> {
        // This can be called at the start of a session to "preload" the agent
        const memories = await pineconeService.retrieveRelevantContext(currentContext, projectId, 3);
        return memories.join("\n\n");
    }
}

export const memoryBridge = new MemoryBridge();
