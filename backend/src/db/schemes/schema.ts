import { pgEnum, pgTable as table, primaryKey, check } from 'drizzle-orm/pg-core';
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
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    username: t.text().notNull().unique(),
    email: t.text().notNull().unique(),
    passwordHash: t.text('password_hash').notNull(),
    bio: t.text(),
    githubLink: t.text('github_link'),
    reputationScore: t.integer('reputation_score').default(0),
    availability: availabilityEnum().default("full_time"),
    role: rolesEnum().default("user"),
    createdAt: t.timestamp('created_at').defaultNow(),
  },
  (table) => [
    t.uniqueIndex("email_idx").on(table.email),
    t.index("username_idx").on(table.username),
    // Garantisce l'integrità del punteggio a livello di database
    check("reputation_non_negative", sql`${table.reputationScore} >= 0`),
  ]
);

export const projects = table(
  'projects', 
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    ownerId: t.integer('owner_id').references(() => users.id, { onDelete: 'cascade' }),
    title: t.text().notNull(),
    description: t.text(),
    objective: t.text(),
    imageUrl: t.text('image_url'),
    // Inizializzato come array vuoto per evitare problemi con l'indice GIN
    languages: t.text().array().notNull().default(sql`ARRAY[]::text[]`),
    status: projectStatusEnum().default("searching"),
    maxMembers: t.integer('max_members').default(5),
    createdAt: t.timestamp('created_at').defaultNow(),
  },
  (table) => [
    t.index("status_idx").on(table.status),
    // Indice GIN per ottimizzare le ricerche all'interno dell'array delle lingue
    t.index("languages_gin_idx").using("gin", table.languages),
  ]
);

export const projectMembers = table(
  'project_members', 
  {
    userId: t.integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    projectId: t.integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    role: t.text(), // es. "Frontend Developer"
    status: membershipStatusEnum().default("pending"),
    joinedAt: t.timestamp('joined_at').defaultNow(),
  },
  (table) => [
    // Chiave primaria composta per evitare iscrizioni duplicate dello stesso utente
    primaryKey({ columns: [table.userId, table.projectId] }),
  ]
);