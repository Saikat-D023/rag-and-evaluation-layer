import { ProjectStatus } from "@repo/shared-types";

export function getRAGStatus(): ProjectStatus {
    return {
        message: "RAG core is initialized and communicating!",
        isReady: true
    };
}