import * as vscode from 'vscode'
import { analyzeWorkspace, RoastCandidate } from './analyzer/analyzeFile'
import { generateRoastWithGemini } from './roaster/geminiClient'


let diagnosticCollection: vscode.DiagnosticCollection

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('code-roast')
  context.subscriptions.push(diagnosticCollection)

  const roastCommand = vscode.commands.registerCommand('code-roast.start', async () => {
    vscode.window.showInformationMessage('🔥 Roasting your sins...')

    const results: RoastCandidate[] = await analyzeWorkspace()

    if (results.length === 0) {
      vscode.window.showInformationMessage('Nothing roastable. Suspiciously clean...')
      return
    }

    const fileMap: Map<string, vscode.Diagnostic[]> = new Map()

    for (const r of results) {
      const uri = vscode.Uri.file(r.filePath)
      const range = new vscode.Range(r.line, 0, r.line, r.text.length)
      
      let message: string | null = null

      try {
        message = await generateRoastWithGemini(r.text)

        if (message === 'This one\'s not roastable.' || !message?.trim()) {
          // Gemini thinks it's fine → skip this line
          console.log(`[SKIP] Gemini found no issue for: ${r.text}`)
          continue
        }

        console.log(`[GEMINI] Roasting: ${r.text} → ${message}`)
      } catch (err) {
        console.error('[CodeRoast] Gemini failed:', err)
        vscode.window.showErrorMessage('⚠️ Gemini API failed or timed out. Try again later.')
        return
      }

      const diagnostic = new vscode.Diagnostic(
        range,
        message,
        vscode.DiagnosticSeverity.Warning
      )

      if (!fileMap.has(r.filePath)) {
        fileMap.set(r.filePath, [])
      }

      fileMap.get(r.filePath)?.push(diagnostic)
    }

    for (const [filePath, diagnostics] of fileMap.entries()) {
      const uri = vscode.Uri.file(filePath)
      diagnosticCollection.set(uri, diagnostics)
    }

    vscode.window.showInformationMessage(`Roast complete. ${results.length} sins uncovered.`)
  })

  context.subscriptions.push(roastCommand)
}

function generateRoast(line: string): string {
  if (line.includes('catch {')) return '🔥 Empty catch block? Just vibe through errors, huh?'
  if (line.includes('==')) return '🔥 Loose equality? Why not just flip a coin?'
  if (line.includes('any')) return '🔥 "any" type detected. Chaos reigns.'
  if (line.match(/\b(data|thing|stuff|obj)\b/)) return '🔥 That variable name tells me nothing and everything. Mostly nothing.'
  return '🔥 Suspicious code detected.'
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.clear()
    diagnosticCollection.dispose()
  }
}
