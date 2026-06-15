// Helper to get or generate a device-specific key
async function getDeviceKey(): Promise<CryptoKey> {
  // Try to fetch key from server which derives it from username/IP
  try {
    const res = await fetch('/api/crypto-key', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      const rawKey = Uint8Array.from(atob(data.key), c => c.charCodeAt(0));
      return await crypto.subtle.importKey(
        'raw',
        rawKey,
        'AES-GCM',
        true,
        ['encrypt', 'decrypt']
      );
    }
  } catch {
    console.warn("Failed to fetch secure key from server, falling back to local derivation.");
  }
  
  // Fallback: derive a key from userAgent (obfuscation fallback)
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode((typeof navigator !== 'undefined' ? navigator.userAgent : '') + "forza-offline-secret"),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('forza-salt-2024'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: any): Promise<string> {
  try {
    const key = await getDeviceKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error('Encryption failed', err);
    throw new Error('Encryption failed');
  }
}

export async function decryptData(encryptedStr: string): Promise<any> {
  try {
    const key = await getDeviceKey();
    const raw = Uint8Array.from(atob(encryptedStr), c => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const data = raw.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded);
  } catch (err) {
    console.error('Decryption failed or data tampered', err);
    return null;
  }
}
