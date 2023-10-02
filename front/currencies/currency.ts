import { BigNumberish, utils } from 'ethers'

const { parseUnits, formatUnits, commify } = utils

export function parseToken(amount: string) {
  return parseUnits(amount.toString(), 18)
}

export function formatToken(amount: BigNumberish) {
  return commify(formatUnits(amount, 18))
}
