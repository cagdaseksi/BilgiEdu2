import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Icon } from './src/components/Icon';
import {
  BottomTabs,
  common,
  Dialog,
  PrimaryButton,
  TextButton,
} from './src/components/UI';
import { HomeScreen } from './src/screens/HomeScreen';
import { LevelsScreen } from './src/screens/LevelsScreen';
import { GameScreen } from './src/screens/GameScreen';
import { nextLevel, useProgress } from './src/state/progress';
import { colors } from './src/theme';

type Screen = 'home' | 'levels' | 'game';
function ArrowApp() {
  const { progress, ready, storageError, complete, reset } = useProgress();
  const [screen, setScreen] = useState<Screen>('home');
  const [level, setLevel] = useState(0);
  const [settings, setSettings] = useState(false);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const openHome = useCallback(() => setScreen('home'), []);
  const openLevels = useCallback(() => setScreen('levels'), []);
  useEffect(
    () => () => {
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
    },
    [],
  );
  useEffect(() => {
    if (screen === 'game') {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (screen === 'levels') {
          setScreen('home');
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [screen]);
  function openGame(index: number) {
    setLevel(index);
    setScreen('game');
  }
  function showNotice(text: string) {
    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }
    setNotice(text);
    noticeTimer.current = setTimeout(() => setNotice(''), 3000);
  }
  function confirmReset() {
    Alert.alert(
      'Yolculuğu sıfırla?',
      'Tamamlanan seviyeler ve yıldızlar bu cihazdan silinecek.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            reset();
            setSettings(false);
            showNotice('Yeni bir yolculuk başlıyor.');
          },
        },
      ],
    );
  }
  return (
    <SafeAreaView style={common.fill} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator
            color={colors.violet}
            accessibilityLabel="İlerleme yükleniyor"
          />
        </View>
      ) : (
        <>
          {screen === 'home' && (
            <HomeScreen
              progress={progress}
              onPlay={() => openGame(nextLevel(progress))}
              onLevels={openLevels}
              onSettings={() => setSettings(true)}
              storageError={storageError}
            />
          )}
          {screen === 'levels' && (
            <LevelsScreen
              progress={progress}
              onSelect={openGame}
              onHome={openHome}
              onNotice={showNotice}
            />
          )}
          {screen === 'game' && (
            <GameScreen
              key={level}
              index={level}
              onHome={openHome}
              onLevels={openLevels}
              onNext={() => openGame(level + 1)}
              onComplete={complete}
            />
          )}
          {screen !== 'game' && (
            <BottomTabs active={screen} onChange={setScreen} />
          )}
        </>
      )}
      {!!notice && (
        <View
          pointerEvents="none"
          style={[styles.toast, { bottom: insets.bottom + 90 }]}
        >
          <Text accessibilityRole="alert" style={styles.toastText}>
            {notice}
          </Text>
        </View>
      )}
      <Dialog visible={settings} onClose={() => setSettings(false)}>
        <View style={common.dialogIcon}>
          <Icon name="spark" color={colors.violet} size={30} />
        </View>
        <Text style={common.dialogTitle}>Sade bir bulmaca.</Text>
        <Text style={common.dialogCopy}>
          Okların gösterdiği yönü takip et. Önü açık oklara dokunarak hepsini
          tahtadan çıkar.{'\n\n'}Üç canın ve her denemede üç ipucun var. Süre
          sınırı yok. Tamamladığın seviyeler bu cihazda kaydedilir.
        </Text>
        <PrimaryButton title="Hazırım" onPress={() => setSettings(false)} />
        <TextButton title="İlerlemeyi sıfırla" onPress={confirmReset} />
        <Text style={styles.version}>arrow. / 1.0</Text>
      </Dialog>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ArrowApp />
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: colors.ink,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  toastText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.paper,
    textAlign: 'center',
  },
  version: {
    fontSize: 10,
    textAlign: 'center',
    color: colors.muted,
    marginTop: 12,
    letterSpacing: 1,
  },
});
