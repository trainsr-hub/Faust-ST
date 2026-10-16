import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PromptHeader } from './PromptHeader';
import { EvaSelectorModal } from './EvaSelectorModal';
import { EvaDossierCard } from './EvaDossierCard';
import { ActiveEvaHeroCard } from './ActiveEvaHeroCard';
import { WorldRouteSpine } from './WorldRouteSpine';
import { ManualPromptCard } from './ManualPromptCard';
import { AppearanceTraitCard } from './AppearanceTraitCard';
import { PromptCompositeCard } from './PromptCompositeCard';
import { ActionToast } from '../ActionToast';
import { PromptEva, WorldNode } from '../../types/prompt';
import { OcularState, EyeColorModeRecord, PupilShapeRecord } from '../../types/ocular';
import { HairState, HairColorModeRecord, HairColorRecord } from '../../types/hair';
import {
  fetchHairBootData,
  compileDynamicHairPrompt,
  parseHairStateFromPrompt,
} from '../../services/hairLiveService';
import {
  fetchOcularBootData,
  compileDynamicOcularPrompt,
  parseOcularStateFromPrompt,
} from '../../services/ocularLiveService';
import { fetchPromptBootData, persistEvaPrompt, persistWorldPrompt } from '../../services/promptLiveApi';
import {
  buildWorldAncestryRoute,
  accumulateOriginPrompt,
  assembleFinalPrompt,
  subtractPromptTokens,
  splitPromptTokens,
  normalizeToken,
} from '../../services/promptHierarchy';
import { createNotification, ActionNotification } from '../../services/notificationManager';
import '../../styles/prompt.css';

