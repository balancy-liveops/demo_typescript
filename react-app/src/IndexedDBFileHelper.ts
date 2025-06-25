export interface FileHelperPaths {
  cachePath: string;
  codePath?: string;
  resourcesPath?: string;
}

export interface FileRecord {
  fileName: string; // Полный путь как ключ
  directory: string;
  data: ArrayBuffer | string;
  fileType: 'text' | 'binary';
  mimeType?: string;
  size: number;
  lastModified: number;
}

export interface DirectoryRecord {
  path: string; // Ключ
  parentPath: string;
  name: string;
  created: number;
}

// Обновленный TypeScript интерфейс, соответствующий C++
export interface JSFileHelper {
  // Основные методы работы с файлами
  createSubDirectoryInCacheCallback: (fileName: string) => Promise<void>;
  saveFileInCacheCallback: (fileName: string, data: string) => Promise<void>;
  saveFileInCacheBinaryCallback: (fileName: string, data: ArrayBuffer | Uint8Array) => Promise<void>;
  saveFileInResourcesCallback: (fileName: string, data: string) => Promise<void>;
  saveFileInResourcesBinaryCallback: (fileName: string, data: ArrayBuffer | Uint8Array) => Promise<void>;
  
  // Очистка папок
  cleanUpResourcesFolderCallback: () => Promise<void>;
  cleanGeneratedCodeFolderCallback: () => Promise<void>;
  
  // Работа с сгенерированным кодом
  saveGeneratedCodeCallback: (fileName: string, data: string) => Promise<void>;
  
  // Загрузка файлов
  loadFileFromCacheCallback: (fileName: string) => Promise<string>;
  loadFileFromResourcesCallback: (fileName: string) => Promise<string>;
  loadFileFromResourcesAsBase64Callback: (fileName: string) => Promise<string>;
  
  // Удаление
  deleteCachedFolderCallback: (path: string) => Promise<void>;
  deleteCachedFileCallback: (path: string) => Promise<void>;
  
  // Проверка существования
  fileExistsInCacheCallback: (fileName: string) => Promise<boolean>;
  fileExistsInResourcesCallback: (fileName: string) => Promise<boolean>;
  
  // Получение путей
  getCachePathCallback: (fileName: string) => Promise<string>;
  getResourcesPathCallback: (fileName: string) => Promise<string>;
  
  // Списки файлов и папок
  getFilesInCachedFolderCallback: (path: string) => Promise<string[]>;
  getFoldersInCachedFolderCallback: (path: string) => Promise<string[]>;
  
  // Временные папки
  activateTempFolderCallback: () => void;
  deactivateTempFolderCallback: () => void;
  applyTempFolderCallback: (tempFolder: string) => Promise<void>;
  isTempFolderActiveCallback: () => boolean;
}

export class IndexedDBFileHelper implements JSFileHelper {
  private readonly cacheDir: string;
  private readonly codeDir?: string;
  private readonly resourcesDir?: string;
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private isTempActive = false;
  
  private readonly DB_NAME = 'BalancyFileStorage';
  private readonly DB_VERSION = 1;
  private readonly STORES = {
    FILES: 'files',
    DIRECTORIES: 'directories'
  };

