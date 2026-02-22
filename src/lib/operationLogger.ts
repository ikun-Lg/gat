import { invoke } from '@tauri-apps/api/core';

export interface OperationLog {
  id: string;
  timestamp: number;
  operation: string;
  details: string;
  repoPath: string;
  success: boolean;
  error?: string;
}

class OperationLogger {
  private logs: OperationLog[] = [];
  private maxLogs = 1000; // Keep max 1000 logs in memory

  async log(operation: string, details: string, repoPath: string, success: boolean, error?: string) {
    const logEntry: OperationLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      operation,
      details,
      repoPath,
      success,
      error
    };

    this.logs.unshift(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Also invoke backend to persist logs if needed
    try {
      await invoke('log_operation', {
        operation,
        details,
        repoPath,
        success,
        error: error || null
      });
    } catch (e) {
      console.error('Failed to persist operation log:', e);
    }
  }

  getLogs(repoPath?: string): OperationLog[] {
    if (repoPath) {
      return this.logs.filter(log => log.repoPath === repoPath);
    }
    return this.logs;
  }

  clearLogs(repoPath?: string) {
    if (repoPath) {
      this.logs = this.logs.filter(log => log.repoPath !== repoPath);
    } else {
      this.logs = [];
    }
  }

  exportLogs(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else {
      const headers = ['Timestamp', 'Operation', 'Details', 'Repository', 'Success', 'Error'];
      let csv = headers.join(',') + '\n';
      
      this.logs.forEach(log => {
        const date = new Date(log.timestamp).toLocaleString('zh-CN');
        const details = `"${log.details.replace(/"/g, '""')}"`;
        const error = log.error ? `"${log.error.replace(/"/g, '""')}"` : '';
        
        csv += [
          `"${date}"`,
          `"${log.operation}"`,
          details,
          `"${log.repoPath}"`,
          log.success,
          error
        ].join(',') + '\n';
      });
      
      return csv;
    }
  }
}

export const operationLogger = new OperationLogger();

// Helper function to log operations with proper error handling
export async function logOperation(
  operation: string,
  details: string,
  repoPath: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
    await operationLogger.log(operation, details, repoPath, true);
  } catch (error) {
    await operationLogger.log(operation, details, repoPath, false, String(error));
    throw error;
  }
}
