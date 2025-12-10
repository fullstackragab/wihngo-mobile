import React from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Text,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

interface RoundedTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  iconColor?: string;
}

export default function RoundedTextInput({
  label,
  error,
  icon,
  iconColor = "#95A5A6",
  style,
  ...props
}: RoundedTextInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && (
          <FontAwesome6
            name={icon as any}
            size={20}
            color={error ? "#EF4444" : iconColor}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#95A5A6"
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#2C3E50",
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    marginTop: 6,
    marginLeft: 4,
  },
});
