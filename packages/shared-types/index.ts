export interface ProjectStatus {
    message: string;
    isReady: boolean;
}

export interface Chunk {
    id: string;
    text: string;
    embedding?: number[];
    metadata: {
        source: string;
        chunkIndex: number
    }
}