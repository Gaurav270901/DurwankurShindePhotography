import { z } from "zod";

// User interface for Firebase
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Photography sections (categories)
export interface Section {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Photography images
export interface Photo {
  id: string;
  title: string;
  description?: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  sectionId?: string;
  tags: string[];
  isPublished: boolean;
  order: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// Contact form messages
export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Insert schemas
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

export const insertSectionSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
});

export const insertPhotoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  filename: z.string().min(1).max(255),
  originalFilename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  fileSize: z.number().min(1),
  width: z.number().optional(),
  height: z.number().optional(),
  sectionId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(true),
  order: z.number().default(0),
});

export const insertContactMessageSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  service: z.string().max(100).optional(),
  message: z.string().min(1),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type LoginData = z.infer<typeof loginSchema>;

// Extended types with relations
export type SectionWithPhotos = Section & {
  photos: Photo[];
};

export type PhotoWithSection = Photo & {
  section: Section | null;
};
