import { App, normalizePath } from 'obsidian';

export interface WorldNode {
  _prt_?: string;
  [key: string]: any;
}

export interface WorldFile {
  id: string; // filename without extension, e.g. "Internet"
  fileName: string;
  path: string;
  data: Record<string, WorldNode>;
}

export interface WorldTreeNode {
  id: string; // path string e.g. "Vtuber/Hololive/HoloEN/HoloMyth"
  key: string; // node name e.g. "HoloMyth"
  level: number; // 1 = #, 2 = ##, 3 = ###, 4 = ####
  headerPrefix: string; // "#", "##", "###", "####"
  path: string[]; // ["Vtuber", "Hololive", "HoloEN", "HoloMyth"]
  parentPath: string[]; // ["Vtuber", "Hololive", "HoloEN"]
  prt?: string;
  childrenKeys: string[];
}

export interface AssociationResolution {
  worldId: string;
  path: string[]; // e.g. ["Vtuber", "Hololive", "HoloEN", "HoloMyth"]
  inheritedPrompts: string[]; // e.g. ["virtual youtuber", "hololive"]
  assembledPrompt: string; // "virtual youtuber, hololive"
}

export class WorldManager {
  public static readonly WORLDS_DIR = 'Hazard_Trigger_Data/Identity/Worlds';

  /**
   * Scans and loads all World JSON & MD files from Hazard_Trigger_Data/Identity/Worlds/
   */
  public static async listWorlds(app: App): Promise<WorldFile[]> {
    const adapter = app.vault.adapter;
    const dirExists = await adapter.exists(this.WORLDS_DIR);

    if (!dirExists) {
      try {
        await adapter.mkdir(this.WORLDS_DIR);
      } catch (e) {
        console.warn('[WorldManager] Failed to create Worlds directory:', e);
      }
      return [];
    }

    const listing = await adapter.list(this.WORLDS_DIR);
    const worldFiles: WorldFile[] = [];

    for (const filePath of listing.files) {
      const normalizedPath = normalizePath(filePath);
      const fileName = normalizedPath.split('/').pop() || '';

      if (filePath.endsWith('.json')) {
        const id = fileName.replace(/\.json$/i, '');
        try {
          const rawContent = await adapter.read(normalizedPath);
          const data = JSON.parse(rawContent);
          worldFiles.push({
            id,
            fileName,
            path: normalizedPath,
            data,
          });
        } catch (err) {
          console.error(`[WorldManager] Error reading JSON ${normalizedPath}:`, err);
        }
      } else if (filePath.endsWith('.md')) {
        const id = fileName.replace(/\.md$/i, '');
        try {
          const rawContent = await adapter.read(normalizedPath);
          const data = this.parseMarkdownWorld(rawContent);
          worldFiles.push({
            id,
            fileName,
            path: normalizedPath,
            data,
          });
        } catch (err) {
          console.error(`[WorldManager] Error reading MD ${normalizedPath}:`, err);
        }
      }
    }

    return worldFiles;
  }

  /**
   * Parses markdown headings into a hierarchical WorldNode tree
   * # Level 1
   * _prt_: prompt
   * ## Level 2
   */
  public static parseMarkdownWorld(markdown: string): Record<string, WorldNode> {
    const lines = markdown.split(/\r?\n/);
    const root: Record<string, WorldNode> = {};
    const stack: { level: number; node: WorldNode; key: string }[] = [];

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const key = headingMatch[2].trim();
        const newNode: WorldNode = {};

        // Pop until we find parent level
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          root[key] = newNode;
        } else {
          stack[stack.length - 1].node[key] = newNode;
        }

        stack.push({ level, node: newNode, key });
        continue;
      }

      // Check for _prt_: keyword inside heading section
      const prtMatch = line.match(/^(_prt_|prompt|keyword):\s*(.+)$/i);
      if (prtMatch && stack.length > 0) {
        stack[stack.length - 1].node._prt_ = prtMatch[2].trim();
      }
    }

    return root;
  }

  /**
   * Extracts non-metadata child node keys from a given WorldNode
   */
  public static getChildKeys(node: WorldNode | null | undefined): string[] {
    if (!node || typeof node !== 'object') return [];
    return Object.keys(node).filter((k) => !k.startsWith('_'));
  }

  /**
   * Flattens a recursive tree into an indexed list of WorldTreeNode items
   */
  public static flattenTree(rootData: Record<string, WorldNode>): WorldTreeNode[] {
    const result: WorldTreeNode[] = [];

    const traverse = (nodeMap: Record<string, WorldNode>, currentPath: string[], level: number) => {
      const keys = this.getChildKeys(nodeMap);
      for (const key of keys) {
        const childNode = nodeMap[key];
        const nextPath = [...currentPath, key];
        const childrenKeys = typeof childNode === 'object' ? this.getChildKeys(childNode) : [];

        result.push({
          id: nextPath.join('/'),
          key,
          level,
          headerPrefix: '#'.repeat(level),
          path: nextPath,
          parentPath: currentPath,
          prt: typeof childNode._prt_ === 'string' ? childNode._prt_.trim() : undefined,
          childrenKeys,
        });

        if (typeof childNode === 'object') {
          traverse(childNode, nextPath, level + 1);
        }
      }
    };

    traverse(rootData, [], 1);
    return result;
  }

  /**
   * Searches tree nodes and sorts by highest depth level not yet chosen
   */
  public static searchTreeNodes(
    allNodes: WorldTreeNode[],
    query: string,
    currentPath: string[] = []
  ): WorldTreeNode[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const currentPathStr = currentPath.join('/');

    const matches = allNodes.filter((node) => {
      const keyMatch = node.key.toLowerCase().includes(q);
      const prtMatch = node.prt ? node.prt.toLowerCase().includes(q) : false;
      const pathMatch = node.id.toLowerCase().includes(q);
      return keyMatch || prtMatch || pathMatch;
    });

    // Sort: highest level first (deepest matches), then prioritize items not fully matching current path
    return matches.sort((a, b) => {
      const aInPath = a.id === currentPathStr || currentPathStr.startsWith(a.id);
      const bInPath = b.id === currentPathStr || currentPathStr.startsWith(b.id);
      if (aInPath !== bInPath) {
        return aInPath ? 1 : -1; // Unchosen first
      }
      return b.level - a.level; // Highest level first
    });
  }

  /**
   * Resolves a path down a World tree and extracts all accumulated _prt_ keywords
   */
  public static resolveAssociationPath(
    rootData: Record<string, WorldNode>,
    path: string[],
    worldId: string = ''
  ): AssociationResolution {
    const inheritedPrompts: string[] = [];
    let currentNode: WorldNode | undefined = rootData;

    for (const segment of path) {
      if (!currentNode || typeof currentNode !== 'object') break;
      const nextNode: WorldNode | undefined = currentNode[segment];
      if (nextNode && typeof nextNode === 'object') {
        if (typeof nextNode._prt_ === 'string' && nextNode._prt_.trim().length > 0) {
          inheritedPrompts.push(nextNode._prt_.trim());
        }
        currentNode = nextNode;
      } else {
        break;
      }
    }

    return {
      worldId,
      path,
      inheritedPrompts,
      assembledPrompt: inheritedPrompts.join(', '),
    };
  }
}
