import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';

let s3Client = null;

// Initialize S3 client lazily
const getS3Client = () => {
  if (!s3Client) {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not properly configured');
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    console.log('✅ S3 Client initialized with region:', region);
  }
  return s3Client;
};

const getBucketName = () => {
  const bucketName = process.env.AWS_S3_BUCKET;
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }
  return bucketName;
};

// @desc    Upload file to S3
export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  try {
    const bucketName = getBucketName();
    const client = getS3Client();

    console.log('��� Uploading to S3:', {
      fileName,
      mimeType,
      bucketName,
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimeType
    };
    
    const command = new PutObjectCommand(params);
    await client.send(command);
    
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log('✅ S3 Upload successful:', url);
    
    return url;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    throw new Error('Failed to upload file to S3');
  }
};

// @desc    Delete file from S3
export const deleteFromS3 = async (fileKey) => {
  try {
    const bucketName = getBucketName();
    const client = getS3Client();

    const params = {
      Bucket: bucketName,
      Key: fileKey
    };
    
    const command = new DeleteObjectCommand(params);
    await client.send(command);
    
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

// @desc    Get signed URL for file access
export const getSignedUrl = async (fileKey, expiresIn = 3600) => {
  try {
    const bucketName = getBucketName();
    const client = getS3Client();

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey
    });
    
    const url = await getS3SignedUrl(client, command, { expiresIn });
    
    return url;
  } catch (error) {
    console.error('S3 Signed URL Error:', error);
    throw new Error('Failed to generate signed URL');
  }
};
