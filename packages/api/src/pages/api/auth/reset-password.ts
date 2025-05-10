import type { NextApiRequest, NextApiResponse } from "next";

import { corsMiddleware, auth } from "common/apiHelper";
import {
  createSupabaseAdminClient,
  createSupabaseClient,
} from "common/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await corsMiddleware(req, res);

  if (req.method === "POST") {
    const supabaseAdmin = createSupabaseAdminClient();

    try {
      await supabaseAdmin.auth.resetPasswordForEmail(req.body.email, {
        redirectTo: req.body.redirectTo,
      });
    } catch (err) {
      return res.status(500).json({
        error: "Failed to reset password",
        details: err.response?.data || err.message,
      });
    }

    return res.status(200).json({ message: "Password reset email sent" });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const { user: u, errorMessage } = await auth(req);
    if (errorMessage) {
      return res.status(401).json({ error: errorMessage });
    }

    const newPassword = req.body.password;

    const supabase = createSupabaseClient();
    const supabaseAdmin = createSupabaseAdminClient();

    if (!newPassword || newPassword.length === 0) {
      return res.status(400).json({ error: "New password is required" });
    }

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
