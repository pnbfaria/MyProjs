/**
 * Clean database and re-sync from Jira.
 * Run: npx tsx lib/clean-and-sync.ts
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🗑️  Cleaning database...');
  
  // Delete all existing data
  await prisma.alert.deleteMany();
  await prisma.syncLog.deleteMany();
  await prisma.ticket.deleteMany();
  
  console.log('✅ Database cleaned');
  
  // Now verify it's empty
  const count = await prisma.ticket.count();
  console.log(`   Tickets remaining: ${count}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
