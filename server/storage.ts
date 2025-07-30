import {
  users,
  sections,
  photos,
  contactMessages,
  type User,
  type UpsertUser,
  type Section,
  type InsertSection,
  type Photo,
  type InsertPhoto,
  type ContactMessage,
  type InsertContactMessage,
  type SectionWithPhotos,
  type PhotoWithSection,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Section operations
  getSections(): Promise<Section[]>;
  getSectionBySlug(slug: string): Promise<SectionWithPhotos | undefined>;
  createSection(section: InsertSection): Promise<Section>;
  updateSection(id: string, section: Partial<InsertSection>): Promise<Section>;
  deleteSection(id: string): Promise<void>;

  // Photo operations
  getPhotos(): Promise<PhotoWithSection[]>;
  getPhotosBySection(sectionId: string): Promise<Photo[]>;
  getPublishedPhotos(): Promise<PhotoWithSection[]>;
  getPublishedPhotosBySection(sectionSlug: string): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhoto(id: string, photo: Partial<InsertPhoto>): Promise<Photo>;
  deletePhoto(id: string): Promise<void>;
  incrementPhotoViews(id: string): Promise<void>;

  // Contact message operations
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  markMessageAsRead(id: string): Promise<void>;

  // Statistics
  getStats(): Promise<{
    totalPhotos: number;
    totalSections: number;
    totalViews: number;
    newMessages: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Section operations
  async getSections(): Promise<Section[]> {
    return await db.select().from(sections).orderBy(asc(sections.order), asc(sections.name));
  }

  async getSectionBySlug(slug: string): Promise<SectionWithPhotos | undefined> {
    const [section] = await db.select().from(sections).where(eq(sections.slug, slug));
    if (!section) return undefined;

    const sectionPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.sectionId, section.id))
      .orderBy(asc(photos.order), desc(photos.createdAt));

    return {
      ...section,
      photos: sectionPhotos,
    };
  }

  async createSection(section: InsertSection): Promise<Section> {
    const [newSection] = await db.insert(sections).values(section).returning();
    return newSection;
  }

  async updateSection(id: string, section: Partial<InsertSection>): Promise<Section> {
    const [updatedSection] = await db
      .update(sections)
      .set({ ...section, updatedAt: new Date() })
      .where(eq(sections.id, id))
      .returning();
    return updatedSection;
  }

  async deleteSection(id: string): Promise<void> {
    await db.delete(sections).where(eq(sections.id, id));
  }

  // Photo operations
  async getPhotos(): Promise<PhotoWithSection[]> {
    return await db
      .select({
        id: photos.id,
        title: photos.title,
        description: photos.description,
        filename: photos.filename,
        originalFilename: photos.originalFilename,
        mimeType: photos.mimeType,
        fileSize: photos.fileSize,
        width: photos.width,
        height: photos.height,
        sectionId: photos.sectionId,
        tags: photos.tags,
        isPublished: photos.isPublished,
        order: photos.order,
        views: photos.views,
        createdAt: photos.createdAt,
        updatedAt: photos.updatedAt,
        section: sections,
      })
      .from(photos)
      .leftJoin(sections, eq(photos.sectionId, sections.id))
      .orderBy(desc(photos.createdAt));
  }

  async getPhotosBySection(sectionId: string): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .where(eq(photos.sectionId, sectionId))
      .orderBy(asc(photos.order), desc(photos.createdAt));
  }

  async getPublishedPhotos(): Promise<PhotoWithSection[]> {
    return await db
      .select({
        id: photos.id,
        title: photos.title,
        description: photos.description,
        filename: photos.filename,
        originalFilename: photos.originalFilename,
        mimeType: photos.mimeType,
        fileSize: photos.fileSize,
        width: photos.width,
        height: photos.height,
        sectionId: photos.sectionId,
        tags: photos.tags,
        isPublished: photos.isPublished,
        order: photos.order,
        views: photos.views,
        createdAt: photos.createdAt,
        updatedAt: photos.updatedAt,
        section: sections,
      })
      .from(photos)
      .leftJoin(sections, eq(photos.sectionId, sections.id))
      .where(eq(photos.isPublished, true))
      .orderBy(asc(photos.order), desc(photos.createdAt));
  }

  async getPublishedPhotosBySection(sectionSlug: string): Promise<Photo[]> {
    const [section] = await db.select().from(sections).where(eq(sections.slug, sectionSlug));
    if (!section) return [];

    return await db
      .select()
      .from(photos)
      .where(eq(photos.sectionId, section.id))
      .orderBy(asc(photos.order), desc(photos.createdAt));
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }

  async updatePhoto(id: string, photo: Partial<InsertPhoto>): Promise<Photo> {
    const [updatedPhoto] = await db
      .update(photos)
      .set({ ...photo, updatedAt: new Date() })
      .where(eq(photos.id, id))
      .returning();
    return updatedPhoto;
  }

  async deletePhoto(id: string): Promise<void> {
    await db.delete(photos).where(eq(photos.id, id));
  }

  async incrementPhotoViews(id: string): Promise<void> {
    await db
      .update(photos)
      .set({ views: sql`views + 1` })
      .where(eq(photos.id, id));
  }

  // Contact message operations
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db
      .update(contactMessages)
      .set({ isRead: true })
      .where(eq(contactMessages.id, id));
  }

  // Statistics
  async getStats(): Promise<{
    totalPhotos: number;
    totalSections: number;
    totalViews: number;
    newMessages: number;
  }> {
    const [photoCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(photos);

    const [sectionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sections);

    const [viewsSum] = await db
      .select({ sum: sql<number>`coalesce(sum(views), 0)` })
      .from(photos);

    const [unreadMessages] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactMessages)
      .where(eq(contactMessages.isRead, false));

    return {
      totalPhotos: photoCount.count,
      totalSections: sectionCount.count,
      totalViews: viewsSum.sum,
      newMessages: unreadMessages.count,
    };
  }
}

export const storage = new DatabaseStorage();
