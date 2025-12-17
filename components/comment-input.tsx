/**
 * CommentInput Component
 * Input field for creating comments and replies with character limit
 */

import { COMMENT_MAX_LENGTH } from "@/types/like-comment";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  replyingTo?: string | null; // Username being replied to
  onCancelReply?: () => void;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export default function CommentInput({
  onSubmit,
  placeholder,
  replyingTo = null,
  onCancelReply,
  style,
  autoFocus = false,
}: CommentInputProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      Alert.alert(t("alerts.error"), t("comments.emptyComment"));
      return;
    }

    if (trimmedContent.length > COMMENT_MAX_LENGTH) {
      Alert.alert(
        t("alerts.error"),
        t("comments.tooLong", { maxLength: COMMENT_MAX_LENGTH })
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(trimmedContent);
      setContent(""); // Clear input on success
    } catch (error) {
      console.error("Error submitting comment:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("alerts.tryAgain");
      Alert.alert(t("alerts.error"), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > COMMENT_MAX_LENGTH;
  const showCharCount = characterCount > COMMENT_MAX_LENGTH * 0.8; // Show when 80% full

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={[styles.container, style]}>
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>
              {t("comments.replyingTo", { name: "" })}
              <Text style={styles.replyingToName}>{replyingTo}</Text>
            </Text>
            <TouchableOpacity
              onPress={onCancelReply}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isOverLimit && styles.inputError]}
            value={content}
            onChangeText={setContent}
            placeholder={placeholder || t("comments.writeComment")}
            placeholderTextColor="#999"
            multiline
            maxLength={COMMENT_MAX_LENGTH + 100} // Allow typing over limit to show error
            editable={!isSubmitting}
            autoFocus={autoFocus}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || !content.trim() || isOverLimit}
            style={[
              styles.sendButton,
              (!content.trim() || isSubmitting || isOverLimit) &&
                styles.sendButtonDisabled,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={!content.trim() || isOverLimit ? "#CCC" : "#4A90E2"}
              />
            )}
          </TouchableOpacity>
        </View>

        {showCharCount && (
          <Text
            style={[styles.charCount, isOverLimit && styles.charCountError]}
          >
            {characterCount} / {COMMENT_MAX_LENGTH}
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  replyingToContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 13,
    color: "#666",
  },
  replyingToName: {
    fontWeight: "600",
    color: "#4A90E2",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
  },
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  charCountError: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
});
