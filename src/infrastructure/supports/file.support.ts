import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export const base_path = (...filepaths: string[]) => {
  const baseDir = path.resolve(import.meta.dir, '../../../');
  return path.join(baseDir, ...filepaths);
};

export const bunshint_path = (...filepaths: string[]) => {
  if (existsSync(base_path('.hiddens')) === false) {
    mkdirSync(base_path('.hiddens'));
  }
  return base_path('.hiddens', ...filepaths);
};
