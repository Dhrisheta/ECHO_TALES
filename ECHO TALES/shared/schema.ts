import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const voices = pgTable("voices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").references(() => users.id),
  voiceId: text("voice_id").notNull(), // External voice ID from ElevenLabs
  gender: text("gender").notNull(),
  type: text("type").notNull(), // e.g., 'custom', 'premium', 'free'
  isDefault: boolean("is_default").default(false),
});

export const narrations = pgTable("narrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  text: text("text").notNull(),
  voiceId: integer("voice_id").references(() => voices.id),
  emotion: text("emotion").notNull(),
  speed: text("speed").notNull(),
  pitch: text("pitch").notNull(),
  audioUrl: text("audio_url"),
  createdAt: text("created_at").notNull(),
});

// TTS Request Schema
export const ttsRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string(),
  emotion: z.string(),
  speed: z.number().min(0.5).max(2.0),
  pitch: z.number().min(-10).max(10),
});

export type TTSRequest = z.infer<typeof ttsRequestSchema>;

// Voice Schema
export const insertVoiceSchema = createInsertSchema(voices).omit({
  id: true,
});

export type InsertVoice = z.infer<typeof insertVoiceSchema>;
export type Voice = typeof voices.$inferSelect;

// Narration Schema
export const insertNarrationSchema = createInsertSchema(narrations).omit({
  id: true,
});

export type InsertNarration = z.infer<typeof insertNarrationSchema>;
export type Narration = typeof narrations.$inferSelect;

// User Schema
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Story Scene Schema
export const storySceneSchema = z.object({
  scene_number: z.number(),
  title: z.string(),
  content: z.string(),
  image_prompt: z.string(),
  image_url: z.string().optional(),
  audio_url: z.string().optional()
});

export type StoryScene = z.infer<typeof storySceneSchema>;

// Story Request Schema
export const storyRequestSchema = z.object({
  prompt: z.string().min(1, "Story prompt is required"),
  voiceId: z.string().min(1, "Voice ID is required"),
  emotion: z.string().default("neutral"),
  speed: z.number().min(0.5).max(2.0).default(1.0),
  pitch: z.number().min(-10).max(10).default(0)
});

export type StoryRequest = z.infer<typeof storyRequestSchema>;

// Story Response Schema
export const storyResponseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  scenes: z.array(storySceneSchema)
});

export type StoryResponse = z.infer<typeof storyResponseSchema>;
