import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  uuid,
  doublePrecision,
  customType,
} from 'drizzle-orm/pg-core';

const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(1536)';
  },
  toDriver(val: number[]) {
    return `[${val.join(',')}]`;
  },
  fromDriver(val: string) {
    return val.replace('[', '').replace(']', '').split(',').map(Number);
  },
});

export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content'),
  metadata: jsonb('metadata'),
  embedding: vector('embedding'),
});

export const evaluationRuns = pgTable('evaluation_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  runAt: timestamp('run_at').notNull().defaultNow(),
  pipelineConfig: jsonb('pipeline_config'),
  metrics: jsonb('metrics'),
  perQuestion: jsonb('per_question'),
});

export const queryLogs = pgTable('query_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  query: text('query').notNull(),
  contexts: jsonb('contexts'),
  answer: text('answer'),
  latencyMs: integer('latency_ms'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(),
  fullName: text('full_name'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => chatSessions.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});
