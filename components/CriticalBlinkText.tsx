import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type TextStyle } from 'react-native';

type Props = {
  children: string;
  style?: TextStyle | TextStyle[];
};

export default function CriticalBlinkText({ children, style }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.Text style={[styles.text, style, { opacity }]} numberOfLines={1}>
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#F87171',
    fontWeight: '700',
    textAlign: 'center',
  },
});
