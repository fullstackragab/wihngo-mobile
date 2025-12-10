import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type ProfileQRCodeProps = {
  birdId: string;
  birdName: string;
  isPremium: boolean;
};

export function ProfileQRCode({
  birdId,
  birdName,
  isPremium,
}: ProfileQRCodeProps) {
  const [showQR, setShowQR] = useState(false);

  const profileUrl = `https://wihngo.app/birds/${birdId}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${birdName} on Wihngo! ${profileUrl}`,
        url: profileUrl,
      });
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  if (!isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <View style={styles.lockedContent}>
          <Ionicons
            name="qr-code-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.lockedText}>QR Code Profile</Text>
          <Text style={styles.lockedSubtext}>
            Premium feature: Share your bird&apos;s profile offline with a
            custom QR code
          </Text>
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color={theme.colors.accent} />
            <Text style={styles.premiumBadgeText}>Premium Only</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setShowQR(!showQR)}>
        <Ionicons name="qr-code" size={24} color={theme.colors.primary} />
        <Text style={styles.title}>Share Profile</Text>
        <Ionicons
          name={showQR ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.colors.textSecondary}
        />
      </Pressable>

      {showQR && (
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={profileUrl}
              size={200}
              backgroundColor="#fff"
              color={theme.colors.primary}
              logo={require("@/assets/images/icon.png")}
              logoSize={40}
              logoBackgroundColor="#fff"
            />
          </View>

          <Text style={styles.qrLabel}>
            Scan to visit {birdName}&apos;s profile
          </Text>

          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={handleShare}>
              <Ionicons
                name="share-social"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.actionText}>Share Link</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => {
                // TODO: Implement QR code download
              }}
            >
              <Ionicons
                name="download"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.actionText}>Download QR</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            Friends and family can scan this code to easily find and follow your
            bird
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border || "#e0e0e0",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    flex: 1,
  },
  qrContainer: {
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border || "#e0e0e0",
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primaryLight || "#e3f2fd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
  lockedContainer: {
    marginVertical: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border || "#e0e0e0",
    borderStyle: "dashed",
  },
  lockedContent: {
    alignItems: "center",
    padding: 24,
  },
  lockedText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 12,
  },
  lockedSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 20,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${theme.colors.accent}20`,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  premiumBadgeText: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: "600",
  },
});
