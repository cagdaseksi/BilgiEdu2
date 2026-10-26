import { Arrow, Cell } from './engine';

type Point = { x: number; y: number };
export const CELL_SPACING = 32;
const CORNER_RADIUS = 6;
const point = (cell: Cell): Point => ({
  x: (cell.x + 1) * CELL_SPACING,
  y: (cell.y + 1) * CELL_SPACING,
});
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const between = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/** A fixed route from the tail, through the rounded bends, to the exit. */
export function createArrowRoute(arrow: Arrow, extent: number) {
  const cells = arrow.cells.map(point);
  const points: Point[] = [cells[0]];
  for (let i = 1; i < cells.length - 1; i++) {
    const a = cells[i - 1];
    const b = cells[i];
    const c = cells[i + 1];
    // Straight sections do not need an extra curve.
    if (a.x === c.x || a.y === c.y) {
      points.push(b);
      continue;
    }
    const before = {
      x: b.x - Math.sign(b.x - a.x) * CORNER_RADIUS,
      y: b.y - Math.sign(b.y - a.y) * CORNER_RADIUS,
    };
    const after = {
      x: b.x + Math.sign(c.x - b.x) * CORNER_RADIUS,
      y: b.y + Math.sign(c.y - b.y) * CORNER_RADIUS,
    };
    points.push(before);
    // Sample the same rounded route for drawing and measuring travel distance.
    for (let step = 1; step <= 8; step++) {
      const t = step / 8;
      points.push(between(between(before, b, t), between(b, after, t), t));
    }
  }
  const head = cells[cells.length - 1];
  points.push(head);
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
  }
  const bodyLength = lengths[lengths.length - 1];
  const { x: dx, y: dy } = arrow.direction;
  const toEdge =
    dx > 0
      ? extent - head.x
      : dx < 0
      ? head.x
      : dy > 0
      ? extent - head.y
      : head.y;
  // Finish only after the tail and rounded stroke have cleared the board.
  const travel = bodyLength + toEdge + 12;
  points.push({ x: head.x + dx * travel, y: head.y + dy * travel });
  lengths.push(bodyLength + travel);
  return { points, lengths, bodyLength, travel, direction: arrow.direction };
}

type ArrowRoute = ReturnType<typeof createArrowRoute>;

function pointAt(route: ArrowRoute, offset: number): Point {
  const { points, lengths } = route;
  for (let i = 1; i < points.length; i++) {
    if (offset <= lengths[i]) {
      return between(
        points[i - 1],
        points[i],
        (offset - lengths[i - 1]) / (lengths[i] - lengths[i - 1]),
      );
    }
  }
  return points[points.length - 1];
}

/** Move a constant-length body along its own route, with the head leading. */
export function arrowFrame(route: ArrowRoute, fraction: number) {
  const offset = Math.max(0, Math.min(1, fraction)) * route.travel;
  const end = offset + route.bodyLength;
  const points = [pointAt(route, offset)];
  route.points.forEach((p, i) => {
    if (route.lengths[i] > offset && route.lengths[i] < end) {
      points.push(p);
    }
  });
  const head = pointAt(route, end);
  points.push(head);
  const { x: dx, y: dy } = route.direction;
  const wing1 = { x: head.x - dx * 7 - dy * 7, y: head.y - dy * 7 + dx * 7 };
  const wing2 = { x: head.x - dx * 7 + dy * 7, y: head.y - dy * 7 - dx * 7 };
  return {
    points,
    head,
    body: points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' '),
    tip: `M${wing1.x},${wing1.y} L${head.x},${head.y} L${wing2.x},${wing2.y}`,
  };
}
