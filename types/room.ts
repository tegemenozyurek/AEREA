import type { Machine } from './machine';

export type Room = {
  id: string;
  name: string;
  machines: Machine[];
};
