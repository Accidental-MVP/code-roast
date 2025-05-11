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
exports.getGeminiSummary = getGeminiSummary;
const vscode = __importStar(require("vscode"));
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
async function getGeminiSummary(roasts, totalFiles) {
    const key = vscode.workspace.getConfiguration().get('codeRoast.geminiApiKey');
    if (!key) {
        vscode.window.showErrorMessage('Gemini API key missing for summary generation.');
        return null;
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
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            vscode.window.showWarningMessage('Gemini did not return a summary.');
            return null;
        }
        return text;
    }
    catch (err) {
        console.error('[CodeRoast] Gemini summary failed:', err);
        vscode.window.showErrorMessage('Error generating summary via Gemini.');
        return null;
    }
}
//# sourceMappingURL=geminiSummaryClient.js.map