import * as ed from '@noble/ed25519'
import { keccak_256 } from '@noble/hashes/sha3'
import { sha256 } from '@noble/hashes/sha256'
import { BigNumberish } from 'ethers'
import { concat } from 'ethers/lib/utils'
import scrypt from 'scrypt-js'
import secureRandom from 'secure-random'

import { Address, Bytes, Cipher, CryptoParams, EncryptedFile, Hex } from './types'
import { toBytes } from './utils/bytes'
import { bignumber } from './utils/numbers'

export const bytesToHex = ed.utils.bytesToHex
export const hexToBytes = ed.utils.hexToBytes


export const generateKeys = async (passphrase: string) => {
  const privateKey = sha256.create().update(passphrase).digest()
  const publicKey = await ed.getPublicKey(privateKey)

  return {
    privateKey,
    publicKey,
    privateKeyHex: bytesToHex(privateKey),
    publicKeyHex: bytesToHex(publicKey),
  }
}

export const generatePublicKeyFromPrivate = async (privateKey: Hex) => {
  const key = hexToBytes(privateKey)
  const publicKey = await ed.getPublicKey(key)

  return publicKey
}

export const generateAddress = (
  publicKey: Uint8Array,
  encode: 'buffer' | 'hex' = 'hex',
): Bytes | Address => {
  const buffer = keccak_256(publicKey).slice(12)

  if (encode === 'buffer') return buffer

  return ('0x' + bytesToHex(buffer)) as Address
}



export const signRawTransaction = async (
  bytes: Uint8Array,
  privateKey: Hex,
): Promise<[Uint8Array, Hex]> => {
  const hash = sha256.create().update(bytes).digest()
  const signature = await ed.sign(hash, privateKey)

  return [signature, bytesToHex(hash)]
}

export const verifyTransaction = (signature: Uint8Array, tx: Uint8Array | Hex, publicKey: Hex) => {
  return ed.verify(signature, tx, publicKey)
}

export const calculateAddress = (sender: Hex, nonce: BigNumberish) => {
  const keccakBuff = keccak_256(concat([sender, toBytes(bignumber(nonce))])).slice(12)

  return '0x' + bytesToHex(keccakBuff)
}

