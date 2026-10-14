import { App, normalizePath } from 'obsidian';
import { ComponentEntry, ComponentFileNode } from './componentScanner';
import { MatrixDomainNode, MatrixStateDefinition } from '../types/schema';

export const MATRICES_ROOT_DIR = 'Hazard_Trigger_Data/Matrices';

function cleanPath(p: string): string {
  return normalizePath(p).replace(/\\/g, '/');
}

export class MatrixScanner {
  /**
   * Dynamically scans all Matrix Domain subdirectories in Hazard_Trigger_Data/Matrices/.
   * Parses _matrix.json and all child component files dynamically with zero hardcoding.
   */
  public static async scanAll(app: App): Promise<MatrixDomainNode[]> {
    const adapter = app.vault.adapter;
    const rootPath = cleanPath(MATRICES_ROOT_DIR);
    const rootExists = await adapter.exists(rootPath);

    if (!rootExists) {
      try {
        await adapter.mkdir(rootPath);
      } catch (e) {
        console.warn('[MatrixScanner] Root creation note:', e);
      }
      return [];
    }

    const listed = await adapter.list(rootPath);
    const matrixDomains: MatrixDomainNode[] = [];

    const sortedFolderPaths = [...listed.folders].map(cleanPath).sort();

    for (const folderPath of sortedFolderPaths) {
      const folderName = folderPath.split('/').pop() || folderPath;
      const relFolderPath = folderPath.startsWith(rootPath + '/')
        ? folderPath.slice(rootPath.length + 1)
        : folderName;

      const folderContents = await adapter.list(folderPath);

      // 1. Read _matrix.json for dynamic Matrix States definition
      let states: MatrixStateDefinition[] = [];
      const matrixDefPath = cleanPath(`${folderPath}/_matrix.json`);

      try {
        if (await adapter.exists(matrixDefPath)) {
          const raw = await adapter.read(matrixDefPath);
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            states = parsed as MatrixStateDefinition[];
          }
        }
      } catch (err) {
        console.error(`[MatrixScanner] Failed to parse _matrix.json in ${folderPath}:`, err);
      }

      // 2. Read all child component files
      const files: ComponentFileNode[] = [];
      const sortedFilePaths = [...folderContents.files]
        .map(cleanPath)
        .filter((f) => {
          const base = f.split('/').pop() || f;
          return f.endsWith('.json') && !base.startsWith('_');
        })
        .sort();

      for (const filePath of sortedFilePaths) {
        const fileName = filePath.split('/').pop() || filePath;
        const relFilePath = `Matrices/${relFolderPath}/${fileName}`;

        try {
          const raw = await adapter.read(filePath);
          const parsed: Record<string, ComponentEntry> = JSON.parse(raw);

          const fallbackCleanName = fileName
            .replace(/\.json$/i, '')
            .replace(/^[_0-9]+/, '')
            .replace(/[-_]/g, ' ')
            .trim();

          const displayName =
            fallbackCleanName.charAt(0).toUpperCase() + fallbackCleanName.slice(1) || fileName;

          files.push({
            fileName,
            displayName,
            relPath: relFilePath,
            entries: parsed,
          });
        } catch (err) {
          console.error(`[MatrixScanner] Failed to parse ${filePath}:`, err);
        }
      }

      const fallbackFolderClean = folderName
        .replace(/^[_0-9]+/, '')
        .replace(/[-_]/g, ' ')
        .trim();

      const folderDisplayName =
        fallbackFolderClean.charAt(0).toUpperCase() + fallbackFolderClean.slice(1) || folderName;

      matrixDomains.push({
        domainId: folderName,
        displayName: folderDisplayName,
        relPath: `Matrices/${relFolderPath}`,
        states,
        files,
      });
    }

    return matrixDomains;
  }
}
