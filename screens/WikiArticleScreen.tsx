import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import GlassCard from '../components/GlassCard';
import { FORUM, formatRelativeTime } from '../components/communityPostShared';
import { useCommunityScrollHandler } from '../contexts/CommunityScrollContext';
import type { WikiArticle } from '../types/wiki';

type WikiArticleScreenProps = {
  article: WikiArticle;
  onBack: () => void;
};

export default function WikiArticleScreen({ article, onBack }: WikiArticleScreenProps) {
  const { width: screenWidth } = useWindowDimensions();
  const onScroll = useCommunityScrollHandler();

  return (
    <View style={styles.fill}>
      <View style={[styles.header, { width: screenWidth }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {article.title}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <GlassCard style={styles.card}>
          {article.imageUri ? (
            <Image source={{ uri: article.imageUri }} style={styles.hero} />
          ) : null}
          <View style={styles.body}>
            <Text style={styles.meta}>
              Updated {formatRelativeTime(article.updatedAt)} · {article.category}
            </Text>
            <Text style={styles.summary}>{article.summary}</Text>
            <Text style={styles.paragraph}>{article.body}</Text>

            <Text style={styles.sectionTitle}>Symptoms</Text>
            {article.symptoms.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Treatment</Text>
            {article.treatment.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={16} color={FORUM.accent} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignSelf: 'stretch',
  },
  header: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FORUM.border,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    maxWidth: '65%',
  },
  backBtn: {
    position: 'absolute',
    left: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 100,
  },
  card: {
    overflow: 'hidden',
  },
  hero: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  body: {
    padding: 16,
    gap: 8,
  },
  meta: {
    color: FORUM.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  paragraph: {
    color: FORUM.body,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: FORUM.muted,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    color: FORUM.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
