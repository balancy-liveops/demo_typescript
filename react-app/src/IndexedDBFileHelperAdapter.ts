import { IndexedDBFileHelper, FileHelperPaths } from './IndexedDBFileHelper';
import { ICachedFileHelper } from '@balancy/core';

/**
 * Адаптер для совместимости IndexedDBFileHelper со старым синхронным интерфейсом
 * Использует IndexedDB под капотом, но предоставляет синхронный API через кэширование
 */
export class IndexedDBFileHelperAdapter implements ICachedFileHelper {
  private indexedDBHelper: IndexedDBFileHelper;
  private initPromise: Promise<void>;
  private isReady = false;

  // Кэш для синхронных операций чтения
  private fileCache = new Map<string, string | Uint8Array>();
  private existsCache = new Map<string, boolean>();

  private constructor(paths: FileHelperPaths) {
    this.indexedDBHelper = new IndexedDBFileHelper(paths);
    this.initPromise = this.initialize();
  }

  /**
  * Статический метод для создания и инициализации адаптера одной строкой
  */
  static async create(paths: FileHelperPaths, fullPreload = true): Promise<IndexedDBFileHelperAdapter> {
  const adapter = new IndexedDBFileHelperAdapter(paths);
  await adapter.waitForReady();

  if (fullPreload) {
  await adapter.preloadEverything(); // ПОЛНАЯ предзагрузка
  }

  return adapter;
  }

  /**
  * Альтернативный метод для быстрого создания без предзагрузки
  */
  static async createFast(paths: FileHelperPaths): Promise<IndexedDBFileHelperAdapter> {
  return await IndexedDBFileHelperAdapter.create(paths, false);
  }

  /**
   * Метод для создания с частичной предзагрузкой (для будущей оптимизации)
   */
  static async createWithPartialPreload(paths: FileHelperPaths): Promise<IndexedDBFileHelperAdapter> {
    const adapter = new IndexedDBFileHelperAdapter(paths);
    await adapter.waitForReady();
    await adapter.preloadCache(); // Только cache, не все
    return adapter;
  }

  private async initialize(): Promise<void> {
    // Инициализируем IndexedDB
    try {
      await this.indexedDBHelper.createSubDirectoryInCacheCallback('init');
      this.isReady = true;
      console.log('IndexedDB FileHelper initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB FileHelper:', error);
      throw error;
    }
  }

  /**
   * Ожидание готовности (для вызова перед использованием)
   */
  async waitForReady(): Promise<void> {
    await this.initPromise;
  }

  // Преобразование string в ArrayBuffer для бинарных данных
  private stringToArrayBuffer(str: string): ArrayBuffer {
    // Предполагаем, что это base64 или бинарные данные как строка
    try {
      // Попробуем декодировать как base64
      const binaryString = atob(str);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch {
      // Если не base64, конвертируем строку в UTF-8 байты
      const encoder = new TextEncoder();
      return encoder.encode(str).buffer;
    }
  }

  // Реализация старого синхронного интерфейса

  createSubDirectoryInCacheCallback(fileName: string): void {
    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, queuing operation');
      this.initPromise.then(() => {
        this.indexedDBHelper.createSubDirectoryInCacheCallback(fileName);
      });
      return;
    }

    // Асинхронно выполняем операцию
    this.indexedDBHelper.createSubDirectoryInCacheCallback(fileName).catch(error => {
      console.error('Error creating subdirectory:', error);
    });
  }

