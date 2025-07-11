// Simple JWT implementation for form ID obfuscation
// In production, use a proper JWT library like jsonwebtoken

interface JWTHeader {
  alg: string;
  typ: string;
}

interface JWTPayload {
  sub: string; // Form ID
  iat: number; // Issued at
  exp: number; // Expiration (optional)
}

// Secret key for signing JWTs (in production, use environment variable)
const JWT_SECRET = 'your-secret-key-here-change-in-production';

// Base64 URL encoding
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Base64 URL decoding
function base64UrlDecode(str: string): string {
  // Add padding if needed
  let paddedStr = str;
  while (paddedStr.length % 4) {
    paddedStr += '=';
  }
  
  return atob(paddedStr.replace(/-/g, '+').replace(/_/g, '/'));
}

// Simple HMAC-SHA256 simulation (in production, use crypto.subtle or a proper library)
function simpleHmac(message: string, secret: string): string {
  // This is a simplified hash for demo purposes
  // In production, use proper HMAC-SHA256
  let hash = 0;
  const combined = message + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Generate JWT token for form ID
export function generateFormToken(formId: string): string {
  const header: JWTHeader = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload: JWTPayload = {
    sub: formId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year expiration
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  const message = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlEncode(simpleHmac(message, JWT_SECRET));
  
  return `${message}.${signature}`;
}

// Verify and decode JWT token to get form ID
export function verifyFormToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Verify signature
    const message = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = base64UrlEncode(simpleHmac(message, JWT_SECRET));
    
    if (encodedSignature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }

    // Decode payload
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: JWTPayload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return payload.sub; // Return the form ID
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Check if a string looks like a JWT token
export function isJWTToken(str: string): boolean {
  const parts = str.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

// Generate a shareable URL for a form
export function generateFormUrl(formId: string, obfuscated: boolean = false): string {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/forms/` 
    : '/forms/';
  
  if (obfuscated) {
    const token = generateFormToken(formId);
    return `${baseUrl}${token}`;
  }
  
  return `${baseUrl}${formId}`;
}

// Extract form ID from URL parameter (either direct ID or JWT token)
export function extractFormId(urlParam: string): string | null {
  if (isJWTToken(urlParam)) {
    return verifyFormToken(urlParam);
  }
  
  // Direct form ID
  return urlParam;
}