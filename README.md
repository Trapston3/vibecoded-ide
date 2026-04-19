# 🪐 Vibecoded IDE

**Vibecoded IDE** is a high-performance, aesthetically-driven code editor built on the Tauri framework. It blends a vintage "vibey" aesthetic with modern, robust developer tools including a customized Monaco editor, integrated PTY terminal, and a secure Rust backend.

![Version](https://img.shields.io/badge/version-0.1.0-amber)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-green)

---

## ✨ Features

- **🎨 Tailored Aesthetic:** Custom "Vibecoded" themes (Dark & Light) featuring soft pastel palettes and low-contrast typography optimized for long coding sessions.
- **⚡ Supercharged Editor:** Powered by **Monaco Editor** (the engine behind VS Code) with full support for syntax highlighting, IntelliSense, and multi-pane management.
- **📟 Integrated Terminal:** A high-performance terminal based on **xterm.js** and **tauri-pty**, featuring seamless bidirectional communication and vintage ANSI color support.
- **📁 Advanced Workspace Management:**
  - Split-pane architecture for side-by-side editing.
  - Global search with regex support and recursive path exploration.
  - Interactive file explorer with hidden file filtering.
- **🛡️ Hardened Security:**
  - **Path Traversal Protection:** Rust backend commands are validated to prevent unauthorized filesystem access.
  - **Strict CSP:** Robust Content Security Policy to mitigate XSS vulnerabilities.
  - **Restricted Privileges:** Finely-tuned Tauri capabilities scope to ensure the IDE only touches what it needs.

---

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Rust (Tauri 2.0)
- **Editor:** @monaco-editor/react
- **Terminal:** @xterm/xterm + tauri-pty
- **Styling:** Vanilla CSS with custom design tokens
- **State Management:** Zustand

---

## 🚀 Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18+)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Trapston3/vibecoded-ide.git
   cd vibecoded-ide
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run tauri dev
   ```

4. **Build for production:**
   ```bash
   npm run tauri build
   ```

---

## 🤝 Contribution

Vibecoded IDE is currently in an experimental phase. Contributions, issue reports, and feedback are welcome!

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <i>Created with love by <a href="https://github.com/Trapston3">Trapston3</a></i>
</p>
