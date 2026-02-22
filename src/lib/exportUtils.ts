import type { CommitInfo } from '../types';

export type ExportFormat = 'markdown' | 'json' | 'csv';

interface ExportOptions {
  repoName: string;
  branch: string;
  commits: CommitInfo[];
}

export async function exportCommits(
  format: ExportFormat,
  options: ExportOptions
): Promise<boolean> {
  try {
    const { repoName, branch, commits } = options;
    
    const defaultFileName = `${repoName}-${branch}-commits`;
    let content: string;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'markdown':
        content = generateMarkdown(options);
        mimeType = 'text/markdown';
        fileExtension = 'md';
        break;
      case 'json':
        content = generateJson(commits);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      case 'csv':
        content = generateCsv(commits);
        mimeType = 'text/csv';
        fileExtension = 'csv';
        break;
      default:
        return false;
    }

    downloadFile(content, `${defaultFileName}.${fileExtension}`, mimeType);
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

function generateMarkdown({ repoName, branch, commits }: ExportOptions): string {
  const date = new Date().toLocaleString('zh-CN');
  
  let markdown = `# ${repoName} - ${branch} 分支提交历史\n\n`;
  markdown += `> 导出时间: ${date}\n`;
  markdown += `> 总提交数: ${commits.length}\n\n`;
  markdown += `---\n\n`;

  commits.forEach((commit) => {
    const commitDate = new Date(commit.timestamp * 1000).toLocaleString('zh-CN');
    
    markdown += `## ${commit.shortId} - ${commit.message.split('\n')[0]}\n\n`;
    markdown += `**提交 ID:** \`${commit.id}\`\n\n`;
    markdown += `**作者:** ${commit.author}\n\n`;
    markdown += `**时间:** ${commitDate}\n\n`;
    
    if (commit.parents.length > 0) {
      markdown += `**父提交:** ${commit.parents.map(p => `\`${p.substring(0, 7)}\``).join(', ')}\n\n`;
    }
    
    if (commit.refs.length > 0) {
      markdown += `**引用:** ${commit.refs.join(', ')}\n\n`;
    }
    
    const fullMessage = commit.message.trim();
    if (fullMessage.includes('\n')) {
      const description = fullMessage.split('\n').slice(1).join('\n').trim();
      if (description) {
        markdown += `**详细描述:**\n\`\`\`\n${description}\n\`\`\`\n\n`;
      }
    }
    
    markdown += `---\n\n`;
  });

  return markdown;
}

function generateJson(commits: CommitInfo[]): string {
  return JSON.stringify(commits, null, 2);
}

function generateCsv(commits: CommitInfo[]): string {
  const headers = ['Short ID', 'Full ID', 'Message', 'Author', 'Date', 'Parents', 'Refs'];
  let csv = headers.join(',') + '\n';

  commits.forEach(commit => {
    const date = new Date(commit.timestamp * 1000).toLocaleString('zh-CN');
    const message = commit.message.replace(/"/g, '""').replace(/\n/g, ' ');
    const parents = commit.parents.join(';');
    const refs = commit.refs.join(';');
    
    const row = [
      commit.shortId,
      commit.id,
      `"${message}"`,
      `"${commit.author}"`,
      `"${date}"`,
      `"${parents}"`,
      `"${refs}"`
    ];
    
    csv += row.join(',') + '\n';
  });

  return csv;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
