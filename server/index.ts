import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import * as xlsx from 'xlsx';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'heworqcv89y47ry34bcti4ycit438obvi74b57li6v534v13vy54y56';

app.disable('x-powered-by'); // Keamanan: Menyembunyikan bahwa server ini berjalan dengan ExpressJS
app.use((req, res, next) => {
    // Keamanan: Security Headers Native tanpa perlu install Helmet
    res.setHeader('X-Content-Type-Options', 'nosniff'); // Cegah celah MIMESniffing (bisa upload file .jpg isinya text/html JS -> dieksekusi client)
    res.setHeader('X-Frame-Options', 'DENY'); // Cegah Clickjacking attack
    res.setHeader('X-XSS-Protection', '1; mode=block'); // Pelindung kuno browser terhadap Reflected XSS
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:;");
    next();
});

app.use(cors());
app.use(express.json());

if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET wajib diatur di file .env untuk keamanan Aplikasi!");
    process.exit(1);
}

// Fungsi bantuan untuk menyamakan format balasan (respons) API
const handleSuccess = (res: Response, data: any, message?: string) => res.json({ success: true, data, message });
const handleError = (res: Response, error: any, status = 500) => {
    console.error(error);
    res.status(status).json({ success: false, error: "Telah terjadi kesalahan pada server." });
};

// -- Lapisan Keamanan (Middleware Autentikasi) --
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, error: "Akses ditolak. Token tidak ditemukan." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jsonwebtoken.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.error("JWT Verification failed. Token received:", token, "Error:", error);
        return res.status(403).json({ success: false, error: "Token tidak valid atau kadaluarsa." });
    }
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: "Akses ditolak. Memerlukan role ADMIN." });
    }
    next();
};

// --- Rute Unggah File (Server MinIO) ---
import { minioClient, BUCKET_NAME, uploadMiddleware, initBucket } from './minio';

// Otomatis membuat wadah penyimpanan (Bucket) saat server pertama menyala
initBucket();

app.post('/api/upload', requireAuth, (req, res, next) => {
    uploadMiddleware.single('file')(req, res, (err: any) => {
        // Jika ada peringatan multer (Ditolak karena beda format MIME / terlalu besar sizenya)
        if (err) return res.status(400).json({ success: false, error: err.message });
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: "Tidak ada file yang diunggah" });

        // Ambil nama folder tujuan dari field Form Data (contoh: 'posts', 'facilities', 'personnel'), default ke 'general'
        const folder = req.body.folder ? `${req.body.folder}/` : 'general/';

        // Buat nama random, lalu pertahankan ekstensi file-nya
        const ext = req.file.originalname.split('.').pop() || 'tmp';
        const genFileName = `${Date.now()}-${randomUUID()}.${ext}`;
        const objectName = `${folder}${genFileName}`;

        // Eksekusi tembakan file ke Server MinIO Remote!
        await minioClient.putObject(
            BUCKET_NAME,
            objectName,
            req.file.buffer, // Datanya dikirim sebagai Memory Buffer (ram)
            req.file.size,
            { 'Content-Type': req.file.mimetype }
        );

        // Buat URL proxy yang dapat diakses publik (tanpa membocorkan IP/Port Server VPS Asli)
        const fileUrl = `/api/files/${objectName}`;

        handleSuccess(res, { url: fileUrl, fileName: objectName }, "File berhasil diunggah");
    } catch (err: any) {
        console.error("Upload error:", err);
        handleError(res, err, 500);
    }
});