  constructor(paths: FileHelperPaths) {
    this.cacheDir = paths.cachePath;
    this.codeDir = paths.codePath;
    this.resourcesDir = paths.resourcesPath;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initIndexedDB();
      this.isInitialized = true;
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Хранилище файлов
        if (!db.objectStoreNames.contains(this.STORES.FILES)) {
          const filesStore = db.createObjectStore(this.STORES.FILES, { keyPath: 'fileName' });
          filesStore.createIndex('directory', 'directory', { unique: false });
          filesStore.createIndex('fileType', 'fileType', { unique: false });
        }
        
        // Хранилище директорий
        if (!db.objectStoreNames.contains(this.STORES.DIRECTORIES)) {
          const dirsStore = db.createObjectStore(this.STORES.DIRECTORIES, { keyPath: 'path' });
          dirsStore.createIndex('parentPath', 'parentPath', { unique: false });
        }
      };
    });
  }

  private getFullPath(directory: string, fileName: string): string {
    return `${directory}/${fileName}`;
  }

  private getTempPath(directory: string): string {
    return `${directory}/temp`;
  }

  private normalizeData(data: string | ArrayBuffer | Uint8Array): { data: ArrayBuffer | string, fileType: 'text' | 'binary' } {
    if (typeof data === 'string') {
      return { data, fileType: 'text' };
    } else if (data instanceof Uint8Array) {
      return { data: data.buffer, fileType: 'binary' };
    } else {
      return { data, fileType: 'binary' };
    }
  }

  private async saveFile(directory: string, fileName: string, data: string | ArrayBuffer | Uint8Array): Promise<void> {
    await this.ensureInitialized();
    
    const actualDirectory = this.isTempActive ? this.getTempPath(directory) : directory;
    const fullPath = this.getFullPath(actualDirectory, fileName);
    const { data: normalizedData, fileType } = this.normalizeData(data);
    
    const fileRecord: FileRecord = {
      fileName: fullPath,
      directory: actualDirectory,
      data: normalizedData,
      fileType,
      size: typeof normalizedData === 'string' ? normalizedData.length : normalizedData.byteLength,
      lastModified: Date.now()
    };

    const transaction = this.db!.transaction([this.STORES.FILES], 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore(this.STORES.FILES).put(fileRecord);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async loadFile(directory: string, fileName: string): Promise<string | ArrayBuffer | null> {
    await this.ensureInitialized();
    
    const fullPath = this.getFullPath(directory, fileName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.FILES], 'readonly');
      const request = transaction.objectStore(this.STORES.FILES).get(fullPath);
      
      request.onsuccess = () => {
        const result = request.result as FileRecord;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async fileExists(directory: string, fileName: string): Promise<boolean> {
    await this.ensureInitialized();
    
    const fullPath = this.getFullPath(directory, fileName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.FILES], 'readonly');
      const request = transaction.objectStore(this.STORES.FILES).get(fullPath);
      
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFile(directory: string, fileName: string): Promise<void> {
    await this.ensureInitialized();
    
    const fullPath = this.getFullPath(directory, fileName);
    
    const transaction = this.db!.transaction([this.STORES.FILES], 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore(this.STORES.FILES).delete(fullPath);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearDirectory(directory: string): Promise<void> {
    await this.ensureInitialized();
    
    const transaction = this.db!.transaction([this.STORES.FILES], 'readwrite');
    const store = transaction.objectStore(this.STORES.FILES);
    const index = store.index('directory');
    
    await new Promise<void>((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(directory));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async getFilesInDirectory(directory: string): Promise<string[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.FILES], 'readonly');
      const store = transaction.objectStore(this.STORES.FILES);
      const index = store.index('directory');
      const files: string[] = [];
      
      const request = index.openCursor(IDBKeyRange.only(directory));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const record = cursor.value as FileRecord;
          // Извлекаем только имя файла без пути к директории
          const fileName = record.fileName.substring(directory.length + 1);
          // Проверяем что это файл в этой директории, а не в поддиректории
          if (fileName && !fileName.includes('/')) {
            files.push(fileName);
          }
          cursor.continue();
        } else {
          resolve(files);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Реализация интерфейса JSFileHelper

  async createSubDirectoryInCacheCallback(fileName: string): Promise<void> {
    await this.ensureInitialized();
    
    const actualDirectory = this.isTempActive ? this.getTempPath(this.cacheDir) : this.cacheDir;
    const dirPath = this.getFullPath(actualDirectory, fileName);
    
    const dirRecord: DirectoryRecord = {
      path: dirPath,
      parentPath: actualDirectory,
      name: fileName,
      created: Date.now()
    };

    const transaction = this.db!.transaction([this.STORES.DIRECTORIES], 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore(this.STORES.DIRECTORIES).put(dirRecord);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveFileInCacheCallback(fileName: string, data: string): Promise<void> {
    await this.saveFile(this.cacheDir, fileName, data);
  }

  async saveFileInCacheBinaryCallback(fileName: string, data: ArrayBuffer | Uint8Array): Promise<void> {
    await this.saveFile(this.cacheDir, fileName, data);
  }

  async saveFileInResourcesCallback(fileName: string, data: string): Promise<void> {
    if (!this.resourcesDir) throw new Error('Resources directory not configured');
    await this.saveFile(this.resourcesDir, fileName, data);
  }

  async saveFileInResourcesBinaryCallback(fileName: string, data: ArrayBuffer | Uint8Array): Promise<void> {
    if (!this.resourcesDir) throw new Error('Resources directory not configured');
    await this.saveFile(this.resourcesDir, fileName, data);
  }

  async cleanUpResourcesFolderCallback(): Promise<void> {
    if (!this.resourcesDir) return;
    await this.clearDirectory(this.resourcesDir);
  }

  async cleanGeneratedCodeFolderCallback(): Promise<void> {
    if (!this.codeDir) return;
    await this.clearDirectory(this.codeDir);
  }

  async saveGeneratedCodeCallback(fileName: string, data: string): Promise<void> {
    if (!this.codeDir) throw new Error('Code directory not configured');
    await this.saveFile(this.codeDir, fileName, data);
  }

  async loadFileFromCacheCallback(fileName: string): Promise<string> {
    const data = await this.loadFile(this.cacheDir, fileName);
    return typeof data === 'string' ? data : '';
  }

  async loadFileFromResourcesCallback(fileName: string): Promise<string> {
    if (!this.resourcesDir) return '';
    const data = await this.loadFile(this.resourcesDir, fileName);
    return typeof data === 'string' ? data : '';
  }

  async loadFileFromResourcesAsBase64Callback(fileName: string): Promise<string> {
    if (!this.resourcesDir) return '';
    const data = await this.loadFile(this.resourcesDir, fileName);
    
    if (typeof data === 'string') {
      return btoa(data);
    } else if (data instanceof ArrayBuffer) {
      return this.arrayBufferToBase64(data);
    }
    
    return '';
  }

  async deleteCachedFolderCallback(path: string): Promise<void> {
    const folderPath = this.getFullPath(this.cacheDir, path);
    await this.clearDirectory(folderPath);
  }

  async deleteCachedFileCallback(path: string): Promise<void> {
    await this.deleteFile(this.cacheDir, path);
  }

  async fileExistsInCacheCallback(fileName: string): Promise<boolean> {
    return await this.fileExists(this.cacheDir, fileName);
  }

  async fileExistsInResourcesCallback(fileName: string): Promise<boolean> {
    if (!this.resourcesDir) return false;
    return await this.fileExists(this.resourcesDir, fileName);
  }

  async getCachePathCallback(fileName: string): Promise<string> {
    return this.getFullPath(this.cacheDir, fileName);
  }

  async getResourcesPathCallback(fileName: string): Promise<string> {
    if (!this.resourcesDir) return '';
    return this.getFullPath(this.resourcesDir, fileName);
  }

  async getFilesInCachedFolderCallback(path: string): Promise<string[]> {
    const folderPath = path === '' ? this.cacheDir : this.getFullPath(this.cacheDir, path);
    return await this.getFilesInDirectory(folderPath);
  }

  async getFoldersInCachedFolderCallback(path: string): Promise<string[]> {
    await this.ensureInitialized();
    
    const folderPath = path === '' ? this.cacheDir : this.getFullPath(this.cacheDir, path);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.DIRECTORIES], 'readonly');
      const store = transaction.objectStore(this.STORES.DIRECTORIES);
      const index = store.index('parentPath');
      const folders: string[] = [];
      
      const request = index.openCursor(IDBKeyRange.only(folderPath));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const record = cursor.value as DirectoryRecord;
          folders.push(record.name);
          cursor.continue();
        } else {
          resolve(folders);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Метод для получения всех файлов из resources директории
  async getFilesInResourcesFolderCallback(path: string = ''): Promise<string[]> {
    if (!this.resourcesDir) return [];
    const folderPath = path === '' ? this.resourcesDir : this.getFullPath(this.resourcesDir, path);
    return await this.getFilesInDirectory(folderPath);
  }

  // Метод для получения всех файлов из code директории
  async getFilesInCodeFolderCallback(path: string = ''): Promise<string[]> {
    if (!this.codeDir) return [];
    const folderPath = path === '' ? this.codeDir : this.getFullPath(this.codeDir, path);
    return await this.getFilesInDirectory(folderPath);
  }

  activateTempFolderCallback(): void {
    this.isTempActive = true;
  }

  deactivateTempFolderCallback(): void {
    this.isTempActive = false;
  }

  async applyTempFolderCallback(tempFolder: string): Promise<void> {
    const tempPath = this.getTempPath(this.cacheDir);
    const tempFolderPath = this.getFullPath(tempPath, tempFolder);
    
    // Получаем все файлы из временной папки
    const tempFiles = await this.getFilesInDirectory(tempFolderPath);
    
    // Перемещаем файлы из временной папки в основную
    for (const fileName of tempFiles) {
      const tempFilePath = this.getFullPath(tempFolderPath, fileName);
      const cacheFilePath = this.getFullPath(this.cacheDir, fileName);
      
      // Загружаем файл из временной папки
      const data = await this.loadFile(tempFolderPath, fileName);
      if (data) {
        // Сохраняем в основную папку
        const { data: normalizedData, fileType } = this.normalizeData(data as any);
        const fileRecord: FileRecord = {
          fileName: cacheFilePath,
          directory: this.cacheDir,
          data: normalizedData,
          fileType,
          size: typeof normalizedData === 'string' ? normalizedData.length : normalizedData.byteLength,
          lastModified: Date.now()
        };

        const transaction = this.db!.transaction([this.STORES.FILES], 'readwrite');
        await new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(this.STORES.FILES).put(fileRecord);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        
        // Удаляем из временной папки
        await this.deleteFile(tempFolderPath, fileName);
      }
    }
    
    // Очищаем временную папку
    await this.clearDirectory(tempFolderPath);
    this.isTempActive = false;
  }

  isTempFolderActiveCallback(): boolean {
    return this.isTempActive;
  }

  // Дополнительные методы для работы с Object URL (бонус)
  async createObjectUrl(directory: string, fileName: string): Promise<string | null> {
    const data = await this.loadFile(directory, fileName);
    if (!data || typeof data === 'string') return null;
    
    const blob = new Blob([data]);
    return URL.createObjectURL(blob);
  }

  // Получение доступа к базе данных (для расширенных операций)
  getDatabase(): IDBDatabase | null {
    return this.db;
  }

  // Очистка ресурсов
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}
