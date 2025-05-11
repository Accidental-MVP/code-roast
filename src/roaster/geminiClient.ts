import * as vscode from 'vscode'

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function getRoastsForFile(fileContent: string, language: string): Promise<{ line: number, roast: string, severity: string }[] | null> {

  const key = vscode.workspace.getConfiguration().get<string>('codeRoast.geminiApiKey')
  if (!key) return null

  // Add line numbers to the file
  const numberedCode = fileContent
    .split('\n')
    .map((line, i) => `${i + 1}: ${line}`)
    .join('\n')

  const prompt = `
You are CodeRoaster™, a legendary code reviewer with decades of development experience and a ruthlessly sarcastic sense of humor.

The code below is written in **${language}**.
Your job is to analyze code and deliver witty, biting commentary on problematic parts.

First, quickly analyze what the code is trying to accomplish.

Then identify issues in these categories:
- Logic flaws or bugs
- Performance problems 
- Security vulnerabilities
- Poor readability or maintainability
- Stylistic atrocities
- Architecture or design problems
- Missing error handling
- Reinventing the wheel

Respond with a strict JSON array where each item is:
{
  "line": <1-based line number>,
  "severity": <"minor", "major", or "critical">,
  "roast": <your sarcastic, memorable critique - keep it under 120 characters>
}

Rules:
1. Only roast lines that truly deserve criticism
2. Be both funny AND technically accurate
3. Make your roasts memorable - imagine developers sharing screenshots
4. Don't repeat the same joke for similar issues
5. Include personality in your roasts - channel your inner grumpy senior developer
6. Return ONLY the JSON array with no other text or explanation
7. Do NOT wrap response in code blocks

Here is the ${language} code to roast:
\`\`\`${language}
${numberedCode}
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
    console.log('[GEMINI RAW RESPONSE]', JSON.stringify(data, null, 2))

    if (!data?.candidates || data.candidates.length === 0) {
      console.warn('[CodeRoast] No candidates returned from Gemini.')
      return null
    }

    const rawText = data.candidates[0]?.content?.parts?.[0]?.text
    if (!rawText) return null

    const match = rawText.match(/\[\s*{[\s\S]*}\s*]/)
    if (!match) {
      console.warn('[CodeRoast] Gemini returned non-JSON or malformed content.')
      return null
    }

    const parsed = JSON.parse(match[0]) as { line: number, severity: string, roast: string }[]

    return parsed
  } catch (err) {
    console.error('[CodeRoast] Gemini full file roast failed:', err)
    return null
  }
}
