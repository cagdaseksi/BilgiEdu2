import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowBoard } from '../components/ArrowBoard';
import { Icon } from '../components/Icon';
import {
  common,
  Dialog,
  IconButton,
  PrimaryButton,
  TextButton,
} from '../components/UI';
import {
  canRemoveArrow,
  createPuzzle,
  getHint,
  levelTitle,
  TOTAL_LEVELS,
} from '../game/engine';
import { Result } from '../state/progress';
import { colors, levelNumber } from '../theme';

type GameDialog = 'pause' | 'win' | 'lose' | 'help' | null;
export function GameScreen({
  index,
  onHome,
  onLevels,
  onNext,
  onComplete,
}: {
  index: number;
  onHome: () => void;
  onLevels: () => void;
  onNext: () => void;
  onComplete: (index: number, result: Result) => void;
}) {
  const puzzle = useMemo(() => createPuzzle(index), [index]);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const boardWidth = Math.min(
    width - 40,
    430,
    Math.max(240, height - insets.top - insets.bottom - 430),
  );
  const [removed, setRemoved] = useState<string[]>([]);
  const [exiting, setExiting] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [hearts, setHearts] = useState(3);
  const [hints, setHints] = useState(3);
  const [moves, setMoves] = useState(0);
  const [dialog, setDialog] = useState<GameDialog>(null);
  const [message, setMessage] = useState('');
  const busy = useRef(false);
  const blockedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isComplete = removed.length === puzzle.arrows.length;
  const remaining = puzzle.arrows.length - removed.length;

  useEffect(
    () => () => {
      if (blockedTimer.current) {
        clearTimeout(blockedTimer.current);
      }
    },
    [],
  );
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setDialog(previous =>
          previous === 'pause'
            ? null
            : previous === 'win' || previous === 'lose'
            ? previous
            : 'pause',
        );
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

  const removeArrow = useCallback(
    (id: string) => {
      setRemoved(previous => [...previous, id]);
      setExiting(null);
      busy.current = false;
      if (removed.length + 1 === puzzle.arrows.length) {
        onComplete(index, { stars: hearts, moves });
        setDialog('win');
      }
    },
    [hearts, index, moves, onComplete, puzzle.arrows.length, removed.length],
  );

  function tapArrow(id: string) {
    if (busy.current || hearts === 0 || dialog || isComplete) {
      return;
    }
    const arrow = puzzle.arrows.find(a => a.id === id);
    if (!arrow || removed.includes(id)) {
      return;
    }
    setHint(null);
    setMoves(count => count + 1);
    if (canRemoveArrow(puzzle, arrow, removed)) {
      busy.current = true;
      setMessage('');
      setExiting(id);
    } else {
      setBlocked(id);
      setMessage('Bu okun yolu kapalı. Önce önündeki oku çıkar.');
      setHearts(count => count - 1);
      if (hearts === 1) {
        setDialog('lose');
      }
      if (blockedTimer.current) {
        clearTimeout(blockedTimer.current);
      }
      blockedTimer.current = setTimeout(() => setBlocked(null), 650);
    }
  }

  function showHint() {
    if (busy.current || dialog || isComplete || hearts === 0) {
      return;
    }
    if (!hints) {
      setMessage(
        'Bu denemedeki ipuçlarını kullandın. Sakin ol, yolu bulabilirsin.',
      );
      return;
    }
    const arrow = getHint(puzzle, removed);
    if (arrow) {
      setHint(arrow.id);
      setHints(count => count - 1);
      setMessage('Mor okun önü açık. Çıkarmak için ona dokun.');
    }
  }

  function restart() {
    if (blockedTimer.current) {
      clearTimeout(blockedTimer.current);
    }
    busy.current = false;
    setRemoved([]);
    setExiting(null);
    setHint(null);
    setBlocked(null);
    setHearts(3);
    setHints(3);
    setMoves(0);
    setDialog(null);
    setMessage('');
  }

  return (
    <View
      style={[common.fill, { paddingBottom: Math.max(insets.bottom, 18) }]}
      testID="game-screen"
    >
      <View style={styles.header}>
        <IconButton
          icon="back"
          label="Oyundan çıkış menüsü"
          onPress={() => setDialog('pause')}
          disabled={!!exiting}
          testID="game-back"
        />
        <View style={styles.levelHeading}>
          <Text style={common.eyebrow} testID="game-level">
            SEVİYE {levelNumber(index)}
          </Text>
          <Text style={styles.levelTitle}>{levelTitle(index)}</Text>
        </View>
        <IconButton
          icon="pause"
          label="Oyunu duraklat"
          onPress={() => setDialog('pause')}
          disabled={!!exiting}
          testID="pause-button"
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.statusRow}>
          <View
            style={styles.hearts}
            accessibilityLabel={`${hearts} can kaldı`}
            testID="hearts"
          >
            {[1, 2, 3].map(n => (
              <Icon
                key={n}
                name="heart"
                size={23}
                color={n <= hearts ? colors.red : '#DEDCD6'}
                filled={n <= hearts}
              />
            ))}
          </View>
          <View style={styles.counter}>
            <View style={styles.counterDot} />
            <Text style={styles.counterText}>{remaining} ok kaldı</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(removed.length / puzzle.arrows.length) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.boardHeading}>
          <Text style={styles.boardLabel}>BİR ÇIKIŞ YOLU BUL</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Oyun kuralları"
            onPress={() => setDialog('help')}
            hitSlop={12}
          >
            <View style={styles.infoIcon}>
              <Text style={styles.infoText}>i</Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.boardWrap}>
          <ArrowBoard
            puzzle={puzzle}
            width={boardWidth}
            removed={removed}
            exiting={exiting}
            hint={hint}
            blocked={blocked}
            onPress={tapArrow}
            onExit={removeArrow}
            disabled={!!dialog || hearts === 0 || !!exiting}
          />
        </View>
        <View style={styles.instruction}>
          <Icon
            name={blocked ? 'lock' : 'spark'}
            size={16}
            color={blocked ? colors.red : colors.violet}
          />
          <Text
            accessibilityLiveRegion="polite"
            testID="game-message"
            style={[styles.instructionText, blocked && styles.blockedText]}
          >
            {message || 'Önü açık oklara dokun, tahtayı temizle.'}
          </Text>
        </View>
        <View style={styles.tools}>
          <Pressable
            testID="hint-button"
            accessibilityRole="button"
            accessibilityLabel={`İpucu, ${hints} kullanım kaldı`}
            disabled={!!exiting || isComplete || hearts === 0}
            onPress={showHint}
            style={({ pressed }) => [styles.tool, pressed && styles.pressed]}
          >
            <View style={styles.hintIcon}>
              <Icon name="hint" size={25} color={colors.violet} />
              <View style={styles.hintBadge}>
                <Text style={styles.hintBadgeText}>{hints}</Text>
              </View>
            </View>
            <Text style={styles.toolLabel}>İpucu</Text>
          </Pressable>
          <View style={styles.toolDivider} />
          <Pressable
            testID="restart-button"
            accessibilityRole="button"
            accessibilityLabel="Seviyeyi yeniden başlat"
            disabled={!!exiting}
            onPress={() => setDialog('pause')}
            style={({ pressed }) => [styles.tool, pressed && styles.pressed]}
          >
            <View style={styles.restartIcon}>
              <Icon name="restart" size={24} color={colors.ink} />
            </View>
            <Text style={styles.toolLabel}>Yeniden başlat</Text>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>
            Acele yok. Sadece sen ve bulmaca.
          </Text>
          <View style={styles.footerLine} />
        </View>
      </ScrollView>
      <Dialog
        visible={dialog !== null}
        onClose={() => setDialog(null)}
        dismissible={dialog !== 'win' && dialog !== 'lose'}
      >
        {dialog === 'pause' && (
          <>
            <View style={common.dialogIcon}>
              <Icon name="pause" size={30} color={colors.violet} />
            </View>
            <Text style={common.dialogTitle}>Küçük bir mola.</Text>
            <Text style={common.dialogCopy}>
              Bulmacan seni bekliyor. Hazır olduğunda{'\n'}kaldığın yerden devam
              et.
            </Text>
            <PrimaryButton
              title="Oyuna devam et"
              icon="play"
              onPress={() => setDialog(null)}
              testID="resume-button"
            />
            <TextButton
              title="Seviyeyi yeniden başlat"
              onPress={restart}
              testID="confirm-restart"
            />
            <TextButton title="Seviyelere dön" onPress={onLevels} />
            <TextButton title="Ana sayfaya dön" onPress={onHome} />
          </>
        )}
        {dialog === 'help' && (
          <>
            <View style={common.dialogIcon}>
              <Icon name="hint" size={30} color={colors.violet} />
            </View>
            <Text style={common.dialogTitle}>Yolunu bul.</Text>
            <Text style={common.dialogCopy}>
              Her ok, ucunun gösterdiği yönde ilerler. Önünde başka bir ok yoksa
              tahtadan çıkar.{'\n\n'}Kapalı bir oka dokunmak bir can götürür.
              Tüm okları çıkararak seviyeyi tamamla. Takılırsan ipucuyla açık
              bir oku bul.
            </Text>
            <PrimaryButton
              title="Anladım, oynayalım"
              onPress={() => setDialog(null)}
            />
          </>
        )}
        {dialog === 'win' && (
          <>
            <View style={styles.winStars}>
              {[1, 2, 3].map(n => (
                <View key={n} style={n === 2 ? styles.middleStar : undefined}>
                  <Icon
                    name="star"
                    size={n === 2 ? 49 : 38}
                    color={n <= hearts ? colors.orange : colors.line}
                    filled
                  />
                </View>
              ))}
            </View>
            <Text style={common.dialogTitle}>Yolu buldun!</Text>
            <Text style={common.dialogCopy}>
              Seviye {levelNumber(index)} tamamlandı.{'\n'}Bir sonraki keşfe
              hazır mısın?
            </Text>
            <View style={styles.resultRow}>
              <View>
                <Text style={styles.resultValue}>{moves}</Text>
                <Text style={styles.resultLabel}>hamle</Text>
              </View>
              <View style={styles.resultDivider} />
              <View>
                <Text style={styles.resultValue}>{hearts}/3</Text>
                <Text style={styles.resultLabel}>kalan can</Text>
              </View>
            </View>
            <PrimaryButton
              title={
                index < TOTAL_LEVELS - 1 ? 'Sıradaki seviye' : 'Seviyelere dön'
              }
              onPress={index < TOTAL_LEVELS - 1 ? onNext : onLevels}
              testID="next-level-button"
            />
            <TextButton title="Seviyelere dön" onPress={onLevels} />
          </>
        )}
        {dialog === 'lose' && (
          <>
            <View style={common.dialogIcon}>
              <Icon name="heart" size={30} color={colors.red} />
            </View>
            <Text style={common.dialogTitle}>Bir kez daha?</Text>
            <Text style={common.dialogCopy}>
              Her deneme yeni bir bakış. Üç yeni canla{'\n'}yolunu tekrar
              bulabilirsin.
            </Text>
            <PrimaryButton
              title="Tekrar dene"
              onPress={restart}
              testID="retry-button"
            />
            <TextButton title="Seviyelere dön" onPress={onLevels} />
          </>
        )}
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  levelHeading: { alignItems: 'center', gap: 6 },
  levelTitle: {
    fontSize: 18,
    color: colors.ink,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 510,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  hearts: { flexDirection: 'row', gap: 7 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  counterDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.violet,
  },
  counterText: { fontSize: 12, color: colors.muted },
  progressTrack: {
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  progressFill: { height: 4, borderRadius: 4, backgroundColor: colors.violet },
  boardHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 14,
  },
  boardLabel: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 2,
    fontWeight: '600',
  },
  infoIcon: {
    width: 17,
    height: 17,
    borderWidth: 1,
    borderColor: '#C4C6BE',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: { fontSize: 10, color: colors.muted, fontWeight: '600' },
  boardWrap: { alignItems: 'center', marginHorizontal: -4 },
  instruction: {
    minHeight: 52,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  instructionText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
    flexShrink: 1,
  },
  blockedText: { color: colors.red },
  tools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 4,
    paddingBottom: 20,
  },
  tool: { alignItems: 'center', gap: 10, minWidth: 95, paddingVertical: 8 },
  hintIcon: {
    width: 58,
    height: 58,
    borderRadius: 21,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBadge: {
    position: 'absolute',
    right: -3,
    top: -3,
    backgroundColor: colors.violet,
    width: 21,
    height: 21,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBadgeText: { fontSize: 10, fontWeight: '700', color: colors.paper },
  restartIcon: {
    width: 58,
    height: 58,
    borderRadius: 21,
    backgroundColor: '#EEEDE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolLabel: { fontSize: 11, color: colors.ink, fontWeight: '500' },
  toolDivider: { height: 30, width: 1, backgroundColor: colors.line },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 16,
    marginTop: 'auto',
  },
  footerLine: { width: 18, height: 1, backgroundColor: colors.line },
  footerText: { fontSize: 9, color: '#ABACA5' },
  pressed: { opacity: 0.5 },
  winStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
    marginTop: 4,
  },
  middleStar: { marginTop: -15 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    marginBottom: 26,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  resultLabel: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  resultDivider: { width: 1, height: 32, backgroundColor: colors.line },
});
