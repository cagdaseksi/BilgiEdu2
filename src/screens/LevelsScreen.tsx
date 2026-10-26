import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { common, IconButton, PrimaryButton } from '../components/UI';
import { TOTAL_LEVELS } from '../game/engine';
import { Progress, nextLevel } from '../state/progress';
import { colors, levelNumber } from '../theme';

const PAGE_SIZE = 30;
export function LevelsScreen({
  progress,
  onSelect,
  onHome,
  onNotice,
}: {
  progress: Progress;
  onSelect: (index: number) => void;
  onHome: () => void;
  onNotice: (text: string) => void;
}) {
  const current = nextLevel(progress);
  const [page, setPage] = useState(Math.floor(current / PAGE_SIZE));
  const completed = Object.keys(progress.completed).length;
  const stars = Object.values(progress.completed).reduce(
    (total, result) => total + result.stars,
    0,
  );
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, TOTAL_LEVELS);
  return (
    <View style={common.fill} testID="levels-screen">
      <View style={common.header}>
        <IconButton icon="back" label="Ana sayfaya dön" onPress={onHome} />
        <Text style={styles.headerTitle}>Seviyeler</Text>
        <View style={styles.starPill}>
          <Icon name="star" size={15} color={colors.orange} filled />
          <Text style={styles.starText}>{stars}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[common.eyebrow, styles.eyebrow]}>
          KÜÇÜK BİR ADIM DAHA
        </Text>
        <Text style={styles.title}>
          Kendi hızında,{'\n'}
          <Text style={styles.violet}>kendi yolunda.</Text>
        </Text>
        <View style={styles.progressLabel}>
          <Text style={styles.progressText}>Yolculuğun</Text>
          <Text style={styles.progressCount}>
            {completed}{' '}
            <Text style={styles.muted}>
              / {TOTAL_LEVELS.toLocaleString('tr-TR')}
            </Text>
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completed / TOTAL_LEVELS) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.gridHeader}>
          <Text style={styles.sectionTitle}>Bölüm {page + 1}</Text>
          <Text style={styles.sectionRange}>
            {levelNumber(start)} — {levelNumber(end - 1)}
          </Text>
        </View>
        <View style={styles.grid}>
          {Array.from({ length: end - start }, (_, offset) => {
            const index = start + offset;
            const result = progress.completed[String(index)];
            const locked = index > current;
            const active = index === current && !result;
            return (
              <Pressable
                key={index}
                testID={`level-${index + 1}`}
                accessibilityRole="button"
                accessibilityLabel={`Seviye ${index + 1}${
                  locked
                    ? ', kilitli'
                    : result
                    ? `, tamamlandı, ${result.stars} yıldız`
                    : ', oyna'
                }`}
                onPress={() =>
                  locked
                    ? onNotice(
                        `Bu seviyeyi açmak için önce Seviye ${
                          current + 1
                        } tamamlanmalı.`,
                      )
                    : onSelect(index)
                }
                style={({ pressed }) => [
                  styles.level,
                  active && styles.levelActive,
                  result && styles.levelCompleted,
                  locked && styles.levelLocked,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.levelNumber,
                    active && styles.activeNumber,
                    locked && styles.lockedNumber,
                  ]}
                >
                  {levelNumber(index)}
                </Text>
                {locked ? (
                  <Icon name="lock" size={12} color="#BBBDB8" />
                ) : result ? (
                  <View style={styles.smallStars}>
                    {[1, 2, 3].map(n => (
                      <Icon
                        key={n}
                        name="star"
                        size={8}
                        color={n <= result.stars ? colors.green : '#CDD8CE'}
                        filled
                      />
                    ))}
                  </View>
                ) : (
                  <Icon name="arrow" size={15} color={colors.paper} />
                )}
              </Pressable>
            );
          })}
        </View>
        <View style={styles.pagination}>
          <IconButton
            icon="back"
            label="Önceki 30 seviye"
            onPress={() => setPage(p => p - 1)}
            disabled={page === 0}
            testID="previous-page"
          />
          <Text style={styles.pageText}>
            {page + 1}
            <Text style={styles.muted}>
              {' '}
              / {Math.ceil(TOTAL_LEVELS / PAGE_SIZE)}
            </Text>
          </Text>
          <IconButton
            icon="arrow"
            label="Sonraki 30 seviye"
            onPress={() => setPage(p => p + 1)}
            disabled={end === TOTAL_LEVELS}
            testID="next-page"
          />
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.completedDot]} />
            <Text style={styles.legendLabel}>Tamamlandı</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.currentDot]} />
            <Text style={styles.legendLabel}>Sıradaki</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name="lock" size={11} color={colors.muted} />
            <Text style={styles.legendLabel}>Kilitli</Text>
          </View>
        </View>
        <PrimaryButton
          title={`Seviye ${levelNumber(current)} · Oyna`}
          onPress={() => onSelect(current)}
          testID="levels-play"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 17, color: colors.ink, fontWeight: '600' },
  starPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.peach,
    borderRadius: 14,
    minWidth: 44,
    height: 36,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  starText: { fontSize: 12, fontWeight: '700', color: colors.orange },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  eyebrow: { marginTop: 23, marginBottom: 13 },
  title: {
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1.8,
    color: colors.ink,
    fontWeight: '700',
  },
  violet: { color: colors.violet },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 9,
  },
  progressText: { fontSize: 12, fontWeight: '500', color: colors.ink },
  progressCount: { fontSize: 11, color: colors.violet, fontWeight: '700' },
  muted: { color: colors.muted, fontWeight: '400' },
  progressTrack: {
    height: 5,
    backgroundColor: colors.line,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: 5, backgroundColor: colors.violet, borderRadius: 5 },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.ink },
  sectionRange: {
    fontSize: 11,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  level: {
    width: '17.6%',
    flexGrow: 1,
    maxWidth: '18%',
    height: 70,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  levelActive: { backgroundColor: colors.violet, borderColor: colors.violet },
  levelCompleted: { backgroundColor: colors.mint, borderColor: '#DFE9E0' },
  levelLocked: { backgroundColor: '#F0F0EB', borderColor: '#EBEBE5' },
  levelNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.green,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.4,
  },
  activeNumber: { color: colors.paper },
  lockedNumber: { color: '#ACAEA8' },
  smallStars: { flexDirection: 'row', gap: 1 },
  pressed: { opacity: 0.65, transform: [{ scale: 0.96 }] },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  pageText: { fontSize: 12, fontWeight: '600', color: colors.ink },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 20,
    marginBottom: 24,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3 },
  completedDot: { backgroundColor: colors.green },
  currentDot: { backgroundColor: colors.violet },
  legendLabel: { fontSize: 10, color: colors.muted },
});
