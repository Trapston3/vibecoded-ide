import { useRef, useCallback, useEffect } from 'react';
import { Editor, DiffEditor, type OnMount, type Monaco } from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';
import { useThemeStore } from '../store/useThemeStore';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { vibecodedDark, vibecodedLight } from '../themes/monacoThemes';
import { registerGhostTextProvider } from '../editor/ghostTextProvider';

// ═══════════════════════════════════════════════════════════════
// EditorComponent
//
// LSP-Ready Architecture:
//   - `monacoRef` exposes the Monaco namespace for future LSP wiring
//   - `editorRef` exposes the editor instance for diagnostics/decorations
//   - `languageClientRef` is a placeholder slot for injecting an LSP client
//
// To add LSP in the future:
//   1. Import your language client library
//   2. In onMount, create the client and assign to languageClientRef.current
//   3. Connect it to the Monaco editor's model
// ═══════════════════════════════════════════════════════════════

interface EditorComponentProps {
  filePath: string;
  content: string;
  language: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isDiff?: boolean;
  originalContent?: string;
}

export default function EditorComponent({
  filePath,
  content,
  language,
  onChange,
  onSave,
  isDiff,
  originalContent,
}: EditorComponentProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const sendToTerminal = useWorkspaceStore((s) => s.sendToTerminal);
  const focusedLine = useWorkspaceStore((s) => s.focusedLine);

  // ── Refs for LSP-ready architecture ──
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const _languageClientRef = useRef<unknown>(null); // Future LSP client slot — rename when wiring LSP
  const ghostTextDisposableRef = useRef<{ dispose: () => void } | null>(null);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Register custom themes
      monaco.editor.defineTheme('vibecoded-dark', vibecodedDark);
      monaco.editor.defineTheme('vibecoded-light', vibecodedLight);
      monaco.editor.setTheme(isDark ? 'vibecoded-dark' : 'vibecoded-light');

      // Register ghost text provider (once)
      if (!ghostTextDisposableRef.current) {
        ghostTextDisposableRef.current = registerGhostTextProvider(monaco);
      }

      // ── Keybindings ──

      // Ctrl+S → Save
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave();
      });

      // Ctrl+Enter → Send selection/line to terminal (preserving exact formatting)
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        const selection = editor.getSelection();
        const model = editor.getModel();
        if (!model || !selection) return;

        let text: string;
        if (selection.isEmpty()) {
          // No selection → send current line
          text = model.getLineContent(selection.startLineNumber);
        } else {
          // Send exact selected text, preserving indentation
          text = model.getValueInRange(selection);
        }

        if (text.trim()) {
          sendToTerminal(text);
        }
      });

      // Focus the editor
      editor.focus();
    },
    [isDark, onSave, sendToTerminal],
  );

  // Update theme when toggled
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isDark ? 'vibecoded-dark' : 'vibecoded-light');
    }
  }, [isDark]);

  // Cleanup ghost text provider on unmount
  useEffect(() => {
    return () => {
      ghostTextDisposableRef.current?.dispose();
      ghostTextDisposableRef.current = null;
    };
  }, []);

  // Handle focusing specific line (search results)
  useEffect(() => {
    if (focusedLine !== null && editorRef.current) {
      const editor = editorRef.current;
      // Scroll smoothly to center the line
      editor.revealLineInCenter(focusedLine);
      // Set cursor position to the beginning of the focused line
      editor.setPosition({ lineNumber: focusedLine, column: 1 });
      editor.focus();
    }
  }, [focusedLine]);

  const editorOptions: MonacoEditor.IStandaloneEditorConstructionOptions = {
    // ── Clean GUI ──
    minimap: { enabled: false },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    scrollbar: {
      verticalScrollbarSize: 6,
      horizontalScrollbarSize: 6,
      useShadows: false,
    },

    // ── Typography ──
    fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.3,

    // ── Editing ──
    wordWrap: 'on',
    tabSize: 2,
    insertSpaces: true,
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'full',
    bracketPairColorization: { enabled: true },
    guides: {
      indentation: true,
      bracketPairs: true,
    },

    // ── IntelliSense ──
    suggestOnTriggerCharacters: true,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
    parameterHints: { enabled: true },
    wordBasedSuggestions: 'currentDocument',
    acceptSuggestionOnCommitCharacter: true,

    // ── Inline Completions (ghost text) ──
    inlineSuggest: { enabled: true },

    // ── UX ──
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    renderLineHighlight: 'line',
    renderWhitespace: 'selection',
    padding: { top: 12, bottom: 12 },
    lineNumbers: 'on',
    glyphMargin: false,
    folding: true,
    foldingHighlight: true,
    links: true,
    colorDecorators: true,
    contextmenu: true,
  };

  if (isDiff) {
    return (
      <DiffEditor
        height="100%"
        language={language}
        original={originalContent}
        modified={content}
        theme={isDark ? 'vibecoded-dark' : 'vibecoded-light'}
        onMount={handleMount as any}
        options={{
          ...editorOptions,
          originalEditable: false,
          renderSideBySide: true,
          readOnly: true, // Diff is read-only right now for simplicity
        }}
      />
    );
  }

  return (
    <Editor
      key={filePath}
      height="100%"
      language={language}
      value={content}
      theme={isDark ? 'vibecoded-dark' : 'vibecoded-light'}
      onChange={(value) => onChange(value ?? '')}
      onMount={handleMount}
      options={editorOptions}
    />
  );
}
