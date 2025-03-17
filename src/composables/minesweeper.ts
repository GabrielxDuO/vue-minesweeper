import { randomInt } from "@/utils";
import { ref, type Ref } from "vue";

export type CellState = {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed?: boolean;
  isFlagged?: boolean;
  isExploded?: boolean;
  clue: number;
};

const DIRECTIONS: [x: number, y: number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

export type GameDifficulty = "beginner" | "intermediate" | "expert" | "custom";

export type GameSettings = {
  width: number;
  height: number;
  mines: number;
};

export const DIFFICULTY_PRESETS: Record<
  Exclude<GameDifficulty, "custom">,
  GameSettings
> = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
} as const;

export type GameStatus = "ready" | "playing" | "won" | "lost";

export type GameState = {
  width: number;
  height: number;
  mines: number;
  difficulty: GameDifficulty;
  board: CellState[][];
  status: GameStatus;
  startMS?: number;
  endMS?: number;
};

// TODO: refactor to composable
export class Minesweeper {
  state = ref() as Ref<GameState>;

  get width() {
    return this.state.value.width;
  }

  get height() {
    return this.state.value.height;
  }

  get mines() {
    return this.state.value.mines;
  }

  get difficulty() {
    return this.state.value.difficulty;
  }

  get board() {
    return this.state.value.board;
  }

  get status() {
    return this.state.value.status;
  }

  get restMines() {
    switch (this.status) {
      case "playing":
      case "lost":
        return (
          this.mines -
          this.cells.reduce((sum, c) => sum + (c.isFlagged ? 1 : 0), 0)
        );
      case "won":
        return 0;
      default:
        return this.mines;
    }
  }

  private set status(v) {
    this.state.value.status = v;
  }

  private get cells() {
    return this.state.value.board.flat();
  }

  constructor(width: number, height: number, mines: number) {
    this.reset("custom", { width, height, mines });
  }

  reset(difficulty: GameDifficulty, settings?: GameSettings) {
    if (difficulty === "custom" && !settings) {
      throw new Error("settings are required for custom difficulty");
    }

    const { width, height, mines } =
      difficulty === "custom" ? settings! : DIFFICULTY_PRESETS[difficulty];

    this.state.value = {
      width,
      height,
      mines,
      difficulty,
      board: Array.from({ length: height }, (_, x) =>
        Array.from(
          { length: width },
          (_, y) => ({ x, y, clue: 0, isMine: false }) as CellState
        )
      ),
      status: "ready",
    };
  }

  generateMines(cell: CellState) {
    const randomPlaceMine = () => {
      const x = randomInt(0, this.height - 1);
      const y = randomInt(0, this.width - 1);

      if (this.board[x][y].isMine) return false;
      if (
        (cell.x === x && Math.abs(cell.y - y) <= 1) ||
        (cell.y === y && Math.abs(cell.x - x) <= 1)
      )
        return false;

      this.board[x][y].isMine = true;
      return true;
    };

    Array.from({ length: this.mines }).forEach(() => {
      for (let placed = false; !placed; placed = randomPlaceMine());
    });

    this.updateClues();
  }

  updateClues() {
    this.cells.forEach(cell => {
      if (cell.isMine) return;

      cell.clue = this.getNeighbors(cell).reduce(
        (sum, c) => sum + Number(c.isMine),
        0
      );
    });
  }

  getNeighbors(cell: CellState): CellState[] {
    return DIRECTIONS.reduce((c, [dx, dy]) => {
      const x = cell.x + dx;
      const y = cell.y + dy;
      if (x >= 0 && x < this.height && y >= 0 && y < this.width) {
        c.push(this.board[x][y]);
      }
      return c;
    }, [] as CellState[]);
  }

  openCell(cell: CellState) {
    if (this.status === "ready") {
      this.generateMines(cell);
      this.status = "playing";
      this.state.value.startMS = Date.now();
    }

    if (this.status !== "playing") return;

    // TODO: what should happen if cells are flagged before the mines are generated?
    // 1. generate mines immediately after the first cell is flagged
    // 2. do not generate mines until the first cell is opened
    // 3. just blow up the whole board
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    if (cell.isMine) cell.isExploded = true;
    else this.openSafeNeighbors(cell);
  }

  openSafeNeighbors(cell: CellState) {
    if (cell.clue) return;

    this.getNeighbors(cell).forEach(c => {
      if (c.isRevealed || c.isFlagged) return;

      // `neighbor` will never be a mine (DFS stops when reaching the first cell that clue > 0)
      c.isRevealed = true;

      this.openSafeNeighbors(c);
    });
  }

  flagCell(cell: CellState) {
    if (this.status !== "playing") return;
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
  }

  // This operation may still trigger unrevealed mines when the count of neighboring mines matches the clue number but the actual mine positions are not correctly flagged.
  // Players should acknowledge that this is not a bug, but a feature
  chording(cell: CellState) {
    if (this.status !== "playing") return;
    if (!cell.isRevealed || cell.isFlagged) return;
    const neighbors = this.getNeighbors(cell);

    // If neighbor flagged === neighbor mines => valid
    const flags = neighbors.reduce((acc, c) => acc + (c.isFlagged ? 1 : 0), 0);
    if (flags === cell.clue)
      neighbors
        .filter(c => !c.isRevealed)
        .forEach(c => {
          this.openCell(c);
        });
  }

  revealAllMines() {
    this.cells
      .filter(c => c.isMine)
      .forEach(c => {
        c.isRevealed = true;
      });
  }

  flagAllMines() {
    this.cells
      .filter(c => c.isMine)
      .forEach(c => {
        c.isFlagged = true;
      });
  }

  checkGameState() {
    if (this.status !== "playing") return;

    if (this.cells.some(c => c.isRevealed && c.isMine)) {
      this.status = "lost";
      this.revealAllMines();
      this.state.value.endMS = Date.now();
    } else if (this.cells.every(c => c.isRevealed || c.isMine)) {
      this.status = "won";
      this.flagAllMines();
      this.state.value.endMS = Date.now();
    }
  }
}
