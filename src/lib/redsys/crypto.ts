import crypto from "crypto";

/**
 * Cifra los datos usando 3DES con la clave del comercio
 */
export function encrypt3DES(data: string, key: string): string {
  const keyBuffer = Buffer.from(key, "base64");
  const iv = Buffer.alloc(8, 0);

  const cipher = crypto.createCipheriv("des-ede3-cbc", keyBuffer, iv);
  cipher.setAutoPadding(true);

  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");

  return encrypted;
}

/**
 * Descifra los datos usando 3DES
 */
export function decrypt3DES(data: string, key: string): string {
  const keyBuffer = Buffer.from(key, "base64");
  const iv = Buffer.alloc(8, 0);

  const decipher = crypto.createDecipheriv("des-ede3-cbc", keyBuffer, iv);
  decipher.setAutoPadding(true);

  let decrypted = decipher.update(data, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Genera la firma SHA-256 MAC para Redsys
 */
export function createSignature(
  merchantParameters: string,
  secretKey: string,
  orderNumber: string
): string {
  console.log("🔐 [CRYPTO] Generando firma Redsys...");
  console.log("🔐 [CRYPTO] Order number:", orderNumber);
  console.log("🔐 [CRYPTO] Order number length:", orderNumber.length);
  console.log("🔐 [CRYPTO] Secret key length (base64):", secretKey.length);
  
  // Verificar que la clave secreta sea válida base64
  const secretKeyBuffer = Buffer.from(secretKey, "base64");
  console.log("🔐 [CRYPTO] Secret key decoded length (bytes):", secretKeyBuffer.length);
  
  if (secretKeyBuffer.length !== 24) {
    console.error("❌ [CRYPTO] ERROR: La clave secreta debe ser de 24 bytes para 3DES, tiene:", secretKeyBuffer.length);
  }
  
  // 1. Derivar clave específica para este pedido usando 3DES
  const derivedKeyBase64 = encrypt3DES(orderNumber, secretKey);
  console.log("🔐 [CRYPTO] Derived key (base64):", derivedKeyBase64);
  
  // 2. Convertir la clave derivada de base64 a Buffer
  const derivedKeyBuffer = Buffer.from(derivedKeyBase64, "base64");
  console.log("🔐 [CRYPTO] Derived key length (bytes):", derivedKeyBuffer.length);

  // 3. Crear HMAC SHA256 con la clave derivada (en bytes, no base64)
  const hmac = crypto.createHmac("sha256", derivedKeyBuffer);
  hmac.update(merchantParameters);

  // 4. Devolver en base64
  const signature = hmac.digest("base64");
  console.log("🔐 [CRYPTO] Signature generated:", signature);
  console.log("🔐 [CRYPTO] Signature length:", signature.length);
  
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
