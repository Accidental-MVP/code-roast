import * as vscode from 'vscode'
import { getRoastsForFile } from './roaster/geminiClient'

let diagnosticCollection: vscode.DiagnosticCollection

type RoastSeverity = 'minor' | 'major' | 'critical'

interface RoastData {
  line: number
  roast: string
  severity: RoastSeverity
}

// Map Gemini severity levels to VS Code diagnostic severities
const severityMap: Record<RoastSeverity, vscode.DiagnosticSeverity> = {
  'minor': vscode.DiagnosticSeverity.Information,
  'major': vscode.DiagnosticSeverity.Warning,
  'critical': vscode.DiagnosticSeverity.Error
}

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('code-roast')
  context.subscriptions.push(diagnosticCollection)

  const roastCommand = vscode.commands.registerCommand('code-roast.start', async () => {
    vscode.window.showInformationMessage('🔥 Roasting your sins (whole-file mode)...')

    const files = await vscode.workspace.findFiles('**/*.{ts,js}', '**/{node_modules,dist,build,out}/**')
    let totalRoasts = 0

    for (const file of files) {
      const doc = await vscode.workspace.openTextDocument(file)
      const text = doc.getText()
      const uri = file

      try {
        const roasts = await getRoastsForFile(text) as RoastData[]
        if (!roasts || roasts.length === 0) continue

        // Log the full roast data for debugging
        console.log('[GEMINI ROAST DATA]', JSON.stringify(roasts, null, 2))

        const diagnostics: vscode.Diagnostic[] = []

        for (const roast of roasts) {
          const actualLine = Math.max(0, Math.min(roast.line - 1, doc.lineCount - 1)) // 1-based → 0-based
          const line = doc.lineAt(actualLine)
          const range = new vscode.Range(actualLine, 0, actualLine, line.text.length)


          const diag = new vscode.Diagnostic(
            range,
            roast.roast,
            severityMap[roast.severity] || vscode.DiagnosticSeverity.Warning
          )

          diagnostics.push(diag)
          totalRoasts++
        }

        diagnosticCollection.set(uri, diagnostics)
      } catch (err) {
        console.error('[CodeRoast] Error processing file:', file.fsPath, err)
        vscode.window.showErrorMessage(`Gemini roast failed for ${file.fsPath}`)
      }
    }

    if (totalRoasts > 0) {
      vscode.window.showInformationMessage(`🔥 Gemini roasted ${totalRoasts} line(s) across your codebase.`)
    } else {
      vscode.window.showInformationMessage('✨ Gemini found nothing to roast. You may be… competent.')
    }
  })

  context.subscriptions.push(roastCommand)
}

export function deactivate() {
  diagnosticCollection?.clear()
  diagnosticCollection?.dispose()
}

