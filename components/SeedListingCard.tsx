import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import GlassCard from './GlassCard';
import PhotoCarousel from './PhotoCarousel';
import { FORUM, formatRelativeTime, RADIUS } from './communityPostShared';
import type { SeedListing } from '../types/seedExchange';

type SeedListingCardProps = {
  listing: SeedListing;
};

export default function SeedListingCard({ listing }: SeedListingCardProps) {
  const typeLabel = listing.exchangeType === 'trade' ? 'Trade' : 'Donate';
  const typeColor = listing.exchangeType === 'trade' ? '#3861C9' : '#008D41';

  return (
    <GlassCard style={styles.card}>
      <View style={styles.metaRow}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Ionicons
            name={listing.exchangeType === 'trade' ? 'swap-horizontal' : 'gift-outline'}
            size={12}
            color="#fff"
          />
          <Text style={styles.typeText}>{typeLabel}</Text>
        </View>
        <Text style={styles.authorMeta}>
          <Text style={styles.author}>{listing.authorName}</Text>
          <Text style={styles.dot}> · </Text>
          <Text style={styles.time}>{formatRelativeTime(listing.createdAt)}</Text>
        </Text>
      </View>

      <Text style={styles.title}>{listing.title}</Text>

      {listing.photoUris.length > 0 && (
        <View style={styles.photoWrap}>
          {listing.photoUris.length === 1 ? (
            <Image source={{ uri: listing.photoUris[0] }} style={styles.singlePhoto} />
          ) : (
            <PhotoCarousel uris={listing.photoUris} height={220} />
          )}
        </View>
      )}

      <Text style={styles.body}>{listing.body}</Text>

      {listing.exchangeType === 'trade' && listing.lookingFor ? (
        <View style={styles.tradeCallout}>
          <View style={styles.tradeCalloutAccent} />
          <View style={styles.tradeCalloutIcon}>
            <Ionicons name="swap-horizontal" size={18} color="#fff" />
          </View>
          <View style={styles.tradeCalloutBody}>
            <Text style={styles.tradeCalloutLabel}>OPEN TO TRADE FOR</Text>
            <Text style={styles.tradeCalloutValue}>{listing.lookingFor}</Text>
          </View>
        </View>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    paddingBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  authorMeta: {
    flex: 1,
    fontSize: 12,
  },
  author: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  dot: {
    color: FORUM.muted,
  },
  time: {
    color: FORUM.muted,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  photoWrap: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: RADIUS.inner,
    overflow: 'hidden',
  },
  singlePhoto: {
    width: '100%',
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  body: {
    color: FORUM.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
  },
  tradeCallout: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: RADIUS.inner,
    overflow: 'hidden',
    backgroundColor: 'rgba(56,97,201,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(56,97,201,0.45)',
  },
  tradeCalloutAccent: {
    width: 4,
    backgroundColor: '#3861C9',
  },
  tradeCalloutIcon: {
    alignSelf: 'center',
    marginLeft: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3861C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeCalloutBody: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
  },
  tradeCalloutLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tradeCalloutValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
});
