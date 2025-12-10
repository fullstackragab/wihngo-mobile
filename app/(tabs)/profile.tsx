import { useAuth } from "@/contexts/auth-context";
import { Bird } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();
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

  const loadUserData = async () => {
    try {
      // TODO: Fetch user data from API
      // const userData = await userService.getUserProfile(user.userId);
      // setLovedBirds(userData.lovedBirds);
      // setSupportedBirds(userData.supportedBirds);
      // setOwnedBirds(userData.ownedBirds);
      // setStats({ storiesCount: userData.storiesCount, totalSupport: userData.totalSupport });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/welcome");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#4ECDC4", "#44A08D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.notAuthHeader}
        >
          <FontAwesome6 name="user-circle" size={100} color="#FFFFFF" />
          <Text style={styles.notAuthTitle}>Join Whingo</Text>
          <Text style={styles.notAuthText}>
            Sign in to save birds, create stories, and connect with the community
          </Text>
        </LinearGradient>

        <View style={styles.notAuthContent}>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: "#FFE5E5" }]}>
                <FontAwesome6 name="heart" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Save Your Favorites</Text>
                <Text style={styles.featureDescription}>
                  Love and track birds you care about
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: "#E0E7FF" }]}>
                <FontAwesome6 name="book-open" size={24} color="#667EEA" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Share Stories</Text>
                <Text style={styles.featureDescription}>
                  Create and share your bird experiences
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: "#D4F4DD" }]}>
                <FontAwesome6 name="hand-holding-heart" size={24} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Support Conservation</Text>
                <Text style={styles.featureDescription}>
                  Help protect endangered species
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.authButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/signup")}
            >
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.primaryButtonText}>Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/welcome")}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Profile Info */}
      <LinearGradient
        colors={["#4ECDC4", "#44A08D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileHeader}
      >
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push("/settings")}
        >
          <FontAwesome6 name="gear" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <FontAwesome6 name="user" size={50} color="#FFFFFF" />
            )}
          </View>
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={() => router.push("/edit-profile")}
          >
            <FontAwesome6 name="camera" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.name || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => router.push("/edit-profile")}
        >
          <FontAwesome6 name="pen" size={14} color="#4ECDC4" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={["#FF6B6B", "#EE5A6F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}
          >
            <FontAwesome6 name="heart" size={28} color="#FFFFFF" solid />
            <Text style={styles.statValue}>{lovedBirds.length}</Text>
            <Text style={styles.statLabel}>Loved Birds</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={["#10b981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}
          >
            <FontAwesome6 name="hand-holding-heart" size={28} color="#FFFFFF" />
            <Text style={styles.statValue}>{supportedBirds.length}</Text>
            <Text style={styles.statLabel}>Supported</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={["#667EEA", "#764BA2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}
          >
            <FontAwesome6 name="book-open" size={28} color="#FFFFFF" />
            <Text style={styles.statValue}>{stats.storiesCount}</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/my-birds")}
        >
          <View style={styles.menuIconContainer}>
            <FontAwesome6 name="dove" size={20} color="#4ECDC4" />
          </View>
          <Text style={styles.menuText}>My Birds</Text>
          <FontAwesome6 name="chevron-right" size={16} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/loved-birds")}
        >
          <View style={styles.menuIconContainer}>
            <FontAwesome6 name="heart" size={20} color="#FF6B6B" solid />
          </View>
          <Text style={styles.menuText}>Loved Birds</Text>
          <FontAwesome6 name="chevron-right" size={16} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/supported-birds")}
        >
          <View style={styles.menuIconContainer}>
            <FontAwesome6 name="hand-holding-heart" size={20} color="#10b981" />
          </View>
          <Text style={styles.menuText}>Supported Birds</Text>
          <FontAwesome6 name="chevron-right" size={16} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/create-story")}
        >
          <View style={styles.menuIconContainer}>
            <FontAwesome6 name="pen" size={20} color="#667EEA" />
          </View>
          <Text style={styles.menuText}>Create Story</Text>
          <FontAwesome6 name="chevron-right" size={16} color="#BDC3C7" />
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/notifications-settings")}
        >
          <View style={styles.menuIconContainer}>
            <FontAwesome6 name="bell" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.menuText}>Notifications</Text>
          <FontAwesome6 name="chevron-right" size={16} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/privacy-settings")}
        >
          <View style={styles.menuIconContainer}>
            <FontAwesome6 name="shield-halved" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.menuText}>Privacy</Text>
          <FontAwesome6 name="chevron-right" size={16} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/payment-methods")}
        >
          <View style={styles.menuIconContainer}>
            <FontAwesome6 name="credit-card" size={20} color="#EC4899" />
          </View>
          <Text style={styles.menuText}>Payment Methods</Text>
          <FontAwesome6 name="chevron-right" size={16} color="#BDC3C7" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome6 name="right-from-bracket" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  // Not Authenticated Styles
  notAuthHeader: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  notAuthTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 12,
  },
  notAuthText: {
    fontSize: 16,
    color: "#E0F2F1",
    textAlign: "center",
    lineHeight: 24,
  },
  notAuthContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  featuresList: {
    gap: 20,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  authButtons: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4ECDC4",
  },
  secondaryButtonText: {
    color: "#4ECDC4",
    fontSize: 17,
    fontWeight: "bold",
  },
  // Authenticated Styles
  profileHeader: {
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  settingsButton: {
    position: "absolute",
    top: 16,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 10,
    borderRadius: 10,
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4ECDC4",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: "#E0F2F1",
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editProfileText: {
    color: "#4ECDC4",
    fontSize: 15,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: -24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statGradient: {
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FEE2E2",
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },
});
