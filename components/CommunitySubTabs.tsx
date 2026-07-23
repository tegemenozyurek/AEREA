import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { COMMUNITY_SUB_TABS, CommunitySubTab } from '../types/communityNav';
import { useResponsive } from '../utils/responsive';
import { FORUM } from './communityPostShared';

const ACTIVE_ICONS: Record<CommunitySubTab, keyof typeof Ionicons.glyphMap> = {
  forum: 'chatbubbles',
  wiki: 'leaf',
  seeds: 'swap-horizontal',
  tutorials: 'play-circle',
};

type CommunitySubTabsProps = {
  active: CommunitySubTab;
  onChange: (tab: CommunitySubTab) => void;
};

export default function CommunitySubTabs({ active, onChange }: CommunitySubTabsProps) {
  const r = useResponsive();
  const scrollRef = useRef<ScrollView>(null);
  const chipX = useRef<Partial<Record<CommunitySubTab, number>>>({});
  const chipW = useRef<Partial<Record<CommunitySubTab, number>>>({});
  const viewportW = useRef(0);

  const scrollActiveIntoView = (key: CommunitySubTab) => {
    const x = chipX.current[key];
    const width = chipW.current[key];
    if (x == null || width == null || viewportW.current <= 0) return;

    const padding = Math.max(r.scale(12), r.horizontalPadding - 12);
    const target = Math.max(0, x - (viewportW.current - width) / 2 + padding);
    scrollRef.current?.scrollTo({ x: target, animated: true });
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => scrollActiveIntoView(active));
    return () => cancelAnimationFrame(id);
  }, [active]);

  const handleChipLayout = (key: CommunitySubTab, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    chipX.current[key] = x;
    chipW.current[key] = width;
    if (key === active) {
      scrollActiveIntoView(key);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={(event) => {
          viewportW.current = event.nativeEvent.layout.width;
        }}
        contentContainerStyle={[
          styles.row,
          {
            paddingLeft: Math.max(r.scale(12), r.horizontalPadding - 12),
            paddingRight: r.horizontalPadding,
            paddingVertical: r.scale(8),
            gap: r.scale(6),
          },
        ]}
      >
        {COMMUNITY_SUB_TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.chip,
                {
                  gap: r.scale(4),
                  paddingHorizontal: r.scale(10),
                  paddingVertical: r.scale(6),
                  borderRadius: r.scale(16),
                },
                isActive && styles.chipActive,
              ]}
              onPress={() => onChange(tab.key)}
              onLayout={(event) => handleChipLayout(tab.key, event)}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.title}
            >
              <Ionicons
                name={
                  isActive
                    ? ACTIVE_ICONS[tab.key]
                    : (tab.icon as keyof typeof Ionicons.glyphMap)
                }
                size={r.scale(13)}
                color={isActive ? '#fff' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[styles.chipText, { fontSize: r.scale(11) }, isActive && styles.chipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FORUM.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipActive: {
    backgroundColor: FORUM.accent,
    borderColor: FORUM.accent,
  },
  chipText: {
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  chipTextActive: {
    color: '#fff',
  },
});
