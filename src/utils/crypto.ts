import { chacha20poly1305 } from '@noble/ciphers/chacha.js'

// Password-based authenticated (and CBC) encryption, all client-side.
//
// Wire format (before base64): [ salt(16) | iv | ciphertext ]
//   - salt: PBKDF2 salt
//   - iv:   AES-GCM 12B, AES-CBC 16B, ChaCha20-Poly1305 12B nonce
// The decrypt side knows the iv length from the chosen cipher.

export type Cipher = 'aes-gcm' | 'aes-cbc' | 'chacha20-poly1305'

export const CIPHERS: { id: Cipher; label: string; authenticated: boolean }[] = [
  { id: 'aes-gcm', label: 'AES-GCM', authenticated: true },
  { id: 'aes-cbc', label: 'AES-CBC', authenticated: false },
  { id: 'chacha20-poly1305', label: 'ChaCha20-Poly1305', authenticated: true },
]

const SALT_LEN = 16
const PBKDF2_ITERATIONS = 250_000
const enc = new TextEncoder()
const dec = new TextDecoder()

/** Encode a string to bytes on a guaranteed (non-shared) ArrayBuffer for WebCrypto. */
function toBytes(s: string): Uint8Array<ArrayBuffer> {
  const u = enc.encode(s)
  const out = new Uint8Array(u.byteLength)
  out.set(u)
  return out
}

function ivLen(cipher: Cipher): number {
  return cipher === 'aes-cbc' ? 16 : 12
}

// --- base64 <-> bytes ---

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

export function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64.trim())
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function randomBytes(len: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(len))
}

// --- key derivation ---

async function deriveBits(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  bits: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const baseKey = await crypto.subtle.importKey('raw', toBytes(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    bits,
  )
  return new Uint8Array(derived)
}

async function deriveAesKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  name: 'AES-GCM' | 'AES-CBC',
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey('raw', toBytes(password), 'PBKDF2', false, [
    'deriveKey',
  ])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name, length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

// --- public API ---

export async function encrypt(cipher: Cipher, password: string, plaintext: string): Promise<string> {
  if (!password) throw new Error('Passphrase is required.')
  const salt = randomBytes(SALT_LEN)
  const iv = randomBytes(ivLen(cipher))
  const data = toBytes(plaintext)

  let ct: Uint8Array
  if (cipher === 'chacha20-poly1305') {
    const key = await deriveBits(password, salt, 256)
    ct = chacha20poly1305(key, iv).encrypt(data)
  } else {
    const name = cipher === 'aes-gcm' ? 'AES-GCM' : 'AES-CBC'
    const key = await deriveAesKey(password, salt, name)
    const buf = await crypto.subtle.encrypt({ name, iv }, key, data)
    ct = new Uint8Array(buf)
  }

  const out = new Uint8Array(salt.length + iv.length + ct.length)
  out.set(salt, 0)
  out.set(iv, salt.length)
  out.set(ct, salt.length + iv.length)
  return bytesToBase64(out)
}

export async function decrypt(cipher: Cipher, password: string, payload: string): Promise<string> {
  if (!password) throw new Error('Passphrase is required.')
  let bytes: Uint8Array<ArrayBuffer>
  try {
    bytes = base64ToBytes(payload)
  } catch {
    throw new Error('Input is not valid base64.')
  }

  const ivn = ivLen(cipher)
  if (bytes.length < SALT_LEN + ivn + 1) throw new Error('Ciphertext is too short or malformed.')

  const salt = bytes.slice(0, SALT_LEN)
  const iv = bytes.slice(SALT_LEN, SALT_LEN + ivn)
  const ct = bytes.slice(SALT_LEN + ivn)

  try {
    if (cipher === 'chacha20-poly1305') {
      const key = await deriveBits(password, salt, 256)
      return dec.decode(chacha20poly1305(key, iv).decrypt(ct))
    }
    const name = cipher === 'aes-gcm' ? 'AES-GCM' : 'AES-CBC'
    const key = await deriveAesKey(password, salt, name)
    const buf = await crypto.subtle.decrypt({ name, iv }, key, ct)
    return dec.decode(new Uint8Array(buf))
  } catch {
    throw new Error('Decryption failed — wrong passphrase, cipher, or corrupted data.')
  }
}
