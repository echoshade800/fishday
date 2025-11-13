/**
 * StorageUtils - Local storage utility for FishyDay app
 * Provides AsyncStorage operations for user data and game state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageUtils {
  // miniApp name variable
  static miniAppName = 'FishyDay';

  /**
   * Get user data
   * @returns {Promise<UserData|null>} User data object, or null if not exists
   */
  static async getUserData() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data locally:', error);
      return null;
    }
  }

  /**
   * Save user data
   * @param {UserData} userData - User data object
   * @returns {Promise<boolean>} Whether save was successful
   */
  static async saveUserData(userData) {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Failed to save user data:', error);
      return false;
    }
  }

  /**
   * Get info data
   * @returns {Promise<any|null>} Info data object, or null if not exists
   */
  static async getData() {
    try {
      const infoData = await AsyncStorage.getItem(`${this.miniAppName}info`);
      return infoData ? JSON.parse(infoData) : null;
    } catch (error) {
      console.error('Failed to get info data:', error);
      return null;
    }
  }

  /**
   * Set info data
   * @param {any} newData - New info data object
   * @returns {Promise<boolean>} Whether set was successful
   */
  static async setData(newData) {
    try {
      // Read old data first
      const oldData = await this.getData();
      // If old data exists, merge using destructuring - new data overwrites same fields
      const mergedData = oldData ? { ...oldData, ...newData } : newData;
      // Save merged data
      await AsyncStorage.setItem(`${this.miniAppName}info`, JSON.stringify(mergedData));
      return true;
    } catch (error) {
      console.error('Failed to set info data:', error);
      return false;
    }
  }
}

export default StorageUtils;
