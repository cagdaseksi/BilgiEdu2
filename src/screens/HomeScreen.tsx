import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { ArrowBoard } from '../components/ArrowBoard';
import { Icon } from '../components/Icon';
import { common, IconButton, PrimaryButton } from '../components/UI';
import { createPuzzle, TOTAL_LEVELS } from '../game/engine';
import { Progress, nextLevel } from '../state/progress';
import { colors, levelNumber } from '../theme';

export function HomeScreen({
  progress,
  onPlay,
  onLevels,
  onSettings,
  storageError,
}: {
  progress: Progress;
  onPlay: () => void;
  onLevels: () => void;
  onSettings: () => void;
  storageError: boolean;
}) {
  const { width } = useWindowDimensions();
  const preview = useMemo(() => createPuzzle(0), []);
  const completed = Object.keys(progress.completed).length;
  return (
    <View style={common.fill} testID="home-screen">
      <View style={common.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Icon name="arrow" size={22} color={colors.paper} />
          </View>
          <Text style={styles.brandName}>
            arrow<Text style={styles.brandDot}>.</Text>
          </Text>
        </View>
        <IconButton
          icon="settings"
          label="Ayarlar ve nasıl oynanır"
          onPress={onSettings}
          testID="settings-button"
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.eyebrowRow}>
            <View style={styles.tinyDot} />
            <Text style={common.eyebrow}>ZİHNİNE KÜÇÜK BİR MOLA</Text>
          </View>
          <Text style={styles.headline}>
            Bir okla<Text style={styles.violet}>{'\n'}başlar.</Text>
          </Text>
          <Text style={styles.subtitle}>
            Düğümleri çöz. Yolunu bul.{'\n'}Biraz yavaşla, bulmacanın tadını
            çıkar.
          </Text>
        </View>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <Icon name="spark" size={12} color={colors.violet} />
              <Text style={styles.heroBadgeText}>
                KÜÇÜK ADIMLAR, BÜYÜK KEŞİFLER
              </Text>
            </View>
            <Text style={styles.heroNumber}>01 / ∞</Text>
          </View>
          <View style={styles.previewWrap}>
            <ArrowBoard
              puzzle={preview}
              width={Math.min(width - 116, 180)}
              preview
            />
          </View>
          <View style={styles.heroBottom}>
            <View style={styles.heroLine} />
            <Text style={styles.heroCaption}>Her okun bir çıkışı var.</Text>
            <View style={styles.heroLine} />
          </View>
        </View>
        <PrimaryButton
          title={
            completed
              ? `Devam et · Seviye ${levelNumber(nextLevel(progress))}`
              : 'Oyuna başla'
          }
          onPress={onPlay}
          testID="play-button"
        />
        <Pressable
          testID="discover-levels"
          accessibilityRole="button"
          onPress={onLevels}
          style={({ pressed }) => [styles.discover, pressed && styles.pressed]}
        >
          <Icon name="grid" size={17} />
          <Text style={styles.discoverText}>Seviyeleri keşfet</Text>
          <Icon name="chevron" size={15} color={colors.muted} />
        </Pressable>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <View style={styles.statIcon}>
              <Icon name="check" size={15} color={colors.green} />
            </View>
            <Text style={styles.statNumber}>
              {completed}
              <Text style={styles.statLabel}> tamamlandı</Text>
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Icon name="grid" size={16} color={colors.muted} />
            <Text style={styles.statNumber}>
              {TOTAL_LEVELS.toLocaleString('tr-TR')}
              <Text style={styles.statLabel}> seviye</Text>
            </Text>
          </View>
        </View>
        {storageError && (
          <Text accessibilityRole="alert" style={styles.error}>
            İlerleme cihaza kaydedilemedi. Depolama alanını kontrol et.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  brandName: {
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -1.6,
    color: colors.ink,
  },
  brandDot: { color: colors.violet },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  intro: { paddingTop: 12, paddingBottom: 20 },
  eyebrowRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  tinyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  headline: {
    fontSize: 56,
    lineHeight: 56,
    letterSpacing: -3,
    fontWeight: '700',
    color: colors.ink,
  },
  violet: { color: colors.violet },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    marginTop: 16,
  },
  hero: {
    borderRadius: 28,
    backgroundColor: '#EEEBE5',
    marginBottom: 22,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroBadgeText: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: colors.violet,
    fontWeight: '700',
  },
  heroNumber: {
    fontSize: 9,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  previewWrap: { alignItems: 'center', marginVertical: -3 },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  heroLine: { width: 20, height: 1, backgroundColor: '#D4D1CB' },
  heroCaption: { fontSize: 11, color: '#85847F' },
  discover: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  discoverText: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  pressed: { opacity: 0.5 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingTop: 14,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statIcon: { backgroundColor: colors.mint, borderRadius: 8, padding: 3 },
  statNumber: { fontSize: 12, fontWeight: '700', color: colors.ink },
  statLabel: { fontSize: 11, color: colors.muted, fontWeight: '400' },
  statDivider: { height: 16, width: 1, backgroundColor: colors.line },
  error: {
    color: colors.red,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
