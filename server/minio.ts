import * as Minio from 'minio';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

// Konfigurasi MinIO Client (Eksklusif mengambil dari .env)
export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT as string,
    port: parseInt(process.env.MINIO_PORT as string, 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY as string,
    secretKey: process.env.MINIO_SECRET_KEY as string
});

// Nama bucket default untuk menyimpan gambar/dokumen
export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME as string;

// Validasi ketersediaan di .env
if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY || !process.env.MINIO_BUCKET_NAME) {
    console.error("❌ ERROR: Kredensial MinIO belum disetel lengkap di file .env lokal Anda!");
}

// Fungsi helper untuk inisialisasi bucket jika belum ada
export const initBucket = async () => {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`Bucket ${BUCKET_NAME} berhasil dibuat di MinIO Server.`);

            // Opsional: Buat policy agar file bisa diakses publik (Read Only)
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: '*',
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
                    }
                ]
            };
            await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
        }
    } catch (err) {
        console.error('Error saat inisialisasi bucket MinIO:', err);
    }
};

// Konfigurasi Multer Memory Storage (File disimpan di memori sementara sebelum dikirim ke MinIO)
export const uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // Batasan ukuran file (contoh: maksimal 5MB)
    }
});
