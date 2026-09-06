import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Backblaze B2 es S3-compatible, así que usamos el SDK oficial de AWS S3
 * apuntando al endpoint de B2.
 */
const s3 = new S3Client({
  region: extraerRegion(process.env.B2_S3_ENDPOINT!),
  endpoint: process.env.B2_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
});

const BUCKET = process.env.B2_BUCKET_NAME!;

/**
 * Sube un buffer de audio a B2 y devuelve la key interna (path dentro del bucket).
 * La URL firmada se genera aparte con `firmarUrl()`.
 */
export async function subirAudio(
  keyInterna: string,
  buffer: Buffer
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: keyInterna,
      Body: buffer,
      ContentType: "audio/mpeg",
      // No public — solo accesible con URL firmada
      ACL: undefined,
    })
  );
  return keyInterna;
}

/**
 * Genera una URL firmada válida por N horas para escuchar/descargar un audio.
 * Sin esta URL nadie puede acceder al archivo (bucket es privado).
 */
export async function firmarUrl(
  keyInterna: string,
  expiraHoras: number = 24
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: keyInterna,
  });
  return await getSignedUrl(s3, command, {
    expiresIn: expiraHoras * 3600,
  });
}

/**
 * Descarga un audio desde una URL cualquiera (por ejemplo, la temporal de fal.ai)
 * y devuelve el buffer para poder resubirlo a B2.
 */
export async function descargarAudio(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`No se pudo descargar audio de ${url}: HTTP ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Extrae la región del endpoint de B2.
 * Ejemplo: "https://s3.us-west-004.backblazeb2.com" → "us-west-004"
 */
function extraerRegion(endpoint: string): string {
  const match = endpoint.match(/s3\.([a-z0-9-]+)\.backblazeb2\.com/);
  return match?.[1] ?? "us-west-004";
}
