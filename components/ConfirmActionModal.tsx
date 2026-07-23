import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../utils/responsive';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  icon?: IoniconName;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmActionModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  icon = 'alert-circle-outline',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const r = useResponsive();
  const insets = useSafeAreaInsets();

  const handleCancel = () => {
    if (loading) return;
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleCancel}>
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <Pressable
          style={[
            styles.sheet,
            {
              borderRadius: r.scale(20),
              paddingBottom: Math.max(insets.bottom, r.scale(16)),
              maxWidth: r.contentMaxWidth,
              paddingHorizontal: r.scale(20),
              paddingTop: r.scale(22),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.iconWrap,
              {
                width: r.scale(56),
                height: r.scale(56),
                borderRadius: r.scale(18),
              },
              destructive ? styles.iconWrapDanger : styles.iconWrapNeutral,
            ]}
          >
            <Ionicons
              name={icon}
              size={r.scale(28)}
              color={destructive ? '#FF8E8E' : '#BAE6FD'}
            />
          </View>

          <Text style={[styles.title, { fontSize: r.scale(20), marginTop: r.scale(16) }]}>
            {title}
          </Text>
          <Text style={[styles.message, { fontSize: r.scale(15), marginTop: r.scale(8) }]}>
            {message}
          </Text>

          <View style={[styles.actions, { marginTop: r.scale(24), gap: r.scale(10) }]}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderRadius: r.scale(14), minHeight: r.scale(50) },
              ]}
              onPress={handleCancel}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelText, { fontSize: r.scale(15) }]}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                destructive ? styles.confirmDanger : styles.confirmNeutral,
                { borderRadius: r.scale(14), minHeight: r.scale(50) },
                loading && styles.buttonDisabled,
              ]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.confirmText, { fontSize: r.scale(15) }]}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: '100%',
    backgroundColor: 'rgba(15,23,42,0.97)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrapNeutral: {
    backgroundColor: 'rgba(186,230,253,0.1)',
    borderColor: 'rgba(186,230,253,0.28)',
  },
  iconWrapDanger: {
    backgroundColor: 'rgba(255,107,138,0.12)',
    borderColor: 'rgba(255,142,142,0.35)',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  message: {
    color: 'rgba(255,255,255,0.58)',
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  actions: {
    width: '100%',
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  confirmNeutral: {
    backgroundColor: '#0369A1',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  confirmDanger: {
    backgroundColor: 'rgba(220, 70, 90, 0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,160,170,0.35)',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
});
