import { ProjectStatus } from "@repo/shared-types";

export function getRAGStatus(): ProjectStatus {
    return {
        message: "RAG core is initialized and communicating!",
        isReady: true
    };
}

export const chunkText = (text: string, size: number = 500): string[] => {
    const chunks: string[] = [];
    let index = 0;

    while (index < text.length) {
        chunks.push(text.slice(index, index + size));
        index += size;
    }

    return chunks;
};