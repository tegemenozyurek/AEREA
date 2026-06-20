import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
import { FORUM, formatRelativeTime, RADIUS } from '../components/communityPostShared';
import { mockTutorials, youtubeThumbnail } from '../data/mockTutorials';
import { useCommunityScrollHandler } from '../contexts/CommunityScrollContext';
import type { Tutorial } from '../types/tutorial';

async function openTutorial(tutorial: Tutorial) {
  try {
    const supported = await Linking.canOpenURL(tutorial.url);
    if (supported) {
      await Linking.openURL(tutorial.url);
    } else {
      Alert.alert('Unable to open', 'This link cannot be opened on your device.');
    }
  } catch {
    Alert.alert('Unable to open', 'Something went wrong opening this link.');
  }
}

function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  const isVideo = tutorial.kind === 'video' && tutorial.youtubeVideoId;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => void openTutorial(tutorial)}>
      <GlassCard style={styles.card}>
        {isVideo ? (
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
        ) : (
          <View style={styles.guideThumb}>
            <Ionicons name="document-text-outline" size={36} color={FORUM.accent} />
            <Text style={styles.guideLabel}>Guide</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {tutorial.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {tutorial.description}
          </Text>
          <Text style={styles.meta}>
            {tutorial.kind === 'video' ? 'YouTube' : 'AEREA Guide'} ·{' '}
            {formatRelativeTime(tutorial.updatedAt)}
          </Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function TutorialsScreen() {
  const onScroll = useCommunityScrollHandler();

  return (
    <View style={styles.fill}>
      <View style={styles.intro}>
        <Ionicons name="logo-youtube" size={16} color="#FF0000" />
        <Text style={styles.introText}>
          Video tutorials and guides from the AEREA team.
        </Text>
      </View>

      <FlatList
        style={styles.list}
        data={mockTutorials}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <TutorialCard tutorial={item} />
          </View>
        )}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignSelf: 'stretch',
  },
  list: {
    flex: 1,
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
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 100,
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
  guideThumb: {
    width: '100%',
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,141,65,0.12)',
    gap: 6,
  },
  guideLabel: {
    color: FORUM.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
});
