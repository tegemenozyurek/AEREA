import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COMMUNITY_SUB_TABS, CommunitySubTab } from '../types/communityNav';
import { FORUM } from './communityPostShared';

type CommunitySubTabsProps = {
  active: CommunitySubTab;
  onChange: (tab: CommunitySubTab) => void;
};

export default function CommunitySubTabs({ active, onChange }: CommunitySubTabsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {COMMUNITY_SUB_TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onChange(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon as keyof typeof Ionicons.glyphMap}
                size={12}
                color={isActive ? '#fff' : 'rgba(255,255,255,0.6)'}
              />
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.22)',
  },
  row: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: FORUM.accent,
    borderColor: FORUM.accent,
  },
  chipText: {
    flexShrink: 1,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
});
