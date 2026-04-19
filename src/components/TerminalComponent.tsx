import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { spawn } from 'tauri-pty';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useThemeStore } from '../store/useThemeStore';
import '@xterm/xterm/css/xterm.css';

// ═══════════════════════════════════════════════════════════════
// TerminalComponent — xterm.js wired to Rust PTY
// ═══════════════════════════════════════════════════════════════

export default function TerminalComponent() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const ptyRef = useRef<any>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const { isDark } = useThemeStore();
  const { pendingTerminalCommand, clearTerminalCommand } = useWorkspaceStore();

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new Terminal({
      fontFamily: "'JetBrains Mono', 'Cascadia Code', monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      cursorWidth: 2,
      scrollback: 5000,
      theme: getTerminalTheme(isDark),
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Spawn PTY (PowerShell on Windows, fallback to sh/bash elsewhere)
    const shell = navigator.userAgent.includes('Win') ? 'powershell.exe' : 'sh';
    
    const initPty = async () => {
      try {
        const pty = await spawn(shell, [], {
          cols: term.cols,
          rows: term.rows,
        });
        ptyRef.current = pty;

        // Bidirectional communication
        pty.onData((data) => {
          // Handle Uint8Array or string depending on tauri-pty version
          const text = data instanceof Uint8Array ? new TextDecoder().decode(data) : data;
          term.write(text);
        });

        term.onData((data) => {
          pty.write(data);
        });
      } catch (err) {
        console.error('Terminal PTY Spawn Error:', err);
      }
    };
    initPty();

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current && termRef.current && ptyRef.current) {
        fitAddonRef.current.fit();
        ptyRef.current.resize(termRef.current.cols, termRef.current.rows);
      }
    };
    window.addEventListener('resize', handleResize);
    
    // Initial resize to ensure correct dimensions
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      ptyRef.current?.kill();
      term.dispose();
    };
  }, []); // Run once on mount

  // Update theme dynamically
  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.theme = getTerminalTheme(isDark);
    }
  }, [isDark]);

  // Handle Ctrl+Enter send-to-terminal commands
  useEffect(() => {
    if (pendingTerminalCommand && ptyRef.current) {
      // Send text followed by a newline for execution
      ptyRef.current.write(pendingTerminalCommand + '\r');
      clearTerminalCommand();
    }
  }, [pendingTerminalCommand, clearTerminalCommand]);

  return (
    <div className="w-full h-full relative terminal-container bg-bg-secondary p-1">
      <div 
        ref={terminalRef} 
        className="w-full h-full overflow-hidden" 
      />
    </div>
  );
}

// ─── Theme Helper ──────────────────────────────────────────────

function getTerminalTheme(isDark: boolean) {
  // Extract CSS variables to match exact tokens
  // Fallbacks provided for when variables might not be parsed
  
  if (isDark) {
    return {
      background: '#242529', // --bg-secondary
      foreground: '#E5E2DE', // --text-primary
      cursor: '#D4A574',     // --accent
      cursorAccent: '#242529',
      selectionBackground: 'rgba(212, 165, 116, 0.3)', // --accent with opacity
      
      // Soft vintage ANSI colors
      black: '#4A4B50',
      red: '#D48080',
      green: '#8FBB96',
      yellow: '#E0B55A',
      blue: '#7BAAD4',
      magenta: '#B080B0',
      cyan: '#80B0B0',
      white: '#E5E2DE',
      
      brightBlack: '#7A7670',
      brightRed: '#E49090',
      brightGreen: '#9FCB96',
      brightYellow: '#F0C56A',
      brightBlue: '#8BBAD4',
      brightMagenta: '#C090C0',
      brightCyan: '#90C0C0',
      brightWhite: '#FFFFFF',
    };
  } else {
    return {
      background: '#F0EDE8', // --bg-secondary
      foreground: '#2D2A26', // --text-primary
      cursor: '#C4956A',     // --accent
      cursorAccent: '#F0EDE8',
      selectionBackground: 'rgba(196, 149, 106, 0.25)',
      
      // Soft vintage ANSI colors for light mode
      black: '#8A8580',
      red: '#C47070',
      green: '#7FA686',
      yellow: '#D4A54A',
      blue: '#6B9AC4',
      magenta: '#906090',
      cyan: '#609090',
      white: '#2D2A26',
      
      brightBlack: '#A09B95',
      brightRed: '#D48080',
      brightGreen: '#8FB686',
      brightYellow: '#E4B55A',
      brightBlue: '#7BAAC4',
      brightMagenta: '#A070A0',
      brightCyan: '#70A0A0',
      brightWhite: '#1A1816',
    };
  }
}
