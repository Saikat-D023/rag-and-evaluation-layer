# RAG with Evaluation Layer

A scalable **Retrieval-Augmented Generation (RAG)** system built as a Turborepo monorepo. It ingests documents, stores semantic embeddings in Supabase, retrieves relevant context via hybrid search, and generates grounded LLM answers — complete with automated faithfulness evaluation and a streaming web API.

---

## Features

- **Document Ingestion** — Chunk large documents and store them with vector embeddings in Supabase (PostgreSQL + pgvector)
- **Hybrid Search** — Combines dense semantic search (pgvector cosine similarity) with sparse keyword matching (TF-IDF BM25) for best-of-both retrieval
- **LLM-Powered Answers** — Uses GPT-4o-mini to generate context-grounded responses from retrieved chunks
- **Streaming Web API** — Streams answers in real-time via Next.js App Router, with citation metadata prepended
- **Automated Evaluation** — LLM-as-a-Judge pipeline scores answer faithfulness (0–1) against a golden Q&A dataset and persists metrics to Supabase
- **Monorepo Architecture** — Clean separation of core logic, scripts, and web app via Turborepo

---

## 🎬 Demo

### Live Chat Demo
![Demo GIF](apps/web/public/demo.gif)

### Video Walkthrough
![Another Demo GIF](apps/web/public/demo2.gif)

---

## 🗂️ Project Structure

```
.
├── packages/
│   └── rag-core/
│       ├── index.ts        # Core RAG engine (chunking, embeddings, retrieval, generation)
│       └── supabase.ts     # Supabase client initialization
├── scripts/
│   ├── ingest.ts           # Document ingestion pipeline
│   ├── test-query.ts       # Semantic search debug script
│   ├── chat.ts             # Interactive terminal chatbot
│   └── run-eval.ts         # Automated faithfulness evaluator
├── apps/
│   └── web/
│       └── app/api/
│           ├── chat/route.ts    # Streaming chat API endpoint
│           └── ingest/route.ts  # Web-triggered ingestion endpoint
└── data/
    ├── raw/                # Source documents for ingestion
    └── golden-dataset/     # Q&A pairs for evaluation (qa-pairs.json)
```

---

## Core Engine (`packages/rag-core/index.ts`)

The heart of the system — all RAG business logic lives here as reusable, exported functions.

| Function | Description |
|---|---|
| `chunkText` | Splits raw text into smaller chunks (default: 500 chars) |
| `processTextIntoChunks` | Wraps `chunkText` and attaches source metadata |
| `generateEmbeddings` | Calls OpenAI `text-embedding-3-small` to produce vector embeddings |
| `syncChunksWithEmbeddings` | Orchestrates chunking + embedding + Supabase upsert |
| `retrieveRelevantChunks` | Pure vector search via Supabase RPC (`match_documents`) |
| `retrieveHybrid` | Semantic search + BM25 re-ranking for best retrieval quality |
| `generateAnswer` | End-to-end: retrieves top 2 chunks, prompts GPT-4o-mini for a grounded answer |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with `pgvector` enabled
- An OpenAI API key

### Environment Variables

Create a `.env` file at the repo root (or within the relevant package):

```env
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Install Dependencies

```bash
npm install
```

### Supabase Setup

Your Supabase database needs two tables and one RPC function:

1. A `documents` table to store chunks and embeddings
2. An `evaluation_runs` table for storing eval metrics
3. A `match_documents` RPC function for vector similarity search (uses `pgvector`)

> Refer to your Supabase migration files for the exact schema.

---

## Ingesting Documents

Place raw `.txt` files in `data/raw/`, then run:

```bash
npx ts-node scripts/ingest.ts
```

This chunks the text, generates OpenAI embeddings for each chunk, and upserts everything to Supabase.

---

## Testing Retrieval

To verify your vector search is returning relevant results without invoking the LLM:

```bash
npx ts-node scripts/test-query.ts
```

Prints raw retrieved chunks and their cosine similarity scores for a test query.

---

## Terminal Chatbot

Run a full end-to-end RAG chatbot in your terminal:

```bash
npx ts-node scripts/chat.ts
```

Type any question and receive a hybrid-search-grounded answer from GPT-4o-mini. Type `exit` to quit.

---

## Running Evaluations

Measure your system's faithfulness against a golden dataset:

```bash
npx ts-node scripts/run-eval.ts
```

For each Q&A pair in `data/golden-dataset/qa-pairs.json`, this script:
1. Runs the full retrieval + generation pipeline
2. Measures latency
3. Uses a second LLM call to score faithfulness (0 = hallucination, 1 = fully grounded)
4. Saves aggregated metrics to the `evaluation_runs` table in Supabase

### Golden Dataset Format

```json
[
  {
    "question": "What is retrieval-augmented generation?",
    "expected_answer": "RAG is a technique that..."
  }
]
```

---

## Web API

Start the Next.js web app:

```bash
cd apps/web
npm run dev
```

### `POST /api/chat`

Streams a RAG-generated answer to the client in real-time.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "What is RAG?" }
  ]
}
```

**Response:** A `ReadableStream` with citation metadata (source files, chunk IDs) prepended, followed by the streamed answer text.

### `POST /api/ingest`

Ingest new knowledge directly from the web UI.

**Request body:**
```json
{
  "text": "Your raw document content here...",
  "filename": "my-document.txt"
}
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | [Turborepo](https://turbo.build) |
| Web Framework | [Next.js](https://nextjs.org) (App Router) |
| Database | [Supabase](https://supabase.com) (PostgreSQL + pgvector) |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | OpenAI `gpt-4o-mini` |
| Keyword Search | `wink-bm25-text-search` (TF-IDF BM25) |
| Language | TypeScript |

---

## How Hybrid Search Works

1. The user's query is embedded into a vector using OpenAI
2. `pgvector` performs cosine similarity search to retrieve the top 10 semantically relevant chunks
3. Those 10 chunks are re-ranked using BM25 keyword scoring against the original query terms
4. The top 2 chunks are passed as context to the LLM

This approach combines the strengths of **semantic understanding** (vector search) and **exact keyword matching** (BM25), significantly improving retrieval precision over either method alone.

---

## 📄s License

MIT