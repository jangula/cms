import { LocalStorage, type StorageDriver } from "./local";

export type { StorageDriver };
export { LocalStorage };

let storageInstance: StorageDriver | null = null;

export function getStorage(): StorageDriver {
  if (!storageInstance) {
    const driver = process.env.STORAGE_DRIVER || "local";
    switch (driver) {
      case "local":
        storageInstance = new LocalStorage();
        break;
      // Future: case "s3": storageInstance = new S3Storage(); break;
      default:
        storageInstance = new LocalStorage();
    }
  }
  return storageInstance;
}
