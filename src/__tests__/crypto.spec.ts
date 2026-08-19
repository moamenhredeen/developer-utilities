import { describe, it, expect } from 'vitest'
import { CIPHERS, decrypt, encrypt, type Cipher } from '../utils/crypto'

const ciphers = CIPHERS.map((c) => c.id) as Cipher[]

describe('crypto encrypt/decrypt', () => {
  for (const cipher of ciphers) {
    it(`round-trips with ${cipher}`, async () => {
      const secret = 'The quick brown fox 🦊 — 42'
      const bundle = await encrypt(cipher, 'correct horse battery staple', secret)
      expect(bundle).toMatch(/^[A-Za-z0-9+/=]+$/)
      const back = await decrypt(cipher, 'correct horse battery staple', bundle)
      expect(back).toBe(secret)
    })

    it(`produces different ciphertext each call (random salt/iv) for ${cipher}`, async () => {
      const a = await encrypt(cipher, 'pw', 'hello')
      const b = await encrypt(cipher, 'pw', 'hello')
      expect(a).not.toBe(b)
    })
  }

  it('authenticated ciphers reject a wrong passphrase', async () => {
    for (const cipher of ['aes-gcm', 'chacha20-poly1305'] as Cipher[]) {
      const bundle = await encrypt(cipher, 'right', 'secret')
      await expect(decrypt(cipher, 'wrong', bundle)).rejects.toThrow(/Decryption failed/)
    }
  })

  it('requires a passphrase', async () => {
    await expect(encrypt('aes-gcm', '', 'x')).rejects.toThrow(/required/)
  })

  it('rejects malformed base64 input on decrypt', async () => {
    await expect(decrypt('aes-gcm', 'pw', 'not valid base64 !!!')).rejects.toThrow()
  })
})
