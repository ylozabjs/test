import { CompilationError, CompilationResult as SolidityCompilationResult, Source } from './types'
import { RemixURLResolver } from './url_resolver'

type CompilationResult = SolidityCompilationResult & { missingInputs: string[] }

type Params = {
  onFinishCompilation: (data: CompilationResult) => void
  onFatalError: (errors?: CompilationError[]) => void
  onCompilationStated?: () => void
  onLoadingFailed?: () => void
}

class Compiler {
  private compiler: Worker | undefined
  private sources: Source | undefined

  private onFinishCompilation: (data: CompilationResult) => void
  private onFatalError: (errors?: CompilationError[]) => void
  private onCompilationStated?: () => void
  private onLoadingFailed?: () => void

  constructor(params: Params) {
    this.loadWorker()

    this.onFinishCompilation = params.onFinishCompilation
    this.onFatalError = params.onFatalError
    this.onCompilationStated = params.onCompilationStated
    this.onLoadingFailed = params.onLoadingFailed
  }

  public compile(source: Source, missingInputs: string[] = []) {
    this.onCompilationStated && this.onCompilationStated()
    this._compile(source, missingInputs)
  }

  private loadWorker() {
    this.compiler = new Worker(new URL('./worker/solc.worker', import.meta.url))
    this.compiler.postMessage({
      cmd: 'load',
    })

    this.registerWokerkMessages()
  }

  private registerWokerkMessages = () => {
    if (this.compiler) {
      this.compiler.onmessage = (e) => {
        switch (e.data.cmd) {
          case 'loaded':
            console.log('compiler loaded', e.data.data)
            break
          case 'compiled':
            this.onCompiled(e.data.data)
            break
          case 'loadingFailed':
            this.onLoadingFailed && this.onLoadingFailed()
            break
          default:
            break
        }
      }
    }
  }

  private _compile(source: Source, missingInputs: string[] = []) {
    this.collectImports(source, missingInputs).then((sources) => {
      this.sources = sources
      this.compiler?.postMessage({
        cmd: 'compile',
        data: this.createCompileInput(sources),
      })
    })
  }

  private onCompiled(data: CompilationResult) {
    let noFatalErrors = true

    const checkIfFatalError = (error: CompilationError) => {
      const isValidError =
        error.message && error.message.includes('Deferred import')
          ? false
          : error.severity !== 'warning'
      if (isValidError) noFatalErrors = false
    }

    if (data.error) checkIfFatalError(data.error)
    if (data.errors) data.errors.forEach((err: CompilationError) => checkIfFatalError(err))

    if (!noFatalErrors) {
      // fatal error
      this.onFatalError(data.errors)
      return
    }

    if (data.missingInputs.length && this.sources) {
      this._compile(this.sources, data.missingInputs)
    } else {
      console.log('compilation finished')
      this.onFinishCompilation(data)
    }
  }

  private createCompileInput(sources: Source): string {
    const compileInput = {
      language: 'Solidity',
      sources: sources,
      settings: {
        outputSelection: {
          '*': {
            '*': ['*'],
          },
        },
      },
    }

    return JSON.stringify(compileInput)
  }

  private async collectImports(files: Source, importHints?: string[]): Promise<Source> {
    importHints = importHints || []
    // FIXME: This will only match imports if the file begins with one '.'
    // It should tokenize by lines and check each.
    const importRegex = /^\s*import\s*['"]([^'"]+)['"];/g
    for (const fileName in files) {
      let match: RegExpExecArray | null

      while ((match = importRegex.exec(files[fileName].content))) {
        let importFilePath = match[1]
        if (importFilePath.startsWith('./')) {
          const path: RegExpExecArray | null = /(.*\/).*/.exec(fileName)
          importFilePath = path ? importFilePath.replace('./', path[1]) : importFilePath.slice(2)
        }
        if (!importHints.includes(importFilePath)) importHints.push(importFilePath)
      }
    }

    while (importHints.length > 0) {
      const m: string = importHints.pop() as string
      if (m && m in files) continue

      const content = await this.handleImportCall(m)
      files[m] = { content }

      this.collectImports(files, importHints)
    }

    return files
  }

  private handleImportCall(moduleName: string) {
    const urlResolver = new RemixURLResolver()

    return urlResolver.resolve(moduleName).then((sources) => {
      return sources.content
    })
  }
}

export default Compiler
