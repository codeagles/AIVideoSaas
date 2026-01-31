import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const subscriptionPlanEnum = pgEnum("SubscriptionPlan", [
  "FREE",
  "PRO",
  "BUSINESS",
]);

export const statusEnum = pgEnum("Status", [
  "PENDING",
  "CREATING",
  "INITING",
  "RUNNING",
  "STOPPED",
  "DELETED",
]);

export const creditTransTypeEnum = pgEnum("CreditTransType", [
  "NEW_USER",
  "ORDER_PAY",
  "SUBSCRIPTION",
  "VIDEO_CONSUME",
  "REFUND",
  "EXPIRED",
  "SYSTEM_ADJUST",
]);

export const creditPackageStatusEnum = pgEnum("CreditPackageStatus", [
  "ACTIVE",
  "DEPLETED",
  "EXPIRED",
]);

export const videoStatusEnum = pgEnum("VideoStatus", [
  "PENDING",
  "GENERATING",
  "UPLOADING",
  "COMPLETED",
  "FAILED",
]);

export const customers = pgTable(
  "Customer",
  {
    id: serial("id").primaryKey(),
    authUserId: text("authUserId").notNull(),
    name: text("name"),
    plan: subscriptionPlanEnum("plan"),
    stripeCustomerId: text("stripeCustomerId").unique(),
    stripeSubscriptionId: text("stripeSubscriptionId").unique(),
    stripePriceId: text("stripePriceId"),
    stripeCurrentPeriodEnd: timestamp("stripeCurrentPeriodEnd"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    authUserIdIdx: index("Customer_authUserId_idx").on(table.authUserId),
  })
);

export const users = pgTable("user", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  isAdmin: boolean("isAdmin").default(false).notNull(),
});

export const creemSubscriptions = pgTable(
  "creem_subscriptions",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    productId: text("product_id").notNull(),
    subscriptionId: text("subscription_id").notNull().unique(),
    status: text("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("creem_subscriptions_user_id_idx").on(table.userId),
  })
);

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: text("userId").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
  })
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: text("userId").notNull(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    idToken: text("idToken"),
    password: text("password"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("account_user_id_idx").on(table.userId),
    providerAccountIdIdx: uniqueIndex("account_provider_account_id_idx").on(
      table.providerId,
      table.accountId
    ),
  })
);

export const verifications = pgTable("verification", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const legacyAccounts = pgTable(
  "Account",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: text("userId").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => ({
    providerAccountIdIdx: uniqueIndex("Account_provider_account_id_idx").on(
      table.provider,
      table.providerAccountId
    ),
  })
);

export const legacySessions = pgTable("Session", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: text("userId").notNull(),
  expires: timestamp("expires").notNull(),
});

export const legacyUsers = pgTable("User", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified"),
  image: text("image"),
});

export const legacyVerificationTokens = pgTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires").notNull(),
  },
  (table) => ({
    identifierTokenIdx: uniqueIndex("VerificationToken_identifier_token_idx").on(
      table.identifier,
      table.token
    ),
  })
);

export const k8sClusterConfigs = pgTable(
  "K8sClusterConfig",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    location: text("location").notNull(),
    authUserId: text("authUserId").notNull(),
    plan: subscriptionPlanEnum("plan").default("FREE"),
    network: text("network"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    status: statusEnum("status").default("PENDING"),
    delete: boolean("delete").default(false),
  },
  (table) => ({
    authUserIdIdx: index("K8sClusterConfig_authUserId_idx").on(table.authUserId),
  })
);

export const creditPackages = pgTable(
  "credit_packages",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    initialCredits: integer("initial_credits").notNull(),
    remainingCredits: integer("remaining_credits").notNull(),
    frozenCredits: integer("frozen_credits").default(0).notNull(),
    transType: creditTransTypeEnum("trans_type").notNull(),
    orderNo: text("order_no"),
    status: creditPackageStatusEnum("status").default("ACTIVE").notNull(),
    expiredAt: timestamp("expired_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userStatusIdx: index("credit_packages_user_id_status_idx").on(
      table.userId,
      table.status
    ),
    userExpiredIdx: index("credit_packages_user_id_expired_at_idx").on(
      table.userId,
      table.expiredAt
    ),
  })
);

