import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { Icon, IconName } from './Icon';

export function IconButton({
  icon,
  onPress,
  label,
  disabled = false,
  testID,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Icon name={icon} size={21} />
    </Pressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  icon = 'arrow',
  testID,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: IconName;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        pressed && styles.primaryPressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.primaryText}>{title}</Text>
      <View style={styles.primaryIcon}>
        <Icon name={icon} color={colors.paper} size={22} />
      </View>
    </Pressable>
  );
}

export function BottomTabs({
  active,
  onChange,
}: {
  active: 'home' | 'levels';
  onChange: (screen: 'home' | 'levels') => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {(['home', 'levels'] as const).map(screen => (
        <Pressable
          key={screen}
          testID={`tab-${screen}`}
          onPress={() => onChange(screen)}
          accessibilityRole="tab"
          accessibilityState={{ selected: screen === active }}
          accessibilityLabel={screen === 'home' ? 'Ana sayfa' : 'Seviyeler'}
          style={styles.tab}
        >
          <View
            style={[styles.tabIcon, screen === active && styles.activeTabIcon]}
          >
            <Icon
              name={screen === 'home' ? 'home' : 'grid'}
              size={21}
              color={screen === active ? colors.violet : colors.muted}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              screen === active && styles.activeTabLabel,
            ]}
          >
            {screen === 'home' ? 'Ana sayfa' : 'Seviyeler'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Dialog({
  visible,
  onClose,
  children,
  dismissible = true,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dismissible?: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissible ? onClose : () => {}}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          accessibilityLabel="Pencereyi kapat"
          accessible={false}
          disabled={!dismissible}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.dialog}>
          {dismissible && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kapat"
              onPress={onClose}
              hitSlop={12}
              style={styles.dialogClose}
            >
              <Icon name="close" size={20} color={colors.muted} />
            </Pressable>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function TextButton({
  title,
  onPress,
  testID,
}: {
  title: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
    >
      <Text style={styles.textButtonLabel}>{title}</Text>
    </Pressable>
  );
}

export const common = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 14,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.4,
    fontWeight: '700',
    color: colors.muted,
  },
  dialogIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lavender,
    alignSelf: 'center',
    marginBottom: 22,
  },
  dialogTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  dialogCopy: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    color: colors.muted,
    marginBottom: 24,
  },
});

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
  },
  pressed: { opacity: 0.55 },
  disabled: { opacity: 0.4 },
  primary: {
    height: 62,
    borderRadius: 21,
    backgroundColor: colors.violet,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 12,
  },
  primaryPressed: {
    backgroundColor: colors.violetDark,
    transform: [{ scale: 0.985 }],
  },
  primaryText: { fontSize: 17, fontWeight: '600', color: colors.paper },
  primaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 64,
    paddingTop: 10,
    backgroundColor: colors.background,
  },
  tab: { alignItems: 'center', gap: 4, minWidth: 72 },
  tabIcon: {
    width: 56,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabIcon: { backgroundColor: colors.lavender },
  tabLabel: { fontSize: 10, color: colors.muted, fontWeight: '500' },
  activeTabLabel: { color: colors.violet, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    padding: 24,
    backgroundColor: '#23232B70',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 32,
    backgroundColor: colors.background,
    padding: 28,
    paddingTop: 40,
  },
  dialogClose: { position: 'absolute', top: 18, right: 18 },
  textButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  textButtonLabel: { fontSize: 14, fontWeight: '600', color: colors.muted },
});
