import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { mockProducts } from "@/lib/mock-data";
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

export async function main() {
  for (const u of mockProducts) {
    await prisma.product.create({ data: u });
  }
}

main();
