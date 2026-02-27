import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    console.log('--- Buat Akun Admin Pertama ---');
    const name = await question('Nama Lengkap: ');
    const email = await question('Email: ');
    const password = await question('Password: ');

    if (!name || !email || !password) {
        console.error('Data tidak boleh kosong.');
        process.exit(1);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        console.error('User dengan email tersebut sudah ada.');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN' // Pastikan role ADMIN bisa membuat user lainnya
        }
    });

    console.log('Berhasil membuat admin baru!');
    console.log(admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        rl.close();
    });
