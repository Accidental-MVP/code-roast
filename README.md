# 🔥 CodeRoast — The AI Code Reviewer With a Grudge

> *"You don’t need a linter. You need therapy."*

**CodeRoast** is a VS Code extension that reads your code, silently judges your life choices,
and then roasts each problematic line with AI-generated insults — powered by Gemini.

It doesn’t ask *“Are you ready for feedback?”*
It asks *“Are you emotionally stable enough to handle this?”*

---

## ⚙️ What It Does

* 🧠 Scans your entire codebase
* 🔎 Sends each file to Gemini AI
* 💬 Returns roast comments for:

  * Logic flaws
  * Naming crimes
  * Empty `catch` blocks
  * Bad style
  * Missing error handling
  * Things that would make your senior dev sigh audibly
* 🩻 Highlights the roast directly in the file via VS Code diagnostics
* 🧾 Generates a `roast-summary.md` in `.code-roast/database/` with:

  * Severity counts
  * Common bad habits
  * Suggested improvements
  * A final report so you can cry productively

---

## 🔧 Extension Settings

To use CodeRoast with Gemini, you’ll need to provide your own Gemini API key.

Go to **Settings > Extensions > CodeRoast** or open `settings.json` and add:

```json
"codeRoast.geminiApiKey": "YOUR_API_KEY_HERE"
```

Optional settings coming soon:

* `codeRoast.useGeminiForSummary`: `true | false` — lets Gemini write the roast summary
* `codeRoast.languageFilter`: `["js", "py", "java"]` — restrict which files get roasted

No key = no roast. Gemini demands tribute.

---

## 💡 Example

```ts
if (data == null || data == undefined) {
  console.log("oops")
}
```

> *“null == undefined? Did you learn JavaScript from a fortune cookie?”*

```ts
catch {}
```

> *“Ah yes, silent error handling. Nothing to see here. Especially the errors.”*

```ts
const thing = "yolo"
```

> *“Global constant named 'thing'. I weep for future maintainers.”*

---

## 🧙 Supported Languages

* ✅ JavaScript / TypeScript (+ JSX/TSX)
* ✅ Python
* ✅ Java
* ✅ Bash / Shell
* ✅ HTML / CSS
* ✅ Ruby
* ✅ Go

> More coming, depending on how much pain you want.

---

## 🚀 How to Use

1. Install from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=YOUR_NAME.code-roast)
2. Press `Ctrl+Shift+P` → `Start Code Roast`
3. Watch it roast your code line by line
4. Check `.code-roast/database/roast-summary.md` for your final report
5. Question your choices

---

## 🔐 Privacy

This extension does NOT upload your code.
It sends individual files to **Gemini** via API **only when you trigger the roast**.
You can also provide your own Gemini API key for complete control.

No tracking.
No data collection.
Just roasting.

---

## 🧷 Why?

Because your code is probably bad.
And deep down, you know it.

---

## ✍️ Built By

[accidental-mvp](https://github.com/accidental-mvp)
The same brain responsible for [ShameLock](https://github.com/accidental-mvp/shamelock)

---

> "You were a developer.
> I roasted you like one."
> — CodeRoast, probably
