import * as vscode from 'vscode'
import { getRoastsForFile } from './roaster/geminiClient'
import { writeRoastSummary } from './summary/writeSummary'

let diagnosticCollection: vscode.DiagnosticCollection

type RoastSeverity = 'minor' | 'major' | 'critical'

export interface RoastData {
  line: number
  roast: string
  severity: RoastSeverity
}

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

    const files = await vscode.workspace.findFiles(
      '**/*.{js,ts,tsx,jsx,py,java,rb,go,sh,html,css}',
      '**/{node_modules,dist,build,out,venv,target,.git}/**'
    )
    
    let totalRoasts = 0
    const allRoasts: RoastData[] = []

    for (const file of files) {
      const doc = await vscode.workspace.openTextDocument(file)
      const text = doc.getText()
      const uri = file
      const language = doc.languageId

      try {
        const roasts = await getRoastsForFile(text, language) as RoastData[]
        if (!roasts || roasts.length === 0) continue

        console.log('[GEMINI ROAST DATA]', JSON.stringify(roasts, null, 2))

        const diagnostics: vscode.Diagnostic[] = []

        for (const roast of roasts) {
          const actualLine = Math.max(0, Math.min(roast.line - 1, doc.lineCount - 1))
          const line = doc.lineAt(actualLine)
          const range = new vscode.Range(actualLine, 0, actualLine, line.text.length)

          const diag = new vscode.Diagnostic(
            range,
            roast.roast,
            severityMap[roast.severity] || vscode.DiagnosticSeverity.Warning
          )

          diagnostics.push(diag)
          allRoasts.push(roast)
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
      await writeRoastSummary(allRoasts, files.length)
    } else {
      vscode.window.showInformationMessage('✨ Gemini found nothing to roast. You may be… competent.')
    }
  })

  const viewSummaryCommand = vscode.commands.registerCommand('code-roast.viewSummary', async () => {
    const workspace = vscode.workspace.workspaceFolders?.[0]
    if (!workspace) {
      vscode.window.showErrorMessage('No workspace folder open.')
      return
    }

    const filePath = vscode.Uri.file(`${workspace.uri.fsPath}/.code-roast/database/roast-summary.md`)

    try {
      const doc = await vscode.workspace.openTextDocument(filePath)
      await vscode.window.showTextDocument(doc, { preview: false })
    } catch (err) {
      vscode.window.showErrorMessage('Roast summary not found. You may not have been judged yet.')
    }
  })

  context.subscriptions.push(roastCommand, viewSummaryCommand)
}

export function deactivate() {
  diagnosticCollection?.clear()
  diagnosticCollection?.dispose()
}
