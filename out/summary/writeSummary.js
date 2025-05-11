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
exports.writeRoastSummary = writeRoastSummary;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const geminiSummaryClient_1 = require(".//geminiSummaryClient"); // new file you’ll create in next step
async function writeRoastSummary(roasts, totalFiles) {
    const summary = await (0, geminiSummaryClient_1.getGeminiSummary)(roasts, totalFiles);
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace || !summary)
        return;
    const folderPath = path.join(workspace.uri.fsPath, '.code-roast', 'database');
    const filePath = path.join(folderPath, 'roast-summary.md');
    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(filePath, summary, 'utf8');
    vscode.window.showInformationMessage(`📂 Gemini-powered roast summary saved to roast-summary.md`, 'View Roast Report').then(selection => {
        if (selection === 'View Roast Report') {
            vscode.commands.executeCommand('code-roast.viewSummary');
        }
    });
}
//# sourceMappingURL=writeSummary.js.map