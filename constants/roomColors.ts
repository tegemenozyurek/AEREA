export type RoomColorId = 'slate' | 'sky' | 'lavender' | 'mint' | 'rose';

export type RoomColorTheme = {
  id: RoomColorId;
  label: string;
  swatch: string;
  panelBg: string;
  panelExpandedBg: string;
  panelBorder: string;
  panelExpandedBorder: string;
  toggleText: string;
  refreshBg: string;
  refreshBorder: string;
};

export const DEFAULT_ROOM_COLOR_ID: RoomColorId = 'slate';

export const ROOM_COLORS: RoomColorTheme[] = [
  {
    id: 'slate',
    label: 'Default',
    swatch: '#6B7280',
    panelBg: 'rgba(38, 46, 62, 0.82)',
    panelExpandedBg: 'rgba(44, 54, 72, 0.92)',
    panelBorder: 'rgba(255,255,255,0.14)',
    panelExpandedBorder: 'rgba(96,165,250,0.28)',
    toggleText: 'rgba(147,197,253,0.9)',
    refreshBg: 'rgba(96,165,250,0.14)',
    refreshBorder: 'rgba(96,165,250,0.3)',
  },
  {
    id: 'sky',
    label: 'Sky',
    swatch: '#7CB9E8',
    panelBg: 'rgba(42, 68, 98, 0.84)',
    panelExpandedBg: 'rgba(48, 78, 112, 0.92)',
    panelBorder: 'rgba(125, 211, 252, 0.18)',
    panelExpandedBorder: 'rgba(125, 211, 252, 0.32)',
    toggleText: 'rgba(186, 230, 253, 0.95)',
    refreshBg: 'rgba(125, 211, 252, 0.16)',
    refreshBorder: 'rgba(125, 211, 252, 0.32)',
  },
  {
    id: 'lavender',
    label: 'Lavender',
    swatch: '#A898D8',
    panelBg: 'rgba(58, 52, 88, 0.84)',
    panelExpandedBg: 'rgba(68, 60, 102, 0.92)',
    panelBorder: 'rgba(196, 181, 253, 0.18)',
    panelExpandedBorder: 'rgba(196, 181, 253, 0.32)',
    toggleText: 'rgba(221, 214, 254, 0.95)',
    refreshBg: 'rgba(196, 181, 253, 0.16)',
    refreshBorder: 'rgba(196, 181, 253, 0.32)',
  },
  {
    id: 'mint',
    label: 'Mint',
    swatch: '#72C4B0',
    panelBg: 'rgba(42, 72, 68, 0.84)',
    panelExpandedBg: 'rgba(48, 82, 76, 0.92)',
    panelBorder: 'rgba(110, 231, 183, 0.18)',
    panelExpandedBorder: 'rgba(110, 231, 183, 0.28)',
    toggleText: 'rgba(167, 243, 208, 0.95)',
    refreshBg: 'rgba(110, 231, 183, 0.14)',
    refreshBorder: 'rgba(110, 231, 183, 0.3)',
  },
  {
    id: 'rose',
    label: 'Rose',
    swatch: '#D896A7',
    panelBg: 'rgba(88, 58, 72, 0.84)',
    panelExpandedBg: 'rgba(98, 66, 82, 0.92)',
    panelBorder: 'rgba(253, 164, 175, 0.18)',
    panelExpandedBorder: 'rgba(253, 164, 175, 0.32)',
    toggleText: 'rgba(254, 205, 211, 0.95)',
    refreshBg: 'rgba(253, 164, 175, 0.16)',
    refreshBorder: 'rgba(253, 164, 175, 0.32)',
  },
];

export function getRoomColorTheme(colorId?: RoomColorId): RoomColorTheme {
  return ROOM_COLORS.find((color) => color.id === colorId) ?? ROOM_COLORS[0];
}
