'use client';

import React, { useState } from 'react';
import { useDocStore } from '@/store/useDocStore';
import { SourceType } from '@/types';
import { MegaLoginModal } from './MegaLoginModal';
import {
  HardDrive,
  Cloud,
  BookOpen,
  Plus,
  Settings,
  FolderOpen
} from 'lucide-react';
import { clsx } from 'clsx';

const sources: { type: SourceType; icon: React.ReactNode; label: string }[] = [
  { type: 'local', icon: <HardDrive size={20} />, label: 'Local Files' },
  { type: 'gdrive', icon: <Cloud size={20} />, label: 'Google Drive' },
  { type: 'notion', icon: <BookOpen size={20} />, label: 'Notion' },
  { type: 'mega', icon: <Cloud size={20} />, label: 'Mega' },
];

export const Sidebar = () => {
  const [isMegaModalOpen, setIsMegaModalOpen] = useState(false);
  const {
    selectedSource,
    setSelectedSource,
    accounts,
    selectedAccount,
    setSelectedAccount,
    addAccount
  } = useDocStore();

  const filteredAccounts = accounts.filter(a => a.source === selectedSource);

  const handleAddAccount = () => {
    if (selectedSource === 'local') return;

    if (selectedSource === 'mega') {
      setIsMegaModalOpen(true);
      return;
    }

    // Redirect to OAuth routes
    window.location.href = `/api/auth/${selectedSource}`;
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FolderOpen className="text-blue-400" />
          Nature Docs
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Sources
          </h2>
          <div className="space-y-1">
            {sources.map((source) => (
              <button
                key={source.type}
                onClick={() => setSelectedSource(source.type)}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  selectedSource === source.type
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 text-gray-400"
                )}
              >
                {source.icon}
                <span>{source.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Accounts
            </h2>
            {selectedSource !== 'local' && (
              <button
                onClick={handleAddAccount}
                className="text-gray-400 hover:text-white transition-colors"
                title="Add account"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
          <div className="space-y-1">
            {filteredAccounts.length === 0 ? (
              <p className="text-xs text-gray-600 italic px-3">No accounts connected</p>
            ) : (
              filteredAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(account.id)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    selectedAccount === account.id
                      ? "bg-gray-800 text-white"
                      : "hover:bg-gray-800 text-gray-400"
                  )}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{account.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>

      <MegaLoginModal isOpen={isMegaModalOpen} onClose={() => setIsMegaModalOpen(false)} />
    </div>
  );
};
