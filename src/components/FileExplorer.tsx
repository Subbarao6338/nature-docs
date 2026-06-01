'use client';

import React, { useState, useCallback } from 'react';
import { useDocStore } from '@/store/useDocStore';
import {
  FileText,
  Search,
  Grid,
  List as ListIcon,
  MoreVertical,
  Download,
  Trash,
  Upload
} from 'lucide-react';
import { clsx } from 'clsx';
import { useDropzone } from 'react-dropzone';

export const FileExplorer = () => {
  const { documents, setSelectedDoc, isLoading, selectedSource, addDocument } = useDocStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const content = reader.result as ArrayBuffer;
        const newDoc = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: file.type,
          size: file.size,
          updatedAt: new Date().toISOString(),
          source: 'local' as const,
          accountId: 'local',
          content: content
        };
        addDocument(newDoc);
      };

      reader.readAsArrayBuffer(file);
    });
  }, [addDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx("p-1.5 rounded", viewMode === 'grid' ? "bg-white shadow-sm" : "text-gray-500")}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx("p-1.5 rounded", viewMode === 'list' ? "bg-white shadow-sm" : "text-gray-500")}
          >
            <ListIcon size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6" {...getRootProps()}>
        <input {...getInputProps()} />

        {selectedSource === 'local' && (
          <div
            onClick={() => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              input?.click();
            }}
            className={clsx(
              "mb-6 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer",
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
            )}
          >
            <Upload size={32} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {isDragActive ? "Drop files here" : "Drag & drop files or click to upload"}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF, Markdown, HTML, DOCX</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>No documents found</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Updated</th>
                  <th className="px-6 py-3 font-semibold">Source</th>
                  <th className="px-6 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <FileText size={20} className="text-blue-500" />
                      <span className="font-medium text-gray-900">{doc.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 capitalize">
                        {doc.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="aspect-[3/4] bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
                  <FileText size={40} className="text-blue-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{doc.source}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
