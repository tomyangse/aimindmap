export interface MindMapData {
  id: string;
  label: string;
  children?: MindMapData[];
  isCollapsed?: boolean;
  note?: string;
  color?: string; // Background color for the node
}

export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}
