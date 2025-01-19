export interface FileHelperPaths {
  cachePath: string;
  codePath?: string;
  resourcesPath?: string;
}

export class FileHelperClassBrowser {
  private readonly cacheDir: string;
  private readonly cacheBinaryDir: string;
  private readonly codeDir?: string;
  private readonly resourcesDir?: string;

  constructor(paths: FileHelperPaths) {
    this.cacheDir = paths.cachePath;
    this.cacheBinaryDir = paths.cachePath;

    if (paths.codePath) {
      this.codeDir = paths.codePath;
    }

    if (paths.resourcesPath) {
      this.resourcesDir = paths.resourcesPath;
    }
  }

  private getFullKey(directory: string, fileName: string): string {
    return `${directory}/${fileName}`;
  }

  private listFilesInDir(directory: string): string[] {
    const prefix = `${directory}/`;
    return Object.keys(localStorage)
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.slice(prefix.length));
  }

  private clearDir(directory: string): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`${directory}/`)) {
        localStorage.removeItem(key);
      }
    });
  }

  public createSubDirectoryInCacheCallback(fileName: string): void {
    const key = this.getFullKey(this.cacheDir, fileName);
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, "{}"); // Simulate a subdirectory as an empty object
    }
  }

  public saveFileInCacheCallback(fileName: string, data: string): void {
    this.saveFileToDir(this.cacheDir, fileName, data);
  }

  public saveFileInCacheBinaryCallback(fileName: string, data: string): void {
    this.saveFileToDir(this.cacheBinaryDir, fileName, data);
  }

  public saveFileInResourcesCallback(fileName: string, data: string): void {
    if (this.resourcesDir) {
      this.saveFileToDir(this.resourcesDir, fileName, data);
    }
  }

  public cleanUpResourcesFolderCallback(): void {
    if (this.resourcesDir) {
      this.clearDir(this.resourcesDir);
    }
  }

  public cleanGeneratedCodeFolderCallback(): void {
    if (this.codeDir) {
      this.clearDir(this.codeDir);
    }
  }

  public saveGeneratedCodeCallback(fileName: string, data: string): void {
    if (this.codeDir) {
      this.saveFileToDir(this.codeDir, fileName, data);
    }
  }

  public loadFileFromCacheCallback(fileName: string): string {
    return this.readFileFromDir(this.cacheDir, fileName);
  }

  public loadFileFromResourcesCallback(fileName: string): string {
    if (this.resourcesDir) {
      return this.readFileFromDir(this.resourcesDir, fileName);
    }
    return "";
  }

  public deleteCachedFolderCallback(path: string): void {
    const prefix = `${this.cacheDir}/${path}`;
    this.clearDir(prefix);
  }

  public deleteCachedFileCallback(path: string): void {
    const key = this.getFullKey(this.cacheDir, path);
    localStorage.removeItem(key);
  }

  public getFilesInCachedFolderCallback(path: string): string[] {
    const directory = `${this.cacheDir}/${path}`;
    return this.listFilesInDir(directory);
  }

  public applyTempFolderCallback(tempFolder: string): void {
    const tempPath = `${this.cacheDir}/${tempFolder}`;

    const tempFiles = this.listFilesInDir(tempPath);
    tempFiles.forEach((file) => {
      const tempFilePath = this.getFullKey(tempPath, file);
      const cacheFilePath = this.getFullKey(this.cacheDir, file);

      const data = localStorage.getItem(tempFilePath);
      if (data) {
        localStorage.setItem(cacheFilePath, data);
        localStorage.removeItem(tempFilePath);
      }
    });
  }

  private saveFileToDir(directory: string, fileName: string, data: string): void {
    const fullKey = this.getFullKey(directory, fileName);
    localStorage.setItem(fullKey, data);
  }

  private readFileFromDir(directory: string, fileName: string): string {
    const fullKey = this.getFullKey(directory, fileName);
    return localStorage.getItem(fullKey) || "";
  }
}
