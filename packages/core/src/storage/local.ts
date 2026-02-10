import { promises as fs } from "fs";
import path from "path";

export interface StorageDriver {
  upload(file: Buffer, filename: string, folder?: string): Promise<string>;
  delete(filepath: string): Promise<void>;
  getUrl(filepath: string): string;
}

export class LocalStorage implements StorageDriver {
  private baseDir: string;
  private baseUrl: string;

  constructor(baseDir?: string, baseUrl?: string) {
    this.baseDir = baseDir || process.env.UPLOAD_DIR || "./uploads";
    this.baseUrl = baseUrl || "/uploads";
  }

  async upload(
    file: Buffer,
    filename: string,
    folder?: string
  ): Promise<string> {
    const dir = folder
      ? path.join(this.baseDir, folder)
      : this.baseDir;
    await fs.mkdir(dir, { recursive: true });

    // Add timestamp to prevent collisions
    const timestamp = Date.now();
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    const safeName = `${name}-${timestamp}${ext}`;

    const filepath = path.join(dir, safeName);
    await fs.writeFile(filepath, file);

    return folder ? `${folder}/${safeName}` : safeName;
  }

  async delete(filepath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filepath);
    try {
      await fs.unlink(fullPath);
    } catch {
      // File may not exist, that's ok
    }
  }

  getUrl(filepath: string): string {
    return `${this.baseUrl}/${filepath}`;
  }
}
