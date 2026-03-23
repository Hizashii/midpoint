/**
 * Central map style configuration for OpenFreeMap + MapLibre.
 * Swap presets or point `custom` at a hosted/local style JSON when ready.
 */
export const OPENFREEMAP_STYLES_BASE = 'https://tiles.openfreemap.org/styles';

export const MAP_STYLE_PRESETS = {
  liberty: `${OPENFREEMAP_STYLES_BASE}/liberty`,
  positron: `${OPENFREEMAP_STYLES_BASE}/positron`,
  bright: `${OPENFREEMAP_STYLES_BASE}/bright`,
} as const;

export type MapStylePresetKey = keyof typeof MAP_STYLE_PRESETS;

/** Include `custom` for future branded StyleJSON (file:// or https://). */
export type MapStyleSelection = MapStylePresetKey | 'custom';

export const DEFAULT_MAP_STYLE_PRESET: MapStylePresetKey = 'liberty';

export type MapStyleConfig = {
  selection: MapStyleSelection;
  /** Required when selection is `custom` — full URL to a MapLibre-compatible style JSON. */
  customStyleURL?: string;
};

const DEFAULT_CONFIG: MapStyleConfig = {
  selection: DEFAULT_MAP_STYLE_PRESET,
};

let activeMapStyleConfig: MapStyleConfig = { ...DEFAULT_CONFIG };

/** Runtime override (e.g. settings screen) without redeploying. */
export function setMapStyleConfig(config: Partial<MapStyleConfig>) {
  activeMapStyleConfig = { ...activeMapStyleConfig, ...config };
}

export function getMapStyleConfig(): MapStyleConfig {
  return { ...activeMapStyleConfig };
}

export function resetMapStyleConfig() {
  activeMapStyleConfig = { ...DEFAULT_CONFIG };
}

/**
 * Resolves the MapLibre `styleURL` from preset or custom URL.
 */
export function resolveMapStyleURL(config: MapStyleConfig = getMapStyleConfig()): string {
  if (config.selection === 'custom' && config.customStyleURL?.trim()) {
    return config.customStyleURL.trim();
  }
  if (config.selection === 'custom') {
    return MAP_STYLE_PRESETS.liberty;
  }
  return MAP_STYLE_PRESETS[config.selection];
}

/** Single URL for a preset (ignores runtime config). */
export function getPresetStyleURL(preset: MapStylePresetKey): string {
  return MAP_STYLE_PRESETS[preset];
}
