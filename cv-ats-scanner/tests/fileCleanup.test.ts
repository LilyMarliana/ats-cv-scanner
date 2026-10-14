/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { removeUploadedFile } from '../src/utils/fileCleanup';

const exists = (target: string) => fs.access(target).then(() => true, () => false);

const makeTempFile = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ats-cleanup-'));
  const file = path.join(dir, 'cv-123.pdf');
  await fs.writeFile(file, 'isi cv');
  return file;
};

describe('fileCleanup: hapus file CV setelah diekstrak', () => {
  it('FC-01: menghapus file yang ada dan mengembalikan true', async () => {
    const file = await makeTempFile();

    expect(await exists(file)).toBe(true);
    expect(await removeUploadedFile(file)).toBe(true);
    expect(await exists(file)).toBe(false);
  });

  it('FC-02: file yang sudah tidak ada tidak melempar error dan mengembalikan false', async () => {
    const file = await makeTempFile();
    await fs.unlink(file);

    expect(await removeUploadedFile(file)).toBe(false);
  });

  it('FC-03: path kosong (undefined) diabaikan dan mengembalikan false', async () => {
    expect(await removeUploadedFile(undefined)).toBe(false);
  });
});