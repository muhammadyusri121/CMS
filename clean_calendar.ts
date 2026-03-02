import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    await prisma.$executeRaw`DELETE FROM _prisma_migrations WHERE migration_name = '20260302101534_remove_calendar_enum'`;
    console.log("Deleted");
}
main().catch(console.error).finally(() => prisma.$disconnect());
