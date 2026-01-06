import { copyFile } from './copy-file.js';
import { createFolder } from './create-folder.js';
import { deleteFile } from './delete-file.js';
import { fileInfo } from './file-info.js';
import { findFiles } from './find-files.js';
import { listDirectory } from './list-directory.js';
import { readFile } from './read-file.js';
import { renameFile } from './rename-file.js';
import { searchInFiles } from './search-in-files.js';
import { writeFile } from './write-file.js';

export const fileTools = {
  readFile,
  writeFile,
  createFolder,
  copyFile,
  renameFile,
  deleteFile,
  listDirectory,
  findFiles,
  searchInFiles,
  fileInfo,
};
