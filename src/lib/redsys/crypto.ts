import crypto from "crypto";

/**
 * Cifra los datos usando 3DES con la clave del comercio
 * 
 * Según documentación oficial de Redsys y bibliotecas oficiales PHP/Java:
 * - 3DES en modo CBC (des-ede3-cbc)
 * - IV = 8 bytes de ceros
 * - Padding PKCS#7 (el default de Node.js)
 * - La clave viene en Base64 y debe decodificarse a 24 bytes
 */
export function encrypt3DES(data: string, key: string): Buffer {
  const keyBuffer = Buffer.from(key, "base64");
  const iv = Buffer.alloc(8, 0);

  // Verificar longitud de clave (debe ser 24 bytes para 3DES)
  if (keyBuffer.length !== 24) {
    console.error("❌ [3DES] Clave incorrecta: debe ser 24 bytes, tiene:", keyBuffer.length);
  }

  const cipher = crypto.createCipheriv("des-ede3-cbc", keyBuffer, iv);
  // Usar padding automático PKCS#7 (default de Node.js)

  const encrypted = Buffer.concat([
    cipher.update(data, "utf8"),
    cipher.final()
  ]);

  return encrypted;
}

/**
 * Descifra los datos usando 3DES (con padding PKCS#7)
 */
export function decrypt3DES(data: Buffer, key: string): string {
  const keyBuffer = Buffer.from(key, "base64");
  const iv = Buffer.alloc(8, 0);

  const decipher = crypto.createDecipheriv("des-ede3-cbc", keyBuffer, iv);
  // Usar padding automático PKCS#7

  const decrypted = Buffer.concat([
    decipher.update(data),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}

/**
 * Genera la firma HMAC_SHA256_V1 para Redsys
 * 
 * Proceso según documentación oficial:
 * 1. Cifrar el número de pedido con 3DES usando la clave secreta → clave derivada
 * 2. Calcular HMAC-SHA256 de los parámetros Base64 usando la clave derivada
 * 3. Codificar el resultado en Base64
 */
export function createSignature(
  merchantParameters: string,
  secretKey: string,
  orderNumber: string
): string {
  console.log("🔐 [CRYPTO] Generando firma Redsys HMAC_SHA256_V1...");
  console.log("🔐 [CRYPTO] Order number:", orderNumber);
  console.log("🔐 [CRYPTO] Secret key length (base64):", secretKey.length);
  
  // Verificar que la clave secreta sea válida
  const secretKeyBuffer = Buffer.from(secretKey, "base64");
  console.log("🔐 [CRYPTO] Secret key decoded (bytes):", secretKeyBuffer.length);
  
  if (secretKeyBuffer.length !== 24) {
    console.error("❌ [CRYPTO] ERROR: Clave secreta debe ser 24 bytes, tiene:", secretKeyBuffer.length);
  }
  
  // 1. Derivar clave específica para este pedido usando 3DES
  // encrypt3DES ahora devuelve un Buffer directamente
  const derivedKey = encrypt3DES(orderNumber, secretKey);
  console.log("🔐 [CRYPTO] Derived key length (bytes):", derivedKey.length);
  console.log("🔐 [CRYPTO] Derived key (hex):", derivedKey.toString("hex"));

  // 2. Crear HMAC SHA256 con la clave derivada
  const hmac = crypto.createHmac("sha256", derivedKey);
  hmac.update(merchantParameters);

  // 3. Devolver en base64
  const signature = hmac.digest("base64");
  console.log("🔐 [CRYPTO] Signature generated:", signature);
  
  return signature;
}

/**
 * Valida la firma recibida de Redsys
 */
export function validateSignature(
  merchantParameters: string,
  signature: string,
  secretKey: string
): boolean {
  // Decodificar parámetros para obtener el número de pedido
  const params = JSON.parse(
    Buffer.from(merchantParameters, "base64").toString("utf8")
  );
  const orderNumber = params.Ds_Order;

  // Generar firma esperada
  const expectedSignature = createSignature(
    merchantParameters,
    secretKey,
    orderNumber
  );

  // Comparar firmas (URL-safe base64)
  const normalizedExpected = expectedSignature
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  
  const normalizedReceived = signature
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return normalizedExpected === normalizedReceived;
}

/**
 * Cifra un token de pago para almacenamiento seguro
 */
export function encryptToken(token: string): string {
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Descifra un token de pago almacenado
 */
export function decryptToken(encryptedToken: string): string {
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

  const parts = encryptedToken.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
