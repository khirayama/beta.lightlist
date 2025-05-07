import type { NextApiRequest, NextApiResponse } from "next";

import { corsMiddleware, auth } from "common/apiHelper";
import {
  createSupabaseClient,
  createSupabaseAdminClient,
} from "common/supabase";

const supabase = createSupabaseClient();
const supabaseAdmin = createSupabaseAdminClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await corsMiddleware(req, res);

  const { user: u, errorMessage } = await auth(req);
  if (errorMessage) {
    return res.status(401).json({ error: errorMessage });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: u.email,
      password: currentPassword,
    });

    if (signInError) {
      return res.status(400).json({ error: signInError.message });
    }

    if (newPassword && newPassword.length > 0) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(u.id, {
        password: newPassword,
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const {
        data: { user, session },
      } = await supabase.auth.signInWithPassword({
        email: u.email,
        password: newPassword,
      });

      return res.json({
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
}
