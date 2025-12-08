import { useAuth } from "@/contexts/auth-context";
import { Bird } from "@/types/bird";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
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
        <View style={styles.notAuthenticated}>
          <FontAwesome6 name="user-circle" size={80} color="#BDC3C7" />
          <Text style={styles.notAuthTitle}>Not Logged In</Text>
          <Text style={styles.notAuthText}>
            Sign in to access your profile and saved birds
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/welcome")}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <FontAwesome6 name="gear" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <FontAwesome6 name="user" size={40} color="#95A5A6" />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/edit-profile")}
        >
          <FontAwesome6 name="pen" size={16} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <FontAwesome6 name="heart" size={24} color="#FF6B6B" />
          <Text style={styles.statValue}>{lovedBirds.length}</Text>
          <Text style={styles.statLabel}>Loved Birds</Text>
        </View>
        <View style={styles.statCard}>
          <FontAwesome6 name="hand-holding-heart" size={24} color="#10b981" />
          <Text style={styles.statValue}>{supportedBirds.length}</Text>
          <Text style={styles.statLabel}>Supported</Text>
        </View>
        <View style={styles.statCard}>
          <FontAwesome6 name="book-open" size={24} color="#667EEA" />
          <Text style={styles.statValue}>{stats.storiesCount}</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        {ownedBirds.length > 0 && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/add-bird")}
          >
            <View style={styles.menuItemIcon}>
              <FontAwesome6 name="plus" size={20} color="#4ECDC4" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Add New Bird</Text>
              <Text style={styles.menuItemSubtitle}>
                List a bird you care for
              </Text>
            </View>
            <FontAwesome6 name="chevron-right" size={16} color="#95A5A6" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/create-story")}
        >
          <View style={styles.menuItemIcon}>
            <FontAwesome6 name="pen-to-square" size={20} color="#667EEA" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Create Story</Text>
            <Text style={styles.menuItemSubtitle}>
              Share your bird experiences
            </Text>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color="#95A5A6" />
        </TouchableOpacity>
      </View>

      {/* My Birds */}
      {ownedBirds.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Birds</Text>
            <TouchableOpacity onPress={() => router.push("/my-birds")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ownedBirds.slice(0, 3).map((bird) => (
              <TouchableOpacity
                key={bird.birdId}
                style={styles.birdCard}
                onPress={() => router.push(`/(tabs)/birds/${bird.birdId}`)}
              >
                <Image
                  source={{
                    uri: bird.imageUrl || "https://via.placeholder.com/100",
                  }}
                  style={styles.birdCardImage}
                />
                <Text style={styles.birdCardName} numberOfLines={1}>
                  {bird.name}
                </Text>
                <View style={styles.birdCardStats}>
                  <View style={styles.birdCardStat}>
                    <FontAwesome6 name="heart" size={10} color="#FF6B6B" />
                    <Text style={styles.birdCardStatText}>{bird.lovedBy}</Text>
                  </View>
                  <View style={styles.birdCardStat}>
                    <FontAwesome6
                      name="hand-holding-heart"
                      size={10}
                      color="#10b981"
                    />
                    <Text style={styles.birdCardStatText}>
                      {bird.supportedBy}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Loved Birds */}
      {lovedBirds.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Loved Birds</Text>
            <TouchableOpacity onPress={() => router.push("/loved-birds")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {lovedBirds.slice(0, 3).map((bird) => (
              <TouchableOpacity
                key={bird.birdId}
                style={styles.birdCard}
                onPress={() => router.push(`/(tabs)/birds/${bird.birdId}`)}
              >
                <Image
                  source={{
                    uri: bird.imageUrl || "https://via.placeholder.com/100",
                  }}
                  style={styles.birdCardImage}
                />
                <Text style={styles.birdCardName} numberOfLines={1}>
                  {bird.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Supported Birds */}
      {supportedBirds.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Supported Birds</Text>
            <TouchableOpacity onPress={() => router.push("/supported-birds")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {stats.totalSupport > 0 && (
            <Text style={styles.totalSupport}>
              Total support: ${stats.totalSupport.toLocaleString()}
            </Text>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {supportedBirds.slice(0, 3).map((bird) => (
              <TouchableOpacity
                key={bird.birdId}
                style={styles.birdCard}
                onPress={() => router.push(`/(tabs)/birds/${bird.birdId}`)}
              >
                <Image
                  source={{
                    uri: bird.imageUrl || "https://via.placeholder.com/100",
                  }}
                  style={styles.birdCardImage}
                />
                <Text style={styles.birdCardName} numberOfLines={1}>
                  {bird.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Settings Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/notifications-settings")}
        >
          <View style={styles.menuItemIcon}>
            <FontAwesome6 name="bell" size={20} color="#F39C12" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Notifications</Text>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color="#95A5A6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/payment-methods")}
        >
          <View style={styles.menuItemIcon}>
            <FontAwesome6 name="credit-card" size={20} color="#9B59B6" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Payment Methods</Text>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color="#95A5A6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/privacy-settings")}
        >
          <View style={styles.menuItemIcon}>
            <FontAwesome6 name="lock" size={20} color="#E74C3C" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Privacy</Text>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color="#95A5A6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={async () => {
            const paypalUrl =
              "https://www.paypal.com/ncp/payment/AECE9FQMFFETS";
            const canOpen = await Linking.canOpenURL(paypalUrl);
            if (canOpen) {
              await Linking.openURL(paypalUrl);
            } else {
              Alert.alert("Error", "Cannot open PayPal");
            }
          }}
        >
          <View style={styles.menuItemIcon}>
            <Feather name="gift" size={20} color="#ec4899" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Support Wihngo</Text>
            <Text style={styles.menuItemSubtitle}>
              Help us keep the platform free
            </Text>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color="#95A5A6" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome6 name="right-from-bracket" size={20} color="#E74C3C" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <Text style={styles.version}>Wihngo v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F8F7",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  seeAll: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 2,
  },
  birdCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  birdCardImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#E8E8E8",
  },
  birdCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    padding: 8,
  },
  birdCardStats: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  birdCardStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  birdCardStatText: {
    fontSize: 10,
    color: "#7F8C8D",
  },
  totalSupport: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
    marginBottom: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E74C3C",
  },
  version: {
    fontSize: 12,
    color: "#95A5A6",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  notAuthenticated: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 20,
    marginBottom: 8,
  },
  notAuthText: {
    fontSize: 14,
    color: "#95A5A6",
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
