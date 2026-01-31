import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { creem } from "@creem_io/better-auth";
import { magicLink } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import {
  CreditTransType,
  creditService,
} from "@/services/credit";
import {
  getProductById,
  getProductExpiryDays,
} from "@/config/credits";

import { creditPackages, db, users } from "@/db";
import * as schema from "@/db/schema";
import { env } from "./env.mjs";
import { eq } from "drizzle-orm";

const toLogString = (value: unknown) => {
  if (value === null || value === undefined) return String(value);
  if (typeof value === "string") return value;
  const normalized =
    value instanceof Error
      ? {
          name: value.name,
          message: value.message,
          stack: value.stack,
          status: (value as Record<string, unknown>).status,
          statusText: (value as Record<string, unknown>).statusText,
          error: (value as Record<string, unknown>).error,
        }
      : value;
  const seen = new WeakSet();
  try {
    return JSON.stringify(normalized, (_key, val) => {
      if (typeof val === "bigint") return val.toString();
      if (typeof val === "function") return "[Function]";
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) return "[Circular]";
        seen.add(val);
      }
      return val;
    });
  } catch {
    return String(normalized);
  }
};

const debugLogger =
  process.env.NODE_ENV === "development"
    ? {
        level: "debug" as const,
        log: (level: "debug" | "info" | "warn" | "error", message: string, ...args: unknown[]) => {
          const suffix = args.length ? ` ${args.map(toLogString).join(" ")}` : "";
          const line = `[Better Auth] ${message}${suffix}`.trimEnd();
          if (level === "error") console.error(line);
          else if (level === "warn") console.warn(line);
          else console.log(line);
        },
      }
    : undefined;

type AuthPlugin =
  | ReturnType<typeof nextCookies>
  | ReturnType<typeof magicLink>
  | ReturnType<typeof creem>;

const plugins: AuthPlugin[] = [
  // Avoid Next.js dev DataCloneError from cookies() in some environments.
  ...(process.env.NODE_ENV === "development" ? [] : [nextCookies()]),
  magicLink({
    sendMagicLink: async ({ email, url }) => {
      // Dynamic import to avoid Edge Runtime issues in middleware
      const { MagicLinkEmail } = await import(
        "@/lib/emails/magic-link-email"
      );
      const { resend } = await import("@/lib/email");
      const { siteConfig } = await import("@/config/site");

      // Check if user exists to determine email type
      const [existingUser] = await db
        .select({ name: users.name, emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const userVerified = !!existingUser?.emailVerified;
      const authSubject = userVerified
        ? `Sign-in link for ${(siteConfig as { name: string }).name}`
        : "Activate your account";

      try {
        await resend.emails.send({
          from: env.RESEND_FROM,
          to: email,
          subject: authSubject,
          react: MagicLinkEmail({
            firstName: existingUser?.name ?? "",
            actionUrl: url,
            mailType: userVerified ? "login" : "register",
            siteName: (siteConfig as { name: string }).name,
          }),
          headers: {
            "X-Entity-Ref-ID": new Date().getTime() + "",
          },
        });
      } catch (error) {
        console.error("Failed to send magic link email:", error);
        throw error;
      }
    },
    expiresIn: 300, // 5 minutes
  }),
];

if (env.CREEM_API_KEY) {
  plugins.push(
    creem({
      apiKey: env.CREEM_API_KEY,
      webhookSecret: env.CREEM_WEBHOOK_SECRET,
      testMode: process.env.NODE_ENV !== "production",
      persistSubscriptions: true,
      defaultSuccessUrl: "/dashboard",

      onGrantAccess: async ({ product, customer, metadata }) => {
        const productConfig = getProductById(product.id);
        if (!productConfig) {
          console.error(`[Creem] Unknown product: ${product.id}`);
          return;
        }

        const credits = productConfig.credits;
        if (credits <= 0) return;

        const meta = (metadata ?? {}) as Record<string, unknown>;
        const metaOrderId =
          typeof meta.paymentId === "string"
            ? meta.paymentId
            : typeof meta.subscriptionId === "string"
              ? meta.subscriptionId
              : typeof meta.orderId === "string"
                ? meta.orderId
                : undefined;
        const customerData = customer as unknown as {
          userId: string;
          subscriptionId?: string;
        };

        const orderId = metaOrderId ?? customerData.subscriptionId;
        const orderNo = orderId
          ? `creem_${orderId}`
          : `creem_${productConfig.type}_${customerData.userId}_${Date.now()}`;

        const [existing] = await db
          .select({ id: creditPackages.id })
          .from(creditPackages)
          .where(eq(creditPackages.orderNo, orderNo))
          .limit(1);

        if (existing) {
          console.log(`[Creem] Duplicate webhook ignored: ${orderNo}`);
          return;
        }

        const transType =
          productConfig.type === "subscription"
            ? CreditTransType.SUBSCRIPTION
            : CreditTransType.ORDER_PAY;

        const productName = product?.name ?? productConfig.id;

        await creditService.recharge({
          userId: customerData.userId,
          credits,
          orderNo,
          transType,
          expiryDays: getProductExpiryDays(productConfig),
          remark: `Creem payment: ${productName}`,
        });
      },

      onRevokeAccess: async ({ customer, product }) => {
        console.log("Creem access revoked:", { customer, product });
      },
    })
  );
}

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  logger: debugLogger,

  // Drizzle adapter with schema for Better Auth
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  // Plugins
  plugins,

  // Hooks - 自动赠送新用户积分
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // 检查是否是注册相关的路径
      if (ctx.path?.startsWith("/sign-up") || ctx.path?.startsWith("/sign-in")) {
        const newSession = ctx.context?.newSession;
        if (newSession?.user?.id) {
          try {
            await creditService.grantNewUserCredits(newSession.user.id);
            console.log(`[Auth] Granted new user credits to: ${newSession.user.id}`);
          } catch (error) {
            console.error("[Auth] Failed to grant new user credits:", error);
            // 不抛出错误，避免影响注册流程
          }
        }
      }
    }),
  },

  // Google OAuth
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account", // Always show account picker
    },
  },

  // Custom user fields
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false, // Prevent users from setting this
      },
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

// Extend user type with additional fields
export type User = typeof auth.$Infer.Session.user & {
  isAdmin?: boolean | null;
};

// Session type with extended user
type BaseSession = typeof auth.$Infer.Session;
export type Session = {
  session: BaseSession["session"];
  user: User;
};
