import { DIRECTIONS } from "@/constants";
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

export type GameStatus = "ready" | "playing" | "won" | "lost";

export type GameState = {
  board: CellState[][];
  status: GameStatus;
};

export class Minesweeper {
  readonly state = ref() as Ref<GameState>;

  get board() {
    return this.state.value.board;
  }

  get status() {
    return this.state.value.status;
  }

  get restMines() {
    return this.status !== "playing"
      ? this.mines
      : this.mines -
          this.cells.reduce((sum, c) => sum + (c.isFlagged ? 1 : 0), 0);
  }

  private set status(v) {
    this.state.value.status = v;
  }

  private get cells() {
    return this.state.value.board.flat();
  }

  constructor(
    public width: number,
    public height: number,
    public mines: number
  ) {
    this.reset();
  }

  reset() {
    this.state.value = {
      board: Array.from({ length: this.height }, (_, x) =>
        Array.from(
          { length: this.width },
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
      return;
    }

    if (this.cells.every(c => c.isRevealed || c.isMine)) {
      this.status = "won";
    }
  }
}
