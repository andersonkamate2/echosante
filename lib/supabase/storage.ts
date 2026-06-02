import { supabaseServer } from './server';
import { supabaseClient } from './client';
import { DatabaseProvider } from '../database/provider';

const database = DatabaseProvider.getInstance();
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'echosante';

/**
 * Upload a file to Supabase Storage
 * @param path - File path in storage (e.g., 'articles/cover-image.jpg')
 * @param file - File blob or buffer
 * @returns Public URL or null on error
 */
export async function uploadFile(path: string, file: Blob | Buffer): Promise<string | null> {
  if (database.useSQLite) {
    console.warn('Storage operations are not supported in SQLite mode');
    return null;
  }

  try {
    database.assertSupabaseConfig();

    const { data, error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    if (!data?.path) {
      console.error('No path returned from storage upload');
      return null;
    }

    // Return public URL
    const publicUrl = getPublicFileUrl(data.path);
    return publicUrl;
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    return null;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param path - File path in storage
 * @returns true if deletion successful, false otherwise
 */
export async function deleteFile(path: string): Promise<boolean> {
  if (database.useSQLite) {
    console.warn('Storage operations are not supported in SQLite mode');
    return false;
  }

  try {
    database.assertSupabaseConfig();

    const { error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Storage deletion error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error during file deletion:', error);
    return false;
  }
}

/**
 * Get public URL for a file
 * @param path - File path in storage
 * @returns Public URL
 */
export function getPublicFileUrl(path: string): string {
  if (database.useSQLite) {
    return '';
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}

/**
 * Get signed URL for a file (temporary access)
 * @param path - File path in storage
 * @param expiresIn - Expiration time in seconds (default: 3600)
 * @returns Signed URL or null on error
 */
export async function getSignedFileUrl(
  path: string,
  expiresIn: number = 3600,
): Promise<string | null> {
  if (database.useSQLite) {
    console.warn('Storage operations are not supported in SQLite mode');
    return null;
  }

  try {
    database.assertSupabaseConfig();

    const { data, error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Signed URL generation error:', error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Unexpected error during signed URL generation:', error);
    return null;
  }
}

/**
 * Download file content from Supabase Storage
 * @param path - File path in storage
 * @returns File blob or null on error
 */
export async function downloadFile(path: string): Promise<Blob | null> {
  if (database.useSQLite) {
    console.warn('Storage operations are not supported in SQLite mode');
    return null;
  }

  try {
    database.assertSupabaseConfig();

    const { data, error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .download(path);

    if (error) {
      console.error('Storage download error:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Unexpected error during file download:', error);
    return null;
  }
}

/**
 * List files in a directory
 * @param folderPath - Folder path in storage (e.g., 'articles/')
 * @returns Array of file objects or empty array on error
 */
export async function listFiles(folderPath: string = '') {
  if (database.useSQLite) {
    console.warn('Storage operations are not supported in SQLite mode');
    return [];
  }

  try {
    database.assertSupabaseConfig();

    const { data, error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .list(folderPath);

    if (error) {
      console.error('Storage list error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error during file listing:', error);
    return [];
  }
}

/**
 * Check if file exists in storage
 * @param path - File path in storage
 * @returns true if file exists, false otherwise
 */
export async function fileExists(path: string): Promise<boolean> {
  if (database.useSQLite) {
    return false;
  }

  try {
    database.assertSupabaseConfig();

    const { data, error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .list(path.split('/').slice(0, -1).join('/'), {
        limit: 1,
        search: path.split('/').pop(),
      });

    if (error) {
      return false;
    }

    return (data || []).some((file) => file.name === path.split('/').pop());
  } catch (error) {
    console.error('Unexpected error during file existence check:', error);
    return false;
  }
}
