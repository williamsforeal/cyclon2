/**
 * S3 Helper Utilities
 * ADHD-friendly: Simple upload/download with progress tracking
 */

import AWS from 'aws-sdk';
import axios from 'axios';

export class S3Helper {
  private s3: AWS.S3;
  private bucket: string;

  constructor(config: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  }) {
    this.bucket = config.bucket;
    this.s3 = new AWS.S3({
      region: config.region,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    });
  }

  /**
   * Upload a file from URL to S3
   */
  async uploadFromUrl(url: string, key: string): Promise<string> {
    try {
      console.log(`Downloading from ${url}...`);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      console.log(`Uploading to S3: ${key}...`);
      await this.s3
        .putObject({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: response.headers['content-type'] || 'image/png',
        })
        .promise();

      return this.getPublicUrl(key);
    } catch (error) {
      console.error(`Error uploading ${key} to S3:`, error);
      throw error;
    }
  }

  /**
   * Upload buffer to S3
   */
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string = 'image/png'
  ): Promise<string> {
    try {
      await this.s3
        .putObject({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
        .promise();

      return this.getPublicUrl(key);
    } catch (error) {
      console.error(`Error uploading buffer to S3:`, error);
      throw error;
    }
  }

  /**
   * Download a file from S3
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const response = await this.s3
        .getObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();

      return response.Body as Buffer;
    } catch (error) {
      console.error(`Error downloading ${key} from S3:`, error);
      throw error;
    }
  }

  /**
   * Get public URL for an S3 object
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  /**
   * Get signed URL for temporary access
   */
  getSignedUrl(key: string, expiresIn: number = 3600): string {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    });
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3
        .headObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
      return true;
    } catch (error) {
      console.error(`Error deleting ${key} from S3:`, error);
      throw error;
    }
  }

  /**
   * List files in S3 with prefix
   */
  async listFiles(prefix: string = ''): Promise<string[]> {
    try {
      const response = await this.s3
        .listObjectsV2({
          Bucket: this.bucket,
          Prefix: prefix,
        })
        .promise();

      return (response.Contents || []).map((obj) => obj.Key || '');
    } catch (error) {
      console.error(`Error listing files in S3:`, error);
      throw error;
    }
  }
}
