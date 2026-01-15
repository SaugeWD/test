import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "firm", "engineer", "student"]);
export const verificationTypeEnum = pgEnum("verification_type", ["architect", "firm", "student", "educator"]);
export const postTypeEnum = pgEnum("post_type", ["text", "project", "competition", "news"]);
export const jobTypeEnum = pgEnum("job_type", ["full-time", "part-time", "internship", "freelance", "contract"]);
export const competitionStatusEnum = pgEnum("competition_status", ["upcoming", "ongoing", "closed"]);
export const contentStatusEnum = pgEnum("content_status", ["pending", "approved", "rejected"]);
export const followStatusEnum = pgEnum("follow_status", ["pending", "accepted", "rejected"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  role: userRoleEnum("role").default("engineer"),
  title: text("title"),
  bio: text("bio"),
  location: text("location"),
  avatar: text("avatar"),
  isVerified: boolean("is_verified").default(false),
  verificationType: verificationTypeEnum("verification_type"),
  // Firm-specific fields
  companySize: text("company_size"),
  foundedYear: text("founded_year"),
  specializations: text("specializations").array(),
  website: text("website"),
  phone: text("phone"),
  // Engineer-specific fields
  workplace: text("workplace"),
  yearsOfExperience: text("years_of_experience"),
  // Student-specific fields
  university: text("university"),
  yearOfStudy: text("year_of_study"),
  major: text("major"),
  expectedGraduation: text("expected_graduation"),
  // Portfolio sample (optional for all)
  portfolioUrl: text("portfolio_url"),
  // Privacy settings
  isActivityPublic: boolean("is_activity_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  projects: many(projects),
  followers: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  notifications: many(notifications),
  savedItems: many(savedItems),
  likes: many(likes),
  comments: many(comments),
}));

// Follows table (user connections)
export const follows = pgTable("follows", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id", { length: 36 }).notNull().references(() => users.id),
  followingId: varchar("following_id", { length: 36 }).notNull().references(() => users.id),
  status: followStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blocked Users table
export const blockedUsers = pgTable("blocked_users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  blockerId: varchar("blocker_id", { length: 36 }).notNull().references(() => users.id),
  blockedId: varchar("blocked_id", { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Muted Users table
export const mutedUsers = pgTable("muted_users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  muterId: varchar("muter_id", { length: 36 }).notNull().references(() => users.id),
  mutedId: varchar("muted_id", { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: "following" }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: "followers" }),
}));

// Posts table (feed posts)
export const posts = pgTable("posts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id", { length: 36 }).notNull().references(() => users.id),
  type: postTypeEnum("type").notNull().default("text"),
  content: text("content").notNull(),
  title: text("title"),
  image: text("image"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  likes: many(likes),
  comments: many(comments),
}));

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id", { length: 36 }).notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  projectType: text("project_type"), // academic, professional
  year: text("year"),
  image: text("image"),
  images: text("images").array(),
  plans: text("plans").array(),
  elevations: text("elevations").array(),
  sections: text("sections").array(),
  conceptDiagrams: text("concept_diagrams").array(),
  conceptExplanation: text("concept_explanation"),
  isFeatured: boolean("is_featured").default(false),
  status: contentStatusEnum("status").default("approved"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  author: one(users, { fields: [projects.authorId], references: [users.id] }),
  likes: many(likes),
  comments: many(comments),
}));

