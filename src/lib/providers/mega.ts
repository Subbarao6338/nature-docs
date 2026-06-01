import { DocItem, Account } from '@/types';
import { DocumentProvider } from './base';
import { Storage, File } from 'megajs';

export class MegaProvider extends DocumentProvider {
  private async getStorage(account: Account): Promise<Storage> {
    const { email, password } = account;

    if (!email || !password) throw new Error('Mega credentials missing');

    return new Promise((resolve, reject) => {
      const storage = new Storage({
        email,
        password,
      }, (err) => {
        if (err) return reject(err);
        resolve(storage);
      });
    });
  }

  async listDocuments(account: Account): Promise<DocItem[]> {
    try {
      const storage = await this.getStorage(account);

      const files: DocItem[] = [];
      const traverse = (node: any) => {
        if (node.children) {
          node.children.forEach(traverse);
        } else {
          const mimeType = this.getMimeType(node.name);
          if (mimeType) {
            files.push({
              id: node.handle,
              name: node.name,
              type: mimeType,
              updatedAt: new Date().toISOString(),
              size: node.size,
              source: 'mega',
              accountId: account.id
            });
          }
        }
      };

      traverse(storage.root);
      return files;
    } catch (error) {
      console.error('Mega listDocuments error:', error);
      return [];
    }
  }

  private getMimeType(filename: string): string | null {
    if (filename.endsWith('.pdf')) return 'application/pdf';
    if (filename.endsWith('.md')) return 'text/markdown';
    if (filename.endsWith('.html')) return 'text/html';
    if (filename.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return null;
  }

  async getDocumentContent(doc: DocItem, account: Account): Promise<string | ArrayBuffer> {
    try {
      const storage = await this.getStorage(account);
      const file = storage.find(doc.id) as File;

      if (!file) throw new Error('File not found in Mega');

      return new Promise((resolve, reject) => {
        file.download({}, (err, data) => {
          if (err) return reject(err);
          if (!data) return reject(new Error('Mega download returned no data'));
          resolve(data.buffer as ArrayBuffer);
        });
      });
    } catch (error) {
      console.error('Mega getDocumentContent error:', error);
      throw error;
    }
  }
}
