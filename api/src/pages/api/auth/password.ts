import type { NextApiRequest, NextApiResponse } from "next";

import { corsMiddleware, auth } from "common/apiHelper";
import {
  createSupabaseClient,
  createSupabaseAdminClient,
} from "common/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await corsMiddleware(req, res);

  const { user, errorMessage } = await auth(req);
  if (errorMessage) {
    return res.status(401).json({ error: errorMessage });
  }

  const supabase = createSupabaseClient();
  const supabaseAdmin = createSupabaseAdminClient();

  if (req.method === "PUT" || req.method === "PATCH") {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    if (newPassword && newPassword.length > 0) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      return res.json({ user });
    }
  }
}
