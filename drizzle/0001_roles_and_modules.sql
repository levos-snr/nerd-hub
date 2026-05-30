ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'learner' NOT NULL;

CREATE TABLE IF NOT EXISTS "curriculum_modules" (
  "id" text PRIMARY KEY NOT NULL,
  "track" text NOT NULL,
  "title" text NOT NULL,
  "difficulty" text NOT NULL,
  "order_index" integer NOT NULL,
  "prerequisites" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "pass_score" integer DEFAULT 70 NOT NULL,
  "payload" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "curriculum_modules_order_idx" ON "curriculum_modules" ("order_index");
