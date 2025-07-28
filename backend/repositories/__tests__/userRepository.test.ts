// Basic test for UserRepository
import { PocketBaseUserRepository } from '../pocketbase/userRepository';
import { SchoolUser } from '../../../types';

// Mock PocketBase
const mockPocketBase = {
  collection: jest.fn(() => ({
    getFullList: jest.fn(),
    getOne: jest.fn(),
    getFirstListItem: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    authWithPassword: jest.fn(),
  })),
};

describe('PocketBaseUserRepository', () => {
  let userRepository: PocketBaseUserRepository;

  beforeEach(() => {
    userRepository = new PocketBaseUserRepository(mockPocketBase as any);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Student',
          department: 'Computer Science',
          avatarUrl: '',
        },
      ];

      mockPocketBase.collection().getFullList.mockResolvedValue(mockUsers);

      const result = await userRepository.findAll();

      expect(mockPocketBase.collection).toHaveBeenCalledWith('users');
      expect(mockPocketBase.collection().getFullList).toHaveBeenCalledWith({
        sort: 'name',
      });
      expect(result).toEqual(mockUsers);
    });

    it('should handle errors', async () => {
      mockPocketBase.collection().getFullList.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findAll()).rejects.toThrow('Failed to retrieve users');
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Student',
        department: 'Computer Science',
        avatarUrl: '',
      };

      mockPocketBase.collection().getOne.mockResolvedValue(mockUser);

      const result = await userRepository.findById('1');

      expect(mockPocketBase.collection).toHaveBeenCalledWith('users');
      expect(mockPocketBase.collection().getOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent user', async () => {
      mockPocketBase.collection().getOne.mockRejectedValue({ status: 404 });

      const result = await userRepository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData: Omit<SchoolUser, 'id'> = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'Teacher',
        department: 'Mathematics',
        avatarUrl: '',
      };

      const mockCreatedUser = { id: '2', ...userData };
      mockPocketBase.collection().create.mockResolvedValue(mockCreatedUser);

      const result = await userRepository.create(userData);

      expect(mockPocketBase.collection).toHaveBeenCalledWith('users');
      expect(result).toEqual(mockCreatedUser);
    });
  });
});