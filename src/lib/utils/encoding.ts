/**
 * Encodes a string to a URL-safe Base64 string (base64url).
 * Works in both Node.js and browser environments.
 */
export function base64url(str: string): string {
  if (typeof Buffer !== 'undefined') {
    // Use standard base64 and convert to base64url format
    // ('base64url' encoding is not available in all runtimes like Edge)
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Browser fallback
  const utf8Bytes = new TextEncoder().encode(str);
  const binaryStr = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binaryStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Encodes a string to a standard Base64 string.
 * Works in both Node.js and browser environments.
 */
export function base64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }

  // Browser fallback
  const utf8Bytes = new TextEncoder().encode(str);
  const binaryStr = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binaryStr);
}
