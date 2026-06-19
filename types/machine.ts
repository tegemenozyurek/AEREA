export type Machine = {
  id: string;
  name: string;
  online: boolean;
  ppm: number;
  ph: number;
  phDown: number;
  phUp: number;
  tankLevel: number;
  waterLevel: number;
  updatedAt: string;
};
