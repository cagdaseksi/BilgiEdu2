import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import App from '../App';
import { ArrowBoard } from '../src/components/ArrowBoard';
import { canRemoveArrow, createPuzzle, getHint } from '../src/game/engine';

const storage = createAsyncStorage('arrow-puzzle');
let tree: ReactTestRenderer.ReactTestRenderer;
const find = (testID: string) => tree.root.findByProps({ testID });
const press = (testID: string) =>
  act(() => {
    find(testID).props.onPress();
  });

beforeEach(async () => {
  await storage.clear();
  await act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });
});
afterEach(async () => {
  await act(async () => tree.unmount());
  jest.useRealTimers();
});

test('completing a board unlocks the next level and survives an app restart', async () => {
  await press('play-button');
  const puzzle = createPuzzle(0);
  const removed: string[] = [];
  while (removed.length < puzzle.arrows.length) {
    const arrow = getHint(puzzle, removed)!;
    await press(`arrow-${arrow.id}`);
    // Simulate the completion event emitted by the native SVG exit animation.
    await act(() => tree.root.findByType(ArrowBoard).props.onExit(arrow.id));
    removed.push(arrow.id);
  }
  expect(find('next-level-button')).toBeTruthy();
  const saved = JSON.parse((await storage.getItem('progress-v1'))!);
  expect(saved.completed['0']).toEqual({
    stars: 3,
    moves: puzzle.arrows.length,
  });
  await press('next-level-button');
  expect(find('game-level').props.children).toEqual(['SEVİYE ', '02']);
  await act(async () => tree.unmount());
  await act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });
  await press('play-button');
  expect(find('game-level').props.children).toEqual(['SEVİYE ', '02']);
});

test('opens the level grid, keeps later levels locked, and starts a game', async () => {
  expect(find('home-screen')).toBeTruthy();
  await press('discover-levels');
  expect(find('levels-screen')).toBeTruthy();
  await press('level-2');
  expect(find('levels-screen')).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'game-screen' })).toHaveLength(0);
  await press('level-1');
  expect(find('game-screen')).toBeTruthy();
  await press('hint-button');
  expect(find('game-message').props.children).toContain('Mor okun');
  await press('pause-button');
  await press('resume-button');
  expect(find('game-screen')).toBeTruthy();
});

test('three blocked taps show retry and a retry restores the board', async () => {
  await press('play-button');
  const puzzle = createPuzzle(0);
  const blocked = puzzle.arrows.find(a => !canRemoveArrow(puzzle, a, []));
  expect(blocked).toBeDefined();
  for (let i = 0; i < 3; i++) {
    await press(`arrow-${blocked!.id}`);
  }
  expect(find('retry-button')).toBeTruthy();
  await press('retry-button');
  expect(find('hearts').props.accessibilityLabel).toBe('3 can kaldı');
});
