import { useEffect, useState } from 'react';
import { useRepoStore } from './store/repoStore';
import { useSettingsStore } from './store/settingsStore';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { UnlistenFn } from '@tauri-apps/api/event';
import { RepoList } from './components/RepoList';
import { RepoView } from './components/RepoView';
import { WelcomeDialog } from './components/WelcomeDialog';
import { ScanDialog } from './components/ScanDialog';
import { Settings } from './components/Settings';
import { useLayoutStore } from './store/layoutStore';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from './components/ui/Button';
import { useThemeStore } from './store/themeStore';
import { Toaster } from './components/ui/Toast';
import { cn } from './lib/utils';
import './App.css';

function App() {
  const { repositories, selectedRepoPath, scanRepositories, isLoading } = useRepoStore();
  const { workDir, setWorkDir } = useSettingsStore(); // Removed sidebar props
  const { sidebarWidth, setSidebarWidth, isSidebarOpen, toggleSidebar } = useLayoutStore();
  const { mode, primaryColor } = useThemeStore();
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Theme Application Logic
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    // Apply primary color
    // Defines standard colors for: blue, purple, green, red, orange
    const colors = {
      blue: '211 100% 50%',
      purple: '267 100% 61%',
      green: '142 76% 36%',
      red: '0 84% 60%',
      orange: '24 95% 53%',
    };
    root.style.setProperty('--primary', colors[primaryColor]);
    root.style.setProperty('--ring', colors[primaryColor]);
    // Also update accent to match primary for consistent hover/selection states
    root.style.setProperty('--accent', colors[primaryColor]);
    // Ensure accent foreground is readable (white for these saturated colors)
    root.style.setProperty('--accent-foreground', '0 0% 100%');

    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(mode);
  }, [mode, primaryColor]);

  useEffect(() => {
    if (workDir) {
      scanRepositories(workDir);
    }
  }, [workDir, scanRepositories]);

  // Sidebar resize logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth > 150 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setSidebarWidth]);

  // 自动刷新逻辑
  useEffect(() => {
    const { refreshStatus, refreshBranchInfo, refreshAllRepoStatus } = useRepoStore.getState();

    // 1. 窗口聚焦时刷新
    const unlistenPromise = getCurrentWindow().listen('tauri://focus', () => {
      const currentSelected = useRepoStore.getState().selectedRepoPath;
      if (currentSelected) {
        refreshStatus(currentSelected);
        refreshBranchInfo(currentSelected);
      }
      refreshAllRepoStatus();
    });

    // 2. 定时轮询
    // 每 10 秒刷新当前选中的仓库状态
    const statusInterval = setInterval(() => {
      const currentSelected = useRepoStore.getState().selectedRepoPath;
      if (currentSelected) {
        useRepoStore.getState().refreshStatus(currentSelected);
      }
    }, 10000);

    // 每 30 秒刷新所有仓库状态（更新左侧列表的变更图标）
    const allReposInterval = setInterval(() => {
      useRepoStore.getState().refreshAllRepoStatus();
    }, 30000);

    return () => {
      unlistenPromise.then((unlisten: UnlistenFn) => unlisten());
      clearInterval(statusInterval);
      clearInterval(allReposInterval);
    };
  }, []); // 仅在组件挂载时运行一次监听器设置

  const handleWorkDirSelected = (dir: string) => {
    setWorkDir(dir);
  };

  const handleScan = async (path: string) => {
    await scanRepositories(path);
    setWorkDir(path);
  };

  const showWelcome = !workDir;

  return (
    <div className="h-screen flex flex-col bg-background selection:bg-primary/20">
      
      <div className={cn("flex-1 flex overflow-hidden", isResizing && "resizing")}>
        {/* Sidebar */}
        <aside 
          className={cn(
            "sidebar-glass flex flex-col shrink-0 select-none transition-all duration-300 ease-in-out",
            !isSidebarOpen && "-ml-[100%] w-0 opacity-0 overflow-hidden" // Hide sidebar
          )}
          style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }}
        >
          <RepoList 
            onScanClick={() => setShowScanDialog(true)} 
            onSettingsClick={() => setShowSettings(true)}
          />
        </aside>

        {/* Resize Handle & Toggle */}
        <div className="relative z-50 flex items-center">
             <div 
                className={cn("resize-handle", !isSidebarOpen && "hidden")}
                onMouseDown={handleMouseDown}
                onDoubleClick={toggleSidebar}
            />
            {/* Floating Toggle Button (visible when sidebar closed or hovering near edge?) 
                Actually, simpler to put it in the main content header or overlay.
                For now, let's put a toggle button on the main view if closed.
            */}
             {!isSidebarOpen && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-2 z-50 h-8 w-8 hover:bg-accent"
                    onClick={toggleSidebar}
                >
                    <PanelLeftOpen className="w-4 h-4" />
                </Button>
            )}
            {/* If open, maybe a close button in sidebar? Or just double click handle? 
                Let's stick to handle double click for now or adding a button in RepoList header if reachable.
                Actually, let's add the button to the main view header area always.
            */}
        </div>

        {/* Main View */}
        <main className="flex-1 bg-background/50 relative overflow-hidden flex flex-col">
            {/* Toggle button in top-left if open */}
             {isSidebarOpen && (
                <div className="absolute left-2 top-2 z-40">
                   <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={toggleSidebar}
                        title="Toggle Sidebar"
                    >
                        <PanelLeftClose className="w-4 h-4" />
                    </Button>
                </div>
            )}

          {!selectedRepoPath && <div className="h-10 shrink-0 drag-region" />}
          {selectedRepoPath ? (
            <RepoView repoPath={selectedRepoPath} />
          ) : repositories.length > 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>请选择一个仓库以查看详情</p>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <p>正在扫描仓库...</p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>暂无仓库。请点击文件夹图标扫描本地目录。</p>
            </div>
          )}
        </main>
      </div>

      {/* 对话框 */}
      {showWelcome && <WelcomeDialog onWorkDirSelected={handleWorkDirSelected} />}
      <ScanDialog
        isOpen={showScanDialog}
        onClose={() => setShowScanDialog(false)}
        onScan={handleScan}
      />
      {showSettings && (
        <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
      <Toaster />
    </div>
  );
}

export default App;
