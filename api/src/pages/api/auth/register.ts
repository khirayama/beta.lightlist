import type { NextApiRequest, NextApiResponse } from "next";
import type { App as AppType, TaskList as TaskListType } from "@prisma/client";
import * as Y from "yjs";
import { v4 as uuid } from "uuid";

import { createPrismaClient, corsMiddleware } from "common/apiHelper";
import { createSupabaseClient } from "common/supabase";

const prisma = createPrismaClient();
const supabase = createSupabaseClient();

const firstTaskListName = {
  "JA": "📋 個人",
  "EN": "PERSONAL",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await corsMiddleware(req, res);

  if (req.method === "POST") {
    const email = req.body.email;
    const password = req.body.password;
    const lang = (req.body.lang || "ja").toUpperCase();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { user, session } = data;
    const appDoc = new Y.Doc();
    const ad = appDoc.getMap("app");
    ad.set("taskListIds", new Y.Array());
    ad.set("taskInsertPosition", "TOP");

    const [app, profile, preferences] = await prisma.$transaction([
      prisma.app.create({
        data: {
          ...ad.toJSON(),
          update: Y.encodeStateAsUpdate(appDoc),
        } as AppType,
      }),
      prisma.profile.create({
        data: {
          userId: user.id,
          displayName: user.email.split("@")[0],
        },
      }),
      prisma.preferences.create({
        data: {
          userId: user.id,
          lang,
          theme: "SYSTEM",
        },
      }),
    ]);

    if (!app || !profile || !preferences) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const id = uuid();
    const taskListDoc = new Y.Doc();
    const td = taskListDoc.getMap(id);
    td.set("id", id);
    td.set("name", firstTaskListName[lang]);
    const tasks = new Y.Array();
    td.set("tasks", tasks);

    const [taskList] = await prisma.$transaction([
      prisma.taskList.create({
        data: {
          ...td.toJSON(),
          update: Y.encodeStateAsUpdate(taskListDoc),
        } as TaskListType,
      }),
      prisma.shareCode.create({
        data: {
          taskListId: id,
        },
      }),
    ]);

    const taskListIds = ad.get("taskListIds") as Y.Array<string>;
    taskListIds.insert(0, [taskList.id]);
    await prisma.app.update({
      where: { userId: user.id },
      data: {
        ...ad.toJSON(),
        update: Y.encodeStateAsUpdate(appDoc),
      },
    });

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
