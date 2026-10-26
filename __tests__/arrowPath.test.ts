import { arrowFrame, createArrowRoute } from '../src/game/arrowPath';
import { Arrow, createPuzzle } from '../src/game/engine';

test('a bent arrow pulls its tail around the bend instead of sliding sideways', () => {
  const arrow: Arrow = {
    id: 'bent',
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    direction: { x: 1, y: 0 },
  };
  const route = createArrowRoute(arrow, 256);
  const frame = arrowFrame(route, 16 / route.travel);
  expect(frame.points[0]).toEqual({ x: 32, y: 48 });
  expect(frame.head).toEqual({ x: 80, y: 64 });
  // Once the tail clears the original bend the whole body is straight.
  expect(
    arrowFrame(route, route.bodyLength / route.travel).points.every(
      p => p.y === 64,
    ),
  ).toBe(true);
});

test('all exit directions keep body length and head direction until the tail clears the board', () => {
  // Include straight, short and multiply bent generated arrows in all directions.
  const seen = new Set<string>();
  for (const level of [0, 3, 12, 100, 500, 1054]) {
    const puzzle = createPuzzle(level);
    const extent = (puzzle.size + 1) * 32;
    for (const arrow of puzzle.arrows) {
      const route = createArrowRoute(arrow, extent);
      const head = arrowFrame(route, 0).head;
      seen.add(`${arrow.direction.x},${arrow.direction.y}`);
      for (const fraction of [0, 0.03, 0.13, 0.37, 0.68, 1]) {
        const frame = arrowFrame(route, fraction);
        const length = frame.points
          .slice(1)
          .reduce(
            (sum, p, i) =>
              sum +
              Math.hypot(p.x - frame.points[i].x, p.y - frame.points[i].y),
            0,
          );
        expect(length).toBeCloseTo(route.bodyLength, 8);
        expect(frame.head.x).toBeCloseTo(
          head.x + arrow.direction.x * route.travel * fraction,
          8,
        );
        expect(frame.head.y).toBeCloseTo(
          head.y + arrow.direction.y * route.travel * fraction,
          8,
        );
        expect(frame.body).not.toMatch(/NaN|Infinity/);
      }
      const tail = arrowFrame(route, 1).points[0];
      if (arrow.direction.x > 0) expect(tail.x).toBeGreaterThan(extent);
      if (arrow.direction.x < 0) expect(tail.x).toBeLessThan(0);
      if (arrow.direction.y > 0) expect(tail.y).toBeGreaterThan(extent);
      if (arrow.direction.y < 0) expect(tail.y).toBeLessThan(0);
    }
  }
  expect(seen.size).toBe(4);
});
