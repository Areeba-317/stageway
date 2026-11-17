const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
     region: 'auto',
     endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
     credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
     },
});

exports.uploadVideo = async (key, buffer, contentType) => {
     await client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET, Key: key, Body: buffer, ContentType: contentType,
     }));
     return `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
};

exports.deleteVideo = (key) =>
     client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));