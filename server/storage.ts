import {
  type User,
  type InsertUser,
  type Section,
  type InsertSection,
  type Photo,
  type InsertPhoto,
  type ContactMessage,
  type InsertContactMessage,
  type SectionWithPhotos,
  type PhotoWithSection,
} from "@shared/schema";
import { getDb } from "./firebase";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

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

export class FirebaseStorage implements IStorage {
  private db = getDb();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const doc = await this.db.collection('users').doc(id).get();
      if (!doc.exists) return undefined;
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date(),
      } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const snapshot = await this.db.collection('users').where('username', '==', username).limit(1).get();
      if (snapshot.empty) return undefined;
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date(),
      } as User;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const id = nanoid();
      const now = new Date();
      const userData = {
        ...user,
        createdAt: now,
        updatedAt: now,
      };
      await this.db.collection('users').doc(id).set(userData);
      return { id, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    try {
      const updateData = {
        ...user,
        updatedAt: new Date(),
      };
      await this.db.collection('users').doc(id).update(updateData);
      const updatedUser = await this.getUser(id);
      if (!updatedUser) throw new Error('User not found after update');
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Section operations
  async getSections(): Promise<Section[]> {
    try {
      const snapshot = await this.db.collection('sections').orderBy('order', 'asc').orderBy('name', 'asc').get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Section;
      });
    } catch (error) {
      console.error('Error getting sections:', error);
      return [];
    }
  }

  async getSectionBySlug(slug: string): Promise<SectionWithPhotos | undefined> {
    try {
      const sectionSnapshot = await this.db.collection('sections').where('slug', '==', slug).limit(1).get();
      if (sectionSnapshot.empty) return undefined;
      
      const sectionDoc = sectionSnapshot.docs[0];
      const sectionData = sectionDoc.data();
      const section = {
        id: sectionDoc.id,
        ...sectionData,
        createdAt: sectionData.createdAt?.toDate() || new Date(),
        updatedAt: sectionData.updatedAt?.toDate() || new Date(),
      } as Section;

      const photosSnapshot = await this.db.collection('photos')
        .where('sectionId', '==', section.id)
        .orderBy('order', 'asc')
        .orderBy('createdAt', 'desc')
        .get();

      const photos = photosSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Photo;
      });

      return { ...section, photos };
    } catch (error) {
      console.error('Error getting section by slug:', error);
      return undefined;
    }
  }

  async createSection(section: InsertSection): Promise<Section> {
    try {
      const id = nanoid();
      const now = new Date();
      const sectionData = {
        ...section,
        createdAt: now,
        updatedAt: now,
      };
      await this.db.collection('sections').doc(id).set(sectionData);
      return { id, ...sectionData };
    } catch (error) {
      console.error('Error creating section:', error);
      throw new Error('Failed to create section');
    }
  }

  async updateSection(id: string, section: Partial<InsertSection>): Promise<Section> {
    try {
      const updateData = {
        ...section,
        updatedAt: new Date(),
      };
      await this.db.collection('sections').doc(id).update(updateData);
      const doc = await this.db.collection('sections').doc(id).get();
      if (!doc.exists) throw new Error('Section not found');
      const data = doc.data()!;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Section;
    } catch (error) {
      console.error('Error updating section:', error);
      throw new Error('Failed to update section');
    }
  }

  async deleteSection(id: string): Promise<void> {
    try {
      await this.db.collection('sections').doc(id).delete();
    } catch (error) {
      console.error('Error deleting section:', error);
      throw new Error('Failed to delete section');
    }
  }

  // Photo operations
  async getPhotos(): Promise<PhotoWithSection[]> {
    try {
      const photosSnapshot = await this.db.collection('photos').orderBy('createdAt', 'desc').get();
      const photos: PhotoWithSection[] = [];

      for (const doc of photosSnapshot.docs) {
        const data = doc.data();
        const photo = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Photo;

        let section: Section | null = null;
        if (photo.sectionId) {
          const sectionDoc = await this.db.collection('sections').doc(photo.sectionId).get();
          if (sectionDoc.exists) {
            const sectionData = sectionDoc.data()!;
            section = {
              id: sectionDoc.id,
              ...sectionData,
              createdAt: sectionData.createdAt?.toDate() || new Date(),
              updatedAt: sectionData.updatedAt?.toDate() || new Date(),
            } as Section;
          }
        }

        photos.push({ ...photo, section });
      }

      return photos;
    } catch (error) {
      console.error('Error getting photos:', error);
      return [];
    }
  }

  async getPhotosBySection(sectionId: string): Promise<Photo[]> {
    try {
      const snapshot = await this.db.collection('photos')
        .where('sectionId', '==', sectionId)
        .orderBy('order', 'asc')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Photo;
      });
    } catch (error) {
      console.error('Error getting photos by section:', error);
      return [];
    }
  }

  async getPublishedPhotos(): Promise<PhotoWithSection[]> {
    try {
      const photosSnapshot = await this.db.collection('photos')
        .where('isPublished', '==', true)
        .orderBy('order', 'asc')
        .orderBy('createdAt', 'desc')
        .get();

      const photos: PhotoWithSection[] = [];

      for (const doc of photosSnapshot.docs) {
        const data = doc.data();
        const photo = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Photo;

        let section: Section | null = null;
        if (photo.sectionId) {
          const sectionDoc = await this.db.collection('sections').doc(photo.sectionId).get();
          if (sectionDoc.exists) {
            const sectionData = sectionDoc.data()!;
            section = {
              id: sectionDoc.id,
              ...sectionData,
              createdAt: sectionData.createdAt?.toDate() || new Date(),
              updatedAt: sectionData.updatedAt?.toDate() || new Date(),
            } as Section;
          }
        }

        photos.push({ ...photo, section });
      }

      return photos;
    } catch (error) {
      console.error('Error getting published photos:', error);
      return [];
    }
  }

  async getPublishedPhotosBySection(sectionSlug: string): Promise<Photo[]> {
    try {
      const sectionSnapshot = await this.db.collection('sections').where('slug', '==', sectionSlug).limit(1).get();
      if (sectionSnapshot.empty) return [];

      const sectionId = sectionSnapshot.docs[0].id;
      const photosSnapshot = await this.db.collection('photos')
        .where('sectionId', '==', sectionId)
        .where('isPublished', '==', true)
        .orderBy('order', 'asc')
        .orderBy('createdAt', 'desc')
        .get();

      return photosSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Photo;
      });
    } catch (error) {
      console.error('Error getting published photos by section:', error);
      return [];
    }
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    try {
      const id = nanoid();
      const now = new Date();
      const photoData = {
        ...photo,
        views: 0,
        createdAt: now,
        updatedAt: now,
      };
      await this.db.collection('photos').doc(id).set(photoData);
      return { id, ...photoData };
    } catch (error) {
      console.error('Error creating photo:', error);
      throw new Error('Failed to create photo');
    }
  }

  async updatePhoto(id: string, photo: Partial<InsertPhoto>): Promise<Photo> {
    try {
      const updateData = {
        ...photo,
        updatedAt: new Date(),
      };
      await this.db.collection('photos').doc(id).update(updateData);
      const doc = await this.db.collection('photos').doc(id).get();
      if (!doc.exists) throw new Error('Photo not found');
      const data = doc.data()!;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Photo;
    } catch (error) {
      console.error('Error updating photo:', error);
      throw new Error('Failed to update photo');
    }
  }

  async deletePhoto(id: string): Promise<void> {
    try {
      await this.db.collection('photos').doc(id).delete();
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw new Error('Failed to delete photo');
    }
  }

  async incrementPhotoViews(id: string): Promise<void> {
    try {
      const photoRef = this.db.collection('photos').doc(id);
      await this.db.runTransaction(async (transaction) => {
        const doc = await transaction.get(photoRef);
        if (doc.exists) {
          const currentViews = doc.data()?.views || 0;
          transaction.update(photoRef, { views: currentViews + 1 });
        }
      });
    } catch (error) {
      console.error('Error incrementing photo views:', error);
    }
  }

  // Contact message operations
  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      const snapshot = await this.db.collection('contactMessages').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as ContactMessage;
      });
    } catch (error) {
      console.error('Error getting contact messages:', error);
      return [];
    }
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    try {
      const id = nanoid();
      const messageData = {
        ...message,
        isRead: false,
        createdAt: new Date(),
      };
      await this.db.collection('contactMessages').doc(id).set(messageData);
      return { id, ...messageData };
    } catch (error) {
      console.error('Error creating contact message:', error);
      throw new Error('Failed to create contact message');
    }
  }

  async markMessageAsRead(id: string): Promise<void> {
    try {
      await this.db.collection('contactMessages').doc(id).update({ isRead: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('Failed to mark message as read');
    }
  }

  // Statistics
  async getStats(): Promise<{
    totalPhotos: number;
    totalSections: number;
    totalViews: number;
    newMessages: number;
  }> {
    try {
      const [photosSnapshot, sectionsSnapshot, messagesSnapshot] = await Promise.all([
        this.db.collection('photos').get(),
        this.db.collection('sections').get(),
        this.db.collection('contactMessages').where('isRead', '==', false).get(),
      ]);

      let totalViews = 0;
      photosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalViews += data.views || 0;
      });

      return {
        totalPhotos: photosSnapshot.size,
        totalSections: sectionsSnapshot.size,
        totalViews,
        newMessages: messagesSnapshot.size,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalPhotos: 0,
        totalSections: 0,
        totalViews: 0,
        newMessages: 0,
      };
    }
  }
}

export const storage = new FirebaseStorage();
