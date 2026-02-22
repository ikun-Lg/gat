import { useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { toast } from '../store/toastStore';

export type SensitiveOperation =
  | 'push'
  | 'force_push'
  | 'pull'
  | 'merge'
  | 'rebase'
  | 'reset'
  | 'checkout'
  | 'cherry_pick'
  | 'revert'
  | 'delete_branch'
  | 'delete_tag'
  | 'discard_changes'
  | 'clean_untracked';

export interface SecurityCheckOptions {
  operation: SensitiveOperation;
  details?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

const OPERATION_MESSAGES: Record<SensitiveOperation, { title: string; message: string; severity: 'warning' | 'danger' }> = {
  push: {
    title: '确认推送',
    message: '即将将本地提交推送到远程仓库。此操作将永久更改远程历史。',
    severity: 'warning'
  },
  force_push: {
    title: '确认强制推送',
    message: '⚠️ 警告：强制推送将覆盖远程历史！\n\n此操作可能导致其他协作者的历史记录丢失，仅在必要时使用。',
    severity: 'danger'
  },
  pull: {
    title: '确认拉取',
    message: '即将从远程仓库拉取更改并合并到本地分支。',
    severity: 'warning'
  },
  merge: {
    title: '确认合并',
    message: '即将执行合并操作。请确保已保存所有未提交的更改。',
    severity: 'warning'
  },
  rebase: {
    title: '确认变基',
    message: '⚠️ 警告：变基将重写提交历史！\n\n如果已推送此分支，变基可能导致问题。请确保您了解变基的影响。',
    severity: 'danger'
  },
  reset: {
    title: '确认重置',
    message: '⚠️ 警告：重置将丢失所有未提交的更改！\n\n此操作无法撤销。',
    severity: 'danger'
  },
  checkout: {
    title: '确认切换分支',
    message: '切换分支前，请确保已提交或贮存所有未提交的更改。',
    severity: 'warning'
  },
  cherry_pick: {
    title: '确认 Cherry-Pick',
    message: '即将将指定提交应用到当前分支。',
    severity: 'warning'
  },
  revert: {
    title: '确认撤销提交',
    message: '将创建一个新提交来撤销指定的提交更改。',
    severity: 'warning'
  },
  delete_branch: {
    title: '确认删除分支',
    message: '⚠️ 警告：删除分支后无法恢复！\n\n请确保此分支已不再需要。',
    severity: 'danger'
  },
  delete_tag: {
    title: '确认删除标签',
    message: '⚠️ 警告：删除标签后无法恢复！',
    severity: 'danger'
  },
  discard_changes: {
    title: '确认放弃更改',
    message: '⚠️ 警告：放弃的所有更改将永久丢失！\n\n此操作无法撤销。',
    severity: 'danger'
  },
  clean_untracked: {
    title: '确认清理未跟踪文件',
    message: '⚠️ 警告：所有未跟踪的文件将被永久删除！\n\n此操作无法撤销。',
    severity: 'danger'
  }
};

export function useSecurityCheck() {
  const { requireConfirmationForSensitiveOps, readOnlyMode } = useSettingsStore();

  const checkSecurity = useCallback(
    async (options: SecurityCheckOptions): Promise<boolean> => {
      const { operation, details, onConfirm, onCancel } = options;

      // Check if in read-only mode
      if (readOnlyMode) {
        toast.error('只读模式下无法执行此操作');
        onCancel?.();
        return false;
      }

      // If confirmation is not required, execute directly
      if (!requireConfirmationForSensitiveOps) {
        await onConfirm();
        return true;
      }

      // Show confirmation dialog
      const opInfo = OPERATION_MESSAGES[operation];
      const fullMessage = details ? `${opInfo.message}\n\n详情: ${details}` : opInfo.message;

      try {
        const { ask } = await import('@tauri-apps/plugin-dialog');
        
        const confirmed = await ask(fullMessage, {
          title: opInfo.title,
          kind: opInfo.severity === 'danger' ? 'warning' : 'info',
          okLabel: '确认',
          cancelLabel: '取消'
        });

        if (confirmed) {
          await onConfirm();
          return true;
        } else {
          onCancel?.();
          return false;
        }
      } catch (error) {
        console.error('Security check failed:', error);
        toast.error('安全确认失败');
        onCancel?.();
        return false;
      }
    },
    [requireConfirmationForSensitiveOps, readOnlyMode]
  );

  return { checkSecurity, isReadOnlyMode: readOnlyMode };
}
