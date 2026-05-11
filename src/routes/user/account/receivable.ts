import { UserVariables } from '@/routes/user/_index'
import { Hono } from 'hono'

export const receivableRoute = new Hono<{ Variables: UserVariables }>()
