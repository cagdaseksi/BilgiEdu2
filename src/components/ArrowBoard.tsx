import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Arrow, Puzzle } from '../game/engine';
import { arrowFrame, createArrowRoute } from '../game/arrowPath';
import { colors } from '../theme';

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
  const route = useMemo(() => createArrowRoute(arrow, extent), [arrow, extent]);
  const exitCallback = useRef(onExit);
  exitCallback.current = onExit;
  useEffect(() => {
    if (!exiting) {
      animation.setValue(0);
      setFraction(0);
      return;
    }
    const listener = animation.addListener(({ value }) => setFraction(value));
    Animated.timing(animation, {
      toValue: 1,
      duration: Math.max(450, route.travel / 0.55),
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        exitCallback.current?.(arrow.id);
      }
    });
    return () => {
      animation.stopAnimation();
      animation.removeListener(listener);
    };
  }, [animation, arrow.id, exiting, route.travel]);
  const { body, tip } = arrowFrame(route, fraction);
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
