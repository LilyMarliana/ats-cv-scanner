import fs from 'fs/promises';

// Hapus file yang diunggah setelah teksnya diekstrak.
// Tidak pernah melempar error: gagal menghapus tidak boleh menggagalkan respons ke pengguna.
export async function removeUploadedFile(filePath: string | undefined): Promise<boolean> {
  if (!filePath) return false;

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    // ENOENT = file sudah tidak ada, itu bukan masalah.
    if (code !== 'ENOENT') {
      console.error(`Gagal menghapus file upload (${code ?? 'unknown'}): ${filePath}`);
    }

    return false;
  }
}