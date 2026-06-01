import { DocItem, Account } from '@/types';
import { DocumentProvider } from './base';
import { google } from 'googleapis';

export class GDriveProvider extends DocumentProvider {
  async listDocuments(account: Account): Promise<DocItem[]> {
    if (!account.accessToken) return [];

    // In a real app with a backend/proxy:
    // const auth = new google.auth.OAuth2();
    // auth.setCredentials({ access_token: account.accessToken });
    // const drive = google.drive({ version: 'v3', auth });
    // const res = await drive.files.list({ pageSize: 10, fields: 'files(id, name, mimeType, size, modifiedTime)' });

    console.log('Fetching from Google Drive with token:', account.accessToken);

    return [
      {
        id: 'g1',
        name: 'Google Drive Sample.pdf',
        type: 'application/pdf',
        updatedAt: new Date().toISOString(),
        source: 'gdrive',
        accountId: account.id,
        url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
      }
    ];
  }

  async getDocumentContent(doc: DocItem, account: Account): Promise<string | ArrayBuffer> {
    if (doc.url) return doc.url;
    // Implementation for downloading from GDrive...
    return new ArrayBuffer(0);
  }
}
