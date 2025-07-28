import PocketBase from 'pocketbase';
import { SchemaVersion } from './schemaVersion';
import semver from 'semver';

/**
 * Schema compatibility check result
 */
export interface SchemaCompatibilityResult {
  compatible: boolean;
  currentVersion: string;
  requiredVersion: string;
  message: string;
}

/**
 * Schema compatibility options
 */
export interface SchemaCompatibilityOptions {
  minVersion?: string;
  maxVersion?: string;
  exactVersion?: string;
}

/**
 * SchemaCompatibility class for checking schema compatibility
 */
export class SchemaCompatibility {
  private pb: PocketBase;
  private schemaVersion: SchemaVersion;

  /**
   * Constructor for SchemaCompatibility
   * @param pb PocketBase instance
   */
  constructor(pb: PocketBase) {
    this.pb = pb;
    this.schemaVersion = new SchemaVersion(pb);
  }

  /**
   * Check if the current schema version is compatible with the application
   * @param options Compatibility options
   * @returns Promise<SchemaCompatibilityResult> Compatibility check result
   */
  async checkCompatibility(options: SchemaCompatibilityOptions): Promise<SchemaCompatibilityResult> {
    const currentVersion = await this.schemaVersion.getCurrentVersion();
    
    // Check exact version match
    if (options.exactVersion) {
      const isExact = currentVersion === options.exactVersion;
      return {
        compatible: isExact,
        currentVersion,
        requiredVersion: options.exactVersion,
        message: isExact
          ? `Schema version ${currentVersion} matches required version ${options.exactVersion}`
          : `Schema version ${currentVersion} does not match required version ${options.exactVersion}`,
      };
    }
    
    // Check version range
    let compatible = true;
    let message = `Schema version ${currentVersion} is compatible`;
    
    // Check minimum version
    if (options.minVersion && semver.lt(currentVersion, options.minVersion)) {
      compatible = false;
      message = `Schema version ${currentVersion} is less than minimum required version ${options.minVersion}`;
    }
    
    // Check maximum version
    if (compatible && options.maxVersion && semver.gt(currentVersion, options.maxVersion)) {
      compatible = false;
      message = `Schema version ${currentVersion} is greater than maximum supported version ${options.maxVersion}`;
    }
    
    return {
      compatible,
      currentVersion,
      requiredVersion: options.minVersion || options.maxVersion || 'any',
      message,
    };
  }

  /**
   * Check if the current schema version is at least the specified version
   * @param minVersion Minimum required version
   * @returns Promise<SchemaCompatibilityResult> Compatibility check result
   */
  async requireMinVersion(minVersion: string): Promise<SchemaCompatibilityResult> {
    return this.checkCompatibility({ minVersion });
  }

  /**
   * Check if the current schema version is exactly the specified version
   * @param exactVersion Exact required version
   * @returns Promise<SchemaCompatibilityResult> Compatibility check result
   */
  async requireExactVersion(exactVersion: string): Promise<SchemaCompatibilityResult> {
    return this.checkCompatibility({ exactVersion });
  }

  /**
   * Check if the current schema version is within the specified range
   * @param minVersion Minimum required version
   * @param maxVersion Maximum supported version
   * @returns Promise<SchemaCompatibilityResult> Compatibility check result
   */
  async requireVersionRange(minVersion: string, maxVersion: string): Promise<SchemaCompatibilityResult> {
    return this.checkCompatibility({ minVersion, maxVersion });
  }
}