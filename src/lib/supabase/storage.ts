import { createClient } from './client'

/**
 * Upload a TOR document file.
 * Path: tor-files/{userId}/{projectId}/{filename}
 */
export async function uploadTorFile(
  userId: string,
  projectId: string,
  file: File
) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${userId}/${projectId}/tor.${ext}`

  const { data, error } = await supabase.storage
    .from('tor-files')
    .upload(path, file, { upsert: true })

  if (error) throw error
  return data.path
}

/**
 * Upload a UI screenshot / image file.
 * Path: ui-files/{userId}/{projectId}/{filename}
 */
export async function uploadUiFile(
  userId: string,
  projectId: string,
  file: File
) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${userId}/${projectId}/ui.${ext}`

  const { data, error } = await supabase.storage
    .from('ui-files')
    .upload(path, file, { upsert: true })

  if (error) throw error
  return data.path
}

/**
 * Get a short-lived signed URL for a TOR file (valid 1 hour).
 */
export async function getTorFileUrl(filePath: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('tor-files')
    .createSignedUrl(filePath, 3600)

  if (error) throw error
  return data.signedUrl
}

/**
 * Get a short-lived signed URL for a UI image (valid 1 hour).
 */
export async function getUiFileUrl(filePath: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('ui-files')
    .createSignedUrl(filePath, 3600)

  if (error) throw error
  return data.signedUrl
}

/**
 * Delete a TOR file.
 */
export async function deleteTorFile(filePath: string) {
  const supabase = createClient()
  const { error } = await supabase.storage.from('tor-files').remove([filePath])
  if (error) throw error
}

/**
 * Delete a UI image file.
 */
export async function deleteUiFile(filePath: string) {
  const supabase = createClient()
  const { error } = await supabase.storage.from('ui-files').remove([filePath])
  if (error) throw error
}
