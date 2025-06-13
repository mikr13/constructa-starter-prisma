ALTER TABLE "files" ALTER COLUMN "client_id" SET DEFAULT 'local';--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "status" varchar(32) DEFAULT 'ready' NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "mime_type" varchar(255);--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_key_unique" UNIQUE("key");