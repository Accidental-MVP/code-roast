import * as vscode from 'vscode'

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

export async function generateRoastWithGemini(line: string): Promise<string | null> {
  const key = vscode.workspace.getConfiguration().get<string>('codeRoast.geminiApiKey')

  if (!key) return null

  const prompt = `
  You're a sarcastic but skilled code reviewer.  
  Your job is to roast this single line of code **only if it's lazy, bad, confusing, or poor style**.  
  If the line looks fine, say: "This one's not roastable."

  Line:
  "${line}"
  `.trim()


  try {
    const response = await fetch(`${GEMINI_API}?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    })

    const data = await response.json() as any
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    return text ?? null
  } catch (err) {
    console.warn('[CodeRoast] Gemini request failed:', err)
    return null
  }
}
