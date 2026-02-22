import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types';
import { defaultShortcuts } from '../lib/shortcuts';

// Serializable shortcut definition
export interface ShortcutDef {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

interface SettingsStore extends Settings {
  // Git username and password/token
  gitUsername: string | null;
  gitPassword: string | null;
  setGitUsername: (username: string | null) => void;
  setGitPassword: (password: string | null) => void;
  // Existing
  setWorkDir: (dir: string | null) => void;
  setAiProvider: (provider: 'heuristic' | 'deepseek' | 'glm' | 'openai' | 'claude' | 'ollama') => void;
  setDeepseekApiKey: (key: string | null) => void;
  setGlmApiKey: (key: string | null) => void;
  setOpenaiApiKey: (key: string | null) => void;
  setOpenaiEndpoint: (endpoint: string | null) => void;
  setOpenaiModel: (model: string | null) => void;
  setClaudeApiKey: (key: string | null) => void;
  setClaudeEndpoint: (endpoint: string | null) => void;
  setClaudeModel: (model: string | null) => void;
  setOllamaEndpoint: (endpoint: string | null) => void;
  setOllamaModel: (model: string | null) => void;
  setCommitLanguage: (lang: 'zh' | 'en') => void;
  setCommitFormat: (format: 'conventional' | 'custom') => void;
  setCustomPrompt: (prompt: string | null) => void;
  
  // Shortcuts
  shortcuts: Record<string, ShortcutDef>;
  setShortcut: (id: string, def: ShortcutDef) => void;
  resetShortcuts: () => void;
  
  // Notifications
  autoFetchInterval: number;
  enableNotifications: boolean;
  setAutoFetchInterval: (interval: number) => void;
  setEnableNotifications: (enable: boolean) => void;

  // Stash settings
  stashIncludeUntracked: boolean;
  setStashIncludeUntracked: (include: boolean) => void;

  // Security settings
  requireConfirmationForSensitiveOps: boolean;
  setRequireConfirmationForSensitiveOps: (require: boolean) => void;
  readOnlyMode: boolean;
  setReadOnlyMode: (enabled: boolean) => void;
  
  // GPG settings
  gpgSigningEnabled: boolean;
  setGpgSigningEnabled: (enabled: boolean) => void;
  gpgKeyId: string | null;
  setGpgKeyId: (keyId: string | null) => void;

  // Provider settings
  githubToken: string | null;
  gitlabToken: string | null;
  gitlabUrl: string | null;
  setGithubToken: (token: string | null) => void;
  setGitlabToken: (token: string | null) => void;
  setGitlabUrl: (url: string | null) => void;

  // Sidebar
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;

  // External Editor
  setExternalEditor: (editor: string | null) => void;
}

// Helper to extract defaults
const getDefaultShortcuts = () => {
  const defaults: Record<string, ShortcutDef> = {};
  for (const [id, config] of Object.entries(defaultShortcuts)) {
    // Cast to any to access optional properties safely, or strict check
    const c = config as any;
    defaults[id] = {
      key: c.key,
      ctrlKey: !!c.ctrlKey,
      altKey: !!c.altKey,
      shiftKey: !!c.shiftKey,
      metaKey: !!c.metaKey,
    };
  }
  return defaults;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Initial state
      workDir: null,
      aiProvider: 'heuristic',
      deepseekApiKey: null,
      glmApiKey: null,
      openaiApiKey: null,
      openaiEndpoint: null,
      openaiModel: null,
      claudeApiKey: null,
      claudeEndpoint: null,
      claudeModel: null,
      ollamaEndpoint: null,
      ollamaModel: null,
      commitLanguage: 'zh',
      commitFormat: 'conventional',
      customPrompt: null,
      gitUsername: null,
      gitPassword: null,
      autoFetchInterval: 10, // Default 10 minutes
      enableNotifications: true,
      stashIncludeUntracked: true, // Default to include untracked files in stash
      
      // Security defaults
      requireConfirmationForSensitiveOps: true, // Default to require confirmation
      readOnlyMode: false, // Default to read-write mode
      
      // GPG defaults
      gpgSigningEnabled: false, // Default to disabled
      gpgKeyId: null, // No default key
      
      sidebarWidth: 320, // Default width
      shortcuts: getDefaultShortcuts(),
      externalEditor: 'code', // Default to VS Code

      // Actions
      setWorkDir: (dir) => set({ workDir: dir }),
      setAiProvider: (provider) => set({ aiProvider: provider }),
      setDeepseekApiKey: (key) => set({ deepseekApiKey: key }),
      setGlmApiKey: (key) => set({ glmApiKey: key }),
      setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
      setOpenaiEndpoint: (endpoint) => set({ openaiEndpoint: endpoint }),
      setOpenaiModel: (model) => set({ openaiModel: model }),
      setClaudeApiKey: (key) => set({ claudeApiKey: key }),
      setClaudeEndpoint: (endpoint) => set({ claudeEndpoint: endpoint }),
      setClaudeModel: (model) => set({ claudeModel: model }),
      setOllamaEndpoint: (endpoint) => set({ ollamaEndpoint: endpoint }),
      setOllamaModel: (model) => set({ ollamaModel: model }),
      setCommitLanguage: (lang) => set({ commitLanguage: lang }),
      setCommitFormat: (format) => set({ commitFormat: format }),
      setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
      setGitUsername: (username) => set({ gitUsername: username }),
      setGitPassword: (password) => set({ gitPassword: password }),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      
      setAutoFetchInterval: (interval) => set({ autoFetchInterval: interval }),
      setEnableNotifications: (enable) => set({ enableNotifications: enable }),
      setStashIncludeUntracked: (include) => set({ stashIncludeUntracked: include }),

      // Security setters
      setRequireConfirmationForSensitiveOps: (require) => set({ requireConfirmationForSensitiveOps: require }),
      setReadOnlyMode: (enabled) => set({ readOnlyMode: enabled }),
      
      // GPG setters
      setGpgSigningEnabled: (enabled) => set({ gpgSigningEnabled: enabled }),
      setGpgKeyId: (keyId) => set({ gpgKeyId: keyId }),

      githubToken: null,
      gitlabToken: null,
      gitlabUrl: null,
      setGithubToken: (token) => set({ githubToken: token }),
      setGitlabToken: (token) => set({ gitlabToken: token }),
      setGitlabUrl: (url) => set({ gitlabUrl: url }),

      setShortcut: (id, def) => set((state) => ({
        shortcuts: { ...state.shortcuts, [id]: def }
      })),
      
      resetShortcuts: () => set({ shortcuts: getDefaultShortcuts() }),

      setExternalEditor: (editor) => set({ externalEditor: editor }),
    }),
    {
      name: 'gat-settings',
    }
  )
);
