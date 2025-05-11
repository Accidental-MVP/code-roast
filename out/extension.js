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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const analyzeFile_1 = require("./analyzer/analyzeFile");
const geminiClient_1 = require("./roaster/geminiClient");
let diagnosticCollection;
function activate(context) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('code-roast');
    context.subscriptions.push(diagnosticCollection);
    const roastCommand = vscode.commands.registerCommand('code-roast.start', async () => {
        vscode.window.showInformationMessage('🔥 Roasting your sins...');
        const results = await (0, analyzeFile_1.analyzeWorkspace)();
        if (results.length === 0) {
            vscode.window.showInformationMessage('Nothing roastable. Suspiciously clean...');
            return;
        }
        const fileMap = new Map();
        for (const r of results) {
            const uri = vscode.Uri.file(r.filePath);
            const range = new vscode.Range(r.line, 0, r.line, r.text.length);
            let message = null;
            try {
                message = await (0, geminiClient_1.generateRoastWithGemini)(r.text);
                if (message === 'This one\'s not roastable.' || !message?.trim()) {
                    // Gemini thinks it's fine → skip this line
                    console.log(`[SKIP] Gemini found no issue for: ${r.text}`);
                    continue;
                }
                console.log(`[GEMINI] Roasting: ${r.text} → ${message}`);
            }
            catch (err) {
                console.error('[CodeRoast] Gemini failed:', err);
                vscode.window.showErrorMessage('⚠️ Gemini API failed or timed out. Try again later.');
                return;
            }
            const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning);
            if (!fileMap.has(r.filePath)) {
                fileMap.set(r.filePath, []);
            }
            fileMap.get(r.filePath)?.push(diagnostic);
        }
        for (const [filePath, diagnostics] of fileMap.entries()) {
            const uri = vscode.Uri.file(filePath);
            diagnosticCollection.set(uri, diagnostics);
        }
        vscode.window.showInformationMessage(`Roast complete. ${results.length} sins uncovered.`);
    });
    context.subscriptions.push(roastCommand);
}
function generateRoast(line) {
    if (line.includes('catch {'))
        return '🔥 Empty catch block? Just vibe through errors, huh?';
    if (line.includes('=='))
        return '🔥 Loose equality? Why not just flip a coin?';
    if (line.includes('any'))
        return '🔥 "any" type detected. Chaos reigns.';
    if (line.match(/\b(data|thing|stuff|obj)\b/))
        return '🔥 That variable name tells me nothing and everything. Mostly nothing.';
    return '🔥 Suspicious code detected.';
}
function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.clear();
        diagnosticCollection.dispose();
    }
}
//# sourceMappingURL=extension.js.map