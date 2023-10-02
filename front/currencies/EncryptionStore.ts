import { makeAutoObservable } from 'mobx'

import { decryptFile, decryptPassphrase, encryptPassphrase, makeEncryptedFile } from '@/crypto'
import { EncryptedFile, Hex } from '@/types'
import { noop } from '@/utils/fn'
import EncryptionStorage from '@/utils/storage/encryption'

export class EncryptionStore {
  password: string | null = null

  requestPasswordDialog = false

  onClosePasswordDialog: (value: string | null) => void = noop

  storage: EncryptionStorage

  constructor() {
    makeAutoObservable(this)
    this.storage = EncryptionStorage.getInstance()
  }

  get passphraseCipher() {
    return this.storage.getPassphraseCipher()
  }

  get externalAccounts() {
    return this.storage.getAllExternalAccount() || []
  }

  async requestPassword(): Promise<string> {
    this.requestPasswordDialog = true

    return new Promise((resolve) => {
      this.onClosePasswordDialog = (value) => {
        resolve(value as string)
        this.requestPasswordDialog = false
      }
    })
  }

  async encryptPassphrase(passphrase: string, password: string) {
    const { cipher } = await encryptPassphrase(passphrase, password)

    this.storage.setPassphraseCipher(cipher)
  }

  async decryptPassphrase(password?: string) {
    const phc = this.storage.getPassphraseCipher()
    if (!phc) {
      throw new Error('PHC_NOT_EXIST')
    }

    password = password || (await this.requestPassword())
    if (!password) {
      throw new Error('EMPTY_PASSWORD')
    }

    const { cipher, Crypto } = phc
    return decryptPassphrase(cipher, Crypto, password)
  }

  async isWalletPasswordValid(password: string) {
    return this.decryptPassphrase(password)
  }

  async encryptPrivateKey(privateKey: Hex, address: Hex, password: string) {
    const { Crypto } = await makeEncryptedFile(password, address, privateKey)

    this.storage.setExternalAccount({
      ciphertext: Crypto.ciphertext,
      salt: Crypto.kdfparams.salt,
      mac: Crypto.mac,
      iv: Crypto.cipherparams.iv,
    })
  }

  async decryptWalletFile(file: EncryptedFile, password: string) {
    return decryptFile(file, password).catch((e: Error) => {
      let msg = e.message
      if (msg === 'INVALID_MAC') msg = 'Invalid file password'
      throw new Error(msg)
    })
  }

  async clearCache() {
    this.storage.clearAll()
  }
}
