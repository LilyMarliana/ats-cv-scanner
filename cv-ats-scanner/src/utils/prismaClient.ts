import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'cv_ats_scanner',
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });