import {PutObjectCommand} from "@aws-sdk/client-s3";
import {TRPCError} from "@trpc/server";
import spacesClient from "~/lib/aws-sdk/digital-ocean";
import {env} from "~/env";
import crypto from 'crypto';
import sharp from 'sharp';

export interface IUploadImage {
  file: string;
  module: string;
}

export interface IDocument {
  name: string;
  uri: string;
  status: "ACTIVE" | "DELETED";
  thumbnail: string;
}

export async function uploadImage(input: IUploadImage): Promise<IDocument> {
  // Helper function to extract the file extension from base64 string
  const getFileExtension = (base64: string): string => {
    const match = base64.match(/^data:(.+?);base64,/);
    if (!match) throw new Error("Invalid base64 string");
    const mimeType = match[1];
    // Extract extension from mime type
    return mimeType!.split("/")[1] ?? '';
  };

  // Generate a unique base filename using crypto
  const uniqueBaseName = crypto.randomBytes(16).toString('hex'); // Generates a unique identifier

  // Get the file extension
  const extension = getFileExtension(input.file);

  // Combine the unique name with the file extension
  const fullFileName = `${uniqueBaseName}.${extension}`;

  // Create upload key (including test/ prefix if not in production)
  const uploadKey = (env.NODE_ENV !== "production" ? "test/" : "") + input.module + "/" + fullFileName;

  // Helper function to convert base64 to buffer
  const base64ToBuffer = (base64: string): Buffer => {
    const base64Data = base64.split(",")[1]; // Split off the data part
    return Buffer.from(base64Data!, "base64");
  };

  // Convert base64 image to buffer
  const imageBuffer = base64ToBuffer(input.file);

  // Send the command
  const client = spacesClient;

  // Create the command to upload the compressed image
  const command = new PutObjectCommand({
    Bucket: env.DIGITAL_OCEAN_SPACES_BUCKET,
    Key: uploadKey,
    Body: imageBuffer,  // Upload the compressed image buffer
    ACL: "public-read",
  });
  // Send the command
  const upload = await client.send(command);

  // Error handling for failed upload
  if (upload.$metadata.httpStatusCode !== 200) {
    throw new TRPCError({
      message: "Failed to upload image to host",
      code: "INTERNAL_SERVER_ERROR",
    });
  }

  // Resize the image before compression (e.g., width = 800, auto height to maintain aspect ratio)
  const resizedImageBuffer = await sharp(imageBuffer)
    .resize({ width: 400, height: 400 })  // Resize to 800px wide, keeping aspect ratio
    .toBuffer();

  const uploadThumbnailKey = (env.NODE_ENV !== "production" ? "test/" : "") + input.module + `/thumbnails/${fullFileName}`;

  const commandThumbnail = new PutObjectCommand({
    Bucket: env.DIGITAL_OCEAN_SPACES_BUCKET,
    Key: uploadThumbnailKey,
    Body: resizedImageBuffer,  // Upload the compressed image buffer
    ACL: "public-read",
  });
  const uploadThumbnail = await client.send(commandThumbnail);

  // Error handling for failed upload
  if (uploadThumbnail.$metadata.httpStatusCode !== 200) {
    throw new TRPCError({
      message: "Failed to upload image thumbnail to host",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
  const thumbnailPath = `${env.DIGITAL_OCEAN_SPACES_CDN}/${uploadThumbnailKey}`;

  // Return image metadata
  return {
    name: fullFileName,
    uri: `${env.DIGITAL_OCEAN_SPACES_CDN}/${uploadKey}`,
    thumbnail: thumbnailPath,
    status: "ACTIVE",
  };
}