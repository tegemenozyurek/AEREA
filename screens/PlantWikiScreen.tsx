import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import GlassCard from '../components/GlassCard';
import { FORUM, formatRelativeTime, RADIUS } from '../components/communityPostShared';
import { mockWikiArticles } from '../data/mockWikiArticles';
import { useCommunityScrollHandler } from '../contexts/CommunityScrollContext';
import type { WikiArticle, WikiCategory } from '../types/wiki';
import WikiArticleScreen from './WikiArticleScreen';

const CATEGORIES: (WikiCategory | 'All')[] = [
  'All',
  'Disease',
  'Pest',
  'Nutrient',
  'Environmental',
];

const CATEGORY_COLORS: Record<WikiCategory, string> = {
  Disease: '#C0392B',
  Pest: '#D35400',
  Nutrient: '#008D41',
  Environmental: '#3861C9',
};

function WikiArticleCard({
  article,
  onPress,
}: {
  article: WikiArticle;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <GlassCard style={styles.card}>
        {article.imageUri ? (
          <Image source={{ uri: article.imageUri }} style={styles.cardImage} />
        ) : null}
        <View style={styles.cardBody}>
          <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[article.category] }]}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          <Text style={styles.cardTitle}>{article.title}</Text>
          <Text style={styles.cardSummary} numberOfLines={2}>
            {article.summary}
          </Text>
          <Text style={styles.cardMeta}>Updated {formatRelativeTime(article.updatedAt)}</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function PlantWikiScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const [category, setCategory] = useState<WikiCategory | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const onScroll = useCommunityScrollHandler();

  const filtered = useMemo(
    () =>
      category === 'All'
        ? mockWikiArticles
        : mockWikiArticles.filter((a) => a.category === category),
    [category],
  );

  const selected = selectedId
    ? mockWikiArticles.find((a) => a.id === selectedId)
    : undefined;

  const ListHeader = useCallback(
    () => (
      <View style={{ width: screenWidth }}>
        <View style={styles.intro}>
          <Ionicons name="book-outline" size={16} color={FORUM.muted} />
          <Text style={styles.introText}>
            Curated guides on plant health — read only, updated by the AEREA team.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {CATEGORIES.map((item) => {
            const active = category === item;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    ),
    [category, screenWidth],
  );

  if (selected) {
    return <WikiArticleScreen article={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <FlatList
      style={styles.fill}
      data={filtered}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      renderItem={({ item }) => (
        <View style={styles.cardWrap}>
          <WikiArticleCard article={item} onPress={() => setSelectedId(item.id)} />
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>No articles in this category yet.</Text>
      }
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
  filterScroll: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FORUM.border,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterChipActive: {
    backgroundColor: FORUM.accent,
    borderColor: FORUM.accent,
  },
  filterText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
    flexGrow: 1,
  },
  cardWrap: {
    marginBottom: 8,
  },
  card: {
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cardBody: {
    padding: 14,
    gap: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cardSummary: {
    color: FORUM.body,
    fontSize: 14,
    lineHeight: 20,
  },
  cardMeta: {
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
