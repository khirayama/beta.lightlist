import type { NextApiRequest, NextApiResponse } from "next";

import { corsMiddleware } from "common/apiHelper";
import { createSupabaseClient } from "common/supabase";

const supabase = createSupabaseClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await corsMiddleware(req, res);

  if (req.method === "POST") {
    const email = req.body.email;
    const password = req.body.password;

    const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at,
        expiresIn: session.expires_in,
      },
      user: {
        id: user.id,
        email: user.email,
      },
    });
  }
}
