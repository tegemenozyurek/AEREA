import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommunitySubTabs from '../components/CommunitySubTabs';
import { useChat } from '../contexts/ChatContext';
import { CommunityScrollProvider } from '../contexts/CommunityScrollContext';
import { useCollapsingSubTabs } from '../hooks/useCollapsingSubTabs';
import { CommunitySubTab } from '../types/communityNav';
import ChatListScreen from './ChatListScreen';
import ChatScreen from './ChatScreen';
import ForumScreen from './ForumScreen';
import PlantWikiScreen from './PlantWikiScreen';
import SeedExchangeScreen from './SeedExchangeScreen';
import TutorialsScreen from './TutorialsScreen';

export default function CommunityScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { chatView, activeConversationId, openInbox, closeChat, totalUnread } = useChat();
  const [subTab, setSubTab] = useState<CommunitySubTab>('forum');
  const { animatedContainerStyle, onContentScroll, resetScrollTracking } =
    useCollapsingSubTabs();

  useEffect(() => {
    resetScrollTracking();
  }, [subTab, resetScrollTracking]);

  const handleSubTabChange = (tab: CommunitySubTab) => {
    setSubTab(tab);
  };

  if (chatView === 'conversation' && activeConversationId) {
    return (
      <ChatScreen conversationId={activeConversationId} onBack={() => openInbox()} />
    );
  }

  if (chatView === 'inbox') {
    return <ChatListScreen onBack={closeChat} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { width: screenWidth }]} edges={['top']}>
      <View style={[styles.header, { width: screenWidth }]}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={openInbox}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Messages"
        >
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          {totalUnread > 0 && (
            <View style={styles.unreadDot}>
              <Text style={styles.unreadDotText}>
                {totalUnread > 9 ? '9+' : totalUnread}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Animated.View style={animatedContainerStyle}>
        <CommunitySubTabs active={subTab} onChange={handleSubTabChange} />
      </Animated.View>

      <CommunityScrollProvider onContentScroll={onContentScroll}>
        <View style={styles.content}>
          {subTab === 'forum' && <ForumScreen />}
          {subTab === 'wiki' && <PlantWikiScreen />}
          {subTab === 'seeds' && <SeedExchangeScreen />}
          {subTab === 'tutorials' && <TutorialsScreen />}
        </View>
      </CommunityScrollProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  header: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B8A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.35)',
  },
  unreadDotText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
