import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Arrow, Cell, Puzzle } from '../game/engine';
import { colors } from '../theme';

const point = (cell: Cell) => ({ x: (cell.x + 1) * 32, y: (cell.y + 1) * 32 });
function pathFor(arrow: Arrow) {
  const points = arrow.cells.map(point);
  let body = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1];
    const b = points[i];
    const c = points[i + 1];
    const before = {
      x: b.x - Math.sign(b.x - a.x) * 6,
      y: b.y - Math.sign(b.y - a.y) * 6,
    };
    const after = {
      x: b.x + Math.sign(c.x - b.x) * 6,
      y: b.y + Math.sign(c.y - b.y) * 6,
    };
    body += ` L${before.x},${before.y} Q${b.x},${b.y} ${after.x},${after.y}`;
  }
  const head = points[points.length - 1];
  const { x: dx, y: dy } = arrow.direction;
  body += ` L${head.x},${head.y}`;
  const wing1 = { x: head.x - dx * 7 - dy * 7, y: head.y - dy * 7 + dx * 7 };
  const wing2 = { x: head.x - dx * 7 + dy * 7, y: head.y - dy * 7 - dx * 7 };
  const tip = `M${wing1.x},${wing1.y} L${head.x},${head.y} L${wing2.x},${wing2.y}`;
  return { body, tip };
}

function ArrowGlyph({
  arrow,
  color,
  exiting,
  onExit,
  onPress,
  extent,
  interactive,
}: {
  arrow: Arrow;
  color: string;
  exiting: boolean;
  onExit?: (id: string) => void;
  onPress?: (id: string) => void;
  extent: number;
  interactive: boolean;
}) {
  const animation = useRef(new Animated.Value(0)).current;
  const [fraction, setFraction] = useState(0);
  useEffect(() => {
    if (!exiting) {
      return;
    }
    const listener = animation.addListener(({ value }) => setFraction(value));
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      easing: Easing.in(Easing.quad),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        onExit?.(arrow.id);
      }
    });
    return () => {
      animation.stopAnimation();
      animation.removeListener(listener);
    };
  }, [animation, arrow.id, exiting, onExit]);
  const { body, tip } = pathFor(arrow);
  return (
    <G
      testID={`arrow-${arrow.id}`}
      accessible={interactive}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={
        interactive
          ? `Ok ${arrow.id.split('-')[1]}, çıkarmak için dokun`
          : undefined
      }
      onPress={interactive && !exiting ? () => onPress?.(arrow.id) : undefined}
      opacity={1 - fraction}
      transform={`translate(${arrow.direction.x * fraction * extent} ${
        arrow.direction.y * fraction * extent
      })`}
    >
      {interactive && (
        <Path
          d={`${body} ${tip}`}
          fill="none"
          stroke="transparent"
          strokeWidth={26}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <Path
        pointerEvents="none"
        d={`${body} ${tip}`}
        fill="none"
        stroke={color}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  );
}

export function ArrowBoard({
  puzzle,
  width,
  removed = [],
  exiting,
  hint,
  blocked,
  onPress,
  onExit,
  preview = false,
  disabled = false,
}: {
  puzzle: Puzzle;
  width: number;
  removed?: string[];
  exiting?: string | null;
  hint?: string | null;
  blocked?: string | null;
  onPress?: (id: string) => void;
  onExit?: (id: string) => void;
  preview?: boolean;
  disabled?: boolean;
}) {
  const extent = (puzzle.size + 1) * 32;
  return (
    <View
      testID={preview ? 'board-preview' : 'game-board'}
      style={[
        styles.board,
        { width, height: width },
        preview && styles.preview,
      ]}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${extent} ${extent}`}>
        {!preview &&
          Array.from({ length: puzzle.size * puzzle.size }, (_, i) => (
            <Circle
              key={i}
              cx={((i % puzzle.size) + 1) * 32}
              cy={(Math.floor(i / puzzle.size) + 1) * 32}
              r={1.6}
              fill="#E2E2DB"
            />
          ))}
        {puzzle.arrows
          .filter(a => !removed.includes(a.id))
          .map((arrow, index) => (
            <ArrowGlyph
              key={arrow.id}
              arrow={arrow}
              extent={extent}
              exiting={exiting === arrow.id}
              color={
                blocked === arrow.id
                  ? colors.red
                  : hint === arrow.id
                  ? colors.violet
                  : preview && index % 4 === 0
                  ? colors.violet
                  : preview && index % 5 === 0
                  ? colors.orange
                  : colors.ink
              }
              onPress={onPress}
              onExit={onExit}
              interactive={!preview && !disabled}
            />
          ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.paper,
    borderRadius: 28,
    overflow: 'hidden',
  },
  preview: { backgroundColor: 'transparent' },
});