// Competitions table
export const competitions = pgTable("competitions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  prize: text("prize"),
  deadline: timestamp("deadline"),
  status: competitionStatusEnum("status").default("upcoming"),
  image: text("image"),
  requirements: text("requirements"),
  organizer: text("organizer"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const competitionsRelations = relations(competitions, ({ many }) => ({
  likes: many(likes),
  comments: many(comments),
}));

// Books table
export const books = pgTable("books", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author"),
  description: text("description"),
  category: text("category"),
  subcategory: text("subcategory"),
  publisher: text("publisher"),
  isbn: text("isbn"),
  language: text("language").default("English"),
  image: text("image"),
  downloadUrl: text("download_url"),
  pageCount: integer("page_count"),
  publishedYear: text("published_year"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const booksRelations = relations(books, ({ many }) => ({
  likes: many(likes),
  comments: many(comments),
}));

// Jobs table
export const jobs = pgTable("jobs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  postedById: varchar("posted_by_id", { length: 36 }).references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  type: jobTypeEnum("type").default("full-time"),
  level: text("level"), // Senior, Junior, Mid-level, Entry-level
  category: text("category"), // Engineering Office, Architecture Firm, etc.
  isPaid: boolean("is_paid").default(true),
  description: text("description"),
  requirements: text("requirements"),
  salary: text("salary"),
  applicationUrl: text("application_url"),
  isActive: boolean("is_active").default(true),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  postedBy: one(users, { fields: [jobs.postedById], references: [users.id] }),
  applications: many(jobApplications),
}));

// Job Applications
export const jobApplications = pgTable("job_applications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id", { length: 36 }).notNull().references(() => jobs.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  coverLetter: text("cover_letter"),
  resumeUrl: text("resume_url"),
  portfolioUrl: text("portfolio_url"),
  phone: text("phone"),
  email: text("email"),
  useArchNetProfile: boolean("use_archnet_profile").default(true),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  job: one(jobs, { fields: [jobApplications.jobId], references: [jobs.id] }),
  user: one(users, { fields: [jobApplications.userId], references: [users.id] }),
}));

// Research papers
export const research = pgTable("research", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  submittedById: varchar("submitted_by_id", { length: 36 }).references(() => users.id),
  title: text("title").notNull(),
  authors: text("authors"),
  abstract: text("abstract"),
  university: text("university"),
  category: text("category"),
  language: text("language").default("English"),
  image: text("image"),
  pdfUrl: text("pdf_url"),
  publishedYear: text("published_year"),
  citations: integer("citations").default(0),
  status: contentStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const researchRelations = relations(research, ({ one, many }) => ({
  submittedBy: one(users, { fields: [research.submittedById], references: [users.id] }),
  likes: many(likes),
  comments: many(comments),
}));

// Tools/Software
export const tools = pgTable("tools", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  purpose: text("purpose"),
  history: text("history"),
  usageInArchitecture: text("usage_in_architecture"),
  category: text("category"),
  type: text("type").default("software"),
  image: text("image"),
  website: text("website"),
  isPaid: boolean("is_paid").default(false),
  pricing: text("pricing"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const toolsRelations = relations(tools, ({ many }) => ({
  likes: many(likes),
}));

// Courses
export const courses = pgTable("courses", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  instructor: text("instructor"),
  platform: text("platform"),
  duration: text("duration"),
  level: text("level"),
  category: text("category"),
  image: text("image"),
  website: text("website"),
  isPaid: boolean("is_paid").default(false),
  price: text("price"),
  rating: text("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  likes: many(likes),
}));

// Plugins
export const plugins = pgTable("plugins", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  software: text("software").notNull(),
  category: text("category"),
  developer: text("developer"),
  website: text("website"),
  isPaid: boolean("is_paid").default(false),
  price: text("price"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pluginsRelations = relations(plugins, ({ many }) => ({
  likes: many(likes),
}));

// News/Events
export const news = pgTable("news", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  submittedById: varchar("submitted_by_id", { length: 36 }).references(() => users.id),
  title: text("title").notNull(),
  content: text("content"),
  excerpt: text("excerpt"),
  category: text("category"),
  source: text("source"),
  sourceUrl: text("source_url"),
  image: text("image"),
  images: text("images").array(),
  pdfAttachment: text("pdf_attachment"),
  tags: text("tags").array(),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  authorPhone: text("author_phone"),
  location: text("location"),
  publishDate: timestamp("publish_date"),
  featured: boolean("featured").default(false),
  isEvent: boolean("is_event").default(false),
  eventDate: timestamp("event_date"),
  eventEndDate: timestamp("event_end_date"),
  eventTime: text("event_time"),
  eventLocation: text("event_location"),
  eventPrice: text("event_price"),
  eventRegistrationUrl: text("event_registration_url"),
  status: contentStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsRelations = relations(news, ({ one, many }) => ({
  submittedBy: one(users, { fields: [news.submittedById], references: [users.id] }),
  likes: many(likes),
  comments: many(comments),
}));

// Messages
export const messages = pgTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id", { length: 36 }).notNull().references(() => users.id),
  receiverId: varchar("receiver_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sender" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receiver" }),
}));

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  link: text("link"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Likes (polymorphic)
export const likes = pgTable("likes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  targetType: text("target_type").notNull(), // post, project, competition, book, research, tool, news
  targetId: varchar("target_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, { fields: [likes.userId], references: [users.id] }),
}));

// Comments (polymorphic with replies support)
export const comments = pgTable("comments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  targetType: text("target_type").notNull(), // post, project, competition, book, research, news
  targetId: varchar("target_id", { length: 36 }).notNull(),
  parentId: varchar("parent_id", { length: 36 }), // for replies
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id], relationName: "commentReplies" }),
  replies: many(comments, { relationName: "commentReplies" }),
  likes: many(likes),
}));

