// PocketBase implementation of UserRepository
import PocketBase from 'pocketbase';
import { SchoolUser } from '../../../types';
import { UserRepository } from '../interfaces';
import { userCreateSchema, userUpdateSchema } from '../../validation/schemas';

/**
 * PocketBase implementation of UserRepository
 */
export class PocketBaseUserRepository implements UserRepository {
  private pb: PocketBase;
  private collectionName = 'users';

  constructor(pb: PocketBase) {
    this.pb = pb;
  }

  /**
   * Find all users
   */
  async findAll(): Promise<SchoolUser[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        sort: 'name',
      });
      return records.map(record => this.mapToSchoolUser(record));
    } catch (error) {
      console.error('Error finding all users:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<SchoolUser | null> {
    try {
      const record = await this.pb.collection(this.collectionName).getOne(id);
      return this.mapToSchoolUser(record);
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<SchoolUser | null> {
    try {
      const record = await this.pb.collection(this.collectionName).getFirstListItem(
        `email="${email}"`
      );
      return this.mapToSchoolUser(record);
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      console.error('Error finding user by email:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: SchoolUser['role']): Promise<SchoolUser[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `role="${role}"`,
        sort: 'name',
      });
      return records.map(record => this.mapToSchoolUser(record));
    } catch (error) {
      console.error('Error finding users by role:', error);
      throw new Error('Failed to retrieve users by role');
    }
  }

  /**
   * Find users by department
   */
  async findByDepartment(department: string): Promise<SchoolUser[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `department="${department}"`,
        sort: 'name',
      });
      return records.map(record => this.mapToSchoolUser(record));
    } catch (error) {
      console.error('Error finding users by department:', error);
      throw new Error('Failed to retrieve users by department');
    }
  }

  /**
   * Authenticate user with email and password
   */
  async authenticate(email: string, password: string): Promise<SchoolUser | null> {
    try {
      const authData = await this.pb.collection(this.collectionName).authWithPassword(email, password);
      if (authData.record) {
        return this.mapToSchoolUser(authData.record);
      }
      return null;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  async create(userData: Omit<SchoolUser, 'id'>): Promise<SchoolUser> {
    try {
      // Validate the user data
      const validatedData = userCreateSchema.parse(userData);
      
      const record = await this.pb.collection(this.collectionName).create(validatedData);
      return this.mapToSchoolUser(record);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update an existing user
   */
  async update(id: string, userData: Partial<SchoolUser>): Promise<SchoolUser> {
    try {
      // Validate the user data
      const validatedData = userUpdateSchema.parse(userData);
      
      const record = await this.pb.collection(this.collectionName).update(id, validatedData);
      return this.mapToSchoolUser(record);
    } catch (error) {
      if ((error as any).status === 404) {
        throw new Error('User not found');
      }
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    try {
      await this.pb.collection(this.collectionName).delete(id);
    } catch (error) {
      if ((error as any).status === 404) {
        throw new Error('User not found');
      }
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Map PocketBase record to SchoolUser
   */
  private mapToSchoolUser(record: any): SchoolUser {
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      role: record.role,
      department: record.department,
      avatarUrl: record.avatarUrl || '',
    };
  }
}