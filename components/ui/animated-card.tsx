import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

type AnimatedCardProps = {
  children: React.ReactNode;
  style?: object;
  duration?: number; // animation duration
  offsetY?: number; // vertical slide offset
};

export default function AnimatedCard({
  children,
  style,
  duration = 550,
  offsetY = 10,
}: AnimatedCardProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const animatedStyle = {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [offsetY, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
  },
});
