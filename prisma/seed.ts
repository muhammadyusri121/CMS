import { PrismaClient, Role, PostCategory, DocType } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('Mulai menanam data (seeding) ke database...')

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Seed Data: User (Autentikasi CMS)
    const users = [
        { email: 'adminbaru@sman1ketapang.sch.id', password: hashedPassword, name: 'Admin Baru', role: Role.ADMIN },
        { email: 'admin@sman1ketapang.sch.id', password: hashedPassword, name: 'Super Admin', role: Role.ADMIN },
        { email: 'editor@sman1ketapang.sch.id', password: hashedPassword, name: 'Editor Web', role: Role.EDITOR },
        { email: 'author@sman1ketapang.sch.id', password: hashedPassword, name: 'Penulis Sekolah', role: Role.AUTHOR },
    ]
    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: { password: u.password },
            create: u,
        })
    }
    console.log('✅ Data User berhasil ditambahkan (Password otomatis di-hash: password123)')

    // 2. Seed Data: GTK (Education Personnel)
    const personnel = [
        { nip: '198001012005011001', full_name: 'Drs. Budi Santoso, M.Pd.', position: 'Kepala Sekolah', image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200', sort_order: 1 },
        { nip: '198203152008012003', full_name: 'Siti Aminah, S.Pd.', position: 'Waka Kurikulum', image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200', sort_order: 2 },
        { nip: '198507222010011005', full_name: 'Ahmad Rizal, S.Kom.', position: 'Guru TIK', image_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200&h=200', sort_order: 3 },
    ]
    for (const p of personnel) {
        await prisma.educationPersonnel.upsert({
            where: { nip: p.nip },
            update: {},
            create: p,
        })
    }
    console.log('✅ Data GTK berhasil ditambahkan')

    // 3. Seed Data: Artikel/Berita (Post)
    const posts = [
        { slug: 'prestasi-osn-2026', title: 'Siswa SMAN 1 Ketapang Juara OSN 2026', content: 'Selamat kepada ananda Budi yang berhasil meraih medali emas pada Olimpiade Sains Nasional tingkat Kabupaten...', category: PostCategory.NEWS, thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800&h=400', is_published: true },
        { slug: 'karya-inovasi-daur-ulang', title: 'Pameran Karya Inovasi Daur Ulang', content: 'Seluruh siswa kelas X dan XI berpartisipasi dalam pameran kreatif daur ulang sampah plastik menjadi barang bernilai jual...', category: PostCategory.INNOVATION, thumbnail: 'https://images.unsplash.com/photo-1584736286279-4a27d2fa9b47?auto=format&fit=crop&q=80&w=800&h=400', is_published: true },
        { slug: 'program-double-track', title: 'Peluncuran Program Double Track Tata Boga', content: 'Sekolah kini menghadirkan program ekstrakurikuler Double Track Tata Boga untuk membekali siswa skil wirausaha...', category: PostCategory.DOUBLE_TRACK, thumbnail: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800&h=400', is_published: true },
    ]
    for (const post of posts) {
        await prisma.post.upsert({
            where: { slug: post.slug },
            update: {},
            create: post,
        })
    }
    console.log('✅ Data Artikel/Berita berhasil ditambahkan')

    // 4. Seed Data: Kelulusan Siswa (Graduation)
    const graduations = [
        { nisn: '0012345671', student_name: 'Ahmad Fauzi', exam_number: 'UJN-2026-001', is_graduated: true, graduation_year: 2026 },
        { nisn: '0012345672', student_name: 'Bunga Citra', exam_number: 'UJN-2026-002', is_graduated: true, graduation_year: 2026 },
        { nisn: '0012345673', student_name: 'Reza Rahadian', exam_number: 'UJN-2026-003', is_graduated: false, graduation_year: 2026 },
    ]
    for (const grad of graduations) {
        await prisma.graduation.upsert({
            where: { nisn: grad.nisn },
            update: {},
            create: grad,
        })
    }
    console.log('✅ Data Kelulusan berhasil ditambahkan')

    // 5. Seed Data: Dokumen Akademik (AcademicDocument)
    const docs = [
        { file_name: 'Kalender Akademik 2026/2027', file_path: '/uploads/docs/kalender-2026.pdf', doc_type: DocType.CALENDAR },
        { file_name: 'Jadwal Pelajaran Ganjil', file_path: '/uploads/docs/jadwal-ganjil.pdf', doc_type: DocType.SCHEDULE },
        { file_name: 'Tata Tertib Sekolah', file_path: '/uploads/docs/tata-tertib.pdf', doc_type: DocType.REGULATION },
    ]
    for (const doc of docs) {
        // Akademik Document tidak punya kolom unique text, jadi create aja. Atau kita buat loop sederhana.
        await prisma.academicDocument.create({ data: doc })
    }
    console.log('✅ Data Dokumen Akademik berhasil ditambahkan')

    // 6. Seed Data: Ekstrakurikuler (Extracurricular)
    const ekstrakurikuler = [
        { title: 'Kegiatan Kemah Pramuka 2026', slug: 'kemah-pramuka-2026', content: 'Kegiatan kemah bakti pramuka tahunan sdb...', ekskul_name: 'Pramuka', thumbnail: 'https://images.unsplash.com/photo-1517164850305-99a3e6cb8ade?auto=format&fit=crop&q=80&w=400&h=300', is_published: true },
        { title: 'Paskibraka Siap Bertugas Upacara', slug: 'paskibraka-bertugas', content: 'Latihan rutin setiap sabtu...', ekskul_name: 'Paskibra', thumbnail: 'https://images.unsplash.com/photo-1596726265737-013695eb04d6?auto=format&fit=crop&q=80&w=400&h=300', is_published: true },
        { title: 'Futsal SMAN 1 Juara 1', slug: 'futsal-juara-1', content: 'Turnamen futsal antar sekolah...', ekskul_name: 'Futsal', thumbnail: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=400&h=300', is_published: true },
    ]
    for (const extra of ekstrakurikuler) {
        await prisma.extracurricular.upsert({
            where: { slug: extra.slug },
            update: {},
            create: extra,
        })
    }
    console.log('✅ Data Ekstrakurikuler berhasil ditambahkan')

    // 7. Seed Data: Fasilitas Sekolah (Facility)
    const sarpras = [
        { name: 'Laboratorium Komputer', quantity: 2, image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400&h=300' },
        { name: 'Perpustakaan', quantity: 1, image_url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400&h=300' },
        { name: 'Lapangan Basket', quantity: 1, image_url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=400&h=300' },
    ]
    for (const s of sarpras) {
        await prisma.facility.create({ data: s })
    }
    console.log('✅ Data Fasilitas Sarpras berhasil ditambahkan')

    console.log('🎉 Semua data berhasil ditanam!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
