import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

import { createSupabaseClient } from "common/supabase";

function runMiddleware(req: any, res: any, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

const cors = Cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

export async function corsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await runMiddleware(req, res, cors);
}

export function createPrismaClient() {
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.prisma) {
      globalThis.prisma = new PrismaClient();
    }
    return globalThis.prisma;
  }
  return new PrismaClient();
}

export function exclude<T, Key extends keyof T>(
  obj: T,
  keys: Key[],
): Omit<T, Key> {
  return obj
    ? (Object.fromEntries(
        Object.entries(obj).filter(([key]: any) => !keys.includes(key)),
      ) as Omit<T, Key>)
    : obj;
}

export async function auth(req: NextApiRequest) {
  const supabase = createSupabaseClient();
  const authorization = req.headers["authorization"];

  if (!authorization) {
    return {
      user: null,
      errorMessage: "Authorization header is required.",
    };
  }

  const accessToken = authorization.split(" ")[1];
  const {
    data: { user },
    error: err,
  } = await supabase.auth.getUser(accessToken);

  if (err) {
    return {
      user: null,
      accessToken,
      errorMessage: err.message,
    };
  }

  return {
    user,
    accessToken,
    errorMessage: "",
  };
}
