import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { db } from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema, insertPostSchema, insertProjectSchema, insertCommentSchema, insertResearchSchema, insertNewsSchema, insertReportSchema, insertJobSchema, insertJobApplicationSchema, insertCompetitionSchema, projects, research, news, users, posts, competitions, jobs } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { eq, sql, and } from "drizzle-orm";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

const JWT_SECRET = process.env.SESSION_SECRET || "archnet-jordan-secret-key";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    name: string;
    role: "admin" | "firm" | "engineer" | "student";
  };
}

type UserRole = "admin" | "firm" | "engineer" | "student";

// Role-based authorization middleware
const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role || "engineer")) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

// Admin-only middleware
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// JWT middleware
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch {
      // Token invalid, continue without user
    }
  }
  next();
};

export async function registerRoutes(app: Express): Promise<void> {
  // ==================== AUTH ROUTES ====================

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const { 
        email, password, name, username, role, title, bio, location,
        companySize, foundedYear, specializations, website, phone,
        workplace, yearsOfExperience,
        university, yearOfStudy, major, expectedGraduation,
        portfolioUrl
      } = result.data;

      // Check if user exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with role and profile info
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        username,
        role: role || "engineer",
        title: title || null,
        bio: bio || null,
        location: location || null,
        // Firm-specific
        companySize: companySize || null,
        foundedYear: foundedYear || null,
        specializations: specializations || null,
        website: website || null,
        phone: phone || null,
        // Engineer-specific
        workplace: workplace || null,
        yearsOfExperience: yearsOfExperience || null,
        // Student-specific
        university: university || null,
        yearOfStudy: yearOfStudy || null,
        major: major || null,
        expectedGraduation: expectedGraduation || null,
        // Portfolio
        portfolioUrl: portfolioUrl || null,
      });

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role || "engineer" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error: any) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const { email, password } = result.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role || "engineer" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  });

  // Forgot Password - generate reset token
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account exists, a reset link has been sent" });
      }

      const resetToken = jwt.sign(
        { id: user.id, email: user.email, type: "password-reset" },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ 
        message: "If an account exists, a reset link has been sent",
        resetToken
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset Password - use reset token to change password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }

      if (decoded.type !== "password-reset") {
        return res.status(400).json({ message: "Invalid reset token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.updateUser(decoded.id, { password: hashedPassword });

      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ==================== USER ROUTES ====================

  // Get users
  app.get("/api/users", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const users = await storage.getUsers(limit);
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user by username or ID
  app.get("/api/users/:usernameOrId", async (req, res) => {
    try {
      const param = req.params.usernameOrId;
      // Try to get by ID first (assuming UUIDs have specific pattern)
      let user = null;
      if (param.includes("-")) {
        // Likely a UUID
        user = await storage.getUser(param);
      }
      // If not found or not an ID, try username
      if (!user) {
        user = await storage.getUserByUsername(param);
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  // Get user stats (saved items count, projects count, followers count)
  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const userId = req.params.id;
      
      const [savedItems, projects, followerCount] = await Promise.all([
        storage.getSavedItems(userId),
        storage.getProjectsByUser(userId),
        storage.getFollowerCount(userId)
      ]);

      // Count saved books specifically
      const savedBooksCount = savedItems.filter(item => item.targetType === 'book').length;

      res.json({
        savedBooks: savedBooksCount,
        projects: projects.length,
        followers: followerCount
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.patch("/api/users/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user!.id !== req.params.id) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      const { password, ...updateData } = req.body;
      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Get user's posts
  app.get("/api/users/:id/posts", async (req, res) => {
    try {
      const posts = await storage.getPostsByUser(req.params.id);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  // Get user's projects
  app.get("/api/users/:id/projects", async (req, res) => {
    try {
      const projects = await storage.getProjectsByUser(req.params.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user projects" });
    }
  });

  // Get user's research papers
  app.get("/api/users/:id/research", async (req, res) => {
    try {
      const research = await storage.getResearchForUser(req.params.id);
      res.json(research);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user research" });
    }
  });

  // Get user's likes
  app.get("/api/users/:id/likes", async (req, res) => {
    try {
      const likes = await storage.getLikesByUser(req.params.id);
      res.json(likes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user likes" });
    }
  });

  // Get user's comments
  app.get("/api/users/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByUser(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user comments" });
    }
  });

  // Get user's news
  app.get("/api/users/:id/news", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.params.id;
      const isOwner = req.user?.id === userId;
      
      let whereClause;
      if (isOwner) {
        // Owner can see all their news regardless of status
        whereClause = eq(news.submittedById, userId);
      } else {
        // Non-owners can only see approved news
        whereClause = and(eq(news.submittedById, userId), eq(news.status, "approved"));
      }
      
      const userNews = await db.select().from(news).where(whereClause).orderBy(sql`${news.createdAt} DESC`);
      res.json(userNews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user news" });
    }
  });

  // Get follow status between current user and target user
  app.get("/api/follow-status/:userId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const follow = await storage.getFollowStatus(req.user!.id, req.params.userId);
      res.json({ status: follow?.status || null, follow });
    } catch (error) {
      res.status(500).json({ message: "Failed to get follow status" });
    }
  });

  // ==================== POSTS ROUTES ====================

  app.get("/api/posts", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      let posts = await storage.getPosts(limit);
      
      if (req.user?.id) {
        const mutedUsers = await storage.getMutedUsers(req.user.id);
        const mutedIds = new Set(mutedUsers.map(m => m.mutedId));
        posts = posts.filter(post => !mutedIds.has(post.authorId));
      }
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Unified feed endpoint - aggregates all content types
  app.get("/api/feed", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Fetch all content types in parallel
      const [postsData, projectsData, researchData, newsData, jobsData, competitionsData] = await Promise.all([
        storage.getPosts(limit),
        storage.getProjects(limit),
        req.user?.id ? storage.getResearchForUser(req.user.id, limit) : storage.getResearchApproved(limit),
        req.user?.id ? storage.getNewsForUser(req.user.id, limit) : storage.getNewsApproved(limit),
        storage.getJobs(limit),
        storage.getCompetitions(limit),
      ]);
      
      // Get author info for content
      const userIds = new Set<string>();
      postsData.forEach(p => p.authorId && userIds.add(p.authorId));
      projectsData.forEach(p => p.authorId && userIds.add(p.authorId));
      researchData.forEach(r => r.submittedById && userIds.add(r.submittedById));
      newsData.forEach(n => n.submittedById && userIds.add(n.submittedById));
      
      const usersMap = new Map<string, any>();
      for (const userId of userIds) {
        const user = await storage.getUser(userId);
        if (user) usersMap.set(userId, user);
      }
      
      // Transform to unified feed format
      const feedItems: any[] = [];
      
      // Add posts
      postsData.forEach(post => {
        const author = usersMap.get(post.authorId || '');
        feedItems.push({
          id: post.id,
          feedType: 'post',
          type: post.type,
          title: post.title,
          content: post.content,
          images: post.images,
          tags: post.tags,
          category: post.category,
          createdAt: post.createdAt,
          author: author ? {
            id: author.id,
            name: author.name,
            username: author.username,
            avatar: author.avatar,
            isVerified: author.isVerified,
            verificationType: author.verificationType,
          } : null,
          likesCount: post.likesCount || 0,
          commentsCount: post.commentsCount || 0,
        });
      });
      
      // Add projects
      projectsData.forEach(project => {
        const author = usersMap.get(project.authorId || '');
        feedItems.push({
          id: project.id,
          feedType: 'project',
          type: project.type,
          title: project.title,
          content: project.description,
          images: project.images || (project.coverImage ? [project.coverImage] : []),
          tags: project.tags,
          category: project.category,
          createdAt: project.createdAt,
          author: author ? {
            id: author.id,
            name: author.name,
            username: author.username,
            avatar: author.avatar,
            isVerified: author.isVerified,
            verificationType: author.verificationType,
          } : null,
          likesCount: 0,
          commentsCount: 0,
          location: project.location,
          year: project.year,
        });
      });
      
      // Add research
      researchData.forEach(paper => {
        const author = usersMap.get(paper.submittedById || '');
        feedItems.push({
          id: paper.id,
          feedType: 'research',
          type: 'research',
          title: paper.title,
          content: paper.abstract,
          images: paper.image ? [paper.image] : [],
          tags: [],
          category: paper.category,
          createdAt: paper.createdAt,
          author: author ? {
            id: author.id,
            name: author.name,
            username: author.username,
            avatar: author.avatar,
            isVerified: author.isVerified,
            verificationType: author.verificationType,
          } : { name: paper.authors },
          likesCount: 0,
          commentsCount: 0,
          university: paper.university,
          language: paper.language,
        });
      });
      
      // Add news
      newsData.forEach(item => {
        const author = usersMap.get(item.submittedById || '');
        feedItems.push({
          id: item.id,
          feedType: 'news',
          type: item.isEvent ? 'event' : 'news',
          title: item.title,
          content: item.content,
          images: item.images || (item.image ? [item.image] : []),
          tags: item.tags,
          category: item.category,
          createdAt: item.createdAt,
          author: author ? {
            id: author.id,
            name: author.name,
            username: author.username,
            avatar: author.avatar,
            isVerified: author.isVerified,
            verificationType: author.verificationType,
          } : { name: item.source || 'ArchNet' },
          likesCount: 0,
          commentsCount: 0,
          isEvent: item.isEvent,
          eventDate: item.eventDate,
          eventLocation: item.eventLocation,
        });
      });
      
      // Add jobs
      jobsData.forEach(job => {
        feedItems.push({
          id: job.id,
          feedType: 'job',
          type: job.type,
          title: job.title,
          content: job.description,
          images: [],
          tags: job.requirements || [],
          category: 'Career',
          createdAt: job.createdAt,
          author: { name: job.company },
          likesCount: 0,
          commentsCount: 0,
          company: job.company,
          location: job.location,
          salary: job.salary,
          jobType: job.type,
        });
      });
      
      // Add competitions
      competitionsData.forEach(comp => {
        feedItems.push({
          id: comp.id,
          feedType: 'competition',
          type: 'competition',
          title: comp.title,
          content: comp.description,
          images: comp.image ? [comp.image] : [],
          tags: [],
          category: comp.category,
          createdAt: comp.createdAt,
          author: { name: comp.organizer || 'Competition' },
          likesCount: 0,
          commentsCount: 0,
          deadline: comp.deadline,
          registrationDeadline: comp.registrationDeadline,
          prize: comp.prize,
          status: comp.status,
        });
      });
      
      // Filter muted users if authenticated
      let filteredItems = feedItems;
      if (req.user?.id) {
        const mutedUsers = await storage.getMutedUsers(req.user.id);
        const mutedIds = new Set(mutedUsers.map(m => m.mutedId));
        filteredItems = feedItems.filter(item => !item.author?.id || !mutedIds.has(item.author.id));
      }
      
      // Sort by createdAt descending
      filteredItems.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      // Apply limit
      const limitedItems = filteredItems.slice(0, limit);
      
      res.json(limitedItems);
    } catch (error) {
      console.error("Failed to fetch feed:", error);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userRole = req.user!.role;
      const postType = req.body.type || "text";
      
      // Role-based posting restrictions:
      // Students can only post text (academic) content
      // Engineers and Firms can post text and project (professional) content
      if (userRole === "student") {
        if (postType !== "text") {
          return res.status(403).json({ 
            message: "Students can only create academic (text) posts. Professional posts are reserved for engineers and firms." 
          });
        }
      } else if (userRole === "engineer" || userRole === "firm") {
        // Engineers and firms can post text and project types
        if (!["text", "project"].includes(postType)) {
          return res.status(403).json({ 
            message: "This post type is not available for your account type." 
          });
        }
      }
      
      const result = insertPostSchema.safeParse({ ...req.body, authorId: req.user!.id });
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const post = await storage.createPost(result.data);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.authorId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      await storage.deletePost(req.params.id);
      res.json({ message: "Post deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // ==================== PROJECTS ROUTES ====================

  app.get("/api/projects", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const projects = await storage.getProjects(limit);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userRole = req.user!.role;
      
      // Only engineers and firms can create projects (professional content)
      // Students cannot create projects
      if (userRole === "student") {
        return res.status(403).json({ 
          message: "Students cannot create projects. Projects are reserved for engineers and architectural firms." 
        });
      }
      
      if (userRole !== "engineer" && userRole !== "firm" && userRole !== "admin") {
        return res.status(403).json({ 
          message: "Only engineers and architectural firms can create projects." 
        });
      }
      
      const result = insertProjectSchema.safeParse({ ...req.body, authorId: req.user!.id });
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const project = await storage.createProject(result.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const isAdmin = req.user!.role === "admin";
      const isOwner = project.authorId === req.user!.id;
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to edit this project" });
      }
      
      const allowedFields = ["title", "description", "category", "projectType", "year", "conceptExplanation", "image", "images", "plans", "elevations", "sections", "conceptDiagrams"];
      const adminOnlyFields = ["status", "isFeatured", "authorId"];
      
      const updateData: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (field in req.body) {
          updateData[field] = req.body[field];
        }
      }
      if (isAdmin) {
        for (const field of adminOnlyFields) {
          if (field in req.body) {
            updateData[field] = req.body[field];
          }
        }
      }
      
      const updated = await storage.updateProject(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // ==================== COMPETITIONS ROUTES ====================

  app.get("/api/competitions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const competitions = await storage.getCompetitions(limit);
      res.json(competitions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch competitions" });
    }
  });

  app.get("/api/competitions/:id", async (req, res) => {
    try {
      const competition = await storage.getCompetition(req.params.id);
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      res.json(competition);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch competition" });
    }
  });

  // Create competition - Only firms can create competitions
  app.post("/api/competitions", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userRole = req.user!.role;
      
      // Only architectural firms can create competitions
      if (userRole !== "firm" && userRole !== "admin") {
        return res.status(403).json({ 
          message: "Only architectural firms can create competitions." 
        });
      }
      
      const result = insertCompetitionSchema.safeParse({ ...req.body, submittedById: req.user!.id });
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const competition = await storage.createCompetition(result.data);
      res.status(201).json(competition);
    } catch (error) {
      res.status(500).json({ message: "Failed to create competition" });
    }
  });

  // ==================== BOOKS ROUTES ====================

  app.get("/api/books", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const books = await storage.getBooks(limit);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  // ==================== JOBS ROUTES ====================

  app.get("/api/jobs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const jobs = await storage.getJobs(limit);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // Create job - Only firms can create job postings
  app.post("/api/jobs", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userRole = req.user!.role;
      
      // Only architectural firms can post jobs
      if (userRole !== "firm" && userRole !== "admin") {
        return res.status(403).json({ 
          message: "Only architectural firms can post job listings." 
        });
      }
      
      // Convert deadline string to Date if provided
      const jobData = { ...req.body, postedById: req.user!.id };
      if (jobData.deadline && typeof jobData.deadline === "string") {
        jobData.deadline = new Date(jobData.deadline);
      }
      
      const result = insertJobSchema.safeParse(jobData);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const job = await storage.createJob(result.data);
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  // ==================== JOB APPLICATIONS ROUTES ====================

  // Apply for a job
  app.post("/api/jobs/:jobId/apply", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { jobId } = req.params;
      const userId = req.user!.id;

      // Check if job exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if user already applied
      const existingApplication = await storage.getJobApplication(jobId, userId);
      if (existingApplication) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }

      const result = insertJobApplicationSchema.safeParse({
        jobId,
        userId,
        coverLetter: req.body.coverLetter,
        resumeUrl: req.body.resumeUrl,
        portfolioUrl: req.body.portfolioUrl,
        phone: req.body.phone,
        email: req.body.email,
        useArchNetProfile: req.body.useArchNetProfile ?? true,
      });

      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const application = await storage.createJobApplication(result.data);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error applying for job:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Get user's applications
  app.get("/api/my-applications", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const applications = await storage.getUserJobApplications(req.user!.id);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Check if user has applied to a job
  app.get("/api/jobs/:jobId/application", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const application = await storage.getJobApplication(req.params.jobId, req.user!.id);
      res.json({ hasApplied: !!application, application });
    } catch (error) {
      res.status(500).json({ message: "Failed to check application status" });
    }
  });

  // Get applications for a job (for firm owners)
  app.get("/api/jobs/:jobId/applications", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const job = await storage.getJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Only allow job poster or admin to view applications
      if (job.postedById !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view applications" });
      }

      const applications = await storage.getJobApplications(req.params.jobId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // ==================== RESEARCH ROUTES ====================

  app.get("/api/research", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      // Admin users see all research
      // Logged-in users see approved + their own items
      // Anonymous users only see approved
      const isAdmin = req.user?.role === "admin";
      let research;
      if (isAdmin) {
        research = await storage.getResearch(limit);
      } else if (req.user?.id) {
        research = await storage.getResearchForUser(req.user.id, limit);
      } else {
        research = await storage.getResearchApproved(limit);
      }
      res.json(research);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch research" });
    }
  });

  app.post("/api/research", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const result = insertResearchSchema.safeParse({ ...req.body, submittedById: req.user!.id });
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const research = await storage.createResearch(result.data);
      res.status(201).json(research);
    } catch (error) {
      res.status(500).json({ message: "Failed to create research" });
    }
  });

  app.get("/api/research/:id", async (req, res) => {
    try {
      const research = await storage.getResearchById(req.params.id);
      if (!research) {
        return res.status(404).json({ message: "Research not found" });
      }
      res.json(research);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch research" });
    }
  });

  // ==================== TOOLS ROUTES ====================

  app.get("/api/tools", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const tools = await storage.getTools(limit);
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.get("/api/tools/:id", async (req, res) => {
    try {
      const tool = await storage.getTool(req.params.id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  // ==================== COURSES ROUTES ====================

  app.get("/api/courses", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const courses = await storage.getCourses(limit);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // ==================== PLUGINS ROUTES ====================

  app.get("/api/plugins", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const software = req.query.software as string;
      let pluginList;
      if (software) {
        pluginList = await storage.getPluginsBySoftware(software, limit);
      } else {
        pluginList = await storage.getPlugins(limit);
      }
      res.json(pluginList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plugins" });
    }
  });

  app.get("/api/plugins/:id", async (req, res) => {
    try {
      const plugin = await storage.getPlugin(req.params.id);
      if (!plugin) {
        return res.status(404).json({ message: "Plugin not found" });
      }
      res.json(plugin);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plugin" });
    }
  });

  // ==================== NEWS ROUTES ====================

  app.get("/api/news", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      // Admin users see all news
      // Logged-in users see approved + their own items
      // Anonymous users only see approved
      const isAdmin = req.user?.role === "admin";
      let news;
      if (isAdmin) {
        news = await storage.getNews(limit);
      } else if (req.user?.id) {
        news = await storage.getNewsForUser(req.user.id, limit);
      } else {
        news = await storage.getNewsApproved(limit);
      }
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post("/api/news", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userRole = req.user!.role;
      
      // Only engineers and firms can create news and events
      // Students cannot create news/events
      if (userRole === "student") {
        return res.status(403).json({ 
          message: "Students cannot create news or events. This feature is reserved for engineers and architectural firms." 
        });
      }
      
      if (userRole !== "engineer" && userRole !== "firm" && userRole !== "admin") {
        return res.status(403).json({ 
          message: "Only engineers and architectural firms can create news and events." 
        });
      }
      
      // Convert date strings to Date objects for timestamp fields
      const processedBody = {
        ...req.body,
        submittedById: req.user!.id,
        publishDate: req.body.publishDate ? new Date(req.body.publishDate) : undefined,
        eventDate: req.body.eventDate ? new Date(req.body.eventDate) : undefined,
        eventEndDate: req.body.eventEndDate ? new Date(req.body.eventEndDate) : undefined,
      };
      const result = insertNewsSchema.safeParse(processedBody);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const news = await storage.createNews(result.data);
      res.status(201).json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to create news" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const news = await storage.getNewsById(req.params.id);
      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.put("/api/news/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const newsItem = await storage.getNewsById(req.params.id);
      if (!newsItem) {
        return res.status(404).json({ message: "News not found" });
      }
      const isAdmin = req.user!.role === "admin";
      const isOwner = newsItem.submittedById === req.user!.id;
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to edit this news" });
      }
      
      const allowedFields = ["title", "content", "category", "excerpt", "source", "sourceUrl", "image", "images", "pdfAttachment", "tags", "authorName", "authorEmail", "authorPhone", "location", "publishDate", "isEvent", "eventDate", "eventEndDate", "eventTime", "eventLocation", "eventPrice", "eventRegistrationUrl"];
      const adminOnlyFields = ["status", "featured", "submittedById"];
      
      const updateData: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (field in req.body) {
          if (["publishDate", "eventDate", "eventEndDate"].includes(field) && req.body[field]) {
            updateData[field] = new Date(req.body[field]);
          } else {
            updateData[field] = req.body[field];
          }
        }
      }
      if (isAdmin) {
        for (const field of adminOnlyFields) {
          if (field in req.body) {
            updateData[field] = req.body[field];
          }
        }
      }
      
      const updated = await storage.updateNews(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update news" });
    }
  });

  app.delete("/api/news/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const newsItem = await storage.getNewsById(req.params.id);
      if (!newsItem) {
        return res.status(404).json({ message: "News not found" });
      }
      const isAdmin = req.user!.role === "admin";
      const isOwner = newsItem.submittedById === req.user!.id;
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this news" });
      }
      await storage.deleteNews(req.params.id);
      res.json({ message: "News deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete news" });
    }
  });

  // ==================== LIKES ROUTES ====================

  app.post("/api/likes", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { targetType, targetId } = req.body;
      const isAlreadyLiked = await storage.isLiked(req.user!.id, targetType, targetId);
      
      if (isAlreadyLiked) {
        await storage.removeLike(req.user!.id, targetType, targetId);
        res.json({ liked: false });
      } else {
        await storage.addLike({ userId: req.user!.id, targetType, targetId });
        res.json({ liked: true });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get("/api/likes/:targetType/:targetId", async (req, res) => {
    try {
      const count = await storage.getLikeCount(req.params.targetType, req.params.targetId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get like count" });
    }
  });

  // ==================== COMMENTS ROUTES ====================

  app.get("/api/comments/:targetType/:targetId", async (req, res) => {
    try {
      const rawComments = await storage.getComments(req.params.targetType, req.params.targetId);
      
      // Enrich comments with user data and likes count
      const enrichedComments = await Promise.all(
        rawComments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          const likesCount = await storage.getLikeCount("comment", comment.id);
          return {
            ...comment,
            user: user ? { id: user.id, name: user.name, username: user.username, avatar: user.avatar } : null,
            likesCount,
          };
        })
      );
      
      res.json(enrichedComments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const result = insertCommentSchema.safeParse({ ...req.body, userId: req.user!.id });
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const comment = await storage.createComment(result.data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.delete("/api/comments/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const comment = await storage.getComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      if (comment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      await storage.deleteComment(req.params.id);
      res.json({ message: "Comment deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.patch("/api/comments/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const comment = await storage.getComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      if (comment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to edit this comment" });
      }
      const { content } = req.body;
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: "Content is required" });
      }
      const updated = await storage.updateComment(req.params.id, content.trim());
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  // ==================== REPORTS ROUTES ====================

  app.post("/api/reports", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const result = insertReportSchema.safeParse({ ...req.body, userId: req.user!.id });
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const report = await storage.createReport(result.data);
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // ==================== SAVED ITEMS ROUTES ====================

  app.get("/api/saved", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const items = await storage.getSavedItems(req.user!.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved items" });
    }
  });

  app.post("/api/saved", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { targetType, targetId } = req.body;
      const isAlreadySaved = await storage.isSaved(req.user!.id, targetType, targetId);
      
      if (isAlreadySaved) {
        await storage.unsaveItem(req.user!.id, targetType, targetId);
        res.json({ saved: false });
      } else {
        await storage.saveItem({ userId: req.user!.id, targetType, targetId });
        res.json({ saved: true });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle save" });
    }
  });

  // ==================== FOLLOW ROUTES ====================

  app.post("/api/follow", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { followingId } = req.body;
      
      if (req.user!.id === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      const isAlreadyFollowing = await storage.isFollowing(req.user!.id, followingId);
      
      if (isAlreadyFollowing) {
        await storage.unfollow(req.user!.id, followingId);
        res.json({ following: false });
      } else {
        await storage.follow({ followerId: req.user!.id, followingId });
        res.json({ following: true });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle follow" });
    }
  });

  app.get("/api/followers/:userId", async (req, res) => {
    try {
      const count = await storage.getFollowerCount(req.params.userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get follower count" });
    }
  });

  app.get("/api/following/:userId", async (req, res) => {
    try {
      const count = await storage.getFollowingCount(req.params.userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get following count" });
    }
  });

  // ==================== FOLLOW REQUESTS ROUTES ====================

  app.get("/api/follow-requests", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const requests = await storage.getPendingFollowRequests(req.user!.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follow requests" });
    }
  });

  app.post("/api/follow-requests/:id/accept", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const followerId = req.params.id;
      const follow = await storage.acceptFollowRequest(followerId, req.user!.id);
      if (!follow) {
        return res.status(404).json({ message: "Follow request not found" });
      }
      res.json({ message: "Follow request accepted", follow });
    } catch (error) {
      res.status(500).json({ message: "Failed to accept follow request" });
    }
  });

  app.post("/api/follow-requests/:id/reject", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const followerId = req.params.id;
      await storage.rejectFollowRequest(followerId, req.user!.id);
      res.json({ message: "Follow request rejected" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject follow request" });
    }
  });

  // ==================== BLOCK ROUTES ====================

  app.post("/api/block", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { blockedId } = req.body;
      
      if (!blockedId) {
        return res.status(400).json({ message: "blockedId is required" });
      }
      
      if (req.user!.id === blockedId) {
        return res.status(400).json({ message: "Cannot block yourself" });
      }

      const isAlreadyBlocked = await storage.isBlocked(req.user!.id, blockedId);
      if (isAlreadyBlocked) {
        return res.status(400).json({ message: "User is already blocked" });
      }

      const block = await storage.blockUser({ blockerId: req.user!.id, blockedId });
      res.status(201).json({ message: "User blocked", block });
    } catch (error) {
      res.status(500).json({ message: "Failed to block user" });
    }
  });

  app.delete("/api/block/:userId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const blockedId = req.params.userId;
      await storage.unblockUser(req.user!.id, blockedId);
      res.json({ message: "User unblocked" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unblock user" });
    }
  });

  app.get("/api/blocked", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const blockedUsers = await storage.getBlockedUsers(req.user!.id);
      res.json(blockedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blocked users" });
    }
  });

  // ==================== MUTE ROUTES ====================

  app.post("/api/mute", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { mutedId } = req.body;
      
      if (!mutedId) {
        return res.status(400).json({ message: "mutedId is required" });
      }
      
      if (req.user!.id === mutedId) {
        return res.status(400).json({ message: "Cannot mute yourself" });
      }

      const isAlreadyMuted = await storage.isMuted(req.user!.id, mutedId);
      if (isAlreadyMuted) {
        return res.status(400).json({ message: "User is already muted" });
      }

      const mute = await storage.muteUser({ muterId: req.user!.id, mutedId });
      res.status(201).json({ message: "User muted", mute });
    } catch (error) {
      res.status(500).json({ message: "Failed to mute user" });
    }
  });

  app.delete("/api/mute/:userId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const mutedId = req.params.userId;
      await storage.unmuteUser(req.user!.id, mutedId);
      res.json({ message: "User unmuted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unmute user" });
    }
  });

  app.get("/api/muted", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const mutedUsers = await storage.getMutedUsers(req.user!.id);
      res.json(mutedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch muted users" });
    }
  });

  // ==================== UNIVERSITY MEMBERSHIPS ROUTES ====================

  // Get university memberships for a specific university
  app.get("/api/university/:universityId/members", async (req, res) => {
    try {
      const { universityId } = req.params;
      const memberships = await storage.getUniversityMembers(universityId);
      res.json(memberships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch university members" });
    }
  });

  // Get user's university memberships
  app.get("/api/university-memberships", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const memberships = await storage.getUserUniversityMemberships(req.user!.id);
      res.json(memberships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch university memberships" });
    }
  });

  // Request to join a university community
  app.post("/api/university/:universityId/join", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { universityId } = req.params;
      
      // Check if already a member or has pending request
      const existingMembership = await storage.getUniversityMembership(req.user!.id, universityId);
      if (existingMembership) {
        if (existingMembership.status === "accepted") {
          return res.status(400).json({ message: "Already a member of this university community" });
        } else if (existingMembership.status === "pending") {
          return res.status(400).json({ message: "Join request already pending" });
        }
      }

      const membership = await storage.createUniversityMembership({
        userId: req.user!.id,
        universityId,
        status: "pending"
      });
      res.status(201).json(membership);
    } catch (error) {
      res.status(500).json({ message: "Failed to join university community" });
    }
  });

  // Leave a university community
  app.delete("/api/university/:universityId/leave", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { universityId } = req.params;
      await storage.deleteUniversityMembership(req.user!.id, universityId);
      res.json({ message: "Left university community" });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave university community" });
    }
  });

  // Cancel join request
  app.delete("/api/university/:universityId/cancel-request", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { universityId } = req.params;
      await storage.deleteUniversityMembership(req.user!.id, universityId);
      res.json({ message: "Join request cancelled" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel join request" });
    }
  });

  // Admin: Accept or reject membership requests
  app.patch("/api/university-membership/:membershipId", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { membershipId } = req.params;
      const { status } = req.body;
      
      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await storage.updateUniversityMembershipStatus(membershipId, status);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update membership status" });
    }
  });

  // ==================== NOTIFICATIONS ROUTES ====================

  app.get("/api/notifications", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const notifications = await storage.getNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/read-all", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.markAllNotificationsRead(req.user!.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  // ==================== MESSAGES ROUTES ====================

  app.get("/api/messages/conversations", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const allMessages = await storage.getMessages(req.user!.id);
      const userMap = new Map<string, { lastMessage: any; unread: number }>();
      
      allMessages.forEach((msg) => {
        const otherId = msg.senderId === req.user!.id ? msg.receiverId : msg.senderId;
        const existing = userMap.get(otherId);
        const msgDate = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
        const existingDate = existing?.lastMessage.createdAt ? new Date(existing.lastMessage.createdAt).getTime() : 0;
        const isUnread = !msg.isRead && msg.receiverId === req.user!.id;
        
        if (!existing || msgDate > existingDate) {
          userMap.set(otherId, { 
            lastMessage: msg, 
            unread: isUnread ? (existing?.unread || 0) + 1 : (existing?.unread || 0)
          });
        } else if (isUnread) {
          existing.unread += 1;
        }
      });

      const conversations = [];
      const entries = Array.from(userMap.entries());
      for (const [oderId, data] of entries) {
        const otherUser = await storage.getUser(oderId);
        conversations.push({
          id: oderId,
          user: {
            id: oderId,
            name: otherUser?.name || "User",
            avatar: otherUser?.avatar || null,
          },
          lastMessage: data.lastMessage.content,
          lastMessageAt: data.lastMessage.createdAt,
          unread: data.unread,
        });
      }

      conversations.sort((a, b) => {
        const aDate = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bDate = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bDate - aDate;
      });

      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const messages = await storage.getMessages(req.user!.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/:userId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const messages = await storage.getConversation(req.user!.id, req.params.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { receiverId, content } = req.body;
      
      if (!receiverId || !content) {
        return res.status(400).json({ message: "receiverId and content are required" });
      }

      const isBlockedByReceiver = await storage.isBlocked(receiverId, req.user!.id);
      if (isBlockedByReceiver) {
        return res.status(403).json({ message: "Cannot send message to this user" });
      }

      const hasBlockedReceiver = await storage.isBlocked(req.user!.id, receiverId);
      if (hasBlockedReceiver) {
        return res.status(403).json({ message: "Cannot send message to a blocked user" });
      }

      const message = await storage.createMessage({
        senderId: req.user!.id,
        receiverId,
        content,
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch("/api/messages/:id/read", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.markMessageRead(req.params.id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // ==================== ADMIN ROUTES ====================

  // GET /api/admin/users - List all users with pagination
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const allUsers = await storage.getUsers(limit + offset);
      const users = allUsers.slice(offset, offset + limit);
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);

      res.json({
        data: usersWithoutPasswords,
        pagination: {
          page,
          limit,
          total: allUsers.length,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // PUT /api/admin/users/:id/role - Update user role
  app.put("/api/admin/users/:id/role", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { role } = req.body;
      const validRoles: UserRole[] = ["admin", "firm", "engineer", "student"];

      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      const user = await storage.updateUser(req.params.id, { role });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // DELETE /api/admin/users/:id - Delete user
  app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.id === req.user!.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.updateUser(req.params.id, { email: `deleted_${Date.now()}_${user.email}` });
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // GET /api/admin/pending-content - Get all pending research/news/projects for approval
  app.get("/api/admin/pending-content", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const pendingProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.status, "pending"));

      const pendingResearch = await db
        .select()
        .from(research)
        .where(eq(research.status, "pending"));

      const pendingNews = await db
        .select()
        .from(news)
        .where(eq(news.status, "pending"));

      res.json({
        projects: pendingProjects,
        research: pendingResearch,
        news: pendingNews,
        total: pendingProjects.length + pendingResearch.length + pendingNews.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending content" });
    }
  });

  // PUT /api/admin/content/:type/:id/approve - Approve content
  app.put("/api/admin/content/:type/:id/approve", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { type, id } = req.params;
      const validTypes = ["project", "research", "news"];

      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid content type" });
      }

      let result;

      if (type === "project") {
        const [updated] = await db
          .update(projects)
          .set({ status: "approved" })
          .where(eq(projects.id, id))
          .returning();
        result = updated;
      } else if (type === "research") {
        const [updated] = await db
          .update(research)
          .set({ status: "approved" })
          .where(eq(research.id, id))
          .returning();
        result = updated;
      } else if (type === "news") {
        const [updated] = await db
          .update(news)
          .set({ status: "approved" })
          .where(eq(news.id, id))
          .returning();
        result = updated;
      }

      if (!result) {
        return res.status(404).json({ message: `${type} not found` });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve content" });
    }
  });

  // PUT /api/admin/content/:type/:id/reject - Reject content
  app.put("/api/admin/content/:type/:id/reject", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { type, id } = req.params;
      const validTypes = ["project", "research", "news"];

      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid content type" });
      }

      let result;

      if (type === "project") {
        const [updated] = await db
          .update(projects)
          .set({ status: "rejected" })
          .where(eq(projects.id, id))
          .returning();
        result = updated;
      } else if (type === "research") {
        const [updated] = await db
          .update(research)
          .set({ status: "rejected" })
          .where(eq(research.id, id))
          .returning();
        result = updated;
      } else if (type === "news") {
        const [updated] = await db
          .update(news)
          .set({ status: "rejected" })
          .where(eq(news.id, id))
          .returning();
        result = updated;
      }

      if (!result) {
        return res.status(404).json({ message: `${type} not found` });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject content" });
    }
  });

  // GET /api/admin/stats - Get system stats
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const userCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users);

      const postCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(posts);

      const projectCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects);

      const newsCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(news);

      const researchCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(research);

      const competitionCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(competitions);

      const jobCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobs);

      const pendingProjectsCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(eq(projects.status, "pending"));

      const pendingNewsCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(news)
        .where(eq(news.status, "pending"));

      const pendingResearchCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(research)
        .where(eq(research.status, "pending"));

      res.json({
        users: userCount[0]?.count || 0,
        posts: postCount[0]?.count || 0,
        projects: projectCount[0]?.count || 0,
        news: newsCount[0]?.count || 0,
        research: researchCount[0]?.count || 0,
        competitions: competitionCount[0]?.count || 0,
        jobs: jobCount[0]?.count || 0,
        pending: {
          projects: pendingProjectsCount[0]?.count || 0,
          news: pendingNewsCount[0]?.count || 0,
          research: pendingResearchCount[0]?.count || 0,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ==================== OBJECT STORAGE ROUTES ====================
  registerObjectStorageRoutes(app);
}
