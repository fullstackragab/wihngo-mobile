import { useLanguage } from "@/contexts/language-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

interface NavigationChevronProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const NavigationChevron: React.FC<NavigationChevronProps> = ({
  size = 14,
  color = "#CCC",
  style,
}) => {
  const { isRTL } = useLanguage();

  return (
    <View style={[{ transform: [{ scaleX: isRTL ? -1 : 1 }] }, style]}>
      <FontAwesome6 name="chevron-right" size={size} color={color} />
    </View>
  );
};
