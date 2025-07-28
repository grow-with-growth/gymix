// User service that uses the repository pattern
import { SchoolUser } from '../../types';
import { UserRepository } from '../repositories/interfaces';

/**
 * User service that handles business logic for user operations
 */
export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<SchoolUser[]> {
    return await this.userRepository.findAll();
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<SchoolUser | null> {
    if (!id) {
      throw new Error('User ID is required');
    }
    return await this.userRepository.findById(id);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<SchoolUser | null> {
    if (!email) {
      throw new Error('Email is required');
    }
    return await this.userRepository.findByEmail(email);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: SchoolUser['role']): Promise<SchoolUser[]> {
    if (!role) {
      throw new Error('Role is required');
    }
    return await this.userRepository.findByRole(role);
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(department: string): Promise<SchoolUser[]> {
    if (!department) {
      throw new Error('Department is required');
    }
    return await this.userRepository.findByDepartment(department);
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email: string, password: string): Promise<SchoolUser | null> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    return await this.userRepository.authenticate(email, password);
  }

  /**
   * Create a new user
   */
  async createUser(userData: Omit<SchoolUser, 'id'>): Promise<SchoolUser> {
    // Business logic validation
    if (!userData.name || !userData.email || !userData.role || !userData.department) {
      throw new Error('Name, email, role, and department are required');
    }

    // Check if user with email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return await this.userRepository.create(userData);
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, userData: Partial<SchoolUser>): Promise<SchoolUser> {
    if (!id) {
      throw new Error('User ID is required');
    }

    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // If email is being updated, check for conflicts
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(userData.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('Another user with this email already exists');
      }
    }

    return await this.userRepository.update(id, userData);
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    if (!id) {
      throw new Error('User ID is required');
    }

    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);
  }

  /**
   * Get users statistics
   */
  async getUsersStatistics(): Promise<{
    total: number;
    byRole: Record<SchoolUser['role'], number>;
    byDepartment: Record<string, number>;
  }> {
    const allUsers = await this.userRepository.findAll();
    
    const byRole: Record<SchoolUser['role'], number> = {
      Student: 0,
      Teacher: 0,
      Admin: 0,
    };
    
    const byDepartment: Record<string, number> = {};

    allUsers.forEach(user => {
      byRole[user.role]++;
      byDepartment[user.department] = (byDepartment[user.department] || 0) + 1;
    });

    return {
      total: allUsers.length,
      byRole,
      byDepartment,
    };
  }
}