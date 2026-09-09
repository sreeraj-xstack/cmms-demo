/**
 * Utility module for Auto-generation, Payload Structuring, Web Link URLs, and Parsing of QR Codes across Sobha CMMS
 */

export interface CMMSQRPayload {
  system: 'SOBHA_CMMS';
  type: 'asset' | 'spare_part' | 'tool';
  id?: string;
  code: string; // asset_tag, part_number, or tool_number
  name: string;
  location: string;
  category?: string;
  adapter_code?: string;
  url?: string;
  created_at?: string;
}

/**
 * Generates a dynamic web URL for an Asset, Spare Part, or Tool.
 * Scanning this QR code from any camera automatically opens the CMMS page in a new browser tab
 * and displays the specific item details drawer instantly.
 */
export function generateItemQRUrl(
  type: 'asset' | 'spare_part' | 'tool',
  item: {
    id?: string;
    code?: string;
    asset_tag?: string;
    part_number?: string;
    tool_number?: string;
  }
): string {
  const identifier = item.code || item.asset_tag || item.part_number || item.tool_number || item.id || '';
  const baseUrl = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000';

  if (type === 'tool') {
    return `${baseUrl}/tools?toolId=${encodeURIComponent(identifier)}`;
  }
  if (type === 'spare_part') {
    return `${baseUrl}/inventory?partId=${encodeURIComponent(identifier)}`;
  }
  return `${baseUrl}/assets?assetId=${encodeURIComponent(identifier)}`;
}

/**
 * Generates a clean, structured payload or web URL for an Asset, Spare Part, or Tool
 */
export function generateQRPayload(
  type: 'asset' | 'spare_part' | 'tool',
  item: {
    id?: string;
    code?: string;
    asset_tag?: string;
    part_number?: string;
    tool_number?: string;
    name: string;
    location?: string;
    storage_location?: string;
    category?: string;
    adapter_code?: string;
  }
): string {
  return generateItemQRUrl(type, item);
}

/**
 * Parses any QR input string (URL link, JSON payload, or plain code string) into structured details
 */
export function parseQRPayload(rawText: string): Partial<CMMSQRPayload> & { raw: string; isStructured: boolean } {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { raw: '', isStructured: false, code: '', name: '' };
  }

  // 1. Check if it is a Web URL link (e.g. http://localhost:3000/tools?toolId=TL-2026-1001)
  if (trimmed.includes('toolId=') || trimmed.includes('partId=') || trimmed.includes('assetId=')) {
    try {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `http://localhost:3000${trimmed}`);
      const toolId = urlObj.searchParams.get('toolId');
      const partId = urlObj.searchParams.get('partId');
      const assetId = urlObj.searchParams.get('assetId');

      if (toolId) {
        return {
          raw: trimmed,
          isStructured: true,
          system: 'SOBHA_CMMS',
          type: 'tool',
          code: toolId,
          name: toolId,
          url: trimmed,
        };
      }
      if (partId) {
        return {
          raw: trimmed,
          isStructured: true,
          system: 'SOBHA_CMMS',
          type: 'spare_part',
          code: partId,
          name: partId,
          url: trimmed,
        };
      }
      if (assetId) {
        return {
          raw: trimmed,
          isStructured: true,
          system: 'SOBHA_CMMS',
          type: 'asset',
          code: assetId,
          name: assetId,
          url: trimmed,
        };
      }
    } catch {
      // URL parsing fallback
    }
  }

  // 2. Check if JSON payload
  try {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed) as CMMSQRPayload;
      if (parsed.system === 'SOBHA_CMMS' || parsed.code || parsed.name) {
        return {
          ...parsed,
          raw: trimmed,
          isStructured: true,
        };
      }
    }
  } catch {
    // Not JSON
  }

  // 3. Handle plain text / legacy codes
  let inferredType: 'asset' | 'spare_part' | 'tool' = 'asset';
  if (trimmed.startsWith('TL-') || trimmed.startsWith('QR-TL-') || trimmed.startsWith('ADP-')) {
    inferredType = 'tool';
  } else if (trimmed.startsWith('SP-') || trimmed.startsWith('QR-SP-')) {
    inferredType = 'spare_part';
  }

  return {
    raw: trimmed,
    isStructured: false,
    system: 'SOBHA_CMMS',
    type: inferredType,
    code: trimmed.replace(/^QR-/, ''),
    name: trimmed,
    adapter_code: trimmed.startsWith('ADP-') ? trimmed : undefined,
  };
}