// --- Rute Pipa Proxy File (Menyembunyikan Server MinIO asli dari Publik) ---
app.get(/^\/api\/files\/(.+)$/, async (req, res) => {
    try {
        const objectName = (req.params as any)[0];

        if (!objectName) return res.status(400).json({ success: false, error: "Nama file tidak valid" });

        // Ambil data file (stat object) terlebih dahulu untuk mengisi Header (tipe konten dan ukuran)
        const stat = await minioClient.statObject(BUCKET_NAME, objectName);
        if (stat.metaData && stat.metaData['content-type']) {
            res.setHeader('Content-Type', stat.metaData['content-type']);
        } else {
            res.setHeader('Content-Type', 'application/octet-stream');
        }
        res.setHeader('Content-Length', stat.size);

        // Buka pipa sirkulasi langsung dari MinIO ke User (Klien)
        const dataStream = await minioClient.getObject(BUCKET_NAME, objectName);
        dataStream.pipe(res);

    } catch (error: any) {
        if (error.code === 'NotFound') {
            res.status(404).json({ success: false, error: "File tidak ditemukan" });
        } else {
            console.error("Error mengambil file dari MinIO:", error);
            res.status(500).json({ success: false, error: "Terjadi kesalahan saat memproses file" });
        }
    }
});

// --- Fitur Masuk Akun (Autentikasi Aplikasi) ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: "Email/NIP dan Password wajib diisi." });

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { nip: email }
                ]
            }
        });
        if (!user) return res.status(401).json({ success: false, error: "Email/NIP atau Password salah." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, error: "Email/NIP atau Password salah." });

        const token = jsonwebtoken.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

        // Mengirim data pengguna yang sukses login beserta Token Akses (Kunci Rahasia)
        const { password: _, ...userWithoutPassword } = user;
        handleSuccess(res, { token, user: userWithoutPassword }, "Login berhasil");
    } catch (error) { handleError(res, error); }
});

// --- Manajemen Pengguna (Admin Sistem CMS) ---
app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } });
        handleSuccess(res, users);
    } catch (error) { handleError(res, error); }
});

