// Service container for dependency injection
import PocketBase from 'pocketbase';
import { UserRepository, CalendarRepository } from '../repositories/interfaces';
import { PocketBaseUserRepository } from '../repositories/pocketbase/userRepository';
import { PocketBaseCalendarRepository } from '../repositories/pocketbase/calendarRepository';
import { UserService } from './userService';
import { CalendarService } from './calendarService';

/**
 * Service container that manages dependencies and provides configured services
 */
export class ServiceContainer {
  private pb: PocketBase;
  private userRepository?: UserRepository;
  private calendarRepository?: CalendarRepository;
  private userService?: UserService;
  private calendarService?: CalendarService;

  constructor(pb: PocketBase) {
    this.pb = pb;
  }

  /**
   * Get user repository instance
   */
  getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new PocketBaseUserRepository(this.pb);
    }
    return this.userRepository;
  }

  /**
   * Get calendar repository instance
   */
  getCalendarRepository(): CalendarRepository {
    if (!this.calendarRepository) {
      this.calendarRepository = new PocketBaseCalendarRepository(this.pb);
    }
    return this.calendarRepository;
  }

  /**
   * Get user service instance
   */
  getUserService(): UserService {
    if (!this.userService) {
      this.userService = new UserService(this.getUserRepository());
    }
    return this.userService;
  }

  /**
   * Get calendar service instance
   */
  getCalendarService(): CalendarService {
    if (!this.calendarService) {
      this.calendarService = new CalendarService(this.getCalendarRepository());
    }
    return this.calendarService;
  }
}

// Singleton instance
let serviceContainer: ServiceContainer | null = null;

/**
 * Initialize the service container with a PocketBase instance
 */
export function initializeServiceContainer(pb: PocketBase): ServiceContainer {
  serviceContainer = new ServiceContainer(pb);
  return serviceContainer;
}

/**
 * Get the service container instance
 */
export function getServiceContainer(): ServiceContainer {
  if (!serviceContainer) {
    throw new Error('Service container not initialized. Call initializeServiceContainer first.');
  }
  return serviceContainer;
}