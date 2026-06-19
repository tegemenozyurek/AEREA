import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../utils/responsive';

export type SettingsChoiceOption<T extends string> = {
  value: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

type Props<T extends string> = {
  label: string;
  value: T;
  options: SettingsChoiceOption<T>[];
  expanded: boolean;
  onToggle: () => void;
  onChange: (value: T) => void;
  isLast?: boolean;
};

export default function SettingsChoiceRow<T extends string>({
  label,
  value,
  options,
  expanded,
  onToggle,
  onChange,
  isLast = false,
}: Props<T>) {
  const r = useResponsive();
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  const handleSelect = (next: T) => {
    onChange(next);
    onToggle();
  };

  return (
    <View style={!expanded && !isLast ? styles.rowBorder : undefined}>
      <TouchableOpacity
        style={[
          styles.row,
          { paddingVertical: r.scale(15), paddingHorizontal: r.scale(14) },
          expanded && styles.rowExpanded,
        ]}
        activeOpacity={0.65}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded }}
      >
        <Text style={[styles.label, { fontSize: r.scale(15) }]} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.right}>
          <Text style={[styles.value, { fontSize: r.scale(13), maxWidth: r.scale(170) }]} numberOfLines={1}>
            {selectedLabel}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={r.scale(15)}
            color="rgba(255,255,255,0.35)"
          />
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View
          style={[
            styles.options,
            {
              paddingBottom: r.scale(6),
              paddingHorizontal: r.scale(8),
            },
            !isLast && styles.optionsBorder,
          ]}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  {
                    paddingVertical: r.scale(11),
                    paddingHorizontal: r.scale(10),
                    borderRadius: r.scale(10),
                    gap: r.scale(10),
                  },
                  selected && styles.optionSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
              >
                {option.icon ? (
                  <Ionicons
                    name={option.icon}
                    size={r.scale(18)}
                    color={selected ? '#93C5FD' : 'rgba(255,255,255,0.55)'}
                  />
                ) : null}
                <Text
                  style={[
                    styles.optionLabel,
                    { fontSize: r.scale(15) },
                    selected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selected ? (
                  <Ionicons name="checkmark" size={r.scale(18)} color="#60A5FA" />
                ) : (
                  <View style={{ width: r.scale(18) }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowExpanded: {
    paddingBottom: 8,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  label: {
    flex: 1,
    color: '#fff',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  value: {
    color: 'rgba(255,255,255,0.42)',
    fontWeight: '400',
    textAlign: 'right',
  },
  options: {
    gap: 4,
  },
  optionsBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
  optionLabel: {
    flex: 1,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
