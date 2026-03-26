import { pgEnum, pgTable as table, check, uniqueIndex, index, unique } from 'drizzle-orm/pg-core';
import * as t from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// --- ENUMS ---
export const rolesEnum = pgEnum("roles", ["user", "admin"]);
export const projectStatusEnum = pgEnum("project_status", ["searching", "in_progress", "completed"]);
export const membershipStatusEnum = pgEnum("membership_status", ["pending", "accepted", "rejected"]);
export const availabilityEnum = pgEnum("availability_status", ["full_time", "part_time", "not_available"]);

// --- TABLES ---

export const users = table(
  'users', 
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    username: t.text("username").notNull().unique(),
    email: t.text("email").notNull().unique(),
    passwordHash: t.text("password_hash").notNull(),
    bio: t.text("bio"),
    githubLink: t.text("github_link"),
    reputationScore: t.integer("reputation_score").default(0),
    availability: availabilityEnum("availability").default("full_time"),
    role: rolesEnum("role").default("user"),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_username_idx").on(table.username),
    check("reputation_non_negative", sql`${table.reputationScore} >= 0`),
  ]
);

export const projects = table(
  'projects', 
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    ownerId: t.integer("owner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: t.text("title").notNull(),
    description: t.text("description"),
    objective: t.text("objective"),
    imageUrl: t.text("image_url"),
    languages: t.text("languages").array().default(sql`ARRAY[]::text[]`).notNull(),
    status: projectStatusEnum("status").default("searching").notNull(),
    maxMembers: t.integer("max_members").default(5).notNull(),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("projects_status_idx").on(table.status),
    index("projects_languages_gin_idx").using("gin", table.languages),
  ]
);

export const projectMembers = table(
  'project_members', 
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    ownerId: t.integer("owner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    projectId: t.integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
    role: t.text("role").default('Contributor').notNull(),
    status: membershipStatusEnum("status").default('pending').notNull(),
    joinedAt: t.timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    unique("project_members_user_project_unique").on(table.ownerId, table.projectId),
  ]
);