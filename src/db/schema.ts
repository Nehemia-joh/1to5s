import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["member", "admin"]);

export const taskStatus = pgEnum("task_status", [
  "not_started",
  "in_progress",
  "completed",
  "abandoned",
]);

export const attendanceStatus = pgEnum("attendance_status", [
  "submitted",
  "late",
  "not_submitted",
  "holiday",
  "weekend",
  "skipped",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRole("role").notNull().default("member"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const entries = pgTable(
  "entries",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    entryDate: date("entry_date").notNull(),
    blocker: text("blocker"),
    yesterdayComment: text("yesterday_comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("entries_user_date_unique").on(t.userId, t.entryDate), index("entries_date_idx").on(t.entryDate)],
);

export const entryTasks = pgTable(
  "entry_tasks",
  {
    id: serial("id").primaryKey(),
    entryId: integer("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    slot: smallint("slot").notNull(),
    taskText: text("task_text").notNull(),
    status: taskStatus("status"),
    statusUpdatedAt: timestamp("status_updated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("entry_tasks_entry_slot_unique").on(t.entryId, t.slot),
  ],
);

export const holidays = pgTable("holidays", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  label: text("label").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const extraDays = pgTable("extra_days", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  label: text("label"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attendance = pgTable(
  "attendance",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    date: date("date").notNull(),
    status: attendanceStatus("status").notNull(),
    reason: text("reason"),
    entryId: integer("entry_id").references(() => entries.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("attendance_user_date_unique").on(t.userId, t.date), index("attendance_date_idx").on(t.date)],
);

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  entries: many(entries),
  attendance: many(attendance),
}));

export const entriesRelations = relations(entries, ({ one, many }) => ({
  user: one(users, { fields: [entries.userId], references: [users.id] }),
  tasks: many(entryTasks),
}));

export const entryTasksRelations = relations(entryTasks, ({ one }) => ({
  entry: one(entries, { fields: [entryTasks.entryId], references: [entries.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, { fields: [attendance.userId], references: [users.id] }),
  entry: one(entries, { fields: [attendance.entryId], references: [entries.id] }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(users, { fields: [auditLog.actorId], references: [users.id] }),
}));

export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey().default(1),
  taskCarryoverEnabled: boolean("task_carryover_enabled").notNull().default(false),
});
