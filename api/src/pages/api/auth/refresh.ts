import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import { corsMiddleware } from "common/apiHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await corsMiddleware(req, res);

  if (req.method === "POST") {
    const refreshToken = req.body.refreshToken;

    let session = null;
    let user = null;
    let error = null;
    try {
      const r = await axios.post(
        "/auth/v1/token?grant_type=refresh_token",
        {
          refresh_token: refreshToken,
        },
        {
          baseURL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          },
        },
      );
      session = r.data;
      user = session.user;
    } catch (err) {
      console.log(err.toJSON());
      error = err;
    }

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
