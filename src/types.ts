export type CellState = {
  x: number;
  y: number;
  isMine: boolean;
  isOpened?: boolean;
  isFlagged?: boolean;
  isRevealed?: boolean;
  clue: number;
};

export type GameState = "unstarted" | "playing" | "won" | "lost";
