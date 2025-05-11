import * as ts from 'typescript'
import * as vscode from 'vscode'

export interface RoastCandidate {
  filePath: string
  line: number
  text: string
}

export async function analyzeWorkspace(): Promise<RoastCandidate[]> {
  const candidates: RoastCandidate[] = []
  const files = await vscode.workspace.findFiles(
    '**/*.{ts,js}',
    '**/{node_modules,dist,build,out}/**'
  )
  
  for (const file of files) {
    const doc = await vscode.workspace.openTextDocument(file)
    const lines = doc.getText().split('\n')

    lines.forEach((lineText, index) => {
      const line = lineText.trim()

      // Add more sins here as you like
      const isSinful =
        line.includes('catch {') ||
        line.includes('==') ||
        line.includes('any') ||
        line.match(/\b(data|thing|stuff|obj)\b/)

      if (isSinful) {
        candidates.push({
          filePath: file.fsPath,
          line: index,
          text: lineText.trim()
        })
      }
    })
  }

  return candidates
}
