import { db } from '@/db';
import { AppVariables } from '@/routes/_app';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

export const profileRoute = new Hono<{Variables: AppVariables}>()

profileRoute.get('/', async (c) => {
  const userId = c.get('userId')

  const user = await db.query.users.findFirst({
    where: (u) => eq(u.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  return c.json(user)
})