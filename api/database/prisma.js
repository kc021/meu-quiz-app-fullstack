import { PrismaClient } from '@prisma/client';

// Cria e exporta a instância única do Prisma
const prisma = new PrismaClient();

export default prisma;