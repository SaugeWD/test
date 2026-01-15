import {
  users, posts, projects, competitions, books, jobs, research, tools, courses, plugins, news,
  messages, notifications, likes, comments, savedItems, follows, jobApplications,
  blockedUsers, mutedUsers, reports, universityMemberships,
  type User, type InsertUser, type Post, type InsertPost, type Project, type InsertProject,
  type Competition, type InsertCompetition, type Book, type InsertBook, type Job, type InsertJob,
  type Research, type InsertResearch, type Tool, type InsertTool, type Course, type InsertCourse,
  type Plugin, type InsertPlugin, type News, type InsertNews, type Message, type InsertMessage,
  type Notification, type InsertNotification, type Like, type InsertLike, type Comment, type InsertComment,
  type SavedItem, type InsertSavedItem, type Follow, type InsertFollow, type Report, type InsertReport,
  type UniversityMembership, type InsertUniversityMembership,
  type JobApplication, type InsertJobApplication
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, or } from "drizzle-orm";

type BlockedUser = typeof blockedUsers.$inferSelect;
type InsertBlockedUser = { blockerId: string; blockedId: string };
type MutedUser = typeof mutedUsers.$inferSelect;
type InsertMutedUser = { muterId: string; mutedId: string };

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(limit?: number): Promise<User[]>;

  // Posts
  getPosts(limit?: number): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: string): Promise<void>;

  // Projects
  getProjects(limit?: number): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;

  // Competitions
  getCompetitions(limit?: number): Promise<Competition[]>;
  getCompetition(id: string): Promise<Competition | undefined>;
  createCompetition(competition: InsertCompetition): Promise<Competition>;

  // Books
  getBooks(limit?: number): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;

  // Jobs
  getJobs(limit?: number): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;

  // Job Applications
  getJobApplication(jobId: string, userId: string): Promise<JobApplication | undefined>;
  getJobApplications(jobId: string): Promise<JobApplication[]>;
  getUserJobApplications(userId: string): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;

  // Research
  getResearch(limit?: number): Promise<Research[]>;
  getResearchApproved(limit?: number): Promise<Research[]>;
  getResearchForUser(userId: string, limit?: number): Promise<Research[]>;
  getResearchById(id: string): Promise<Research | undefined>;
  createResearch(research: InsertResearch): Promise<Research>;

  // Tools
  getTools(limit?: number): Promise<Tool[]>;
  getToolsByType(type: string, limit?: number): Promise<Tool[]>;
  getTool(id: string): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;

  // Courses
  getCourses(limit?: number): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Plugins
  getPlugins(limit?: number): Promise<Plugin[]>;
  getPluginsBySoftware(software: string, limit?: number): Promise<Plugin[]>;
  getPlugin(id: string): Promise<Plugin | undefined>;
  createPlugin(plugin: InsertPlugin): Promise<Plugin>;

  // News
  getNews(limit?: number): Promise<News[]>;
  getNewsApproved(limit?: number): Promise<News[]>;
  getNewsForUser(userId: string, limit?: number): Promise<News[]>;
  getNewsById(id: string): Promise<News | undefined>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: string, data: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: string): Promise<void>;

  // Messages
  getMessages(userId: string): Promise<Message[]>;
  getConversation(user1Id: string, user2Id: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageRead(id: string): Promise<void>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;

  // Likes
  getLikes(targetType: string, targetId: string): Promise<Like[]>;
  getLikeCount(targetType: string, targetId: string): Promise<number>;
  addLike(like: InsertLike): Promise<Like>;
  removeLike(userId: string, targetType: string, targetId: string): Promise<void>;
  isLiked(userId: string, targetType: string, targetId: string): Promise<boolean>;

  // Comments
  getComments(targetType: string, targetId: string): Promise<Comment[]>;
  getComment(id: string): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, content: string): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<void>;

  // Saved Items
  getSavedItems(userId: string): Promise<SavedItem[]>;
  saveItem(item: InsertSavedItem): Promise<SavedItem>;
  unsaveItem(userId: string, targetType: string, targetId: string): Promise<void>;
  isSaved(userId: string, targetType: string, targetId: string): Promise<boolean>;

  // Posts by user
  getPostsByUser(userId: string): Promise<Post[]>;

  // Likes by user
  getLikesByUser(userId: string): Promise<Like[]>;

  // Comments by user
  getCommentsByUser(userId: string): Promise<Comment[]>;

  // Follows
  getFollowers(userId: string): Promise<Follow[]>;
  getFollowing(userId: string): Promise<Follow[]>;
  follow(follow: InsertFollow): Promise<Follow>;
  unfollow(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowerCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
  acceptFollowRequest(followerId: string, followingId: string): Promise<Follow | undefined>;
  rejectFollowRequest(followerId: string, followingId: string): Promise<void>;
  getPendingFollowRequests(userId: string): Promise<Follow[]>;
  getFollowStatus(followerId: string, followingId: string): Promise<Follow | undefined>;

  // Blocked Users
  blockUser(block: InsertBlockedUser): Promise<BlockedUser>;
  unblockUser(blockerId: string, blockedId: string): Promise<void>;
  getBlockedUsers(userId: string): Promise<BlockedUser[]>;
  isBlocked(blockerId: string, blockedId: string): Promise<boolean>;

  // Muted Users
  muteUser(mute: InsertMutedUser): Promise<MutedUser>;
  unmuteUser(muterId: string, mutedId: string): Promise<void>;
  getMutedUsers(userId: string): Promise<MutedUser[]>;
  isMuted(muterId: string, mutedId: string): Promise<boolean>;

  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReports(limit?: number): Promise<Report[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getUsers(limit = 50): Promise<User[]> {
    return db.select().from(users).limit(limit);
  }

  // Posts
  async getPosts(limit = 50): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit);
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [created] = await db.insert(posts).values(post).returning();
    return created;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  // Projects
  async getProjects(limit = 50): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.createdAt)).limit(limit);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
    return updated;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.authorId, userId)).orderBy(desc(projects.createdAt));
  }

  // Competitions
  async getCompetitions(limit = 50): Promise<Competition[]> {
    return db.select().from(competitions).orderBy(desc(competitions.createdAt)).limit(limit);
  }

  async getCompetition(id: string): Promise<Competition | undefined> {
    const [competition] = await db.select().from(competitions).where(eq(competitions.id, id));
    return competition || undefined;
  }

  async createCompetition(competition: InsertCompetition): Promise<Competition> {
    const [created] = await db.insert(competitions).values(competition).returning();
    return created;
  }

  // Books
  async getBooks(limit = 50): Promise<Book[]> {
    return db.select().from(books).orderBy(desc(books.createdAt)).limit(limit);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [created] = await db.insert(books).values(book).returning();
    return created;
  }

  // Jobs
  async getJobs(limit = 50): Promise<Job[]> {
    return db.select().from(jobs).where(eq(jobs.isActive, true)).orderBy(desc(jobs.createdAt)).limit(limit);
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [created] = await db.insert(jobs).values(job).returning();
    return created;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  // Job Applications
  async getJobApplication(jobId: string, userId: string): Promise<JobApplication | undefined> {
    const [application] = await db.select().from(jobApplications)
      .where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.userId, userId)));
    return application || undefined;
  }

  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    return db.select().from(jobApplications)
      .where(eq(jobApplications.jobId, jobId))
      .orderBy(desc(jobApplications.createdAt));
  }

  async getUserJobApplications(userId: string): Promise<JobApplication[]> {
    return db.select().from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.createdAt));
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [created] = await db.insert(jobApplications).values(application).returning();
    return created;
  }

  // Research
  async getResearch(limit = 50): Promise<Research[]> {
    return db.select().from(research).orderBy(desc(research.createdAt)).limit(limit);
  }

  async getResearchApproved(limit = 50): Promise<Research[]> {
    return db.select().from(research).where(eq(research.status, "approved")).orderBy(desc(research.createdAt)).limit(limit);
  }

  async getResearchForUser(userId: string, limit = 50): Promise<Research[]> {
    return db.select().from(research)
      .where(or(eq(research.status, "approved"), eq(research.submittedById, userId)))
      .orderBy(desc(research.createdAt))
      .limit(limit);
  }

  async getResearchById(id: string): Promise<Research | undefined> {
    const [paper] = await db.select().from(research).where(eq(research.id, id));
    return paper || undefined;
  }

  async createResearch(researchPaper: InsertResearch): Promise<Research> {
    const [created] = await db.insert(research).values(researchPaper).returning();
    return created;
  }

  // Tools
  async getTools(limit = 50): Promise<Tool[]> {
    return db.select().from(tools).orderBy(desc(tools.createdAt)).limit(limit);
  }

  async getToolsByType(type: string, limit = 50): Promise<Tool[]> {
    return db.select().from(tools).where(eq(tools.type, type)).orderBy(desc(tools.createdAt)).limit(limit);
  }

  async getTool(id: string): Promise<Tool | undefined> {
    const [tool] = await db.select().from(tools).where(eq(tools.id, id));
    return tool || undefined;
  }

  async createTool(tool: InsertTool): Promise<Tool> {
    const [created] = await db.insert(tools).values(tool).returning();
    return created;
  }

  // Courses
  async getCourses(limit = 50): Promise<Course[]> {
    return db.select().from(courses).orderBy(desc(courses.createdAt)).limit(limit);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [created] = await db.insert(courses).values(course).returning();
    return created;
  }

  // Plugins
  async getPlugins(limit = 50): Promise<Plugin[]> {
    return db.select().from(plugins).orderBy(desc(plugins.createdAt)).limit(limit);
  }

  async getPluginsBySoftware(software: string, limit = 50): Promise<Plugin[]> {
    return db.select().from(plugins).where(eq(plugins.software, software)).orderBy(desc(plugins.createdAt)).limit(limit);
  }

  async getPlugin(id: string): Promise<Plugin | undefined> {
    const [plugin] = await db.select().from(plugins).where(eq(plugins.id, id));
    return plugin || undefined;
  }

  async createPlugin(plugin: InsertPlugin): Promise<Plugin> {
    const [created] = await db.insert(plugins).values(plugin).returning();
    return created;
  }

  // News
  async getNews(limit = 50): Promise<News[]> {
    return db.select().from(news).orderBy(desc(news.createdAt)).limit(limit);
  }

  async getNewsApproved(limit = 50): Promise<News[]> {
    return db.select().from(news).where(eq(news.status, "approved")).orderBy(desc(news.createdAt)).limit(limit);
  }

  async getNewsForUser(userId: string, limit = 50): Promise<News[]> {
    return db.select().from(news)
      .where(or(eq(news.status, "approved"), eq(news.submittedById, userId)))
      .orderBy(desc(news.createdAt))
      .limit(limit);
  }

  async getNewsById(id: string): Promise<News | undefined> {
    const [item] = await db.select().from(news).where(eq(news.id, id));
    return item || undefined;
  }

  async createNews(newsItem: InsertNews): Promise<News> {
    const [created] = await db.insert(news).values(newsItem).returning();
    return created;
  }

  async updateNews(id: string, data: Partial<InsertNews>): Promise<News | undefined> {
    const [updated] = await db.update(news).set(data).where(eq(news.id, id)).returning();
    return updated || undefined;
  }

  async deleteNews(id: string): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // Messages
  async getMessages(userId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(sql`${messages.senderId} = ${userId} OR ${messages.receiverId} = ${userId}`)
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(sql`(${messages.senderId} = ${user1Id} AND ${messages.receiverId} = ${user2Id}) OR (${messages.senderId} = ${user2Id} AND ${messages.receiverId} = ${user1Id})`)
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async markMessageRead(id: string): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  // Likes
  async getLikes(targetType: string, targetId: string): Promise<Like[]> {
    return db.select().from(likes)
      .where(and(eq(likes.targetType, targetType), eq(likes.targetId, targetId)));
  }

  async getLikeCount(targetType: string, targetId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(likes)
      .where(and(eq(likes.targetType, targetType), eq(likes.targetId, targetId)));
    return result[0]?.count || 0;
  }

  async addLike(like: InsertLike): Promise<Like> {
    const [created] = await db.insert(likes).values(like).returning();
    return created;
  }

  async removeLike(userId: string, targetType: string, targetId: string): Promise<void> {
    await db.delete(likes).where(
      and(eq(likes.userId, userId), eq(likes.targetType, targetType), eq(likes.targetId, targetId))
    );
  }

  async isLiked(userId: string, targetType: string, targetId: string): Promise<boolean> {
    const [result] = await db.select().from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.targetType, targetType), eq(likes.targetId, targetId)));
    return !!result;
  }

  // Comments
  async getComments(targetType: string, targetId: string): Promise<Comment[]> {
    return db.select().from(comments)
      .where(and(eq(comments.targetType, targetType), eq(comments.targetId, targetId)))
      .orderBy(comments.createdAt);
  }

  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [created] = await db.insert(comments).values(comment).returning();
    return created;
  }

  async updateComment(id: string, content: string): Promise<Comment | undefined> {
    const [updated] = await db.update(comments).set({ content }).where(eq(comments.id, id)).returning();
    return updated || undefined;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Saved Items
  async getSavedItems(userId: string): Promise<SavedItem[]> {
    return db.select().from(savedItems).where(eq(savedItems.userId, userId)).orderBy(desc(savedItems.createdAt));
  }

  async saveItem(item: InsertSavedItem): Promise<SavedItem> {
    const [created] = await db.insert(savedItems).values(item).returning();
    return created;
  }

  async unsaveItem(userId: string, targetType: string, targetId: string): Promise<void> {
    await db.delete(savedItems).where(
      and(eq(savedItems.userId, userId), eq(savedItems.targetType, targetType), eq(savedItems.targetId, targetId))
    );
  }

  async isSaved(userId: string, targetType: string, targetId: string): Promise<boolean> {
    const [result] = await db.select().from(savedItems)
      .where(and(eq(savedItems.userId, userId), eq(savedItems.targetType, targetType), eq(savedItems.targetId, targetId)));
    return !!result;
  }

  // Posts by user
  async getPostsByUser(userId: string): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.authorId, userId)).orderBy(desc(posts.createdAt));
  }

  // Likes by user
  async getLikesByUser(userId: string): Promise<Like[]> {
    return db.select().from(likes).where(eq(likes.userId, userId)).orderBy(desc(likes.createdAt));
  }

  // Comments by user
  async getCommentsByUser(userId: string): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.userId, userId)).orderBy(desc(comments.createdAt));
  }

  // Follows
  async getFollowers(userId: string): Promise<Follow[]> {
    return db.select().from(follows).where(
      and(eq(follows.followingId, userId), eq(follows.status, "accepted"))
    );
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    return db.select().from(follows).where(
      and(eq(follows.followerId, userId), eq(follows.status, "accepted"))
    );
  }

  async follow(followData: InsertFollow): Promise<Follow> {
    const [created] = await db.insert(follows).values({ ...followData, status: "pending" }).returning();
    return created;
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
    );
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [result] = await db.select().from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId),
        eq(follows.status, "accepted")
      ));
    return !!result;
  }

  async getFollowerCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(follows)
      .where(and(eq(follows.followingId, userId), eq(follows.status, "accepted")));
    return result[0]?.count || 0;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(follows)
      .where(and(eq(follows.followerId, userId), eq(follows.status, "accepted")));
    return result[0]?.count || 0;
  }

  async acceptFollowRequest(followerId: string, followingId: string): Promise<Follow | undefined> {
    const [updated] = await db.update(follows)
      .set({ status: "accepted" })
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId),
        eq(follows.status, "pending")
      ))
      .returning();
    return updated || undefined;
  }

  async rejectFollowRequest(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(
      and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId),
        eq(follows.status, "pending")
      )
    );
  }

  async getPendingFollowRequests(userId: string): Promise<Follow[]> {
    return db.select().from(follows).where(
      and(eq(follows.followingId, userId), eq(follows.status, "pending"))
    );
  }

  async getFollowStatus(followerId: string, followingId: string): Promise<Follow | undefined> {
    const [result] = await db.select().from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));
    return result || undefined;
  }

  // Blocked Users
  async blockUser(block: InsertBlockedUser): Promise<BlockedUser> {
    const [created] = await db.insert(blockedUsers).values(block).returning();
    return created;
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await db.delete(blockedUsers).where(
      and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId))
    );
  }

  async getBlockedUsers(userId: string): Promise<BlockedUser[]> {
    return db.select().from(blockedUsers).where(eq(blockedUsers.blockerId, userId));
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const [result] = await db.select().from(blockedUsers)
      .where(and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId)));
    return !!result;
  }

  // Muted Users
  async muteUser(mute: InsertMutedUser): Promise<MutedUser> {
    const [created] = await db.insert(mutedUsers).values(mute).returning();
    return created;
  }

  async unmuteUser(muterId: string, mutedId: string): Promise<void> {
    await db.delete(mutedUsers).where(
      and(eq(mutedUsers.muterId, muterId), eq(mutedUsers.mutedId, mutedId))
    );
  }

  async getMutedUsers(userId: string): Promise<MutedUser[]> {
    return db.select().from(mutedUsers).where(eq(mutedUsers.muterId, userId));
  }

  async isMuted(muterId: string, mutedId: string): Promise<boolean> {
    const [result] = await db.select().from(mutedUsers)
      .where(and(eq(mutedUsers.muterId, muterId), eq(mutedUsers.mutedId, mutedId)));
    return !!result;
  }

  // Reports
  async createReport(report: InsertReport): Promise<Report> {
    const [created] = await db.insert(reports).values(report).returning();
    return created;
  }

  async getReports(limit = 50): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.createdAt)).limit(limit);
  }
}

export const storage = new DatabaseStorage();
