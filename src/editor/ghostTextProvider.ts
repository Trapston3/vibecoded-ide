import type * as Monaco from 'monaco-editor';

// ═══════════════════════════════════════════════════════════════════
// Ghost Text Provider — AI Inline Completion Scaffold
//
// Architecture:
//   - Registers a InlineCompletionsProvider on editor mount
//   - Fires on typing pauses (debounced by Monaco internally)
//   - Calls a pluggable `getCompletion` function (returns empty for now)
//   - Ghost text renders in muted grey, accept with Tab
//
// To wire a real LLM backend later, implement `getCompletion`.
// ═══════════════════════════════════════════════════════════════════

/**
 * Placeholder async function for fetching AI completions.
 * Replace this with an actual API call to your LLM backend.
 */
async function getCompletion(
  _model: Monaco.editor.ITextModel,
  _position: Monaco.Position,
  _context: Monaco.languages.InlineCompletionContext,
): Promise<string | null> {
  // ──────────────────────────────────────────────────────────
  // TODO: Wire this to your AI backend (e.g., OpenAI, local LLM)
  //
  // Example future implementation:
  //   const prefix = model.getValueInRange({
  //     startLineNumber: 1,
  //     startColumn: 1,
  //     endLineNumber: position.lineNumber,
  //     endColumn: position.column,
  //   });
  //   const response = await fetch('/api/complete', {
  //     method: 'POST',
  //     body: JSON.stringify({ prefix, language: model.getLanguageId() }),
  //   });
  //   const { completion } = await response.json();
  //   return completion;
  // ──────────────────────────────────────────────────────────
  return null;
}

/**
 * Register the ghost text inline completion provider for all languages.
 * Call this once during Monaco editor initialization.
 */
export function registerGhostTextProvider(monaco: typeof Monaco): Monaco.IDisposable {
  return monaco.languages.registerInlineCompletionsProvider(
    { pattern: '**' }, // all languages
    {
      provideInlineCompletions: async (model, position, context, _token) => {
        const completion = await getCompletion(model, position, context);

        if (!completion) {
          return { items: [] };
        }

        return {
          items: [
            {
              insertText: completion,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            },
          ],
        };
      },

      disposeInlineCompletions: () => {
        // cleanup if needed
      },
    }
  );
}
