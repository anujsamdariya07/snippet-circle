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
      localStorage.setItem('editor-theme', theme)
      set({theme: theme})
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem('editor-font-size', fontSize.toString())
      set({fontSize: fontSize})
    },

    setLanguage: (language: string) => {
      // Save the current language code before switching
      const currentCode = get().editor?.getValue()
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode)
      }

      localStorage.setItem('editor-language', language)

      set({
        language: language,
        output: '',
        error: null,
      })
    },

    runCode: async () => {
      // TODO
    }
  };
});
