import { emptyProgress, nextLevel, parseProgress } from '../src/state/progress';

test('restores only valid completion results and tolerates corrupt storage', () => {
  expect(parseProgress('{broken')).toEqual(emptyProgress());
  expect(parseProgress(null)).toEqual(emptyProgress());
  expect(parseProgress(JSON.stringify({ version: 99, completed: {} }))).toEqual(
    emptyProgress(),
  );
  expect(
    parseProgress(
      JSON.stringify({
        version: 1,
        completed: {
          0: { stars: 3, moves: 12 },
          1: { stars: 4, moves: 10 },
          2: null,
          1055: { stars: 2, moves: 5 },
          3: { stars: 2, moves: -1 },
        },
      }),
    ),
  ).toEqual({ version: 1, completed: { 0: { stars: 3, moves: 12 } } });
});

test('unlocks levels in order without skipping a gap', () => {
  expect(nextLevel(emptyProgress())).toBe(0);
  expect(
    nextLevel({
      version: 1,
      completed: { 0: { stars: 3, moves: 10 }, 2: { stars: 3, moves: 10 } },
    }),
  ).toBe(1);
});