export const creditHolds = pgTable(
  "credit_holds",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    videoUuid: text("video_uuid").notNull().unique(),
    credits: integer("credits").notNull(),
    status: text("status").default("HOLDING").notNull(),
    packageAllocation: jsonb("package_allocation").notNull(),
    packageId: integer("package_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    settledAt: timestamp("settled_at"),
  },
  (table) => ({
    userIdx: index("credit_holds_user_id_idx").on(table.userId),
    statusIdx: index("credit_holds_status_idx").on(table.status),
    packageIdx: index("credit_holds_package_id_idx").on(table.packageId),
  })
);

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: serial("id").primaryKey(),
    transNo: text("trans_no").notNull().unique(),
    userId: text("user_id").notNull(),
    transType: creditTransTypeEnum("trans_type").notNull(),
    credits: integer("credits").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    packageId: integer("package_id"),
    videoUuid: text("video_uuid"),
    orderNo: text("order_no"),
    holdId: integer("hold_id"),
    remark: text("remark"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("credit_transactions_user_id_idx").on(table.userId),
    transTypeIdx: index("credit_transactions_trans_type_idx").on(table.transType),
    createdAtIdx: index("credit_transactions_created_at_idx").on(
      table.createdAt
    ),
  })
);

export const videos = pgTable(
  "videos",
  {
    id: serial("id").primaryKey(),
    uuid: text("uuid").notNull().unique(),
    userId: text("user_id").notNull(),
    prompt: text("prompt").notNull(),
    model: text("model").notNull(),
    parameters: jsonb("parameters"),
    status: videoStatusEnum("status").default("PENDING").notNull(),
    provider: text("provider"),
    externalTaskId: text("external_task_id"),
    errorMessage: text("error_message"),
    startImageUrl: text("start_image_url"),
    originalVideoUrl: text("original_video_url"),
    videoUrl: text("video_url"),
    thumbnailUrl: text("thumbnail_url"),
    duration: integer("duration"),
    resolution: text("resolution"),
    aspectRatio: text("aspect_ratio"),
    fileSize: integer("file_size"),
    creditsUsed: integer("credits_used").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    generationTime: integer("generation_time"),
    isDeleted: boolean("is_deleted").default(false).notNull(),
  },
  (table) => ({
    userIdx: index("videos_user_id_idx").on(table.userId),
    statusIdx: index("videos_status_idx").on(table.status),
    createdAtIdx: index("videos_created_at_idx").on(table.createdAt),
  })
);

export type Customer = typeof customers.$inferSelect;
export type BetterAuthUser = typeof users.$inferSelect;
export type CreditPackage = typeof creditPackages.$inferSelect;
export type CreditHold = typeof creditHolds.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type Video = typeof videos.$inferSelect;

export const SubscriptionPlan = {
  FREE: "FREE",
  PRO: "PRO",
  BUSINESS: "BUSINESS",
} as const;
export type SubscriptionPlan =
  (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const CreditTransType = {
  NEW_USER: "NEW_USER",
  ORDER_PAY: "ORDER_PAY",
  SUBSCRIPTION: "SUBSCRIPTION",
  VIDEO_CONSUME: "VIDEO_CONSUME",
  REFUND: "REFUND",
  EXPIRED: "EXPIRED",
  SYSTEM_ADJUST: "SYSTEM_ADJUST",
} as const;
export type CreditTransType =
  (typeof CreditTransType)[keyof typeof CreditTransType];

export const CreditPackageStatus = {
  ACTIVE: "ACTIVE",
  DEPLETED: "DEPLETED",
  EXPIRED: "EXPIRED",
} as const;
export type CreditPackageStatus =
  (typeof CreditPackageStatus)[keyof typeof CreditPackageStatus];

export const VideoStatus = {
  PENDING: "PENDING",
  GENERATING: "GENERATING",
  UPLOADING: "UPLOADING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];
