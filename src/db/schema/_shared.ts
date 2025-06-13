import { timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const createdAt = () => timestamptz('created_at').notNull().defaultNow();
export const updatedAt = () => timestamptz('updated_at').notNull().defaultNow().$onUpdate(() => sql`CURRENT_TIMESTAMP`);
export const accessedAt = () => timestamptz('accessed_at').notNull().defaultNow();

export const timestamps = {
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  accessedAt: accessedAt(),
};