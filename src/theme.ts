export const colors = {
  background: '#F8F7F3',
  paper: '#FFFFFF',
  ink: '#272A30',
  muted: '#90928F',
  line: '#E8E8E2',
  violet: '#7760DA',
  violetDark: '#614BC4',
  lavender: '#EFEBFA',
  green: '#648775',
  mint: '#E8F0E9',
  orange: '#D98C5F',
  peach: '#F6EADF',
  red: '#DD7B7E',
};

export const levelNumber = (index: number) =>
  String(index + 1).padStart(2, '0');
