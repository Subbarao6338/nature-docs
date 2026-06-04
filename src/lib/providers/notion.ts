import { DocItem, Account } from '@/types';
import { DocumentProvider } from './base';
import { Client } from '@notionhq/client';

export class NotionProvider extends DocumentProvider {
  async listDocuments(account: Account): Promise<DocItem[]> {
    const token = account.accessToken || account.apiKey;
    if (!token) return [];

    const notion = new Client({ auth: token });

    try {
      const response = await notion.search({
        filter: { property: 'object', value: 'page' },
        sort: { direction: 'descending', timestamp: 'last_edited_time' }
      });

      return response.results.map((page: any) => {
        const properties = page.properties;
        let title = 'Untitled';

        // Notion title can be in different properties depending on the page setup
        const titleProp = properties?.title || properties?.Name || properties?.Page;
        if (titleProp?.title?.[0]?.plain_text) {
          title = titleProp.title[0].plain_text;
        }

        return {
          id: page.id,
          name: title,
          type: 'text/markdown',
          updatedAt: page.last_edited_time,
          source: 'notion',
          accountId: account.id
        };
      });
    } catch (error) {
      console.error('Notion fetch error:', error);
      return [];
    }
  }

  async getDocumentContent(doc: DocItem, account: Account): Promise<string | ArrayBuffer> {
    const token = account.accessToken || account.apiKey;
    if (!token) throw new Error('Missing Notion token');

    const notion = new Client({ auth: token });

    try {
      const blocks = await notion.blocks.children.list({ block_id: doc.id });

      // Improved block to markdown conversion
      let markdown = '';

      const processRichText = (richText: any[]) => {
        return richText.map((t: any) => {
          let text = t.plain_text;
          if (t.annotations.bold) text = `**${text}**`;
          if (t.annotations.italic) text = `*${text}*`;
          if (t.annotations.strikethrough) text = `~~${text}~~`;
          if (t.annotations.code) text = `\`${text}\``;
          if (t.href) text = `[${text}](${t.href})`;
          return text;
        }).join('');
      };

      for (const block of blocks.results as any[]) {
        const type = block.type;
        const richText = block[type]?.rich_text || [];
        const text = processRichText(richText);

        switch (type) {
          case 'paragraph':
            markdown += text + '\n\n';
            break;
          case 'heading_1':
            markdown += '# ' + text + '\n\n';
            break;
          case 'heading_2':
            markdown += '## ' + text + '\n\n';
            break;
          case 'heading_3':
            markdown += '### ' + text + '\n\n';
            break;
          case 'bulleted_list_item':
            markdown += '* ' + text + '\n';
            break;
          case 'numbered_list_item':
            markdown += '1. ' + text + '\n';
            break;
          case 'code':
            markdown += '```' + (block.code.language || '') + '\n' + block.code.rich_text.map((t: any) => t.plain_text).join('') + '\n```\n\n';
            break;
          case 'quote':
            markdown += '> ' + text + '\n\n';
            break;
          case 'callout':
            const icon = block.callout.icon?.emoji || 'ℹ️';
            markdown += `> ${icon} ${text}\n\n`;
            break;
          case 'divider':
            markdown += '---\n\n';
            break;
          case 'to_do':
            const checked = block.to_do.checked ? '[x]' : '[ ]';
            markdown += checked + ' ' + text + '\n';
            break;
          case 'toggle':
            markdown += `<details><summary>${text}</summary>\n\n(Toggle content not supported yet)\n</details>\n\n`;
            break;
          case 'image':
            const imageUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
            const caption = block.image.caption?.map((t: any) => t.plain_text).join('') || 'Image';
            markdown += `![${caption}](${imageUrl})\n\n`;
            break;
          case 'video':
            const videoUrl = block.video.type === 'external' ? block.video.external.url : block.video.file.url;
            markdown += `[Video: ${videoUrl}](${videoUrl})\n\n`;
            break;
        }
      }

      return markdown || '# No content in Notion page';
    } catch (error) {
      console.error('Failed to fetch Notion page content:', error);
      throw error;
    }
  }
}