  public fileExistsInCacheCallback(path: string): boolean {
    console.log("fileExistsInCacheCallback " + path);
    const cacheKey = `cache/${path}`;
    if (this.existsCache.has(cacheKey)) {
      console.log("cache hit for existsCache: " + cacheKey + " => " + this.existsCache.get(cacheKey));
      return this.existsCache.get(cacheKey)!;
    }

    // Если нет в кэше, проверяем IndexedDB
    if (this.isReady) {
      this.indexedDBHelper.fileExistsInCacheCallback(path).then(exists => {
        console.log("DB for existsCache: " + cacheKey + " => " + this.existsCache.get(cacheKey));
        this.existsCache.set(cacheKey, exists);
      }).catch(error => {
        console.error('Error checking file existence in cache:', error);
        this.existsCache.set(cacheKey, false);
      });
    }

    console.warn(`File ${path} not found in cache, returning false`);
    return false;
  }

  public fileExistsInResourcesCallback(path: string): boolean {
    return false;
  }

  saveFileInCacheCallback(fileName: string, data: string): void {
    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, queuing operation');
      this.initPromise.then(() => {
        this.indexedDBHelper.saveFileInCacheCallback(fileName, data);
      });
      return;
    }

    // Кэшируем для синхронного чтения
    const cacheKey = `cache/${fileName}`;
    this.fileCache.set(cacheKey, data);
    this.existsCache.set(cacheKey, true);

