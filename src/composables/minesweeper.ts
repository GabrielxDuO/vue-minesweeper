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
      const x = randomInt(0, this.height);
      const y = randomInt(0, this.width);

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
    return DIRECTIONS.reduce((neighbors, [dx, dy]) => {
      const x = cell.x + dx;
      const y = cell.y + dy;
      if (x >= 0 && x < this.height && y >= 0 && y < this.width) {
        neighbors.push(this.board[x][y]);
      }
      return neighbors;
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

    this.getNeighbors(cell).forEach(neighbor => {
      if (neighbor.isRevealed || neighbor.isFlagged) return;

      // `neighbor` will never be a mine (DFS stops when reaching the first cell that clue > 0)
      neighbor.isRevealed = true;

      this.openSafeNeighbors(neighbor);
    });
  }

  flagCell(cell: CellState) {
    if (this.status !== "playing") return;
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
  }

  revealAllMines() {
    this.cells
      .filter(c => c.isMine)
      .forEach(c => {
        c.isRevealed = true;
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
      this.state.value.endMS = Date.now();
    }
  }
}
