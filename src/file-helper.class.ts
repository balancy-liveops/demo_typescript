import { Core, CoreVector } from '@balancy/wasm';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { resolve, parse } from 'node:path';
import mkdirp, { mkdirpSync } from 'mkdirp';
import { readFileSync, copyFileSync } from 'fs';
import { rimrafSync } from 'rimraf';

export class Vector<T> implements CoreVector<T> {
  constructor(private array: Array<T>) {
  }

  public size(): number {
    return this.array.length;
  }
  set(value: T): void {
    throw new Error('readonly array');
  }
  push_back(value: T): void {
    this.array.unshift(value);
  }
  get(inNumber: number): T {
    return this.array[inNumber];
  }
  resize(inSize: number, inValue: number): void {
    throw new Error('not implemented');
  }
  reserve(inSize: number): void {
    throw new Error('not implemented');
  }
}

export class FileHelperClass {

  private readonly cacheDir: string;
  private readonly cacheBinaryDir: string;
  private readonly codeDir: string;
  private readonly resourcesDir: string;

  constructor(
    private root: string,
  ) {

    this.cacheDir = resolve(this.root, '.cache');
    this.cacheBinaryDir = resolve(this.root, '.cache_binary');
    this.codeDir = resolve(this.root, 'models');
    this.resourcesDir = resolve(this.root, 'resources');

    if (!existsSync(this.root))
      mkdirpSync(this.root);
    if (!existsSync(this.cacheDir))
      mkdirpSync(this.cacheDir);
    if (!existsSync(this.cacheBinaryDir))
      mkdirpSync(this.cacheBinaryDir);
    if (!existsSync(this.codeDir))
      mkdirpSync(this.codeDir);
    if (!existsSync(this.resourcesDir))
      mkdirpSync(this.resourcesDir);
  }

  private saveFileToDir(directory: string, fileName: string, data: string) {
    const filePath = resolve(directory, fileName);
    const { dir } = parse(filePath);
    mkdirpSync(dir);
    writeFileSync(filePath, data);
  }

  private clearDir(directory: string) {
    readdirSync(directory).forEach((dir: string) => {
      const stat = lstatSync(resolve(directory, dir));
      if (stat.isDirectory()) {
        rimrafSync(resolve(directory, dir));
      } else {
        unlinkSync(resolve(directory, dir));
      }
    });
  }

  private readFileFromDir(directory: string, fileName: string): string {
    try {
      return readFileSync(resolve(directory, fileName)).toString('utf-8');
    } catch (error) {
      return "";
    }
  }

  // public getFilesInFolderCallback(folder: string): string[] {
  public getFilesInFolderCallback(folder: string): CoreVector<string> {
    const files = readdirSync(resolve(this.root, folder));
    // return files;
    return new Vector(files);
  }
  public createSubDirectoryInCacheCallback(fileName: string): void {
    mkdirpSync(resolve(this.cacheDir, fileName)); // todo check logic
  }
  public saveFileInCacheCallback(fileName: string, data: string): void {
    this.saveFileToDir(this.cacheDir, fileName, data);
  }
  public saveFileInCacheBinaryCallback(fileName: string, data: string): void {
    this.saveFileToDir(this.cacheBinaryDir, fileName, data);
  }
  public saveFileInResourcesCallback(fileName: string, data: string): void {
    this.saveFileToDir(this.resourcesDir, fileName, data);
  }
  public cleanUpResourcesFolderCallback(): void {
    this.clearDir(this.resourcesDir);
  }
  public cleanGeneratedCodeFolderCallback(): void {
    this.clearDir(this.codeDir);
  }
  public saveGeneratedCodeCallback(fileName: string, data: string): void {
    this.saveFileToDir(this.codeDir, fileName, data);
  }
  public loadFileFromCacheCallback(fileName: string): string {
    return this.readFileFromDir(this.cacheDir, fileName); // todo check logic
  }
  public loadFileFromResourcesCallback(fileName: string): string {
    return this.readFileFromDir(this.resourcesDir, fileName); // todo check logic
  }
  public deleteFolderCallback(path: string): void {
    rimrafSync(resolve(this.root, path)); // todo check logic
  }
  public deleteCachedFolderCallback(path: string): void {
    rimrafSync(resolve(this.cacheDir, path));
  }
  public deleteCachedFileCallback(path: string): void {
    unlinkSync(resolve(this.cacheDir, path));
  }
  public getFilesInCachedFolderCallback(path: string): CoreVector<string> {
    let fullPath = resolve(this.cacheDir, path);
    return new Vector(readdirSync(fullPath));
  }
  // public getFilesInCachedFolderCallback(path: string): string[] {
  //   let fullPath = resolve(this.cacheDir, path);
  //   return readdirSync(fullPath);
  // }
  public applyTempFolderCallback(tempFolder: string): void {
    const tempPath = resolve(this.cacheDir, tempFolder);

    if (!existsSync(this.cacheDir) || !existsSync(tempPath)) {
      console.error("Either the Cache or Temp directory does not exist.");
      return;
    }

    const moveAndOverwriteTempContents = (sourceDir: string, targetDir: string) => {
      const files = readdirSync(sourceDir);

      files.forEach(file => {
        const sourceFile = resolve(sourceDir, file);
        const targetFile = resolve(targetDir, file);

        const stat = lstatSync(sourceFile);

        if (stat.isFile()) {
          // Copy and overwrite the file in the cache directory
          copyFileSync(sourceFile, targetFile);
        } else if (stat.isDirectory()) {
          // If it's a directory, recursively apply the logic
          if (!existsSync(targetFile)) {
            mkdirpSync(targetFile); // Create directory if it doesn't exist
          }
          moveAndOverwriteTempContents(sourceFile, targetFile);
        }
      });

      // Optionally, remove the temp directory after copying
      rimrafSync(sourceDir);
    };

    // Move and overwrite contents from temp folder to cache
    moveAndOverwriteTempContents(tempPath, this.cacheDir);
  }
}
