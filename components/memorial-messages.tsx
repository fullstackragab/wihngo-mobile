/**
 * Memorial Messages Component
 * Allows users to leave condolence messages for memorial birds
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MemorialMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

interface MemorialMessagesProps {
  birdId: string;
  birdName: string;
}

export default function MemorialMessages({
  birdId,
  birdName,
}: MemorialMessagesProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MemorialMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      return;
    }

    if (message.length > 500) {
      Alert.alert(
        "Message Too Long",
        "Please keep your message under 500 characters."
      );
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to submit memorial message
      // await memorialService.addMessage(birdId, message);

      // For now, add to local state
      const newMessage: MemorialMessage = {
        id: Date.now().toString(),
        userId: "current-user",
        userName: "You",
        message: message.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages([newMessage, ...messages]);
      setMessage("");

      Alert.alert("Message Posted", "Your tribute has been shared.");
    } catch (error) {
      console.error("Error posting memorial message:", error);
      Alert.alert("Error", "Failed to post message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: MemorialMessage }) => (
    <View style={styles.messageCard}>
      <View style={styles.messageHeader}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.messageDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubble-outline" size={24} color="#7F8C8D" />
        <Text style={styles.title}>Memorial Messages</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Share your memories of {birdName}</Text>
        <TextInput
          style={styles.input}
          placeholder="Write a message of remembrance..."
          placeholderTextColor="#BDC3C7"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <View style={styles.inputFooter}>
          <Text style={styles.charCount}>{message.length}/500</Text>
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || !message.trim()}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Posting..." : "Post Message"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.messagesSection}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color="#BDC3C7" />
            <Text style={styles.emptyStateText}>
              Be the first to share a memory of {birdName}
            </Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
  },
  inputSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7F8C8D",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#2C3E50",
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: "#95A5A6",
  },
  submitButton: {
    backgroundColor: "#7F8C8D",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#BDC3C7",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  messagesSection: {
    flex: 1,
  },
  messagesList: {
    padding: 20,
    gap: 12,
  },
  messageCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#95A5A6",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  messageDate: {
    fontSize: 12,
    color: "#95A5A6",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#34495E",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#95A5A6",
    textAlign: "center",
  },
});
