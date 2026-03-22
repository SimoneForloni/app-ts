CREATE TYPE "public"."availability_status" AS ENUM('full_time', 'part_time', 'not_available');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('searching', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "project_members" (
	"user_id" integer,
	"project_id" integer,
	"role" text,
	"status" "membership_status" DEFAULT 'pending',
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "project_members_user_id_project_id_pk" PRIMARY KEY("user_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"owner_id" integer,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"objective" text,
	"image_url" text,
	"languages" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"status" "project_status" DEFAULT 'searching',
	"max_members" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"bio" text,
	"github_link" text,
	"reputation_score" integer DEFAULT 0,
	"availability" "availability_status" DEFAULT 'full_time',
	"role" "roles" DEFAULT 'user',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "reputation_non_negative" CHECK ("users"."reputation_score" >= 0)
);
--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "languages_gin_idx" ON "projects" USING gin ("languages");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "username_idx" ON "users" USING btree ("username");