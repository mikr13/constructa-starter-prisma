import { generateId } from '~/utils/id-generator';
import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'; // Import for type inference
// import { idGenerator } from '@/lib/utils'; // Assuming idGenerator is in lib/utils
//import { users } from './user.schema'; // Assuming user.schema.ts is in the same directory
//import { globalFiles } from './global-files.schema'; // Assuming global-files.schema.ts is in the same directory
// import { asyncTasks } from './async-tasks.schema'; // Assuming async-tasks.schema.ts is in the same directory
import { timestamps } from './_shared'; // Assuming _common.ts is in the same directory for timestamps

export const files = pgTable(
  'files',
  {
    id: text('id')
      .$defaultFn(() => generateId('files'))
      .primaryKey(),
    clientId: text('client_id').notNull().default('local'),
    key: text('key').notNull().unique(),
    mimeType: varchar('mime_type', { length: 255 }),
    // userId: text('user_id')
    //   .references(() => users.id, { onDelete: 'cascade' })
    //   .notNull(),
    fileType: varchar('file_type', { length: 255 }).notNull(),
    // fileHash: varchar('file_hash', { length: 64 }).references(() => globalFiles.hashId, {
    //   onDelete: 'no action',
    // }),
    name: text('name').notNull(),
    size: integer('size').notNull(),
    url: text('url').notNull(),
    ...timestamps,
  },
  (table) => [
    //index('file_hash_idx').on(table.fileHash),
    // uniqueIndex('files_client_id_user_id_unique').on(
    //   table.clientId,
    //   table.userId,
    // ),
  ]
);

// Export inferred types
export type File = InferSelectModel<typeof files>;
export type NewFile = InferInsertModel<typeof files>;
