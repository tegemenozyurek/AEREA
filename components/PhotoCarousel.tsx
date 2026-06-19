import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';

type PhotoCarouselProps = {
  uris: string[];
  height?: number;
};

export default function PhotoCarousel({ uris, height = 260 }: PhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setSlideWidth(event.nativeEvent.layout.width);
  }, []);

  const updateIndex = useCallback(
    (offsetX: number) => {
      if (slideWidth <= 0) return;
      const index = Math.round(offsetX / slideWidth);
      setActiveIndex(Math.min(Math.max(index, 0), uris.length - 1));
    },
    [slideWidth, uris.length],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      updateIndex(event.nativeEvent.contentOffset.x);
    },
    [updateIndex],
  );

  if (uris.length === 0) return null;

  if (uris.length === 1) {
    return (
      <View style={styles.wrap} onLayout={onLayout}>
        <Image
          source={{ uri: uris[0] }}
          style={[styles.image, { height }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {slideWidth > 0 && (
        <FlatList
          data={uris}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          keyExtractor={(uri, index) => `${uri}-${index}`}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width: slideWidth, height }}
              resizeMode="cover"
            />
          )}
          getItemLayout={(_, index) => ({
            length: slideWidth,
            offset: slideWidth * index,
            index,
          })}
        />
      )}

      <View style={styles.dots} pointerEvents="none">
        {uris.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  image: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
});
