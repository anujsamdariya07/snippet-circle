import React from 'react';
import { LANGUAGE_CONFIG } from '@/app/(root)/_constants';
import { Monaco } from '@monaco-editor/react';
import { create } from 'zustand';
import { CodeEditorState } from '../types/index';

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      language: 'javascript',
      fontSize: 16,
      theme: 'vs-dark',
    };
  }

  // If we are on client, return values from the localStorage because localStorage is a browser API
  const savedLanguage = localStorage.getItem('editor-language') || 'javascript';
  const savedTheme = localStorage.getItem('editor-theme') || 'vs-dark';
  const savedFontSize = localStorage.getItem('editor-font-size') || 16;

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: '',
    isRunning: false,
    error: '',
    editor: null,
    executionResult: null,

    getCode: () => get().editor?.getValue() || '',

    setEditor: (editor: Monaco) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) {
        editor.setValue(savedCode);
      }
      set({ editor: editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem('editor-theme', theme);
      set({ theme: theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem('editor-font-size', fontSize.toString());
      set({ fontSize: fontSize });
    },

    setLanguage: (language: string) => {
      // Save the current language code before switching
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem('editor-language', language);

      set({
        language: language,
        output: '',
        error: null,
      });
    },

    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: 'Please enter some code!' });
        return;
      }

      set({ isRunning: true, error: null, output: '' });

      try {
        const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
          }),
        });

        const data = await response.json();

        console.log('Data back from piston:', data);

        if (data.message) {
          // Handle api level error
          set({
            error: data.message,
            executionResult: { code: code, error: data.message, output: '' },
          });
          return;
        }

        // Handle compilation error
        if (data.compile && data.compile.code !== 0) {
          const error = data.compile.stderr || data.compile.output;
          set({
            error: error,
            executionResult: {
              code: code,
              output: '',
              error: error,
            },
          });
          return;
        }

        // Handle runtime error
        if (data.run && data.run.code !== 0) {
          const error = data.run.stderr || data.run.output;
          set({
            error: error,
            executionResult: {
              code: code,
              output: '',
              error: error,
            },
          });
          return;
        }

        // Handle successful execution
        const output = data.run.output;
        set({
          output: output.trim(),
          error: null,
          executionResult: {
            code: code,
            output: output,
            error: null,
          },
        });
      } catch (error) {
        console.log('Error running code:', error);
        set({
          error:
            'Something went wrong while running the code. Please try again later.',
          executionResult: {
            code: code,
            error:
              'Something went wrong while running the code. Please try again later.',
            output: '',
          },
        });
      } finally {
        set({ isRunning: false });
      }
    },
  };
});

export const getExecutionResult = () => {
  return useCodeEditorStore.getState().executionResult;
};
