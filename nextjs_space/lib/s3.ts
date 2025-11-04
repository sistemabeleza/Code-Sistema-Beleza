
import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  CopyObjectCommand 
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createS3Client, getBucketConfig } from './aws-config'

const s3Client = createS3Client()
const { bucketName, folderPrefix } = getBucketConfig()

/**
 * Upload de arquivo para S3
 * @param buffer - Buffer do arquivo
 * @param fileName - Nome do arquivo com extensão
 * @returns cloud_storage_path - Caminho completo no S3
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const cloud_storage_path = `${folderPrefix}uploads/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    Body: buffer,
    ContentType: getContentType(fileName)
  })

  await s3Client.send(command)
  return cloud_storage_path
}

/**
 * Download de arquivo do S3 (retorna URL assinada)
 * @param key - Chave do arquivo no S3 (cloud_storage_path)
 * @returns URL assinada válida por 1 hora
 */
export async function downloadFile(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  })

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  return signedUrl
}

/**
 * Deletar arquivo do S3
 * @param key - Chave do arquivo no S3 (cloud_storage_path)
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  })

  await s3Client.send(command)
}

/**
 * Renomear/mover arquivo no S3
 * @param oldKey - Chave antiga do arquivo
 * @param newKey - Nova chave do arquivo
 */
export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  // Copiar arquivo
  const copyCommand = new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${oldKey}`,
    Key: newKey
  })
  await s3Client.send(copyCommand)

  // Deletar arquivo antigo
  await deleteFile(oldKey)

  return newKey
}

/**
 * Determinar Content-Type baseado na extensão do arquivo
 */
function getContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }

  return contentTypes[ext || ''] || 'application/octet-stream'
}
