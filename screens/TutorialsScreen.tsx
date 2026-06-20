import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GlassCard from '../components/GlassCard';
import { FORUM, formatRelativeTime } from '../components/communityPostShared';
import {
  mockGuideTutorials,
  mockVideoTutorials,
  youtubeThumbnail,
} from '../data/mockTutorials';
import { useCommunityScrollHandler } from '../contexts/CommunityScrollContext';
import { useAppForeground } from '../hooks/useAppForeground';
import type { Tutorial } from '../types/tutorial';

type TutorialSection = 'tutorials' | 'guides';

const SECTION_TABS: { key: TutorialSection; label: string; icon: string }[] = [
  { key: 'tutorials', label: 'Tutorials', icon: 'play-circle-outline' },
  { key: 'guides', label: 'Guides', icon: 'document-text-outline' },
];

function openTutorial(tutorial: Tutorial) {
  Linking.canOpenURL(tutorial.url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(tutorial.url);
      }
      Alert.alert('Unable to open', 'This link cannot be opened on your device.');
    })
    .catch(() => {
      Alert.alert('Unable to open', 'Something went wrong opening this link.');
    });
}

function VideoTutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => openTutorial(tutorial)}>
      <GlassCard style={styles.card}>
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: youtubeThumbnail(tutorial.youtubeVideoId!) }}
            style={styles.thumb}
          />
          <View style={styles.playOverlay}>
            <View style={styles.playCircle}>
              <Ionicons name="play" size={22} color="#fff" style={styles.playIcon} />
            </View>
          </View>
          {tutorial.duration ? (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{tutorial.duration}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {tutorial.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {tutorial.description}
          </Text>
          <Text style={styles.meta}>
            YouTube · {formatRelativeTime(tutorial.updatedAt)}
          </Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

function GuideCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => openTutorial(tutorial)}>
      <GlassCard style={styles.card}>
        <View style={styles.guideRow}>
          <View style={styles.guideIconWrap}>
            <Ionicons name="document-text-outline" size={28} color={FORUM.accent} />
          </View>
          <View style={styles.guideBody}>
            <Text style={styles.title} numberOfLines={2}>
              {tutorial.title}
            </Text>
            <Text style={styles.description} numberOfLines={3}>
              {tutorial.description}
            </Text>
            <Text style={styles.meta}>
              AEREA Guide · {formatRelativeTime(tutorial.updatedAt)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={FORUM.muted} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function TutorialsScreen() {
  const onScroll = useCommunityScrollHandler();
  const listRef = useRef<FlatList<Tutorial>>(null);
  const [section, setSection] = useState<TutorialSection>('tutorials');
  const [listEpoch, setListEpoch] = useState(0);

  const remountList = useCallback(() => {
    setListEpoch((epoch) => epoch + 1);
  }, []);

  useAppForeground(remountList);

  const data = useMemo(
    () => (section === 'tutorials' ? mockVideoTutorials : mockGuideTutorials),
    [section],
  );

  const introText =
    section === 'tutorials'
      ? 'Video tutorials from the AEREA team and community growers.'
      : 'Step-by-step text guides — read at your own pace.';

  const handleSectionChange = useCallback((next: TutorialSection) => {
    setSection(next);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const ListHeader = useCallback(
    () => (
      <>
        <View style={styles.intro}>
          <Ionicons
            name={section === 'tutorials' ? 'logo-youtube' : 'book-outline'}
            size={16}
            color={section === 'tutorials' ? '#FF0000' : FORUM.muted}
          />
          <Text style={styles.introText}>{introText}</Text>
        </View>

        <View style={styles.sectionTabs}>
          {SECTION_TABS.map((tab) => {
            const isActive = section === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.sectionChip, isActive && styles.sectionChipActive]}
                onPress={() => handleSectionChange(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color={isActive ? '#fff' : 'rgba(255,255,255,0.6)'}
                />
                <Text style={[styles.sectionChipText, isActive && styles.sectionChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </>
    ),
    [handleSectionChange, introText, section],
  );

  return (
    <FlatList
      ref={listRef}
      key={`tutorials-${section}-${listEpoch}`}
      style={styles.fill}
      data={data}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={false}
      renderItem={({ item }) => (
        <View style={styles.cardWrap}>
          {section === 'tutorials' ? (
            <VideoTutorialCard tutorial={item} />
          ) : (
            <GuideCard tutorial={item} />
          )}
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>
          {section === 'tutorials' ? 'No video tutorials yet.' : 'No guides published yet.'}
        </Text>
      }
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignSelf: 'stretch',
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FORUM.border,
  },
  introText: {
    flex: 1,
    color: FORUM.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FORUM.border,
  },
  sectionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionChipActive: {
    backgroundColor: FORUM.accent,
    borderColor: FORUM.accent,
  },
  sectionChipText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 100,
    flexGrow: 1,
  },
  cardWrap: {
    marginBottom: 10,
  },
  card: {
    overflow: 'hidden',
  },
  thumbWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  playIcon: {
    marginLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  guideIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,141,65,0.12)',
  },
  guideBody: {
    flex: 1,
    gap: 4,
  },
  body: {
    padding: 14,
    gap: 4,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  description: {
    color: FORUM.body,
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    color: FORUM.muted,
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    color: FORUM.muted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
