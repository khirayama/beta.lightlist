import type { NextApiRequest, NextApiResponse } from "next";
import type { Profile as ProfileType } from "@prisma/client";

import {
  createPrismaClient,
  exclude,
  auth,
  corsMiddleware,
} from "common/apiHelper";
import { createSupabaseClient } from "common/supabase";

const prisma = createPrismaClient();
const supabase = createSupabaseClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await corsMiddleware(req, res);

  const { user, accessToken, errorMessage } = await auth(req);
  if (errorMessage) {
    return res.status(401).json({ error: errorMessage });
  }

  const unsafeKeys: (keyof ProfileType)[] = ["id", "userId"];

  if (req.method === "GET") {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
    });
    return res.json({
      profile: {
        ...exclude(profile, unsafeKeys),
        email: user.email,
      },
    });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    if (req.body.email && req.body.email !== user.email) {
      // TODO: Email validation
      // TODO: そもそも、メールアドレス変更はAuthに移動
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: "dummy",
      });
      const { error } = await supabase.auth.updateUser({
        email: req.body.email,
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    delete req.body.email;
    const profile = await prisma.profile.update({
      where: {
        userId: user.id,
      },
      data: exclude(req.body, unsafeKeys),
    });
    return res.json({
      profile: {
        ...exclude(profile, unsafeKeys),
        email: user.email,
      },
    });
  }
}
