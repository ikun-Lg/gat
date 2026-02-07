import { useEffect, useState } from 'react';
import { useRepoStore } from './store/repoStore';
import { useSettingsStore } from './store/settingsStore';
import { RepoList } from './components/RepoList';
import { RepoView } from './components/RepoView';
import { WelcomeDialog } from './components/WelcomeDialog';
import { ScanDialog } from './components/ScanDialog';
import { Settings } from './components/Settings';
import { Button } from './components/ui/Button';
import { Settings as SettingsIcon, Github } from 'lucide-react';
import './App.css';

function App() {
  const { repositories, selectedRepoPath, scanRepositories, isLoading } = useRepoStore();
  const { workDir, setWorkDir } = useSettingsStore();
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (workDir) {
      scanRepositories(workDir);
    }
  }, [workDir, scanRepositories]);

  const handleWorkDirSelected = (dir: string) => {
    setWorkDir(dir);
  };

  const handleScan = async (path: string) => {
    await scanRepositories(path);
    setWorkDir(path);
  };

  const showWelcome = !workDir;

  return (
    <div className="h-screen flex flex-col">
      {/* 头部 */}
      <header className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Github className="w-6 h-6" />
          <h1 className="font-semibold">gayt</h1>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowSettings(true)}
          title="设置"
        >
          <SettingsIcon className="w-5 h-5" />
        </Button>
      </header>

      {/* 主内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <aside className="w-80 border-r flex flex-col">
          <RepoList onScanClick={() => setShowScanDialog(true)} />
        </aside>

        {/* 主视图 */}
        <main className="flex-1">
          {selectedRepoPath ? (
            <RepoView repoPath={selectedRepoPath} />
          ) : repositories.length > 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>选择一个仓库查看详情</p>
            </div>
          ) : isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p>正在扫描仓库...</p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>未找到仓库。点击文件夹图标扫描目录。</p>
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
    </div>
  );
}

export default App;