app.post('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, email, password, role, nip } = req.body;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ success: false, error: "Email sudah digunakan." });
        if (nip) {
            const existingNip = await prisma.user.findUnique({ where: { nip } });
            if (existingNip) return res.status(400).json({ success: false, error: "NIP sudah digunakan." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role, nip: nip || null },
            select: { id: true, name: true, email: true, nip: true, role: true, createdAt: true, updatedAt: true }
        });
        handleSuccess(res, user, 'Admin pengguna berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { name, email, password, role, nip } = req.body;

        const data: any = { name, email, role, nip: nip || null };
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        // Mencegah pemakaian email yang sama oleh admin lain
        const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
        if (existing) return res.status(400).json({ success: false, error: "Email sudah digunakan oleh admin lain." });

        if (nip) {
            const existingNip = await prisma.user.findFirst({ where: { nip, NOT: { id } } });
            if (existingNip) return res.status(400).json({ success: false, error: "NIP sudah digunakan oleh admin lain." });
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, nip: true, role: true, createdAt: true, updatedAt: true }
        });
        handleSuccess(res, user, 'Admin pengguna berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        // Cek jangan hapus diri sendiri (opsional) atau master admin.
        if (id === (req as any).user.id) {
            return res.status(400).json({ success: false, error: "Tidak dapat menghapus akun Anda sendiri." });
        }
        await prisma.user.delete({ where: { id } });
        handleSuccess(res, null, 'Admin pengguna berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Manajemen Tenaga Pendidik (Guru & Karyawan) ---
app.get('/api/education-personnel', requireAuth, async (req, res) => {
    try {
        const personnel = await prisma.educationPersonnel.findMany({
            orderBy: { sort_order: 'asc' },
        });
        // Menyesuaikan format waktu pembuatan agar bisa dibaca Frontend
        const formatted = personnel.map(p => ({ ...p, created_at: p.createdAt, updated_at: p.createdAt }));
        handleSuccess(res, formatted);
    } catch (error) { handleError(res, error); }
});

app.post('/api/education-personnel', requireAuth, async (req, res) => {
    try {
        const { created_at, updated_at, ...data } = req.body;
        const personnel = await prisma.educationPersonnel.create({ data });
        handleSuccess(res, { ...personnel, created_at: personnel.createdAt, updated_at: personnel.createdAt }, 'Personel berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/education-personnel/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { created_at, updated_at, id: _, ...data } = req.body;
        const personnel = await prisma.educationPersonnel.update({
            where: { id },
            data,
        });
        handleSuccess(res, { ...personnel, created_at: personnel.createdAt, updated_at: personnel.createdAt }, 'Personel berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/education-personnel/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.educationPersonnel.delete({ where: { id } });
        handleSuccess(res, null, 'Personel berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Manajemen Artikel dan Berita ---
app.get('/api/posts', requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '10');
        // Mencocokkan bahasa waktu urutan (sorting) dari Frontend ke struktur Database Anda
        const rawSortBy = req.query.sortBy as string || 'createdAt';
        const sortBy = rawSortBy === 'created_at' ? 'createdAt' : rawSortBy === 'updated_at' ? 'updatedAt' : rawSortBy;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

        const [total, posts] = await Promise.all([
            prisma.post.count(),
            prisma.post.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            })
        ]);

        const formatted = posts.map(p => ({ ...p, created_at: p.createdAt, updated_at: p.updatedAt }));

        handleSuccess(res, {
            data: formatted,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) { handleError(res, error); }
});

const generateUniqueSlug = async (title: string, excludeId?: string) => {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    const where: any = excludeId ? { NOT: { id: excludeId } } : {};

    while (await prisma.post.findFirst({ where: { ...where, slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}

app.post('/api/posts', requireAuth, async (req, res) => {
    try {
        const { created_at, updated_at, category, ...data } = req.body;
        const slug = await generateUniqueSlug(data.title);
        const post = await prisma.post.create({
            data: {
                ...data,
                slug,
                category: category,
                updatedAt: new Date()
            }
        });
        handleSuccess(res, { ...post, created_at: post.createdAt, updated_at: post.updatedAt }, 'Postingan berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/posts/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { created_at, updated_at, id: _, category, ...data } = req.body;
        let slug = undefined;
        if (data.title) {
            slug = await generateUniqueSlug(data.title, id);
            (data as any).slug = slug;
        }
        const post = await prisma.post.update({
            where: { id },
            data: { ...data, category: category, updatedAt: new Date() }
        });
        handleSuccess(res, { ...post, created_at: post.createdAt, updated_at: post.updatedAt }, 'Postingan berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/posts/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.post.delete({ where: { id } });
        handleSuccess(res, null, 'Postingan berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Manajemen Data Kelulusan Siswa ---
app.get('/api/graduations', requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '10');
        const rawSortBy = req.query.sortBy as string || 'createdAt';
        const sortBy = rawSortBy === 'created_at' ? 'createdAt' : rawSortBy;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
        const searchNisn = req.query.searchNisn as string;

        const where = searchNisn ? { nisn: { contains: searchNisn } } : {};

        const [total, graduations] = await Promise.all([
            prisma.graduation.count({ where }),
            prisma.graduation.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            })
        ]);

        const formatted = graduations.map(g => ({ ...g, created_at: g.createdAt, updated_at: g.createdAt }));

        handleSuccess(res, {
            data: formatted,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) { handleError(res, error); }
});

app.post('/api/graduations', requireAuth, async (req, res) => {
    try {
        const { created_at, updated_at, ...data } = req.body;
        const existing = await prisma.graduation.findUnique({ where: { nisn: data.nisn } });
        if (existing) {
            return res.status(400).json({ success: false, error: "NISN sudah terdaftar" });
        }
        const graduation = await prisma.graduation.create({ data: { ...data, id: randomUUID() } });
        handleSuccess(res, { ...graduation, created_at: graduation.createdAt, updated_at: graduation.createdAt }, 'Data kelulusan berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/graduations/:nisn', requireAuth, async (req, res) => {
    try {
        const { nisn } = req.params as { nisn: string };
        const { created_at, updated_at, ...data } = req.body;
        const graduation = await prisma.graduation.update({ where: { nisn }, data });
        handleSuccess(res, { ...graduation, created_at: graduation.createdAt, updated_at: graduation.createdAt }, 'Data kelulusan berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/graduations/:nisn', requireAuth, async (req, res) => {
    try {
        const { nisn } = req.params as { nisn: string };
        await prisma.graduation.delete({ where: { nisn } });
        handleSuccess(res, null, 'Data kelulusan berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Manajemen Dokumen dan Peraturan Akademik ---
app.get('/api/academic-documents', requireAuth, async (req, res) => {
    try {
        const documents = await prisma.academicDocument.findMany();
        const formatted = documents.map(d => ({ ...d, created_at: d.createdAt, updated_at: d.createdAt }));
        handleSuccess(res, formatted);
    } catch (error) { handleError(res, error); }
});

app.post('/api/academic-documents', requireAuth, async (req, res) => {
    try {
        const { created_at, updated_at, ...data } = req.body;
        const doc = await prisma.academicDocument.create({ data });
        handleSuccess(res, { ...doc, created_at: doc.createdAt, updated_at: doc.createdAt }, 'Dokumen berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/academic-documents/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { created_at, updated_at, id: _, ...data } = req.body;
        const doc = await prisma.academicDocument.update({ where: { id }, data });
        handleSuccess(res, { ...doc, created_at: doc.createdAt, updated_at: doc.createdAt }, 'Dokumen berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/academic-documents/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.academicDocument.delete({ where: { id } });
        handleSuccess(res, null, 'Dokumen berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Manajemen Kegiatan Ekstrakurikuler ---
const generateUniqueEkskulSlug = async (title: string, excludeId?: string) => {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;

    const where: any = excludeId ? { NOT: { id: excludeId } } : {};

    while (await prisma.extracurricular.findFirst({ where: { ...where, slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}

app.get('/api/extracurriculars', requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '10');
        const rawSortBy = req.query.sortBy as string || 'createdAt';
        const sortBy = rawSortBy === 'created_at' ? 'createdAt' : rawSortBy === 'updated_at' ? 'updatedAt' : rawSortBy;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

        const [total, items] = await Promise.all([
            prisma.extracurricular.count(),
            prisma.extracurricular.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            })
        ]);

        const formatted = items.map(d => ({ ...d, created_at: d.createdAt, updated_at: d.updatedAt }));
        handleSuccess(res, {
            data: formatted,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) { handleError(res, error); }
});

app.post('/api/extracurriculars', requireAuth, async (req, res) => {
    try {
        const { created_at, updated_at, ...data } = req.body;
        const slug = await generateUniqueEkskulSlug(data.title);
        const item = await prisma.extracurricular.create({
            data: {
                ...data,
                slug,
                updatedAt: new Date()
            }
        });
        handleSuccess(res, { ...item, created_at: item.createdAt, updated_at: item.updatedAt }, 'Artikel ekstrakurikuler berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/extracurriculars/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { created_at, updated_at, id: _, ...data } = req.body;

        let slug = undefined;
        if (data.title) {
            slug = await generateUniqueEkskulSlug(data.title, id);
            (data as any).slug = slug;
        }

        const item = await prisma.extracurricular.update({
            where: { id },
            data: { ...data, updatedAt: new Date() }
        });
        handleSuccess(res, { ...item, created_at: item.createdAt, updated_at: item.updatedAt }, 'Artikel ekstrakurikuler berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/extracurriculars/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.extracurricular.delete({ where: { id } });
        handleSuccess(res, null, 'Artikel ekstrakurikuler berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Manajemen Fasilitas dan Sarana Prasarana Sekolah ---
app.get('/api/facilities', requireAuth, async (req, res) => {
    try {
        const items = await prisma.facility.findMany();
        const formatted = items.map(d => ({ ...d, created_at: d.createdAt, updated_at: d.createdAt }));
        handleSuccess(res, formatted);
    } catch (error) { handleError(res, error); }
});

app.post('/api/facilities', requireAuth, async (req, res) => {
    try {
        const { created_at, updated_at, ...data } = req.body;
        const item = await prisma.facility.create({ data });
        handleSuccess(res, { ...item, created_at: item.createdAt, updated_at: item.createdAt }, 'Fasilitas berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/facilities/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { created_at, updated_at, id: _, ...data } = req.body;
        const item = await prisma.facility.update({ where: { id }, data });
        handleSuccess(res, { ...item, created_at: item.createdAt, updated_at: item.createdAt }, 'Fasilitas berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/facilities/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.facility.delete({ where: { id } });
        handleSuccess(res, null, 'Fasilitas berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Manajemen Kalender / Hari Libur (Holidays) ---
app.get('/api/holidays', requireAuth, async (req, res) => {
    try {
        const holidays = await prisma.holiday.findMany({
            orderBy: { date: 'asc' }
        });
        const formatted = holidays.map((h: any) => ({ ...h, created_at: h.createdAt, updated_at: h.updatedAt }));
        handleSuccess(res, formatted);
    } catch (error) { handleError(res, error); }
});

app.post('/api/holidays/upload', requireAuth, (req, res, next) => {
    uploadMiddleware.single('file')(req, res, (err: any) => {
        if (err) return res.status(400).json({ success: false, error: err.message });
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: "Tidak ada file yang diunggah" });

        // Baca excel dari file buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Konversi ke array of objects
        const data: any[] = xlsx.utils.sheet_to_json(sheet);

        // Hapus holidays sebelumnya (opsional) atau kita timpa yg ada
        // Untuk amannya dan simpel, kita tidak menghapus yang sudah ada (kecuali user request replace all)
        // Kita hanya tambahkan ke database

        const validHolidays = data.filter(row => row['Tanggal'] && row['Bulan'] && row['Tahun'] && row['Perayaan']);

        const insertData = validHolidays.map(row => {
            const day = row['Tanggal'];
            const month = row['Bulan'];
            const year = row['Tahun'];
            const description = row['Perayaan'];

            // Format JS Date (Month is 0-indexed in JS, but here we construct string)
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;

            return {
                date: new Date(dateStr),
                description: description
            }
        });

        if (insertData.length === 0) {
            return res.status(400).json({ success: false, error: "Format Excel tidak valid atau kosong. Pastikan kolom: Tanggal, Bulan, Tahun, Perayaan" });
        }

        // Simpan bulk data ke dalam database
        await prisma.holiday.createMany({
            data: insertData
        });

        handleSuccess(res, { count: insertData.length }, `${insertData.length} hari perayaan berhasil ditambahkan`);
    } catch (error) {
        console.error("Error process excel", error);
        handleError(res, error);
    }
});

app.delete('/api/holidays/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.holiday.delete({ where: { id } });
        handleSuccess(res, null, 'Hari libur berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Manajemen Jadwal Pelajaran (School Schedule) ---
app.get('/api/school-schedule', requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '10');
        const search = req.query.search as string;

        const where: any = search ? {
            OR: [
                { class_name: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
                { teacher_nip: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        const [total, items] = await Promise.all([
            prisma.schoolSchedule.count({ where }),
            prisma.schoolSchedule.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [
                    { day_of_week: 'asc' },
                    { period: 'asc' }
                ],
                include: { teacher: true }
            })
        ]);

        handleSuccess(res, {
            data: items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) { handleError(res, error); }
});

app.post('/api/school-schedule', requireAuth, async (req, res) => {
    try {
        const { class_name, period, time, subject, day_of_week, teacher_nip } = req.body;

        let validNip = null;
        if (teacher_nip) {
            const checkNip = await prisma.educationPersonnel.findUnique({ where: { nip: teacher_nip } });
            if (checkNip) validNip = teacher_nip;
        }

        const item = await prisma.schoolSchedule.create({
            data: { class_name, period, time, subject, day_of_week, teacher_nip: validNip }
        });
        handleSuccess(res, item, 'Jadwal berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/school-schedule/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { class_name, period, time, subject, day_of_week, teacher_nip } = req.body;

        let validNip = null;
        if (teacher_nip) {
            const checkNip = await prisma.educationPersonnel.findUnique({ where: { nip: teacher_nip } });
            if (checkNip) validNip = teacher_nip;
        }

        const item = await prisma.schoolSchedule.update({
            where: { id },
            data: { class_name, period, time, subject, day_of_week, teacher_nip: validNip }
        });
        handleSuccess(res, item, 'Jadwal berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/school-schedule/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.schoolSchedule.delete({ where: { id } });
        handleSuccess(res, null, 'Jadwal berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

app.post('/api/school-schedule/upload', requireAuth, (req, res, next) => {
    uploadMiddleware.single('file')(req, res, (err: any) => {
        if (err) return res.status(400).json({ success: false, error: err.message });
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: "Tidak ada file yang diunggah" });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data: any[] = xlsx.utils.sheet_to_json(sheet);

        const allPersonnel = await prisma.educationPersonnel.findMany({ select: { nip: true } });
        const nipSet = new Set(allPersonnel.filter(p => p.nip).map(p => p.nip));

        const insertData = data
            .map(row => {
                const class_name = row['Nama Kelas']?.toString() || row['Kelas']?.toString();
                const period = row['Jam Ke']?.toString();
                const time = row['Jam']?.toString() || row['Waktu']?.toString();
                const subject = row['Mata Pelajaran']?.toString();
                const teacher_nip_raw = row['NIP Guru Pengajar']?.toString() || row['NIP']?.toString();
                const day_of_week = row['Hari']?.toString();

                if (!class_name || !period || !time || !subject || !day_of_week) return null;

                const validNip = (teacher_nip_raw && nipSet.has(teacher_nip_raw)) ? teacher_nip_raw : null;

                return {
                    class_name,
                    period,
                    time,
                    subject,
                    day_of_week,
                    teacher_nip: validNip
                };
            })
            .filter((row): row is Exclude<typeof row, null> => row !== null);

        if (insertData.length === 0) {
            return res.status(400).json({ success: false, error: "Format Excel tidak valid. Pastikan kolom: Nama Kelas, Jam Ke, Jam, Mata Pelajaran, NIP Guru Pengajar, Hari" });
        }

        await prisma.schoolSchedule.createMany({ data: insertData });

        handleSuccess(res, { count: insertData.length }, `${insertData.length} jadwal berhasil ditambahkan`);
    } catch (error) { console.error("Error process excel", error); handleError(res, error); }
});

// --- Statistik Ringkasan Untuk Dashboard CMS ---
app.get('/api/dashboard-stats', requireAuth, async (req, res) => {
    try {
        const [
            totalPersonnel,
            totalPosts,
            totalGraduates,
            totalDocuments,
            totalExtracurriculars,
            totalFacilities,
            publishedPosts,
            graduatedStudents
        ] = await Promise.all([
            prisma.educationPersonnel.count(),
            prisma.post.count(),
            prisma.graduation.count(),
            prisma.academicDocument.count(),
            prisma.extracurricular.count(),
            prisma.facility.count(),
            prisma.post.count({ where: { is_published: true } }),
            prisma.graduation.count({ where: { is_graduated: true } }),
        ]);

        handleSuccess(res, {
            totalPersonnel,
            totalPosts,
            totalGraduates,
            totalDocuments,
            totalExtracurriculars,
            totalFacilities,
            publishedPosts,
            graduatedStudents
        });
    } catch (error) { handleError(res, error); }
});

// --- Serving Frontend Build (Production) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback rute untuk SPA (Single Page Application) Frontend
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
