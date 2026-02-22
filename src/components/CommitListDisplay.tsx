import { useRepoStore } from '../store/repoStore';
import { CommitGraph } from './CommitGraph';
import { VirtualizedCommitList } from './VirtualizedCommitList';
import { GitGraph, SearchX, AlertCircle } from 'lucide-react';

interface CommitListDisplayProps {
    repoPath: string;
    showGraph: boolean;
}

export function CommitListDisplay({ repoPath, showGraph }: CommitListDisplayProps) {
    const { 
        commitHistory, 
        searchResults, 
        isSearching, 
        loadMoreCommits, 
        hasMoreCommits, 
        isLoadingMoreCommits 
    } = useRepoStore();

    // Determine what to display
    // If searchResults is not null, we are in search mode (even if empty results)
    const isSearchMode = searchResults !== null;
    const commitsToDisplay = isSearchMode ? searchResults : commitHistory;

    if (isSearching) {
         return (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground animate-pulse">
                 <GitGraph className="w-10 h-10 mb-3 opacity-20 animate-bounce" />
                 <p>正在搜索提交...</p>
             </div>
         );
    }

    if (commitsToDisplay.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                {isSearchMode ? (
                     <>
                        <SearchX className="w-10 h-10 mb-3 opacity-20" />
                        <p>未找到匹配的提交</p>
                     </>
                ) : (
                    <>
                        <GitGraph className="w-10 h-10 mb-3 opacity-20" />
                        <p>暂无提交记录</p>
                    </>
                )}
            </div>
        );
    }

    return (
        <>
            {/* Search result warning banner */}
            {isSearchMode && commitsToDisplay.length >= 100 && (
                <div className="mx-2 mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                            搜索结果限制
                        </p>
                        <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">
                            当前仅显示前 {commitsToDisplay.length} 条匹配的提交。如需查看更多结果,请尝试使用更具体的搜索条件。
                        </p>
                    </div>
                </div>
            )}

            {showGraph && !isSearchMode && (
                <CommitGraph commits={commitsToDisplay} rowHeight={56} />
            )}

            <VirtualizedCommitList
                repoPath={repoPath}
                commits={commitsToDisplay}
                rowHeight={56}
                showGraph={showGraph && !isSearchMode} // Disable graph lines for search results as they might be disjointed
                graphWidth={showGraph && !isSearchMode ? 80 : 0}
                onLoadMore={() => !isSearchMode && loadMoreCommits(repoPath)} // Disable load more for search results for now
                hasMore={!isSearchMode && hasMoreCommits}
                isLoadingMore={!isSearchMode && isLoadingMoreCommits}
            />
        </>
    );
}
