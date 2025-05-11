import * as vscode from 'vscode'

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function getGeminiSummary(roasts: any[], totalFiles: number): Promise<string | null> {
  const key = vscode.workspace.getConfiguration().get<string>('codeRoast.geminiApiKey')
  if (!key) {
    vscode.window.showErrorMessage('Gemini API key missing for summary generation.')
    return null
  }

  const prompt = `
You're CodeRoast™, an experienced code reviewer with a sharp eye and sharper tongue.

Given this array of roast messages (each with severity and comment), generate a roast summary in Markdown format. Include:

- Total files scanned: ${totalFiles}
- Number of roast lines total
- Count of roasts by severity
- Common issues you see (in plain language)
- Suggestions for how the developer can improve

Keep it clear, sarcastic, and technically accurate. DO NOT return JSON. Return a readable Markdown summary only.

Here are the roast messages:
${JSON.stringify(roasts)}
`.trim()

  try {
    const response = await fetch(`${GEMINI_API}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const data = await response.json() as any
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      vscode.window.showWarningMessage('Gemini did not return a summary.')
      return null
    }

    return text
  } catch (err) {
    console.error('[CodeRoast] Gemini summary failed:', err)
    vscode.window.showErrorMessage('Error generating summary via Gemini.')
    return null
  }
}
