/* eslint-disable @typescript-eslint/no-explicit-any */
import * as wrapper from 'solc/wrapper'

const VERSION = 'soljson-v0.8.17+commit.8df45f5f.js'

const ctx = self as any
let solc: any

let missingInputs: string[] = []

const missingInputsCallback = (path: string) => {
  missingInputs.push(path)
  return { error: 'Deferred import' }
}

const loadCompiler = () => {
  try {
    importScripts(`https://solc-bin.ethereum.org/bin/${VERSION}`)
    solc = wrapper(ctx.Module)
  } catch (error) {
    return null
  }

  return VERSION
}

const compile = (input: object) => {
  missingInputs = []

  const data = JSON.parse(solc.compile(input, { import: missingInputsCallback }))

  return {
    ...data,
    missingInputs,
  }
}

ctx.onmessage = (e: MessageEvent<{ cmd: 'compile' | 'load'; data: object }>) => {
  switch (e.data.cmd) {
    case 'load':
      {
        const version = loadCompiler()
        ctx.postMessage({
          cmd: version ? 'loaded' : 'loadingFailed',
          data: version,
        })
      }

      break
    case 'compile':
      ctx.postMessage({
        cmd: 'compiled',
        data: compile(e.data.data),
      })
      break

    default:
      break
  }
}

export {}
