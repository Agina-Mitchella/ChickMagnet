import { ValidationError } from '../middleware/index.ts';

/**
 * Server-side HTML & script tag sanitizer for user-generated content
 * Removes script tags, iframe injections, javascript: URIs, event handlers.
 */
export function sanitizeTextContent(input: string): string {
  if (typeof input !== 'string') return input;

  return input
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove inline event handlers like onerror=, onload=, onclick=
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=\w+/gi, '')
    // Remove javascript: URIs
    .replace(/javascript:[^\s"']+/gi, '#')
    .trim();
}

/**
 * Deep recursive object text content sanitizer for request bodies
 */
export function sanitizeObjectFields<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return sanitizeTextContent(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectFields) as unknown as T;
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    clean[key] = sanitizeObjectFields(value);
  }
  return clean as T;
}

/**
 * Server-side File MIME Type Inspector using Magic Bytes signature validation.
 * Never trust Content-Type header or extension alone.
 */
const MAGIC_NUMBERS: Record<string, string> = {
  'ffd8ffe0': 'image/jpeg',
  'ffd8ffe1': 'image/jpeg',
  'ffd8ffe2': 'image/jpeg',
  '89504e47': 'image/png',
  '47494638': 'image/gif',
  '52494646': 'image/webp', // RIFF header for webp
  '25504446': 'application/pdf',
};

export function validateFileMagicBytes(buffer: Buffer, expectedMimeType: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  const hexHeader = buffer.toString('hex', 0, 4).toLowerCase();
  
  // Verify if header matches allowed magic numbers
  const detectedType = MAGIC_NUMBERS[hexHeader];
  if (!detectedType) {
    // Check webp RIFF header
    if (hexHeader === '52494646' && buffer.toString('utf8', 8, 12) === 'WEBP') {
      return expectedMimeType.includes('webp') || expectedMimeType.includes('image');
    }
    throw new ValidationError(`Invalid file signature. Detected untrusted file binary.`, { hexHeader });
  }

  if (detectedType !== expectedMimeType && !expectedMimeType.includes(detectedType.split('/')[1])) {
    throw new ValidationError(`File header (${detectedType}) does not match reported content-type (${expectedMimeType}).`);
  }

  return true;
}
