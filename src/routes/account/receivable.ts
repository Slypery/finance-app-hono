import { AppVariables } from '@/routes/_app';
import { Hono } from 'hono';

export const receivableRoute = new Hono<{ Variables: AppVariables }>()