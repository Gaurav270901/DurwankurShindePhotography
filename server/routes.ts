import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, register, login, getCurrentUser, type AuthRequest } from "./auth";
import { insertSectionSchema, insertPhotoSchema, insertContactMessageSchema } from "@shared/schema";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Firebase
  try {
    const { initializeFirebase } = await import('./firebase');
    initializeFirebase();
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }

  // Auth routes
  app.post('/api/register', register);
  app.post('/api/login', login);
  app.get('/api/user', authenticateToken, getCurrentUser);

  // Public routes - Gallery
  app.get('/api/sections', async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  app.get('/api/photos', async (req, res) => {
    try {
      const photos = await storage.getPublishedPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.get('/api/photos/section/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const photos = await storage.getPublishedPhotosBySection(slug);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos by section:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.post('/api/photos/:id/view', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementPhotoViews(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing photo views:", error);
      res.status(500).json({ message: "Failed to increment views" });
    }
  });

  // Contact form
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      if ((error as any).name === 'ZodError') {
        res.status(400).json({ message: "Invalid form data", errors: (error as any).errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // Serve uploaded images
  app.get('/api/images/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const imagePath = path.join(uploadsDir, filename);
      
      // Check if file exists
      await fs.access(imagePath);
      
      res.sendFile(imagePath);
    } catch (error) {
      res.status(404).json({ message: "Image not found" });
    }
  });

  // Protected admin routes
  app.get('/api/admin/stats', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/photos', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const photos = await storage.getPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching admin photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.get('/api/admin/sections', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching admin sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  app.get('/api/admin/messages', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Section management
  app.post('/api/admin/sections', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(validatedData);
      res.status(201).json(section);
    } catch (error) {
      console.error("Error creating section:", error);
      if ((error as any).name === 'ZodError') {
        res.status(400).json({ message: "Invalid section data", errors: (error as any).errors });
      } else {
        res.status(500).json({ message: "Failed to create section" });
      }
    }
  });

  app.put('/api/admin/sections/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSectionSchema.partial().parse(req.body);
      const section = await storage.updateSection(id, validatedData);
      res.json(section);
    } catch (error) {
      console.error("Error updating section:", error);
      if ((error as any).name === 'ZodError') {
        res.status(400).json({ message: "Invalid section data", errors: (error as any).errors });
      } else {
        res.status(500).json({ message: "Failed to update section" });
      }
    }
  });

  app.delete('/api/admin/sections/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSection(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ message: "Failed to delete section" });
    }
  });

  // Photo upload and management
  app.post('/api/admin/photos', authenticateToken, upload.single('photo'), async (req: AuthRequest, res) => {
    try {
      if (!(req as any).file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { title, description, sectionId, tags } = req.body;
      const file = (req as any).file;
      
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `${randomUUID()}${fileExtension}`;
      const filepath = path.join(uploadsDir, filename);

      // Process image with Sharp (resize and optimize)
      const imageBuffer = await sharp(file.buffer)
        .resize(2000, 2000, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();

      // Save processed image
      await fs.writeFile(filepath, imageBuffer);

      // Parse tags if provided
      const parsedTags = tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];

      const photoData = {
        title,
        description: description || '',
        filename,
        originalFilename: file.originalname,
        mimeType: 'image/jpeg', // All images are converted to JPEG
        fileSize: imageBuffer.length,
        width: metadata.width || 0,
        height: metadata.height || 0,
        sectionId: sectionId || null,
        tags: parsedTags,
        isPublished: true,
        order: 0,
      };

      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  app.put('/api/admin/photos/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Parse tags if provided
      if (updates.tags && typeof updates.tags === 'string') {
        updates.tags = updates.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      }

      const photo = await storage.updatePhoto(id, updates);
      res.json(photo);
    } catch (error) {
      console.error("Error updating photo:", error);
      res.status(500).json({ message: "Failed to update photo" });
    }
  });

  app.delete('/api/admin/photos/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      // Get photo to delete file
      const photos = await storage.getPhotos();
      const photo = photos.find(p => p.id === id);
      
      if (photo) {
        const filepath = path.join(uploadsDir, photo.filename);
        try {
          await fs.unlink(filepath);
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }

      await storage.deletePhoto(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Mark message as read
  app.patch('/api/admin/messages/:id/read', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.markMessageAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
