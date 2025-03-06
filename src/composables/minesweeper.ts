import { DIRECTIONS } from "@/constants";
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

export type GameState = "unstarted" | "playing" | "won" | "lost";

export class Minesweeper {
  readonly board = ref() as Ref<CellState[][]>;
  readonly state = ref("unstarted") as Ref<GameState>;

  constructor(
    public width: number,
    public height: number
  ) {
    if (!this.loadData()) this.reset();
  }

  reset() {
    this.board.value = Array.from({ length: this.height }, (_, x) =>
      Array.from(
        { length: this.width },
        (_, y) => ({ x, y, isMine: false, clue: 0 }) as CellState
      )
    );
    this.state.value = "unstarted";
  }

  generateMines(cell: CellState): void {
    for (const row of this.board.value) {
      for (const curr of row) {
        if (cell.x == curr.x && cell.y == curr.y) continue;
        curr.isMine = Math.random() < 0.2;
      }
    }

    this.updateClues();
  }

  updateClues() {
    this.board.value.forEach(row =>
      row.forEach(cell => {
        if (cell.isMine) return;

        cell.clue = this.getNeighbors(cell).reduce(
          (accu, curr) => accu + Number(curr.isMine),
          0
        );
      })
    );
  }

  getNeighbors(cell: CellState): CellState[] {
    const neighbors: CellState[] = [];

    for (const [dx, dy] of DIRECTIONS) {
      const x = cell.x + dx;
      const y = cell.y + dy;

      if (x >= 0 && x < this.height && y >= 0 && y < this.width) {
        neighbors.push(this.board.value[x][y]);
      }
    }

    return neighbors;
  }

  openCell(cell: CellState) {
    if (this.state.value === "unstarted") {
      this.generateMines(cell);
      this.state.value = "playing";
    }

    if (this.state.value !== "playing") return;
    // TODO: what should happen if cells are flagged before the mines are generated?
    // 1. generate mines immediately after the first cell is flagged
    // 2. do not generate mines until the first cell is opened
    // 3. just blow up the whole board
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    if (cell.isMine) {
      cell.isExploded = true;
      return;
    }
    this.openSafeNeighbors(cell);
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
    if (this.state.value !== "playing") return;
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
  }

  revealAllMines() {
    for (const row of this.board.value) {
      for (const cell of row) {
        if (cell.isMine) cell.isRevealed = true;
      }
    }
  }

  checkGameState() {
    this.saveData();

    if (this.state.value !== "playing") return;

    const cellState = this.board.value.flat();

    if (cellState.some(cell => cell.isRevealed && cell.isMine)) {
      this.state.value = "lost";
      this.revealAllMines();
      return;
    }

    if (cellState.every(cell => cell.isRevealed || cell.isMine)) {
      this.state.value = "won";
    }
  }

  saveData() {
    const data = {
      board: this.board.value,
      state: this.state.value,
      width: this.width,
      height: this.height,
    };

    localStorage.setItem("minesweeper-data", JSON.stringify(data));
  }

  loadData(): boolean {
    const savedData = localStorage.getItem("minesweeper-data");

    if (!savedData) return false;

    try {
      const data = JSON.parse(savedData);
      this.board.value = data.board;
      this.state.value = data.state;
      this.width = data.width;
      this.height = data.height;
    } catch (e) {
      console.log("load data error:", e);
      return false;
    }

    return true;
  }
}
