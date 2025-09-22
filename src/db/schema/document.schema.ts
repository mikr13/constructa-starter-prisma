import { generateId } from '~/utils/id-generator';
import { integer, pgTable, text, vector, timestamp } from 'drizzle-orm/pg-core';
import { files } from './file.schema';
import { timestamps } from './_shared';

export const documents = pgTable('documents', {
  id: text('id')
    .$defaultFn(() => generateId('doc'))
    .primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  fileType: text('file_type'),
  filename: text('filename'),
  totalCharCount: integer('total_char_count'),
  totalLineCount: integer('total_line_count'),
  sourceType: text('source_type').notNull(),
  source: text('source'),
  fileId: text('file_id').references(() => files.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  clientId: text('client_id').default('local'),
  ...timestamps,
});

export const documentChunks = pgTable('document_chunks', {
  id: text('id')
    .$defaultFn(() => generateId('chunk'))
    .primaryKey(),
  fileId: text('file_id')
    .references(() => files.id, { onDelete: 'cascade' })
    .notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  text: text('text').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  ...timestamps,
});
