import type { NextApiRequest, NextApiResponse } from "next";

import { corsMiddleware, auth } from "common/apiHelper";
import { createSupabaseAdminClient } from "common/supabase";

function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return re.test(email);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await corsMiddleware(req, res);

  const { user, errorMessage } = await auth(req);
  if (errorMessage) {
    return res.status(401).json({ error: errorMessage });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  if (req.method === "PUT" || req.method === "PATCH") {
    const email = req.body.email;

    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: "Invalid email format",
        });
      }
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          email,
        },
      );
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      if (data) {
        return res.status(200).json({
          user: {
            id: user.id,
            email,
          },
        });
      }
    }
    if (email && email === user.email) {
      return res.status(304).json({
        message: "No changes made",
      });
    }
    return res.status(400).json({
      error: "Invalid email",
    });
  }
}
