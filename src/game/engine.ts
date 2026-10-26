import catalog from '../data/levelCatalog.json';

export type Cell = { x: number; y: number };
export type Direction = { x: number; y: number };
export type Arrow = { id: string; cells: Cell[]; direction: Direction };
export type Puzzle = { id: number; size: number; arrows: Arrow[] };

export const levelIds = catalog.levelIds;
export const TOTAL_LEVELS = levelIds.length;
const directions: Direction[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];
export const cellKey = ({ x, y }: Cell) => `${x},${y}`;
const inside = (cell: Cell, size: number) =>
  cell.x >= 0 && cell.x < size && cell.y >= 0 && cell.y < size;

/* eslint-disable no-bitwise -- Mulberry32 requires integer bit operations. */
function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let n = Math.imul(value ^ (value >>> 15), 1 | value);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Uses the archive's ordered IDs, with original boards generated here.
 * Every added arrow has a clear exit through all older arrows. Removing
 * arrows in reverse creation order is therefore a constructive solution.
 */
/* eslint-enable no-bitwise */
export function createPuzzle(index: number): Puzzle {
  if (!Number.isInteger(index) || index < 0 || index >= TOTAL_LEVELS) {
    throw new Error('Invalid level index');
  }
  const id = levelIds[index];
  const random = seededRandom(id * 7919 + 42);
  const size =
    index < 3 ? 7 : index < 12 ? 8 : 9 + (Math.floor(index / 12) % 3);
  const target = Math.floor((size * size) / 4.3);
  const occupied = new Set<string>();
  const arrows: Arrow[] = [];

  for (let attempt = 0; attempt < 3000 && arrows.length < target; attempt++) {
    const head = {
      x: Math.floor(random() * size),
      y: Math.floor(random() * size),
    };
    const direction = directions[Math.floor(random() * directions.length)];
    const behind = { x: head.x - direction.x, y: head.y - direction.y };
    if (
      !inside(behind, size) ||
      occupied.has(cellKey(head)) ||
      occupied.has(cellKey(behind))
    ) {
      continue;
    }
    const ray = new Set<string>();
    let next = { x: head.x + direction.x, y: head.y + direction.y };
    let blocked = false;
    while (inside(next, size)) {
      ray.add(cellKey(next));
      if (occupied.has(cellKey(next))) {
        blocked = true;
        break;
      }
      next = { x: next.x + direction.x, y: next.y + direction.y };
    }
    if (blocked) {
      continue;
    }
    const backwards: Cell[] = [head, behind];
    const visited = new Set(backwards.map(cellKey));
    const length = 3 + Math.floor(random() * (index < 3 ? 3 : 6));
    while (backwards.length < length) {
      const tail = backwards[backwards.length - 1];
      const choices = directions
        .map(d => ({ x: tail.x + d.x, y: tail.y + d.y }))
        .filter(
          c =>
            inside(c, size) &&
            !occupied.has(cellKey(c)) &&
            !visited.has(cellKey(c)) &&
            !ray.has(cellKey(c)),
        );
      if (!choices.length) {
        break;
      }
      const cell = choices[Math.floor(random() * choices.length)];
      backwards.push(cell);
      visited.add(cellKey(cell));
    }
    backwards.forEach(c => occupied.add(cellKey(c)));
    arrows.push({
      id: `${id}-${arrows.length}`,
      cells: backwards.reverse(),
      direction,
    });
  }
  return { id, size, arrows };
}

export function canRemoveArrow(
  puzzle: Puzzle,
  arrow: Arrow,
  removed: readonly string[],
): boolean {
  const removedIds = new Set(removed);
  if (removedIds.has(arrow.id)) {
    return false;
  }
  // Include the arrow's own tail: an arrow cannot pass through itself.
  const occupied = new Set(
    puzzle.arrows
      .filter(a => !removedIds.has(a.id))
      .flatMap(a => a.cells.map(cellKey)),
  );
  const head = arrow.cells[arrow.cells.length - 1];
  let cell = { x: head.x + arrow.direction.x, y: head.y + arrow.direction.y };
  while (inside(cell, puzzle.size)) {
    if (occupied.has(cellKey(cell))) {
      return false;
    }
    cell = { x: cell.x + arrow.direction.x, y: cell.y + arrow.direction.y };
  }
  return true;
}

export function getHint(
  puzzle: Puzzle,
  removed: readonly string[],
): Arrow | undefined {
  return puzzle.arrows.find(a => canRemoveArrow(puzzle, a, removed));
}

export function levelTitle(index: number) {
  if (index < 3) {
    return 'İlk adımlar';
  }
  if (index < 12) {
    return 'Ritmini bul';
  }
  return ['Yeni bir bakış', 'Yönünü keşfet', 'Düğümleri çöz', 'Akışa bırak'][
    Math.floor(index / 12) % 4
  ];
}
