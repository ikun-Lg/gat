import { useEffect, useState } from 'react';
import { useProviderStore } from '../store/providerStore';
import { useSettingsStore } from '../store/settingsStore';
import { CreatePRDialog } from './CreatePRDialog';
import { CreateIssueDialog } from './CreateIssueDialog';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { GitPullRequest, CircleDot, Plus, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProviderPanelProps {
  repoPath: string;
}

export function ProviderPanel({ repoPath }: ProviderPanelProps) {
  const { 
    pullRequests, 
    issues, 
    isLoading, 
    error, 
    loadPullRequests, 
    loadIssues 
  } = useProviderStore();
  
  const { githubToken, gitlabToken } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'prs' | 'issues'>('prs');
  const [isCreatePROpen, setIsCreatePROpen] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);

  // Load data on mount or tab change
  useEffect(() => {
    if (activeTab === 'prs') {
      loadPullRequests(repoPath);
    } else {
      loadIssues(repoPath);
    }
  }, [repoPath, activeTab, loadPullRequests, loadIssues]);

  const hasToken = !!(githubToken || gitlabToken);

  if (!hasToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
        <div className="bg-muted/50 p-4 rounded-full mb-4">
          <GitPullRequest className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">未配置 Git Token</h3>
        <p className="text-sm mb-6 max-w-xs">
            请在设置中配置 GitHub 或 GitLab Token 以查看 Pull Requests 和 Issues。
        </p>
        <Button variant="default" onClick={() => {
            // Trigger settings open? For now just message
             const event = new CustomEvent('open-settings');
             window.dispatchEvent(event);
        }}>
            去配置
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2">
            <div className="flex p-1 bg-muted/50 rounded-lg">
                <button
                    onClick={() => setActiveTab('prs')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        activeTab === 'prs' 
                            ? "bg-background shadow-sm text-foreground" 
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    Pull Requests
                </button>
                <button
                    onClick={() => setActiveTab('issues')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        activeTab === 'issues' 
                            ? "bg-background shadow-sm text-foreground" 
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <CircleDot className="w-3.5 h-3.5" />
                    Issues
                </button>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={() => activeTab === 'prs' ? loadPullRequests(repoPath) : loadIssues(repoPath)}
                disabled={isLoading}
            >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Button 
                size="sm" 
                variant="default" 
                className="h-8 gap-1.5 text-xs"
                onClick={() => activeTab === 'prs' ? setIsCreatePROpen(true) : setIsCreateIssueOpen(true)}
            >
                <Plus className="w-3.5 h-3.5" />
                新建 {activeTab === 'prs' ? 'PR' : 'Issue'}
            </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        {error && (
            <div className="m-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
            </div>
        )}

        {isLoading && !error && (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <RefreshCw className="w-6 h-6 animate-spin mb-2 opacity-50" />
                <span className="text-xs">加载中...</span>
            </div>
        )}

        {!isLoading && !error && activeTab === 'prs' && pullRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <GitPullRequest className="w-10 h-10 mb-3 opacity-20" />
                <span className="text-sm">暂无 Pull Requests</span>
            </div>
        )}

        {!isLoading && !error && activeTab === 'issues' && issues.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <CircleDot className="w-10 h-10 mb-3 opacity-20" />
                <span className="text-sm">暂无 Issues</span>
            </div>
        )}

        <div className="divide-y divide-border/30">
            {activeTab === 'prs' ? (
                pullRequests.map(pr => (
                    <div key={pr.id} className="p-4 hover:bg-muted/30 transition-colors group">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-muted-foreground text-xs font-mono">#{pr.number}</span>
                                    <h4 className="text-sm font-medium text-foreground truncate" title={pr.title}>{pr.title}</h4>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant={pr.state === 'open' ? 'default' : 'secondary'} className="h-5 px-1.5 text-[10px] uppercase">
                                        {pr.state}
                                    </Badge>
                                    <span>{pr.author}</span>
                                    <span>•</span>
                                    <span>{new Date(pr.updatedAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="font-mono bg-muted/50 px-1 rounded text-[10px]">{pr.headRef}</span>
                                    <span className="text-[10px]">→</span>
                                    <span className="font-mono bg-muted/50 px-1 rounded text-[10px]">{pr.baseRef}</span>
                                </div>
                            </div>
                            <a 
                                href={pr.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-primary transition-all"
                                title="在浏览器中打开"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))
            ) : (
                issues.map(issue => (
                    <div key={issue.id} className="p-4 hover:bg-muted/30 transition-colors group">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-muted-foreground text-xs font-mono">#{issue.number}</span>
                                    <h4 className="text-sm font-medium text-foreground truncate" title={issue.title}>{issue.title}</h4>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant={issue.state === 'open' ? 'default' : 'secondary'} className="h-5 px-1.5 text-[10px] uppercase">
                                        {issue.state}
                                    </Badge>
                                    <span>{issue.author}</span>
                                    <span>•</span>
                                    <span>{new Date(issue.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                             <a 
                                href={issue.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-primary transition-all"
                                title="在浏览器中打开"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      <CreatePRDialog 
        isOpen={isCreatePROpen} 
        onClose={() => setIsCreatePROpen(false)} 
        repoPath={repoPath} 
      />
      <CreateIssueDialog 
        isOpen={isCreateIssueOpen} 
        onClose={() => setIsCreateIssueOpen(false)} 
        repoPath={repoPath} 
      />
    </div>
  );
}
