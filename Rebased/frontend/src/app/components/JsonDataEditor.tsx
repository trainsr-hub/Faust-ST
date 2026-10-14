import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { X, FileCode, RefreshCw, Copy, Check, Folder } from 'lucide-react';

interface JsonDataEditorProps {
  onClose: () => void;
}

export const JsonDataEditor: React.FC<JsonDataEditorProps> = ({ onClose }) => {
  const {
    categories,
    nodes,
    gachaPools,
    wildcards,
    exclusions,
    presets,
    reloadVaultData,
  } = useStudioStore();

  const [activeFile, setActiveFile] = useState<
    'nodes' | 'categories' | 'gacha' | 'wildcards' | 'exclusions' | 'presets'
  >('nodes');
  const [copied, setCopied] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const getJsonContent = () => {
    switch (activeFile) {
      case 'nodes':
        return JSON.stringify(nodes, null, 2);
      case 'categories':
        return JSON.stringify(categories, null, 2);
      case 'gacha':
        return JSON.stringify(gachaPools, null, 2);
      case 'wildcards':
        return JSON.stringify(wildcards, null, 2);
      case 'exclusions':
        return JSON.stringify(exclusions, null, 2);
      case 'presets':
        return JSON.stringify(presets, null, 2);
      default:
        return '';
    }
  };

  const currentJsonString = getJsonContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleReload = async () => {
    setIsReloading(true);
    await reloadVaultData();
    setTimeout(() => setIsReloading(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="flex flex-col w-full max-w-4xl h-[85vh] bg-hazard-card border border-hazard-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-hazard-border bg-hazard-void">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-hazard-gold" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-hazard-textBright">
                Vault JSON Data Inspector
              </h3>
              <p className="text-[11px] font-mono text-hazard-textMuted flex items-center gap-1">
                <Folder className="w-3 h-3 text-hazard-cyan" />
                <span>Vault Path: <strong>Hazard_Trigger_Data/</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-hazard-textMuted hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-hazard-border bg-hazard-card/80">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'nodes', name: 'prompt_nodes.json' },
              { id: 'categories', name: 'categories.json' },
              { id: 'gacha', name: 'gacha_pools.json' },
              { id: 'wildcards', name: 'wildcards.json' },
              { id: 'exclusions', name: 'exclusions.json' },
              { id: 'presets', name: 'presets.json' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFile(tab.id as any)}
                className={`px-3 py-1 text-xs font-mono rounded-md transition ${
                  activeFile === tab.id
                    ? 'bg-hazard-gold text-black font-bold shadow-sm'
                    : 'text-hazard-textMuted hover:text-white hover:bg-hazard-cardHover'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-hazard-void border border-hazard-border hover:border-hazard-gold text-xs text-hazard-textBright rounded transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-hazard-gold" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleReload}
              className="flex items-center gap-1.5 px-3 py-1 bg-hazard-gold/10 border border-hazard-gold/30 hover:bg-hazard-gold/20 text-hazard-gold text-xs font-semibold rounded transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
              <span>Reload From Disk</span>
            </button>
          </div>
        </div>

        {/* JSON Display Area */}
        <div className="flex-1 p-4 bg-hazard-void overflow-hidden">
          <pre className="w-full h-full p-3 font-mono text-xs text-hazard-textBright bg-hazard-card/50 rounded-xl border border-hazard-border overflow-auto leading-relaxed">
            <code>{currentJsonString}</code>
          </pre>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between p-3 border-t border-hazard-border bg-hazard-card/90 text-[11px] text-hazard-textMuted">
          <span>
            💡 Tip: You can edit these JSON files directly in VS Code or any text editor. Click <strong>Reload From Disk</strong> to sync changes instantly into the studio.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-hazard-gold text-black font-bold rounded hover:brightness-110 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
