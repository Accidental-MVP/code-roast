"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoastsForFile = getRoastsForFile;
const vscode = __importStar(require("vscode"));
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
async function getRoastsForFile(fileContent, language) {
    const key = vscode.workspace.getConfiguration().get('codeRoast.geminiApiKey');
    if (!key)
        return null;
    // Add line numbers to the file
    const numberedCode = fileContent
        .split('\n')
        .map((line, i) => `${i + 1}: ${line}`)
        .join('\n');
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
`.trim();
    try {
        const response = await fetch(`${GEMINI_API}?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        console.log('[GEMINI RAW RESPONSE]', JSON.stringify(data, null, 2));
        if (!data?.candidates || data.candidates.length === 0) {
            console.warn('[CodeRoast] No candidates returned from Gemini.');
            return null;
        }
        const rawText = data.candidates[0]?.content?.parts?.[0]?.text;
        if (!rawText)
            return null;
        const match = rawText.match(/\[\s*{[\s\S]*}\s*]/);
        if (!match) {
            console.warn('[CodeRoast] Gemini returned non-JSON or malformed content.');
            return null;
        }
        const parsed = JSON.parse(match[0]);
        return parsed;
    }
    catch (err) {
        console.error('[CodeRoast] Gemini full file roast failed:', err);
        return null;
    }
}
//# sourceMappingURL=geminiClient.js.map