export type CellState = {
  x: number;
  y: number;
  isMine: boolean;
  isOpened?: boolean;
  isFlagged?: boolean;
  clue: number;
};
