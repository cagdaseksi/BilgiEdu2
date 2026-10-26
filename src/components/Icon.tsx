import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type IconName =
  | 'arrow'
  | 'back'
  | 'grid'
  | 'home'
  | 'settings'
  | 'lock'
  | 'check'
  | 'heart'
  | 'hint'
  | 'restart'
  | 'pause'
  | 'close'
  | 'star'
  | 'spark'
  | 'chevron'
  | 'play';
const paths: Partial<Record<IconName, string>> = {
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6-6-6 6 6 6',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M12 15v2',
  check: 'm5 12 4 4L19 6',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  hint: 'M9 18h6m-5 3h4M8.2 13.3a6 6 0 1 1 7.6 0c-.8.6-.8 1.7-.8 2.7H9c0-1-.0-2.1-.8-2.7Z',
  restart: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
  pause: 'M8 5v14M16 5v14',
  close: 'm6 6 12 12M6 18 18 6',
  star: 'm12 2 3 6.1 6.7 1-4.9 4.7 1.2 6.7-6-3.2-6 3.2 1.2-6.7-4.9-4.7 6.7-1Z',
  spark: 'm12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z',
  chevron: 'm9 5 7 7-7 7',
  play: 'm8 4 12 8-12 8Z',
  settings:
    'M9.5 3h5l.6 2.3 2 .9 2.1-.7 2.5 4.3-1.7 1.6v2.3l1.7 1.5-2.5 4.3-2.1-.6-2 .9-.6 2.2h-5L9 19.8l-2-.9-2.1.6-2.5-4.3L4 13.7v-2.3L2.4 9.8l2.5-4.3 2.1.7 2-.9Z',
};

export function Icon({
  name,
  size = 24,
  color = colors.ink,
  filled = false,
}: {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
    >
      {name === 'grid' ? (
        [3, 14].flatMap(x =>
          [3, 14].map(y => (
            <Rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={7}
              height={7}
              rx={2}
              stroke={color}
              strokeWidth={1.7}
              fill={filled ? color : 'none'}
            />
          )),
        )
      ) : (
        <Path
          d={paths[name]}
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={filled ? color : 'none'}
        />
      )}
      {name === 'lock' && (
        <Rect
          x={5}
          y={10}
          width={14}
          height={11}
          rx={3}
          stroke={color}
          strokeWidth={1.8}
        />
      )}
      {name === 'settings' && (
        <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
      )}
    </Svg>
  );
}