    //console.log("saveFileInCacheCallback... " + fileName + " data: " + data.length + " bytes == " + data);
    // Асинхронно сохраняем в IndexedDB
    this.indexedDBHelper.saveFileInCacheCallback(fileName, data).catch(error => {
      console.error('Error saving file to cache:', error);
      // Удаляем из кэша при ошибке
      this.fileCache.delete(cacheKey);
      this.existsCache.set(cacheKey, false);
    });
  }

  saveFileInCacheBinaryCallback(fileName: string, memoryView: Uint8Array): void {
    console.log('saveFileInCacheBinaryCallback... ' + fileName + ' data: ' + memoryView.length + ' bytes');

    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, queuing operation');
      this.initPromise.then(() => {
        // memoryView уже Uint8Array, создаем копию для безопасности
        const dataCopy = new Uint8Array(memoryView);
        this.indexedDBHelper.saveFileInCacheBinaryCallback(fileName, dataCopy.buffer);
      });
      return;
    }

    // Создаем копию данных для безопасности (так как memoryView может быть invalidated)
    const dataCopy = new Uint8Array(memoryView);
    const arrayBuffer = dataCopy.buffer.slice(dataCopy.byteOffset, dataCopy.byteOffset + dataCopy.byteLength);

    // Кэшируем для синхронного чтения
    const cacheKey = `cache/${fileName}`;

    // Сохраняем как Uint8Array в память для быстрого доступа
    this.fileCache.set(cacheKey, dataCopy);
    this.existsCache.set(cacheKey, true);

    // Асинхронно сохраняем в IndexedDB
    this.indexedDBHelper.saveFileInCacheBinaryCallback(fileName, arrayBuffer).catch(error => {
      console.error('Error saving binary file to cache:', error);
      this.fileCache.delete(cacheKey);
      this.existsCache.set(cacheKey, false);
    });
  }

  saveFileInResourcesCallback(fileName: string, data: string): void {
    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, queuing operation');
      this.initPromise.then(() => {
        this.indexedDBHelper.saveFileInResourcesCallback(fileName, data);
      });
      return;
    }

    const cacheKey = `resources/${fileName}`;
    this.fileCache.set(cacheKey, data);
    this.existsCache.set(cacheKey, true);

    this.indexedDBHelper.saveFileInResourcesCallback(fileName, data).catch(error => {
      console.error('Error saving file to resources:', error);
      this.fileCache.delete(cacheKey);
      this.existsCache.set(cacheKey, false);
    });
  }

  cleanUpResourcesFolderCallback(): void {
    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, queuing operation');
      this.initPromise.then(() => {
        this.indexedDBHelper.cleanUpResourcesFolderCallback();
      });
      return;
    }

    // Очищаем кэш ресурсов
    for (const [key] of this.fileCache) {
      if (key.startsWith('resources/')) {
        this.fileCache.delete(key);
        this.existsCache.set(key, false);
      }
    }

    this.indexedDBHelper.cleanUpResourcesFolderCallback().catch(error => {
      console.error('Error cleaning resources folder:', error);
    });
  }

  cleanGeneratedCodeFolderCallback(): void {
    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, queuing operation');
      this.initPromise.then(() => {
        this.indexedDBHelper.cleanGeneratedCodeFolderCallback();
      });
      return;
    }

    this.indexedDBHelper.cleanGeneratedCodeFolderCallback().catch(error => {
      console.error('Error cleaning code folder:', error);
    });
  }

  saveGeneratedCodeCallback(fileName: string, data: string): void {
    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, queuing operation');
      this.initPromise.then(() => {
        this.indexedDBHelper.saveGeneratedCodeCallback(fileName, data);
      });
      return;
    }

    this.indexedDBHelper.saveGeneratedCodeCallback(fileName, data).catch(error => {
      console.error('Error saving generated code:', error);
    });
  }

  loadFileFromCacheCallback(fileName: string): string {
    const cacheKey = `cache/${fileName}`;

    // Сначала проверяем кэш
    if (this.fileCache.has(cacheKey)) {
      const cachedData = this.fileCache.get(cacheKey)!;
      
      // Если это бинарные данные (Uint8Array), конвертируем в строку
      if (cachedData instanceof Uint8Array) {
        return new TextDecoder().decode(cachedData);
      }
      
      // Если это строка, возвращаем как есть
      return cachedData;
    }

    // Если нет в кэше и IndexedDB готов, пытаемся загрузить асинхронно
    if (this.isReady) {
      // Запускаем асинхронную загрузку для будущих вызовов
      this.indexedDBHelper.loadFileFromCacheCallback(fileName).then(data => {
        if (data) {
          this.fileCache.set(cacheKey, data);
          this.existsCache.set(cacheKey, true);
        }
      }).catch(error => {
        console.error('Error loading file from cache:', error);
        this.existsCache.set(cacheKey, false);
      });
    }

    console.warn(`File ${fileName} not found in cache, returning empty string`);
    return '';
  }

  loadFileFromResourcesCallback(fileName: string): string {
    const cacheKey = `resources/${fileName}`;

    if (this.fileCache.has(cacheKey)) {
      const cachedData = this.fileCache.get(cacheKey)!;
      
      // Если это бинарные данные (Uint8Array), конвертируем в строку
      if (cachedData instanceof Uint8Array) {
        return new TextDecoder().decode(cachedData);
      }
      
      // Если это строка, возвращаем как есть
      return cachedData;
    }

    if (this.isReady) {
      this.indexedDBHelper.loadFileFromResourcesCallback(fileName).then(data => {
        if (data) {
          this.fileCache.set(cacheKey, data);
          this.existsCache.set(cacheKey, true);
        }
      }).catch(error => {
        console.error('Error loading file from resources:', error);
        this.existsCache.set(cacheKey, false);
      });
    }

    console.warn(`Resource ${fileName} not found in cache, returning empty string`);
    return '';
  }

  deleteCachedFolderCallback(path: string): void {
    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, queuing operation');
      this.initPromise.then(() => {
        this.indexedDBHelper.deleteCachedFolderCallback(path);
      });
      return;
    }

    // Очищаем кэш для этой папки
    const folderPrefix = `cache/${path}`;
    for (const [key] of this.fileCache) {
      if (key.startsWith(folderPrefix)) {
        this.fileCache.delete(key);
        this.existsCache.set(key, false);
      }
    }

    this.indexedDBHelper.deleteCachedFolderCallback(path).catch(error => {
      console.error('Error deleting cached folder:', error);
    });
  }

  deleteCachedFileCallback(path: string): void {
    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, queuing operation');
      this.initPromise.then(() => {
        this.indexedDBHelper.deleteCachedFileCallback(path);
      });
      return;
    }

    const cacheKey = `cache/${path}`;
    this.fileCache.delete(cacheKey);
    this.existsCache.set(cacheKey, false);

    this.indexedDBHelper.deleteCachedFileCallback(path).catch(error => {
      console.error('Error deleting cached file:', error);
    });
  }

  getFilesInCachedFolderCallback(path: string): string[] {
    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, returning empty array');
      return [];
    }

    // Пытаемся получить из кэша
    const folderPrefix = `cache/${path}`;
    const cachedFiles: string[] = [];

    for (const [key] of this.fileCache) {
      if (key.startsWith(folderPrefix)) {
        const fileName = key.substring(folderPrefix.length + 1);
        cachedFiles.push(fileName);
      }
    }

    // Асинхронно обновляем кэш
    this.indexedDBHelper.getFilesInCachedFolderCallback(path).then(files => {
      // Обновляем информацию о существующих файлах
      files.forEach(fileName => {
        const cacheKey = `cache/${path}/${fileName}`;
        this.existsCache.set(cacheKey, true);
      });
    }).catch(error => {
      console.error('Error getting files in cached folder:', error);
    });

    return cachedFiles;
  }

  applyTempFolderCallback(tempFolder: string): void {
    if (!this.isReady) {
      console.warn('IndexedDB not ready yet, queuing operation');
      this.initPromise.then(() => {
        this.indexedDBHelper.applyTempFolderCallback(tempFolder);
      });
      return;
    }

    this.indexedDBHelper.applyTempFolderCallback(tempFolder).catch(error => {
      console.error('Error applying temp folder:', error);
    });
  }

  // Дополнительные методы для предзагрузки

  /**
  * Предзагружает файлы в кэш для быстрого синхронного доступа
  */
  async preloadCache(): Promise<void> {
  await this.waitForReady();

  try {
  // Загружаем список всех файлов и предзагружаем их в память
  const cacheFiles = await this.indexedDBHelper.getFilesInCachedFolderCallback('');

  for (const fileName of cacheFiles) {
  try {
  const data = await this.indexedDBHelper.loadFileFromCacheCallback(fileName);
  if (data) {
  const cacheKey = `cache/${fileName}`;
  this.fileCache.set(cacheKey, data);
  this.existsCache.set(cacheKey, true);
  }
  } catch (error) {
  console.error(`Error preloading file ${fileName}:`, error);
  }
  }

  console.log(`Preloaded ${cacheFiles.length} files into memory cache`);
  } catch (error) {
  console.error('Error during cache preload:', error);
  }
  }

  /**
   * ПОЛНАЯ предзагрузка всех файлов из всех директорий в память
   * Гарантирует синхронный доступ ко всем файлам
   */
  async preloadEverything(): Promise<void> {
    await this.waitForReady();

    console.log('🚀 Starting full preload of all files...');
    let totalFiles = 0;
    let totalSize = 0;

    try {
      // Сначала покажем все файлы в базе для отладки
      const allFiles = await this.getAllFilesFromIndexedDB();
      console.log('🗂️ All files in IndexedDB:', allFiles.length);
      allFiles.forEach(file => {
        console.log(`  - ${file.directory}/${file.fileName} (${file.fileType})`);
      });

      // Предзагружаем все найденные файлы напрямую
      for (const fileInfo of allFiles) {
        try {
          let data: string | ArrayBuffer | null = null;
          let cacheKey = '';

          // Определяем как загружать файл в зависимости от директории
          if (fileInfo.directory.includes('cache') || fileInfo.directory === '.balancy') {
            data = await this.indexedDBHelper.loadFileFromCacheCallback(fileInfo.fileName);
            cacheKey = `cache/${fileInfo.fileName}`;
          } else if (fileInfo.directory.includes('resources')) {
            data = await this.indexedDBHelper.loadFileFromResourcesCallback(fileInfo.fileName);
            cacheKey = `resources/${fileInfo.fileName}`;
          } else {
            // Используем общий метод loadFile
            data = await this.indexedDBHelper.loadFile(fileInfo.directory, fileInfo.fileName);
            cacheKey = `${fileInfo.directory}/${fileInfo.fileName}`;
          }

          if (data) {
            // Если это бинарные данные, конвертируем в base64
            if (data instanceof ArrayBuffer) {
              const base64 = this.arrayBufferToBase64(data);
              this.fileCache.set(cacheKey, base64);
              totalSize += base64.length;
            } else {
              this.fileCache.set(cacheKey, data);
              totalSize += data.length;
            }

            this.existsCache.set(cacheKey, true);
            totalFiles++;
            console.log(`✅ Loaded: ${cacheKey}`);
          }
        } catch (error) {
          console.error(`❌ Error preloading file ${fileInfo.directory}/${fileInfo.fileName}:`, error);
        }
      }

      console.log(`✅ Full preload completed: ${totalFiles} files (${this.formatBytes(totalSize)}) loaded into memory`);
      console.log(`📊 Memory cache size: ${this.fileCache.size} files, exists cache: ${this.existsCache.size} entries`);

      // Показываем примеры ключей в кэше
      const sampleKeys = Array.from(this.fileCache.keys()).slice(0, 5);
      console.log('🔍 Sample cached keys:', sampleKeys);

    } catch (error) {
      console.error('❌ Error during full preload:', error);
      throw error;
    }
  }

  /**
   * Получение списка всех файлов из IndexedDB (включая метаданные)
   */
  private async getAllFilesFromIndexedDB(): Promise<Array<{fileName: string, directory: string, fileType: 'text' | 'binary'}>> {
    await this.waitForReady();

    const db = this.indexedDBHelper.getDatabase();
    if (!db) {
      console.warn('Database not available for file enumeration');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const files: Array<{fileName: string, directory: string, fileType: 'text' | 'binary'}> = [];

      const request = store.openCursor();

      request.onsuccess = (event: Event) => {
        const target = event.target as IDBRequest;
        const cursor = target.result;
        if (cursor) {
          const record = cursor.value;
          files.push({
            fileName: record.fileName.split('/').pop() || record.fileName,
            directory: record.directory,
            fileType: record.fileType || 'text'
          });
          cursor.continue();
        } else {
          resolve(files);
        }
      };

      request.onerror = () => {
        console.error('Error reading files from IndexedDB');
        reject(request.error);
      };
    });
  }

  /**
   * Конвертация ArrayBuffer в base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Форматирование размера в читаемый вид
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Получение статистики кэша
   */
  getCacheStats(): {fileCount: number, memoryUsage: string, hitRate?: number} {
    let totalSize = 0;
    for (const [, data] of this.fileCache) {
      if (typeof data === 'string') {
        totalSize += data.length;
      } else if (data instanceof Uint8Array) {
        totalSize += data.byteLength;
      }
    }

    return {
      fileCount: this.fileCache.size,
      memoryUsage: this.formatBytes(totalSize),
    };
  }

  /**
   * Очистка кэша памяти (НЕ IndexedDB)
   */
  clearMemoryCache(): void {
    this.fileCache.clear();
    this.existsCache.clear();
    console.log('Memory cache cleared');
  }

  /**
   * Очистка ресурсов
   */
  close(): void {
    this.fileCache.clear();
    this.existsCache.clear();
    this.indexedDBHelper.close();
  }

  /**
   * Приватный метод для загрузки файла из IndexedDB (используется в кэшировании)
   */
  private async loadFile(directory: string, fileName: string): Promise<string | ArrayBuffer | null> {
    return await this.indexedDBHelper.loadFile(directory, fileName);
  }

  /**
   * Получение доступа к нативному IndexedDB helper для расширенных операций
   */
  getIndexedDBHelper(): IndexedDBFileHelper {
    return this.indexedDBHelper;
  }

  // ==============================================
  // Реализация ICachedFileHelper интерфейса
  // ==============================================

  /**
   * Получить бинарные данные файла по ключу
   */
  async getBinaryFile(key: string): Promise<Uint8Array | null> {
    console.log("==>> getBinaryFile:", key);
    
    await this.waitForReady();
    
    // Проверяем кэш в памяти
    const cacheKey = `cache/${key}`;
    if (this.fileCache.has(cacheKey)) {
      const cachedData = this.fileCache.get(cacheKey)!;
      console.log("==>> Found in memory cache");
      
      if (cachedData instanceof Uint8Array) {
        return cachedData;
      } else if (typeof cachedData === 'string') {
        // Попытка декодировать base64
        try {
          return this.base64ToUint8Array(cachedData);
        } catch (error) {
          console.warn('Failed to decode base64, trying as text:', error);
          return new TextEncoder().encode(cachedData);
        }
      }
    }
    
    try {
      console.log("==>> Loading from IndexedDB");
      // Загружаем из IndexedDB как бинарные данные
      const data = await this.indexedDBHelper.loadFile('.balancy', key);
      
      if (data) {
        let binaryData: Uint8Array;
        
        if (data instanceof ArrayBuffer) {
          binaryData = new Uint8Array(data);
        } else {
          // Если это строка, пробуем декодировать как base64
          try {
            binaryData = this.base64ToUint8Array(data);
          } catch {
            binaryData = new TextEncoder().encode(data);
          }
        }
        
        // Кэшируем для будущих вызов
        this.fileCache.set(cacheKey, binaryData);
        this.existsCache.set(cacheKey, true);
        
        console.log("==>> Successfully loaded binary data:", binaryData.length, "bytes");
        return binaryData;
      }
    } catch (error) {
      console.error('Error loading binary file:', error);
    }
    
    console.log("==>> Binary file not found");
    return null;
  }

  /**
   * Конвертация base64 в Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Сохранить бинарные данные файла
   */
  async saveBinaryFile(key: string, data: Uint8Array): Promise<boolean> {
    try {
      await this.waitForReady();
      
      // Кэшируем в памяти
      const cacheKey = `cache/${key}`;
      this.fileCache.set(cacheKey, new Uint8Array(data)); // Создаем копию
      this.existsCache.set(cacheKey, true);
      
      // Сохраняем в IndexedDB
      const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      await this.indexedDBHelper.saveFileInCacheBinaryCallback(key, arrayBuffer);
      
      return true;
    } catch (error) {
      console.error('Error saving binary file:', error);
      return false;
    }
  }

  /**
   * Проверить существование файла в кеше
   */
  async hasFile(key: string): Promise<boolean> {
    const cacheKey = `cache/${key}`;
    
    // Проверяем кэш в памяти
    if (this.existsCache.has(cacheKey)) {
      return this.existsCache.get(cacheKey)!;
    }
    
    // Проверяем в IndexedDB
    if (this.isReady) {
      try {
        const exists = await this.indexedDBHelper.fileExistsInCacheCallback(key);
        this.existsCache.set(cacheKey, exists);
        return exists;
      } catch (error) {
        console.error('Error checking file existence:', error);
        return false;
      }
    }
    
    return false;
  }

  /**
   * Удалить файл из кеша
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.waitForReady();
      
      const cacheKey = `cache/${key}`;
      this.fileCache.delete(cacheKey);
      this.existsCache.set(cacheKey, false);
      
      await this.indexedDBHelper.deleteCachedFileCallback(key);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Очистить весь кеш
   */
  async clearCache(): Promise<boolean> {
    try {
      await this.waitForReady();
      
      // Очищаем кэш в памяти
      this.fileCache.clear();
      this.existsCache.clear();
      
      // Очищаем IndexedDB (здесь нужно добавить метод в IndexedDBFileHelper)
      // Пока просто очищаем кэш в памяти
      
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }
}
