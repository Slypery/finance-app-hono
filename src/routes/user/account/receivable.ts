import { jsonValidator } from '@/helpers/validator'
import { UserVariables } from '@/routes/user/_index'
import { createReceivableSchema } from '@/schemas/account/receivable.schema'
import { createReceivable, getReceivables } from '@/services/account/receivable.service'
import { Hono } from 'hono'

export const receivableRoute = new Hono<{ Variables: UserVariables }>()

// create receivable
receivableRoute.post('', jsonValidator(createReceivableSchema), async (c) => {
  const input = c.req.valid('json')
  const receivable = await createReceivable({ ...input, userId: c.get('userId') })

  return c.json({ success: true, data: receivable })
})

// get receivables
receivableRoute.get('', async (c) => {
  const receivableData = await getReceivables(c.get('userId'))

  return c.json({ success: true, data: receivableData })
})
