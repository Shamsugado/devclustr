import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const loginLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15 m"), prefix: "rl:login" })
  : null;

const registerLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "rl:register" })
  : null;

const forgotPasswordLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "rl:forgot-password" })
  : null;

const resetPasswordLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15 m"), prefix: "rl:reset-password" })
  : null;

const resendVerificationLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "15 m"), prefix: "rl:resend-verification" })
  : null;

export function getIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : "127.0.0.1";
}

async function doLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<{ success: boolean; reset: number }> {
  if (!limiter) return { success: true, reset: 0 };
  try {
    return await limiter.limit(key);
  } catch {
    return { success: true, reset: 0 }; // Fail open if Upstash unavailable
  }
}

function rateLimitedResponse(reset: number): NextResponse {
  const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return NextResponse.json(
    { error: `Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.` },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}

export async function checkRegisterRateLimit(request: Request): Promise<NextResponse | null> {
  const { success, reset } = await doLimit(registerLimiter, getIp(request));
  return success ? null : rateLimitedResponse(reset);
}

export async function checkForgotPasswordRateLimit(request: Request): Promise<NextResponse | null> {
  const { success, reset } = await doLimit(forgotPasswordLimiter, getIp(request));
  return success ? null : rateLimitedResponse(reset);
}

export async function checkResetPasswordRateLimit(request: Request): Promise<NextResponse | null> {
  const { success, reset } = await doLimit(resetPasswordLimiter, getIp(request));
  return success ? null : rateLimitedResponse(reset);
}

export async function checkResendVerificationRateLimit(
  request: Request,
  email: string
): Promise<NextResponse | null> {
  const key = `${getIp(request)}:${email}`;
  const { success, reset } = await doLimit(resendVerificationLimiter, key);
  return success ? null : rateLimitedResponse(reset);
}

export async function isLoginRateLimited(ip: string, email: string): Promise<boolean> {
  const { success } = await doLimit(loginLimiter, `${ip}:${email}`);
  return !success;
}
