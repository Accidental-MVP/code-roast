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
const geminiClient_1 = require("./roaster/geminiClient");
const writeSummary_1 = require("./summary/writeSummary");
let diagnosticCollection;
const severityMap = {
    'minor': vscode.DiagnosticSeverity.Information,
    'major': vscode.DiagnosticSeverity.Warning,
    'critical': vscode.DiagnosticSeverity.Error
};
function activate(context) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('code-roast');
    context.subscriptions.push(diagnosticCollection);
    const roastCommand = vscode.commands.registerCommand('code-roast.start', async () => {
        vscode.window.showInformationMessage('🔥 Roasting your sins (whole-file mode)...');
        const files = await vscode.workspace.findFiles('**/*.{ts,js}', '**/{node_modules,dist,build,out}/**');
        let totalRoasts = 0;
        const allRoasts = [];
        for (const file of files) {
            const doc = await vscode.workspace.openTextDocument(file);
            const text = doc.getText();
            const uri = file;
            try {
                const roasts = await (0, geminiClient_1.getRoastsForFile)(text);
                if (!roasts || roasts.length === 0)
                    continue;
                console.log('[GEMINI ROAST DATA]', JSON.stringify(roasts, null, 2));
                const diagnostics = [];
                for (const roast of roasts) {
                    const actualLine = Math.max(0, Math.min(roast.line - 1, doc.lineCount - 1));
                    const line = doc.lineAt(actualLine);
                    const range = new vscode.Range(actualLine, 0, actualLine, line.text.length);
                    const diag = new vscode.Diagnostic(range, roast.roast, severityMap[roast.severity] || vscode.DiagnosticSeverity.Warning);
                    diagnostics.push(diag);
                    allRoasts.push(roast);
                    totalRoasts++;
                }
                diagnosticCollection.set(uri, diagnostics);
            }
            catch (err) {
                console.error('[CodeRoast] Error processing file:', file.fsPath, err);
                vscode.window.showErrorMessage(`Gemini roast failed for ${file.fsPath}`);
            }
        }
        if (totalRoasts > 0) {
            vscode.window.showInformationMessage(`🔥 Gemini roasted ${totalRoasts} line(s) across your codebase.`);
            await (0, writeSummary_1.writeRoastSummary)(allRoasts, files.length);
        }
        else {
            vscode.window.showInformationMessage('✨ Gemini found nothing to roast. You may be… competent.');
        }
    });
    const viewSummaryCommand = vscode.commands.registerCommand('code-roast.viewSummary', async () => {
        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) {
            vscode.window.showErrorMessage('No workspace folder open.');
            return;
        }
        const filePath = vscode.Uri.file(`${workspace.uri.fsPath}/.code-roast/database/roast-summary.md`);
        try {
            const doc = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(doc, { preview: false });
        }
        catch (err) {
            vscode.window.showErrorMessage('Roast summary not found. You may not have been judged yet.');
        }
    });
    context.subscriptions.push(roastCommand, viewSummaryCommand);
}
function deactivate() {
    diagnosticCollection?.clear();
    diagnosticCollection?.dispose();
}
//# sourceMappingURL=extension.js.map