// Saved Items (bookmarks)
export const savedItems = pgTable("saved_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  targetType: text("target_type").notNull(),
  targetId: varchar("target_id", { length: 36 }).notNull(),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// University Memberships (for students joining other university communities)
export const universityMemberships = pgTable("university_memberships", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  universityId: text("university_id").notNull(), // matches JORDANIAN_UNIVERSITIES id
  status: followStatusEnum("status").default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const universityMembershipsRelations = relations(universityMemberships, ({ one }) => ({
  user: one(users, { fields: [universityMemberships.userId], references: [users.id] }),
}));

// Reports table
export const reports = pgTable("reports", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  targetType: text("target_type").notNull(),
  targetId: varchar("target_id", { length: 36 }).notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, { fields: [reports.userId], references: [users.id] }),
}));

export const savedItemsRelations = relations(savedItems, ({ one }) => ({
  user: one(users, { fields: [savedItems.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertCompetitionSchema = createInsertSchema(competitions).omit({ id: true, createdAt: true });
export const insertBookSchema = createInsertSchema(books).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertResearchSchema = createInsertSchema(research).omit({ id: true, createdAt: true });
export const insertToolSchema = createInsertSchema(tools).omit({ id: true, createdAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true });
export const insertPluginSchema = createInsertSchema(plugins).omit({ id: true, createdAt: true });
export const insertNewsSchema = createInsertSchema(news).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertLikeSchema = createInsertSchema(likes).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertSavedItemSchema = createInsertSchema(savedItems).omit({ id: true, createdAt: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });
export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({ id: true, createdAt: true });
export const insertBlockedUserSchema = createInsertSchema(blockedUsers).omit({ id: true, createdAt: true });
export const insertMutedUserSchema = createInsertSchema(mutedUsers).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });
export const insertUniversityMembershipSchema = createInsertSchema(universityMemberships).omit({ id: true, createdAt: true });

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/),
  role: z.enum(["firm", "engineer", "student"]).optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  // Firm-specific
  companySize: z.string().optional(),
  foundedYear: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  // Engineer-specific
  workplace: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  // Student-specific
  university: z.string().optional(),
  yearOfStudy: z.string().optional(),
  major: z.string().optional(),
  expectedGraduation: z.string().optional(),
  // Portfolio (optional for all)
  portfolioUrl: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Competition = typeof competitions.$inferSelect;
export type InsertCompetition = z.infer<typeof insertCompetitionSchema>;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Research = typeof research.$inferSelect;
export type InsertResearch = z.infer<typeof insertResearchSchema>;
export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Plugin = typeof plugins.$inferSelect;
export type InsertPlugin = z.infer<typeof insertPluginSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type SavedItem = typeof savedItems.$inferSelect;
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type InsertBlockedUser = z.infer<typeof insertBlockedUserSchema>;
export type MutedUser = typeof mutedUsers.$inferSelect;
export type InsertMutedUser = z.infer<typeof insertMutedUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type UniversityMembership = typeof universityMemberships.$inferSelect;
export type InsertUniversityMembership = z.infer<typeof insertUniversityMembershipSchema>;
