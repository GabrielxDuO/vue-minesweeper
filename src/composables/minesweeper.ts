import { DIRECTIONS } from "@/constants";
import type { CellState, GameState } from "@/types";
import { ref, type Ref } from "vue";

export class Minesweeper {
  readonly board = ref() as Ref<CellState[][]>;
  readonly state = ref<GameState>("unstarted");

  constructor(
    public width: number,
    public height: number
  ) {
    this.reset();
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
    if (cell.isOpened || cell.isFlagged) return;

    cell.isOpened = true;
    if (cell.isMine) return;
    this.openSafeNeighbors(cell);
  }

  openSafeNeighbors(cell: CellState) {
    if (cell.clue) return;

    this.getNeighbors(cell).forEach(neighbor => {
      if (neighbor.isOpened || neighbor.isFlagged) return;
      // `neighbor` will never be a mine (DFS stops when reaching the first cell that clue > 0)
      neighbor.isOpened = true;

      this.openSafeNeighbors(neighbor);
    });
  }

  flagCell(cell: CellState) {
    if (this.state.value !== "playing") return;
    if (cell.isOpened) return;

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
    if (this.state.value !== "playing") return;

    const cellState = this.board.value.flat();

    if (cellState.some(cell => cell.isOpened && cell.isMine)) {
      this.state.value = "lost";
      this.revealAllMines();
      return;
    }

    if (cellState.every(cell => cell.isOpened || cell.isMine)) {
      this.state.value = "won";
    }
  }
}
