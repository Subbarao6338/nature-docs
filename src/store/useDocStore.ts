import { create } from 'zustand';
import { DocItem, Account, SourceType } from '@/types';

interface DocState {
  accounts: Account[];
  selectedSource: SourceType;
  selectedAccount: string | null;
  documents: DocItem[];
  selectedDoc: DocItem | null;
  isLoading: boolean;

  // Actions
  addAccount: (account: Account) => void;
  removeAccount: (accountId: string) => void;
  setSelectedSource: (source: SourceType) => void;
  setSelectedAccount: (accountId: string | null) => void;
  setDocuments: (docs: DocItem[]) => void;
  setSelectedDoc: (doc: DocItem | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useDocStore = create<DocState>((set) => ({
  accounts: [],
  selectedSource: 'local',
  selectedAccount: null,
  documents: [],
  selectedDoc: null,
  isLoading: false,

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

  setSelectedDoc: (doc) => set({
    selectedDoc: doc
  }),

  setLoading: (loading) => set({
    isLoading: loading
  }),
}));
