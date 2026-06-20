import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import CreateSeedListingModal from '../components/CreateSeedListingModal';
import SeedListingCard from '../components/SeedListingCard';
import { FORUM } from '../components/communityPostShared';
import { useSeedExchange } from '../contexts/SeedExchangeContext';
import { useCommunityScrollHandler } from '../contexts/CommunityScrollContext';

export default function SeedExchangeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { listings, refreshing, refresh, createListing } = useSeedExchange();
  const [createVisible, setCreateVisible] = useState(false);
  const onScroll = useCommunityScrollHandler();

  return (
    <View style={styles.fill}>
      <View style={[styles.toolbar, { width: screenWidth }]}>
        <View style={styles.intro}>
          <Ionicons name="leaf-outline" size={16} color={FORUM.muted} />
          <Text style={styles.introText}>Free seed trades & donations — no sales.</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setCreateVisible(true)}
          hitSlop={8}
          accessibilityLabel="Create seed listing"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor="#fff"
            colors={['#008D41']}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <SeedListingCard listing={item} />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No listings yet. Post your first seeds!</Text>
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      <CreateSeedListingModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSubmit={createListing}
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.22)',
  },
  intro: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  introText: {
    flex: 1,
    color: FORUM.muted,
    fontSize: 13,
  },
  addBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 100,
  },
  cardWrap: {
    marginBottom: 8,
  },
  empty: {
    color: FORUM.muted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
