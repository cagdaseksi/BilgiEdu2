import {
  canRemoveArrow,
  cellKey,
  createPuzzle,
  getHint,
  levelIds,
  Puzzle,
  TOTAL_LEVELS,
} from '../src/game/engine';

test('all imported level IDs have deterministic, collision-free, solvable boards', () => {
  expect(TOTAL_LEVELS).toBe(1055);
  expect(new Set(levelIds).size).toBe(TOTAL_LEVELS);
  for (let index = 0; index < TOTAL_LEVELS; index++) {
    const puzzle = createPuzzle(index);
    expect(puzzle.arrows.length).toBeGreaterThan(4);
    const occupied = new Set<string>();
    for (const arrow of puzzle.arrows) {
      expect(arrow.cells.length).toBeGreaterThanOrEqual(2);
      arrow.cells.forEach((cell, i) => {
        const key = cellKey(cell);
        expect(occupied.has(key)).toBe(false);
        occupied.add(key);
        expect(
          cell.x >= 0 &&
            cell.y >= 0 &&
            cell.x < puzzle.size &&
            cell.y < puzzle.size,
        ).toBe(true);
        if (i > 0) {
          const previous = arrow.cells[i - 1];
          expect(
            Math.abs(cell.x - previous.x) + Math.abs(cell.y - previous.y),
          ).toBe(1);
        }
      });
      const head = arrow.cells[arrow.cells.length - 1];
      const neck = arrow.cells[arrow.cells.length - 2];
      expect(arrow.direction).toEqual({
        x: head.x - neck.x,
        y: head.y - neck.y,
      });
    }
    const removed: string[] = [];
    while (removed.length < puzzle.arrows.length) {
      const hint = getHint(puzzle, removed);
      if (!hint) {
        throw new Error(
          `Level ${index + 1} has no solution after ${removed.length} removals`,
        );
      }
      removed.push(hint.id);
    }
    expect(getHint(puzzle, removed)).toBeUndefined();
  }
  expect(createPuzzle(12)).toEqual(createPuzzle(12));
});

test('a blocked arrow stays until the arrow in front leaves', () => {
  const puzzle: Puzzle = {
    id: 1,
    size: 5,
    arrows: [
      {
        id: 'a',
        cells: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
        ],
        direction: { x: 1, y: 0 },
      },
      {
        id: 'b',
        cells: [
          { x: 3, y: 2 },
          { x: 3, y: 1 },
        ],
        direction: { x: 0, y: -1 },
      },
    ],
  };
  expect(canRemoveArrow(puzzle, puzzle.arrows[0], [])).toBe(false);
  expect(canRemoveArrow(puzzle, puzzle.arrows[1], [])).toBe(true);
  expect(canRemoveArrow(puzzle, puzzle.arrows[0], ['b'])).toBe(true);
  expect(canRemoveArrow(puzzle, puzzle.arrows[0], ['a'])).toBe(false);
});

test('rejects indices outside the imported catalogue', () => {
  for (const index of [-1, TOTAL_LEVELS, 1.5, NaN]) {
    expect(() => createPuzzle(index)).toThrow('Invalid level index');
  }
});
