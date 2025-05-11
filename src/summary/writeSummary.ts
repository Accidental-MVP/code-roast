import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { RoastData } from '../extension' // or wherever your RoastData type lives
import { getGeminiSummary } from './/geminiSummaryClient' // new file you’ll create in next step

export async function writeRoastSummary(roasts: RoastData[], totalFiles: number) {
  const summary = await getGeminiSummary(roasts, totalFiles)

  const workspace = vscode.workspace.workspaceFolders?.[0]
  if (!workspace || !summary) return

  const folderPath = path.join(workspace.uri.fsPath, '.code-roast', 'database')
  const filePath = path.join(folderPath, 'roast-summary.md')

  fs.mkdirSync(folderPath, { recursive: true })
  fs.writeFileSync(filePath, summary, 'utf8')

  vscode.window.showInformationMessage(`📂 Gemini-powered roast summary saved to ${filePath}`)
}
