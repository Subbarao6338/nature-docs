import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DocItem, Account, SourceType } from '@/types';

export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange';

interface DocState {
  accounts: Account[];
  selectedSource: SourceType;
  selectedAccount: string | null;
  documents: DocItem[];
  selectedDoc: DocItem | null;
  isLoading: boolean;

  // Theme state
  theme: Theme;
  colorScheme: ColorScheme;

  // Actions
  addAccount: (account: Account) => void;
  removeAccount: (accountId: string) => void;
  setSelectedSource: (source: SourceType) => void;
  setSelectedAccount: (accountId: string | null) => void;
  setDocuments: (docs: DocItem[]) => void;
  addDocument: (doc: DocItem) => void;
  setSelectedDoc: (doc: DocItem | null) => void;
  setLoading: (loading: boolean) => void;

  // Theme actions
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

export const useDocStore = create<DocState>()(
  persist(
    (set) => ({
      accounts: [],
      selectedSource: 'local',
      selectedAccount: null,
      documents: [],
      selectedDoc: null,
      isLoading: false,

      theme: 'system',
      colorScheme: 'blue',

      addAccount: (account) => set((state) => ({
        accounts: [...state.accounts, account]
      })),

      removeAccount: (accountId) => set((state) => ({
        accounts: state.accounts.filter(a => a.id !== accountId)
      })),

      setSelectedSource: (source) => set({
        selectedSource: source,
        selectedAccount: null,
        documents: []
      }),

      setSelectedAccount: (accountId) => set({
        selectedAccount: accountId
      }),

      setDocuments: (docs) => set({
        documents: docs
      }),

      addDocument: (doc) => set((state) => ({
        documents: [...state.documents, doc]
      })),

      setSelectedDoc: (doc) => set({
        selectedDoc: doc
      }),

      setLoading: (loading) => set({
        isLoading: loading
      }),

      setTheme: (theme) => set({ theme }),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
    }),
    {
      name: 'nature-docs-storage',
      partialize: (state) => ({
        accounts: state.accounts,
        theme: state.theme,
        colorScheme: state.colorScheme,
      }),
    }
  )
);
