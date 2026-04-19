import type { editor } from 'monaco-editor';

// ═══════════════════════════════════════════════════════════════
// VIBECODED — Custom Monaco Themes
// Soft, low-contrast pastel palettes that match the IDE aesthetic
// ═══════════════════════════════════════════════════════════════

export const vibecodedDark: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Comments — very muted, sage green
    { token: 'comment', foreground: '6A7A6A', fontStyle: 'italic' },
    { token: 'comment.block', foreground: '6A7A6A', fontStyle: 'italic' },

    // Keywords — soft warm amber
    { token: 'keyword', foreground: 'D4A574' },
    { token: 'keyword.control', foreground: 'D4A574' },
    { token: 'keyword.operator', foreground: 'C49A6A' },

    // Strings — dusty rose / warm pink
    { token: 'string', foreground: 'C9A0A0' },
    { token: 'string.escape', foreground: 'D4B0A0' },

    // Numbers — soft teal
    { token: 'number', foreground: '8ABAB0' },
    { token: 'number.float', foreground: '8ABAB0' },

    // Types & classes — muted lavender
    { token: 'type', foreground: 'A0A0C4' },
    { token: 'type.identifier', foreground: 'A0A0C4' },
    { token: 'class', foreground: 'A0A0C4' },

    // Functions — soft sky blue
    { token: 'function', foreground: '8AB4C4' },
    { token: 'function.declaration', foreground: '8AB4C4' },

    // Variables — warm off-white (the default text)
    { token: 'variable', foreground: 'D5D0CA' },
    { token: 'variable.predefined', foreground: 'C4B0A0' },

    // Constants — soft peach
    { token: 'constant', foreground: 'C4B48A' },

    // Operators — muted stone
    { token: 'operator', foreground: 'A09A94' },

    // Tags (HTML/XML) — warm amber
    { token: 'tag', foreground: 'C4956A' },
    { token: 'attribute.name', foreground: 'B0A090' },
    { token: 'attribute.value', foreground: 'C9A0A0' },

    // Regex
    { token: 'regexp', foreground: 'C49A7A' },

    // Markdown
    { token: 'markup.heading', foreground: 'D4A574', fontStyle: 'bold' },
    { token: 'markup.bold', fontStyle: 'bold' },
    { token: 'markup.italic', fontStyle: 'italic' },

    // YAML keys
    { token: 'type.yaml', foreground: 'D4A574' },
  ],
  colors: {
    'editor.background': '#1A1B1E',
    'editor.foreground': '#D5D0CA',
    'editor.lineHighlightBackground': '#242529',
    'editor.selectionBackground': '#3D302044',
    'editor.inactiveSelectionBackground': '#3D302022',
    'editorCursor.foreground': '#D4A574',
    'editorWhitespace.foreground': '#2C2D32',
    'editorIndentGuide.background': '#2C2D32',
    'editorIndentGuide.activeBackground': '#3A3B42',
    'editorLineNumber.foreground': '#4A4B50',
    'editorLineNumber.activeForeground': '#8A8580',
    'editor.selectionHighlightBackground': '#3D302030',
    'editorBracketMatch.background': '#3D302040',
    'editorBracketMatch.border': '#D4A57450',
    'editorGutter.background': '#1A1B1E',
    'scrollbarSlider.background': '#ffffff10',
    'scrollbarSlider.hoverBackground': '#ffffff20',
    'editorWidget.background': '#242529',
    'editorWidget.border': '#ffffff10',
    'editorSuggestWidget.background': '#242529',
    'editorSuggestWidget.border': '#ffffff10',
    'editorSuggestWidget.selectedBackground': '#3D302040',
    'editorHoverWidget.background': '#242529',
    'editorHoverWidget.border': '#ffffff10',

    // Ghost text color for inline completions
    'editorGhostText.foreground': '#5A5650',
  },
};

export const vibecodedLight: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    // Comments — muted sage
    { token: 'comment', foreground: '8A9A8A', fontStyle: 'italic' },
    { token: 'comment.block', foreground: '8A9A8A', fontStyle: 'italic' },

    // Keywords — warm terracotta
    { token: 'keyword', foreground: 'A07040' },
    { token: 'keyword.control', foreground: 'A07040' },
    { token: 'keyword.operator', foreground: 'B08050' },

    // Strings — dusty rose
    { token: 'string', foreground: 'A06060' },
    { token: 'string.escape', foreground: 'B07070' },

    // Numbers — muted teal
    { token: 'number', foreground: '508080' },
    { token: 'number.float', foreground: '508080' },

    // Types — muted purple
    { token: 'type', foreground: '706090' },
    { token: 'type.identifier', foreground: '706090' },
    { token: 'class', foreground: '706090' },

    // Functions — soft blue
    { token: 'function', foreground: '507090' },
    { token: 'function.declaration', foreground: '507090' },

    // Variables
    { token: 'variable', foreground: '3D3A36' },
    { token: 'variable.predefined', foreground: '8A7060' },

    // Constants
    { token: 'constant', foreground: '907830' },

    // Operators
    { token: 'operator', foreground: '6A6560' },

    // Tags
    { token: 'tag', foreground: 'A07040' },
    { token: 'attribute.name', foreground: '706050' },
    { token: 'attribute.value', foreground: 'A06060' },

    // Regex
    { token: 'regexp', foreground: 'A07048' },

    // Markdown
    { token: 'markup.heading', foreground: 'A07040', fontStyle: 'bold' },

    // YAML
    { token: 'type.yaml', foreground: 'A07040' },
  ],
  colors: {
    'editor.background': '#FAF8F5',
    'editor.foreground': '#2D2A26',
    'editor.lineHighlightBackground': '#F0EDE8',
    'editor.selectionBackground': '#E8D5C440',
    'editor.inactiveSelectionBackground': '#E8D5C420',
    'editorCursor.foreground': '#C4956A',
    'editorWhitespace.foreground': '#E5E0DA',
    'editorIndentGuide.background': '#E5E0DA',
    'editorIndentGuide.activeBackground': '#D0CBC4',
    'editorLineNumber.foreground': '#C0BAB4',
    'editorLineNumber.activeForeground': '#8A8580',
    'editor.selectionHighlightBackground': '#E8D5C430',
    'editorBracketMatch.background': '#E8D5C440',
    'editorBracketMatch.border': '#C4956A50',
    'editorGutter.background': '#FAF8F5',
    'scrollbarSlider.background': '#00000008',
    'scrollbarSlider.hoverBackground': '#00000014',
    'editorWidget.background': '#FAF8F5',
    'editorWidget.border': '#E5E0DA',
    'editorSuggestWidget.background': '#FAF8F5',
    'editorSuggestWidget.border': '#E5E0DA',
    'editorSuggestWidget.selectedBackground': '#E8D5C430',
    'editorHoverWidget.background': '#FAF8F5',
    'editorHoverWidget.border': '#E5E0DA',

    // Ghost text for inline completions
    'editorGhostText.foreground': '#B0ABA5',
  },
};
