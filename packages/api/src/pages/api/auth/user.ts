import type { NextApiRequest, NextApiResponse } from "next";

import { createPrismaClient, auth, corsMiddleware } from "common/apiHelper";
import { createSupabaseAdminClient } from "common/supabase";

const prisma = createPrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await corsMiddleware(req, res);

  const { user, errorMessage } = await auth(req);
  if (errorMessage) {
    return res.status(401).json({ error: errorMessage });
  }

  if (req.method === "DELETE") {
    const supabaseAdmin = createSupabaseAdminClient();
    const app = await prisma.app.findFirst({
      where: {
        userId: user.id,
      },
    });
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    await Promise.all([
      prisma.app.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      prisma.preferences.deleteMany({
        where: {
          userId: user.id,
        },
      }),
    ]);
    app.taskListIds.forEach(async (taskListId: string) => {
      const apps = await prisma.app.findMany({
        where: {
          taskListIds: {
            has: taskListId,
          },
        },
      });
      if (apps.length === 1) {
        await prisma.$transaction([
          prisma.shareCode.deleteMany({
            where: {
              taskListId,
            },
          }),
          prisma.taskList.delete({
            where: {
              id: taskListId,
            },
          }),
        ]);
      }
    });
    res.status(200).json({ message: "User deleted successfully" });
  }
}
