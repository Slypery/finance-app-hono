import { Hono } from 'hono'

export const appRoute = new Hono()

appRoute.get('/', (c) => {
  return c.json({ hello: 'world' })
})
