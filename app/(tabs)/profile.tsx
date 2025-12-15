import { NavigationChevron } from "@/components/navigation-chevron";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useNotifications } from "@/contexts/notification-context";
import { BorderRadius, FontSizes, Spacing } from "@/lib/constants/theme";
import { storyService } from "@/services/story.service";
import { userService } from "@/services/user.service";
import { Bird } from "@/types/bird";
import { User } from "@/types/user";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const { language, setLanguage, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const router = useRouter();
  const [lovedBirds, setLovedBirds] = useState<Bird[]>([]);
  const [supportedBirds, setSupportedBirds] = useState<Bird[]>([]);
  const [ownedBirds, setOwnedBirds] = useState<Bird[]>([]);
  const [stats, setStats] = useState({
    storiesCount: 0,
    totalSupport: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  // Refresh user profile when screen comes into focus (e.g., after editing profile)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refreshUserProfile();
        loadUserData();
      }
    }, [isAuthenticated])
  );

  const refreshUserProfile = async () => {
    try {
      // Fetch latest profile data including S3 image URL
      const profileData = await userService.getProfile();
      if (user) {
        const updatedUser: User = {
          ...user,
          name: profileData.name,
          bio: profileData.bio,
          profileImageUrl: profileData.profileImageUrl, // S3 pre-signed URL
          profileImageS3Key: profileData.profileImageS3Key,
        };
        updateUser(updatedUser);
        console.log("✅ Profile data refreshed with S3 image URL");
      }
    } catch (error) {
      console.error("Error refreshing profile data:", error);
    }
  };

  const loadUserData = async () => {
    if (!user?.userId) return;

    try {
      // Fetch all user data in parallel
      const [
        lovedBirdsData,
        supportedBirdsData,
        ownedBirdsData,
        myStoriesData,
      ] = await Promise.all([
        userService.getLovedBirds(user.userId),
        userService.getSupportedBirds(user.userId),
        userService.getOwnedBirds(user.userId),
        storyService.getMyStories(1, 100), // Fetch first page to get count
      ]);

      setLovedBirds(lovedBirdsData);
      setSupportedBirds(supportedBirdsData);
      setOwnedBirds(ownedBirdsData);
      setStats({
        storiesCount: myStoriesData.totalCount,
        totalSupport: supportedBirdsData.length,
      });

      console.log("✅ Profile data loaded:", {
        loved: lovedBirdsData.length,
        supported: supportedBirdsData.length,
        owned: ownedBirdsData.length,
        stories: myStoriesData.totalCount,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/welcome");
    } catch (error) {
      console.error("Logout error:", error);
      addNotification(
        "recommendation",
        "Logout Failed",
        "Failed to logout. Please try again."
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.notAuthHeader}>
          <FontAwesome6 name="user-circle" size={80} color="#E0E0E0" />
          <Text style={styles.notAuthTitle}>{t("auth.joinWhingo")}</Text>
          <Text style={styles.notAuthText}>{t("auth.connectWithBirds")}</Text>
        </View>

        <View style={styles.notAuthContent}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.primaryButtonText}>
              {t("auth.createAccount")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/welcome")}
          >
            <Text style={styles.secondaryButtonText}>{t("auth.signIn")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Minimal Profile Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/settings")}
        >
          <FontAwesome6 name="gear" size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          {user?.profileImageUrl || user?.avatarUrl ? (
            <Image
              source={{ uri: user.profileImageUrl || user.avatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <FontAwesome6 name="user" size={40} color="#CCC" />
            </View>
          )}
        </View>

        <Text style={styles.userName}>{user?.name || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Stats - Simplified */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lovedBirds.length}</Text>
          <Text style={styles.statLabel}>{t("bird.lovedBy")}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{supportedBirds.length}</Text>
          <Text style={styles.statLabel}>{t("bird.supportedBy")}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.storiesCount}</Text>
          <Text style={styles.statLabel}>{t("tabs.stories")}</Text>
        </View>
      </View>

      {/* Menu Items - Minimal */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/my-stories")}
        >
          <FontAwesome6 name="book-open" size={18} color="#666" />
          <Text style={styles.menuText}>{t("story.myStories")}</Text>
          <NavigationChevron />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/my-birds")}
        >
          <FontAwesome6 name="dove" size={18} color="#666" />
          <Text style={styles.menuText}>{t("bird.myBirds")}</Text>
          <NavigationChevron />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/loved-birds")}
        >
          <FontAwesome6 name="heart" size={18} color="#666" />
          <Text style={styles.menuText}>{t("bird.lovedBirds")}</Text>
          <NavigationChevron />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/supported-birds")}
        >
          <FontAwesome6 name="hand-holding-heart" size={18} color="#666" />
          <Text style={styles.menuText}>{t("bird.supportedBirds")}</Text>
          <NavigationChevron />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/edit-profile")}
        >
          <FontAwesome6 name="pen" size={18} color="#666" />
          <Text style={styles.menuText}>{t("settings.editProfile")}</Text>
          <NavigationChevron />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t("auth.logout")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // Not Authenticated Styles
  notAuthHeader: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  notAuthTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  notAuthText: {
    fontSize: FontSizes.md,
    color: "#666",
    textAlign: "center",
  },
  notAuthContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#1A1A1A",
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
  // Authenticated Styles
  profileHeader: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  settingsButton: {
    position: "absolute",
    top: Spacing.xl + 8,
    right: Spacing.lg,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: FontSizes.xxl,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: "#999",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.lg,
    backgroundColor: "#FAFAFA",
    borderRadius: BorderRadius.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: FontSizes.lg,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: Spacing.sm,
  },
  logoutContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  logoutButton: {
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.md,
    backgroundColor: "#FAFAFA",
  },
  logoutText: {
    fontSize: FontSizes.lg,
    color: "#EF4444",
    fontWeight: "500",
  },
});
