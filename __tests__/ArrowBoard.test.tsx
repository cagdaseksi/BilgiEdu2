import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Path } from 'react-native-svg';
import { ArrowBoard } from '../src/components/ArrowBoard';
import { Puzzle } from '../src/game/engine';

test('exit animates the body path and completes once after a parent rerender', async () => {
  jest.useFakeTimers();
  const puzzle: Puzzle = {
    id: 1,
    size: 7,
    arrows: [
      {
        id: '1-0',
        cells: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
        direction: { x: 1, y: 0 },
      },
    ],
  };
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  const firstCallback = jest.fn();
  const latestCallback = jest.fn();
  try {
    await act(() => {
      tree = ReactTestRenderer.create(
        <ArrowBoard
          puzzle={puzzle}
          width={256}
          exiting="1-0"
          onExit={firstCallback}
        />,
      );
    });
    const initial = tree!.root.findAllByType(Path).map(p => p.props.d);
    await act(() => jest.advanceTimersByTime(200));
    expect(tree!.root.findAllByType(Path).map(p => p.props.d)).not.toEqual(
      initial,
    );
    expect(firstCallback).not.toHaveBeenCalled();
    await act(() => {
      tree!.update(
        <ArrowBoard
          puzzle={puzzle}
          width={256}
          exiting="1-0"
          onExit={latestCallback}
        />,
      );
    });
    await act(() => jest.advanceTimersByTime(1500));
    expect(firstCallback).not.toHaveBeenCalled();
    expect(latestCallback).toHaveBeenCalledTimes(1);
    expect(latestCallback).toHaveBeenCalledWith('1-0');
    await act(() => {
      tree!.update(<ArrowBoard puzzle={puzzle} width={256} />);
    });
    expect(tree!.root.findAllByType(Path).map(p => p.props.d)).toEqual(initial);
  } finally {
    await act(() => tree?.unmount());
    jest.useRealTimers();
  }
});
