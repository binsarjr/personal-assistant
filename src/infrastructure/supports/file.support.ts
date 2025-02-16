import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export const base_path = (...filepaths: string[]) => {
  const baseDir = path.resolve(import.meta.dir, '../../../');
  return path.join(baseDir, ...filepaths);
};

export const hidden_path = (...filepaths: string[]) => {
  const dirPath = path.dirname(base_path('.hiddens', ...filepaths));
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
  return base_path('.hiddens', ...filepaths);
};
