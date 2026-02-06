/**
 * Airtable Helper Utilities
 * ADHD-friendly: Simple, focused functions with clear purpose
 */

import axios from 'axios';
import { Actor, Scene, Product, AdCopy, AdVariant } from '../../types/schemas';

export class AirtableHelper {
  private apiKey: string;
  private baseId: string;
  private baseUrl: string;

  constructor(apiKey: string, baseId: string) {
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.baseUrl = `https://api.airtable.com/v0/${baseId}`;
  }

  /**
   * Get headers for Airtable API requests
   */
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get all records from a table
   */
  async getRecords<T>(tableName: string): Promise<T[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${tableName}`, {
        headers: this.getHeaders(),
      });
      return response.data.records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
    } catch (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get a single record by ID
   */
  async getRecord<T>(tableName: string, recordId: string): Promise<T> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${tableName}/${recordId}`,
        { headers: this.getHeaders() }
      );
      return {
        id: response.data.id,
        ...response.data.fields,
      } as T;
    } catch (error) {
      console.error(`Error fetching record ${recordId} from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async createRecord<T>(tableName: string, fields: Partial<T>): Promise<T> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${tableName}`,
        { fields },
        { headers: this.getHeaders() }
      );
      return {
        id: response.data.id,
        ...response.data.fields,
      } as T;
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing record
   */
  async updateRecord<T>(
    tableName: string,
    recordId: string,
    fields: Partial<T>
  ): Promise<T> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/${tableName}/${recordId}`,
        { fields },
        { headers: this.getHeaders() }
      );
      return {
        id: response.data.id,
        ...response.data.fields,
      } as T;
    } catch (error) {
      console.error(`Error updating record ${recordId} in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async deleteRecord(tableName: string, recordId: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/${tableName}/${recordId}`, {
        headers: this.getHeaders(),
      });
      return true;
    } catch (error) {
      console.error(`Error deleting record ${recordId} from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get pending ad variants that need processing
   */
  async getPendingAdVariants(): Promise<AdVariant[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/AdVariants?filterByFormula={status}='pending'`,
        { headers: this.getHeaders() }
      );
      return response.data.records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
    } catch (error) {
      console.error('Error fetching pending ad variants:', error);
      throw error;
    }
  }

  /**
   * Update ad variant status
   */
  async updateAdVariantStatus(
    variantId: string,
    status: 'pending' | 'generating' | 'complete' | 'failed',
    imageUrl?: string
  ): Promise<AdVariant> {
    const fields: any = { status, updatedAt: new Date().toISOString() };
    if (imageUrl) {
      fields.generatedImageUrl = imageUrl;
    }
    return this.updateRecord<AdVariant>('AdVariants', variantId, fields);
  }
}