interface PromptStudioAppProps {
  onSwitchToPk: () => void;
  onSwitchToHazard: () => void;
  onSwitchToHair?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const PromptStudioApp: React.FC<PromptStudioAppProps> = ({
  onSwitchToPk,
  onSwitchToHazard,
  onSwitchToHair,
  theme,
  onToggleTheme,
}) => {
  const [isSyncing, setIsSyncing] = useState(true);
  const [evasList, setEvasList] = useState<PromptEva[]>([]);
  const [worldsMap, setWorldsMap] = useState<Record<string, WorldNode>>({});
  const [selectedEvaId, setSelectedEvaId] = useState<string | null>(null);
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);
  const [manualPrompt, setManualPrompt] = useState<string>('');
  const [ocularModes, setOcularModes] = useState<EyeColorModeRecord[]>([]);
  const [pupilShapes, setPupilShapes] = useState<PupilShapeRecord[]>([]);
  const [ocularState, setOcularState] = useState<OcularState>({
    isEnabled: true,
    mode: 'single',
    color1: 'blue',
    color2: 'red',
    irisShape: 'round',
    pupilColor: 'black',
  });
  const [hairModes, setHairModes] = useState<HairColorModeRecord[]>([]);
  const [hairColors, setHairColors] = useState<HairColorRecord[]>([]);
  const [hairState, setHairState] = useState<HairState>({
    isEnabled: true,
    mode: 'single',
    color1: 'black',
    color2: 'blue',
    length: 'medium',
    texture: 'none',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingToEva, setIsSavingToEva] = useState(false);
  const [notifications, setNotifications] = useState<ActionNotification[]>([]);

  const notify = useCallback((type: any, title: string, details?: string) => {
    const notif = createNotification(type, title, details);
    setNotifications((prev) => [notif, ...prev.slice(0, 2)]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id)), 3500);
  }, []);

  // Bootstrapping from Turso DB
  const loadData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [{ evasList: loadedEvas, worldsMap: loadedWorlds }, ocularData, hairData] = await Promise.all([
        fetchPromptBootData(),
        fetchOcularBootData(),
        fetchHairBootData(),
      ]);
      setEvasList(loadedEvas);
      setWorldsMap(loadedWorlds);
      setOcularModes(ocularData.modes);
      setPupilShapes(ocularData.shapes);
      setHairModes(hairData.modes);
      setHairColors(hairData.colors);

      if (loadedEvas.length > 0) {
        const initialEva = loadedEvas[0];
        setSelectedEvaId(initialEva.id);
        const firstAff = initialEva.affiliateIds[0] || null;
        setSelectedWorldId(firstAff);
        const initRoute = firstAff ? buildWorldAncestryRoute(firstAff, loadedWorlds) : [];
        const initOrigin = accumulateOriginPrompt(initRoute);
        const parsedOcular = parseOcularStateFromPrompt(initialEva.currentEvaPrompt || '', ocularData.shapes);
        const parsedHair = parseHairStateFromPrompt(initialEva.currentEvaPrompt || '');
        setOcularState(parsedOcular);
        setHairState(parsedHair);
        const initOcular = compileDynamicOcularPrompt(parsedOcular, ocularData.modes, ocularData.shapes);
        const initHair = compileDynamicHairPrompt(parsedHair, hairData.modes);
        setManualPrompt(subtractPromptTokens(initialEva.currentEvaPrompt || '', initOrigin, initOcular, initHair));
      }
      notify('info', 'Turso DB Synchronized', `${loadedEvas.length} Evas loaded`);
    } catch (err: any) {
      notify('error', 'Failed to load Turso data', err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active Eva
  const activeEva = useMemo(() => evasList.find((e) => e.id === selectedEvaId) || null, [evasList, selectedEvaId]);

  const handleSelectEva = (eva: PromptEva) => {
    setSelectedEvaId(eva.id);
    const firstAff = eva.affiliateIds[0] || null;
    setSelectedWorldId(firstAff);
    const newRoute = firstAff ? buildWorldAncestryRoute(firstAff, worldsMap) : [];
    const newOrigin = accumulateOriginPrompt(newRoute);
    const parsedOcular = parseOcularStateFromPrompt(eva.currentEvaPrompt || '', pupilShapes);
    const parsedHair = parseHairStateFromPrompt(eva.currentEvaPrompt || '');
    setOcularState(parsedOcular);
    setHairState(parsedHair);
    const newOcular = compileDynamicOcularPrompt(parsedOcular, ocularModes, pupilShapes);
    const newHair = compileDynamicHairPrompt(parsedHair, hairModes);
    setManualPrompt(subtractPromptTokens(eva.currentEvaPrompt || '', newOrigin, newOcular, newHair));
  };

  const availableAffiliateNodes = useMemo(() => {
    if (!activeEva) return [];
    return activeEva.affiliateIds.map((id) => worldsMap[id]).filter(Boolean);
  }, [activeEva, worldsMap]);

  const route = useMemo(() => {
    if (!selectedWorldId) return [];
    return buildWorldAncestryRoute(selectedWorldId, worldsMap);
  }, [selectedWorldId, worldsMap]);

  const originPrompt = useMemo(() => accumulateOriginPrompt(route), [route]);
  const ocularPrompt = useMemo(() => compileDynamicOcularPrompt(ocularState, ocularModes, pupilShapes), [ocularState, ocularModes, pupilShapes]);
  const hairPrompt = useMemo(() => compileDynamicHairPrompt(hairState, hairModes), [hairState, hairModes]);

  // Final Assembled Prompt: 1 ~ Manual, 2 ~ World Tree, 3 ~ Ocular, 4 ~ Hair
  const assembledPrompt = useMemo(() => {
    return assembleFinalPrompt(manualPrompt, originPrompt, ocularPrompt, hairPrompt);
  }, [manualPrompt, originPrompt, ocularPrompt, hairPrompt]);

  // Overlap detection
  const overlapCount = useMemo(() => {
    if (!manualPrompt) return 0;
    const excluded = [...splitPromptTokens(originPrompt), ...splitPromptTokens(ocularPrompt), ...splitPromptTokens(hairPrompt)];
    const normSet = new Set(excluded.map(normalizeToken));
    return splitPromptTokens(manualPrompt).filter((t) => normSet.has(normalizeToken(t))).length;
  }, [manualPrompt, originPrompt, ocularPrompt, hairPrompt]);

  const handleCleanOverlaps = useCallback(() => {
    const cleaned = subtractPromptTokens(manualPrompt, originPrompt, ocularPrompt, hairPrompt);
    setManualPrompt(cleaned);
    notify('changed', 'Manual prompt separated', 'Extracted only character residual tags');
  }, [manualPrompt, originPrompt, ocularPrompt, hairPrompt, notify]);

  const handleUpdateWorldPrompt = (worldId: string, text: string) => {
    setWorldsMap((prev) => {
      const node = prev[worldId];
      if (!node) return prev;
      return { ...prev, [worldId]: { ...node, prompt: text } };
    });
    persistWorldPrompt(worldId, text);
  };

  const handleSaveToEva = async () => {
    if (!activeEva || !assembledPrompt) return;
    setIsSavingToEva(true);
    const ok = await persistEvaPrompt(activeEva.id, assembledPrompt);
    setIsSavingToEva(false);
    if (ok) {
      setEvasList((prev) => prev.map((e) => (e.id === activeEva.id ? { ...e, currentEvaPrompt: assembledPrompt } : e)));
      notify('saved', `Saved to ${activeEva.tournamentName}`, assembledPrompt.slice(0, 40) + '...');
    } else {
      notify('error', 'Save Failed', 'Could not persist prompt to Turso');
    }
  };

  return (
    <div className="prompt-studio-root">
      <PromptHeader
        onSwitchToPk={onSwitchToPk}
        onSwitchToHazard={onSwitchToHazard}
        onSwitchToHair={onSwitchToHair}
        onSync={loadData}
        isSyncing={isSyncing}
        theme={theme}
        onToggleTheme={onToggleTheme}
        evaCount={evasList.length}
      />

      <div className="prompt-workspace">
        {/* Left Column: Active Eva Contender */}
        <div className="prompt-col">
          <ActiveEvaHeroCard
            activeEva={activeEva}
            onOpenSelector={() => setIsModalOpen(true)}
          />

          <EvaDossierCard activeEva={activeEva} />
        </div>

        {/* Center Column: Pipeline Sequence (1 ~ Manual, 2 ~ World Tree, 3 ~ Ocular, 4 ~ Hair) */}
        <div className="prompt-col">
          <ManualPromptCard
            manualPrompt={manualPrompt}
            onChangeManualPrompt={setManualPrompt}
            evaTournamentName={activeEva?.tournamentName}
            onCleanOverlaps={handleCleanOverlaps}
            overlapCount={overlapCount}
          />

          <WorldRouteSpine
            route={route}
            availableAffiliateNodes={availableAffiliateNodes}
            selectedWorldId={selectedWorldId}
            onSelectWorld={(id) => setSelectedWorldId(id)}
            onUpdateWorldPrompt={handleUpdateWorldPrompt}
            originPrompt={originPrompt}
          />

          <AppearanceTraitCard
            ocularState={ocularState}
            onChangeOcular={setOcularState}
            hairState={hairState}
            onChangeHair={setHairState}
            scanText={manualPrompt}
            modes={ocularModes}
            shapes={pupilShapes}
            hairModes={hairModes}
            hairColors={hairColors}
          />
        </div>

        {/* Right Column: Composite Output Matrix */}
        <div className="prompt-col prompt-workspace-right">
          <PromptCompositeCard
            assembledPrompt={assembledPrompt}
            onSaveToEva={handleSaveToEva}
            isSavingToEva={isSavingToEva}
            evaTournamentName={activeEva?.tournamentName}
          />
        </div>
      </div>

      <EvaSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        evasList={evasList}
        selectedEvaId={selectedEvaId}
        onSelectEva={handleSelectEva}
      />

      <ActionToast notifications={notifications} onDismiss={() => {}} />
    </div>
  );
};
