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
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? value;
  const valueMaxWidth = Math.max(r.scale(96), r.width * 0.32);

  const handleSelect = (next: T) => {
    onChange(next);
    onToggle();
  };

  return (
    <View style={!expanded && !isLast ? styles.rowBorder : undefined}>
      <TouchableOpacity
        style={[
          styles.row,
          {
            paddingVertical: r.scale(13),
            paddingHorizontal: r.scale(14),
            minHeight: r.scale(52),
          },
          expanded && styles.rowExpanded,
        ]}
        activeOpacity={0.65}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded }}
      >
        <View
          style={[
            styles.iconWrap,
            {
              width: r.scale(32),
              height: r.scale(32),
              borderRadius: r.scale(10),
              marginRight: r.scale(10),
            },
          ]}
        >
          <Ionicons
            name={selected?.icon ?? 'options-outline'}
            size={r.scale(17)}
            color="rgba(255,255,255,0.55)"
          />
        </View>
        <Text style={[styles.label, { fontSize: r.scale(15) }]} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.right}>
          <Text
            style={[styles.value, { fontSize: r.scale(13), maxWidth: valueMaxWidth }]}
            numberOfLines={1}
          >
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
              paddingBottom: r.scale(8),
              paddingHorizontal: r.scale(10),
            },
            !isLast && styles.optionsBorder,
          ]}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
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
                  isSelected && styles.optionSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={option.label}
              >
                {option.icon ? (
                  <Ionicons
                    name={option.icon}
                    size={r.scale(18)}
                    color={isSelected ? '#93C5FD' : 'rgba(255,255,255,0.55)'}
                  />
                ) : null}
                <Text
                  style={[
                    styles.optionLabel,
                    { fontSize: r.scale(15) },
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {isSelected ? (
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
  },
  rowExpanded: {
    paddingBottom: 6,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  label: {
    flex: 1,
    color: '#fff',
    fontWeight: '500',
    letterSpacing: 0.1,
    minWidth: 0,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    marginLeft: 8,
  },
  value: {
    color: 'rgba(255,255,255,0.45)',
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
