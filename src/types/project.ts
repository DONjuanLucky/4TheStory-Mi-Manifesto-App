import { Timestamp } from "firebase/firestore";

export interface Project {
    id: string;
    userId: string;
    title: string;
    description?: string;
    genre?: string;
    content: string;
    wordCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CreateProjectData {
    title: string;
    description?: string;
    genre?: string;
}
