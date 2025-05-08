import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import { corsMiddleware, auth } from "common/apiHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await corsMiddleware(req, res);

  const { accessToken, errorMessage } = await auth(req);
  if (errorMessage) {
    return res.status(401).json({ error: errorMessage });
  }

  if (req.method === "POST") {
    try {
      await axios.post(
        "/auth/v1/logout",
        {},
        {
          baseURL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    } catch (err) {
      return res.status(500).json({
        error: "Failed to log out",
        details: err.response?.data || err.message,
      });
    }

    return res.status(200).json({ message: "Logged out successfully" });
  }
}
