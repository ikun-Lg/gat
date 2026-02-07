import { useRepoStore } from '../store/repoStore';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Plus, Minus, File, FilePlus, FileMinus, FileEdit, GitBranch } from 'lucide-react';
import type { FileStatus, StatusItem } from '../types';

interface FileListProps {
  repoPath: string;
}

interface FileSectionProps {
  title: string;
  files: StatusItem[];
  onStageFile: (file: string) => void;
  onUnstageFile: (file: string) => void;
  stageLabel: string;
  unstageLabel: string;
  icon: React.ReactNode;
}

function FileSection({
  title,
  files,
  onStageFile,
  onUnstageFile,
  stageLabel,
  unstageLabel,
  icon,
}: FileSectionProps) {
  if (files.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {files.length}
        </Badge>
      </div>
      <div className="space-y-1">
        {files.map((item, index) => (
          <div
            key={`${item.path}-${index}`}
            className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
          >
            <FileIcon status={item.status} />
            <span className="flex-1 text-sm truncate">{item.path}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStageFile(item.path)}
              title={stageLabel}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUnstageFile(item.path)}
              title={unstageLabel}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileIcon({ status }: { status: FileStatus }) {
  const iconProps = { className: 'w-4 h-4 text-muted-foreground' };

  switch (status) {
    case 'added':
      return <FilePlus {...iconProps} className="w-4 h-4 text-green-500" />;
    case 'deleted':
      return <FileMinus {...iconProps} className="w-4 h-4 text-red-500" />;
    case 'modified':
      return <FileEdit {...iconProps} className="w-4 h-4 text-amber-500" />;
    case 'renamed':
      return <File {...iconProps} className="w-4 h-4 text-blue-500" />;
    default:
      return <File {...iconProps} />;
  }
}

export function FileList({ repoPath }: FileListProps) {
  const { currentStatus, stageFile, unstageFile, stageAll, unstageAll } = useRepoStore();

  if (!currentStatus) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        加载中...
      </div>
    );
  }

  const totalFiles =
    currentStatus.staged.length +
    currentStatus.unstaged.length +
    currentStatus.untracked.length +
    currentStatus.conflicted.length;

  if (totalFiles === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <GitBranch className="w-12 h-12 mb-4 opacity-50" />
        <p>工作区干净</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Button size="sm" onClick={() => stageAll(repoPath)}>
          全部暂存
        </Button>
        <Button size="sm" variant="outline" onClick={() => unstageAll(repoPath)}>
          全部取消暂存
        </Button>
      </div>

      <FileSection
        title="已暂存"
        files={currentStatus.staged}
        onStageFile={() => {}}
        onUnstageFile={(file) => unstageFile(repoPath, file)}
        stageLabel=""
        unstageLabel="取消暂存"
        icon={<Badge variant="success">S</Badge>}
      />

      <FileSection
        title="未暂存"
        files={currentStatus.unstaged}
        onStageFile={(file) => stageFile(repoPath, file)}
        onUnstageFile={() => {}}
        stageLabel="暂存"
        unstageLabel=""
        icon={<Badge variant="secondary">U</Badge>}
      />

      <FileSection
        title="未跟踪"
        files={currentStatus.untracked}
        onStageFile={(file) => stageFile(repoPath, file)}
        onUnstageFile={() => {}}
        stageLabel="暂存"
        unstageLabel=""
        icon={<Badge variant="outline">?</Badge>}
      />

      {currentStatus.conflicted.length > 0 && (
        <FileSection
          title="冲突"
          files={currentStatus.conflicted}
          onStageFile={() => {}}
          onUnstageFile={() => {}}
          stageLabel=""
          unstageLabel=""
          icon={<Badge variant="destructive">C</Badge>}
        />
      )}
    </div>
  );
}
