import { db } from '@/db'
import { UserVariables } from '@/routes/user/_index'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'

export const profileRoute = new Hono<{ Variables: UserVariables }>()

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

  return c.json({ sucess: true, data: user })
})
