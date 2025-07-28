import PocketBase from 'pocketbase';
import semver from 'semver';

/**
 * SchemaVersion class for managing schema versions
 */
export class SchemaVersion {
  private pb: PocketBase;

  /**
   * Constructor for SchemaVersion
   * @param pb PocketBase instance
   */
  constructor(pb: PocketBase) {
    this.pb = pb;
  }

  /**
   * Get the current schema version
   * @returns Promise<string> Current schema version
   */
  async getCurrentVersion(): Promise<string> {
    try {
      // Check if schema_version collection exists
      try {
        await this.pb.collections.getOne('schema_version');
      } catch (error) {
        // Collection doesn't exist, return default version
        return '0.0.0';
      }
      
      // Get latest version record
      const records = await this.pb.collection('schema_version').getList(1, 1, {
        sort: '-created',
      });
      
      if (records.items.length === 0) {
        return '0.0.0';
      }
      
      return records.items[0].version;
    } catch (error) {
      console.error('Error getting schema version:', error);
      return '0.0.0';
    }
  }

  /**
   * Update the schema version
   * @param version New schema version
   * @returns Promise<boolean> True if version was updated successfully
   */
  async updateVersion(version: string): Promise<boolean> {
    try {
      // Validate version format
      if (!semver.valid(version)) {
        throw new Error(`Invalid version format: ${version}`);
      }
      
      // Check if schema_version collection exists
      try {
        await this.pb.collections.getOne('schema_version');
      } catch (error) {
        // Create schema_version collection
        await this.pb.collections.create({
          name: 'schema_version',
          schema: [
            {
              name: 'version',
              type: 'text',
              required: true,
            },
            {
              name: 'updatedAt',
              type: 'date',
              required: true,
            },
          ],
        });
      }
      
      // Create new version record
      await this.pb.collection('schema_version').create({
        version,
        updatedAt: new Date().toISOString(),
      });
      
      return true;
    } catch (error) {
      console.error('Error updating schema version:', error);
      return false;
    }
  }

  /**
   * Compare versions
   * @param version1 First version
   * @param version2 Second version
   * @returns number Negative if version1 < version2, positive if version1 > version2, 0 if equal
   */
  compareVersions(version1: string, version2: string): number {
    return semver.compare(version1, version2);
  }

  /**
   * Check if current version is greater than or equal to target version
   * @param targetVersion Target version to compare against
   * @returns Promise<boolean> True if current version is greater than or equal to target version
   */
  async isVersionAtLeast(targetVersion: string): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    return semver.gte(currentVersion, targetVersion);
  }

  /**
   * Check if current version is less than target version
   * @param targetVersion Target version to compare against
   * @returns Promise<boolean> True if current version is less than target version
   */
  async isVersionLessThan(targetVersion: string): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    return semver.lt(currentVersion, targetVersion);
  }
}