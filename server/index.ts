import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'heworqcv89y47ry34bcti4ycit438obvi74b57li6v534v13vy54y56';

app.use(cors());
app.use(express.json());

// Helpers for API response
const handleSuccess = (res: Response, data: any, message?: string) => res.json({ success: true, data, message });
const handleError = (res: Response, error: any, status = 500) => {
    console.error(error);
    res.status(status).json({ success: false, error: "Telah terjadi kesalahan pada server." });
};

// -- Auth Middleware --
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

// --- Authentication ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: "Email dan Password wajib diisi." });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ success: false, error: "Email atau Password salah." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, error: "Email atau Password salah." });

        const token = jsonwebtoken.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

        // Kirim response
        const { password: _, ...userWithoutPassword } = user;
        handleSuccess(res, { token, user: userWithoutPassword }, "Login berhasil");
    } catch (error) { handleError(res, error); }
});

// --- Users (Admin) Management ---
app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } });
        handleSuccess(res, users);
    } catch (error) { handleError(res, error); }
});

app.post('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ success: false, error: "Email sudah digunakan." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role },
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
        });
        handleSuccess(res, user, 'Admin pengguna berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { name, email, password, role } = req.body;

        const data: any = { name, email, role };
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        // Check if email already exists for another user
        const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
        if (existing) return res.status(400).json({ success: false, error: "Email sudah digunakan oleh admin lain." });

        const user = await prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
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

// --- Education Personnel ---
app.get('/api/education-personnel', async (req, res) => {
    try {
        const personnel = await prisma.educationPersonnel.findMany({
            orderBy: { sort_order: 'asc' },
        });
        // Transform createdAt to created_at for frontend compat
        const formatted = personnel.map(p => ({ ...p, created_at: p.createdAt, updated_at: p.createdAt }));
        handleSuccess(res, formatted);
    } catch (error) { handleError(res, error); }
});

app.post('/api/education-personnel', async (req, res) => {
    try {
        const { created_at, updated_at, ...data } = req.body;
        const personnel = await prisma.educationPersonnel.create({ data });
        handleSuccess(res, { ...personnel, created_at: personnel.createdAt, updated_at: personnel.createdAt }, 'Personel berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/education-personnel/:id', async (req, res) => {
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

app.delete('/api/education-personnel/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.educationPersonnel.delete({ where: { id } });
        handleSuccess(res, null, 'Personel berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Posts ---
app.get('/api/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '10');
        // Map order fields based on actual Prisma schema (createdAt instead of created_at)
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

const generateUniqueSlug = async (title: string) => {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}

app.post('/api/posts', async (req, res) => {
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

app.put('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { created_at, updated_at, id: _, category, ...data } = req.body;
        let slug = undefined;
        if (data.title) {
            slug = await generateUniqueSlug(data.title);
            (data as any).slug = slug;
        }
        const post = await prisma.post.update({
            where: { id },
            data: { ...data, updatedAt: new Date() }
        });
        handleSuccess(res, { ...post, created_at: post.createdAt, updated_at: post.updatedAt }, 'Postingan berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.post.delete({ where: { id } });
        handleSuccess(res, null, 'Postingan berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Graduations ---
app.get('/api/graduations', async (req, res) => {
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

app.post('/api/graduations', async (req, res) => {
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

app.put('/api/graduations/:nisn', async (req, res) => {
    try {
        const { nisn } = req.params as { nisn: string };
        const { created_at, updated_at, ...data } = req.body;
        const graduation = await prisma.graduation.update({ where: { nisn }, data });
        handleSuccess(res, { ...graduation, created_at: graduation.createdAt, updated_at: graduation.createdAt }, 'Data kelulusan berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/graduations/:nisn', async (req, res) => {
    try {
        const { nisn } = req.params as { nisn: string };
        await prisma.graduation.delete({ where: { nisn } });
        handleSuccess(res, null, 'Data kelulusan berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Academic Documents ---
app.get('/api/academic-documents', async (req, res) => {
    try {
        const documents = await prisma.academicDocument.findMany();
        const formatted = documents.map(d => ({ ...d, created_at: d.createdAt, updated_at: d.createdAt }));
        handleSuccess(res, formatted);
    } catch (error) { handleError(res, error); }
});

app.post('/api/academic-documents', async (req, res) => {
    try {
        const { created_at, updated_at, ...data } = req.body;
        const doc = await prisma.academicDocument.create({ data });
        handleSuccess(res, { ...doc, created_at: doc.createdAt, updated_at: doc.createdAt }, 'Dokumen berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/academic-documents/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { created_at, updated_at, id: _, ...data } = req.body;
        const doc = await prisma.academicDocument.update({ where: { id }, data });
        handleSuccess(res, { ...doc, created_at: doc.createdAt, updated_at: doc.createdAt }, 'Dokumen berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/academic-documents/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.academicDocument.delete({ where: { id } });
        handleSuccess(res, null, 'Dokumen berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Extracurriculars ---
const generateUniqueEkskulSlug = async (title: string) => {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.extracurricular.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}

app.get('/api/extracurriculars', async (req, res) => {
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

app.post('/api/extracurriculars', async (req, res) => {
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

app.put('/api/extracurriculars/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { created_at, updated_at, id: _, ...data } = req.body;

        let slug = undefined;
        if (data.title) {
            slug = await generateUniqueEkskulSlug(data.title);
            (data as any).slug = slug;
        }

        const item = await prisma.extracurricular.update({
            where: { id },
            data: { ...data, updatedAt: new Date() }
        });
        handleSuccess(res, { ...item, created_at: item.createdAt, updated_at: item.updatedAt }, 'Artikel ekstrakurikuler berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/extracurriculars/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.extracurricular.delete({ where: { id } });
        handleSuccess(res, null, 'Artikel ekstrakurikuler berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Facilities ---
app.get('/api/facilities', async (req, res) => {
    try {
        const items = await prisma.facility.findMany();
        const formatted = items.map(d => ({ ...d, created_at: d.createdAt, updated_at: d.createdAt }));
        handleSuccess(res, formatted);
    } catch (error) { handleError(res, error); }
});

app.post('/api/facilities', async (req, res) => {
    try {
        const { created_at, updated_at, ...data } = req.body;
        const item = await prisma.facility.create({ data });
        handleSuccess(res, { ...item, created_at: item.createdAt, updated_at: item.createdAt }, 'Fasilitas berhasil ditambahkan');
    } catch (error) { handleError(res, error); }
});

app.put('/api/facilities/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        const { created_at, updated_at, id: _, ...data } = req.body;
        const item = await prisma.facility.update({ where: { id }, data });
        handleSuccess(res, { ...item, created_at: item.createdAt, updated_at: item.createdAt }, 'Fasilitas berhasil diperbarui');
    } catch (error) { handleError(res, error); }
});

app.delete('/api/facilities/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.facility.delete({ where: { id } });
        handleSuccess(res, null, 'Fasilitas berhasil dihapus');
    } catch (error) { handleError(res, error); }
});

// --- Dashboard Stats ---
app.get('/api/dashboard-stats', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
