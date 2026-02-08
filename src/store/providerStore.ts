import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { PullRequest, Issue, CreatePullRequest, CreateIssue } from '../types';
import { useSettingsStore } from './settingsStore';

interface ProviderStore {
  pullRequests: PullRequest[];
  issues: Issue[];
  isLoading: boolean;
  error: string | null;

  loadPullRequests: (path: string) => Promise<void>;
  loadIssues: (path: string) => Promise<void>;
  createPullRequest: (path: string, pr: CreatePullRequest) => Promise<void>;
  createIssue: (path: string, issue: CreateIssue) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useProviderStore = create<ProviderStore>((set, get) => ({
  pullRequests: [],
  issues: [],
  isLoading: false,
  error: null,

  loadPullRequests: async (path: string) => {
    set({ isLoading: true, error: null });
    const settings = useSettingsStore.getState();
    // Try to determine token to use.
    // Ideally backend does this mapping more robustly, but here we just pass both or decide based on simple check?
    // Backend command takes `token` and `domain`.
    // We need to know which token to pass.
    // Let's pass the token based on simple heuristic or just try.
    // Actually, passing just one "token" to backend is limiting if we have both.
    // But typically a repo is either GH or GL.
    // Let's assume user sets up tokens.
    // For now, let's pass a token. If we don't know the remote, we can't decide easily without parsing remote here too.
    // BUT, `useRepoStore` has `remotes`.
    // Maybe we should just pass "githubToken" if it exists, or "gitlabToken".
    // Or we can let backend fail if token is invalid.
    
    // Better: Helper to multiple guess or just send all needed info?
    // The backend `get_provider_and_repo` checks host.
    // If host is github.com, it uses provided token.
    // If we pass the WRONG token (e.g. gitlab token for github repo), it fails.
    
    // Let's do a quick check on remote URL if possible.
    // But we don't have remote URL handy here easily without querying repoStore.
    // We can import repoStore.
    
    const { useRepoStore } = await import('./repoStore');
    const repoStore = useRepoStore.getState();
    const remotes = repoStore.remotes;
    const origin = remotes.find(r => r.name === 'origin');
    
    let token = '';
    let domain: string | undefined = undefined;

    if (origin && origin.url) {
        if (origin.url.includes('gitlab')) {
            token = settings.gitlabToken || '';
            // if self hosted, we might need to extract domain, or settings has gitlabUrl?
            // If settings.gitlabUrl is set, maybe use that as hint?
            if (settings.gitlabUrl) {
                 try {
                     const url = new URL(settings.gitlabUrl);
                     domain = url.host;
                 } catch {}
            }
        } else {
            // Default to GitHub
            token = settings.githubToken || '';
        }
    } else {
        // Fallback
        token = settings.githubToken || '';
    }

    try {
      const prs = await invoke<PullRequest[]>('fetch_pr_list', { path, token, domain });
      set({ pullRequests: prs, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  loadIssues: async (path: string) => {
    set({ isLoading: true, error: null });
    const settings = useSettingsStore.getState();
    const { useRepoStore } = await import('./repoStore');
    const repoStore = useRepoStore.getState();
    const remotes = repoStore.remotes;
    const origin = remotes.find(r => r.name === 'origin');
    
    let token = '';
    let domain: string | undefined = undefined;

    if (origin && origin.url) {
        if (origin.url.includes('gitlab')) {
            token = settings.gitlabToken || '';
            if (settings.gitlabUrl) {
                 try {
                     const url = new URL(settings.gitlabUrl);
                     domain = url.host;
                 } catch {}
            }
        } else {
            token = settings.githubToken || '';
        }
    } else {
        token = settings.githubToken || '';
    }

    try {
      const issues = await invoke<Issue[]>('fetch_issue_list', { path, token, domain });
      set({ issues, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  createPullRequest: async (path: string, pr: CreatePullRequest) => {
    set({ isLoading: true, error: null });
    const settings = useSettingsStore.getState();
    const { useRepoStore } = await import('./repoStore');
    const repoStore = useRepoStore.getState();
    const remotes = repoStore.remotes;
    const origin = remotes.find(r => r.name === 'origin');
    
    let token = '';
    let domain: string | undefined = undefined;

    if (origin && origin.url) {
        if (origin.url.includes('gitlab')) {
            token = settings.gitlabToken || '';
             if (settings.gitlabUrl) {
                 try {
                     const url = new URL(settings.gitlabUrl);
                     domain = url.host;
                 } catch {}
            }
        } else {
            token = settings.githubToken || '';
        }
    } else {
        token = settings.githubToken || '';
    }

    try {
      await invoke<PullRequest>('create_pr', { path, token, domain, pr });
      // Reload list
      await get().loadPullRequests(path);
      set({ isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
      throw e;
    }
  },

  createIssue: async (path: string, issue: CreateIssue) => {
    set({ isLoading: true, error: null });
    const settings = useSettingsStore.getState();
     const { useRepoStore } = await import('./repoStore');
    const repoStore = useRepoStore.getState();
    const remotes = repoStore.remotes;
    const origin = remotes.find(r => r.name === 'origin');
    
    let token = '';
     let domain: string | undefined = undefined;

    if (origin && origin.url) {
        if (origin.url.includes('gitlab')) {
            token = settings.gitlabToken || '';
             if (settings.gitlabUrl) {
                 try {
                     const url = new URL(settings.gitlabUrl);
                     domain = url.host;
                 } catch {}
            }
        } else {
            token = settings.githubToken || '';
        }
    } else {
        token = settings.githubToken || '';
    }

    try {
      await invoke<Issue>('create_issue', { path, token, domain, issue });
      // Reload list
      await get().loadIssues(path);
      set({ isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ pullRequests: [], issues: [], error: null, isLoading: false }),
}));
