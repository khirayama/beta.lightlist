import type { NextApiRequest, NextApiResponse } from "next";

import { createSupabaseClient } from "common/supabase";

const supabase = createSupabaseClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const email = req.body.email;
    const password = req.body.password;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  }
}
