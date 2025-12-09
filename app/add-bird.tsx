import { useAuth } from "@/contexts/auth-context";
import { birdService } from "@/services/bird.service";
import { CreateBirdDto } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddBird() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [commonName, setCommonName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      Alert.alert("Error", "You must be logged in to add a bird");
      router.push("/welcome");
      return;
    }

    // Validate required fields
    if (!name.trim() || !species.trim() || !tagline.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const birdData: CreateBirdDto = {
        name: name.trim(),
        species: species.trim(),
        commonName: commonName.trim() || undefined,
        scientificName: scientificName.trim() || undefined,
        tagline: tagline.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        age: age.trim() || undefined,
        location: location.trim() || undefined,
      };

      // Create bird through API (automatically associates with authenticated user)
      const createdBird = await birdService.createBird(birdData);
      console.log("Bird created successfully:", createdBird);

      Alert.alert("Success", `${name} has been added to your profile!`, [
        {
          text: "View Bird",
          onPress: () => {
            router.back();
            // Optionally navigate to the bird's profile
            // router.push(`/bird/${createdBird.birdId}`);
          },
        },
        {
          text: "Add Another",
          onPress: () => {
            // Reset form
            setName("");
            setSpecies("");
            setCommonName("");
            setScientificName("");
            setTagline("");
            setDescription("");
            setImageUrl("");
            setCoverImageUrl("");
            setAge("");
            setLocation("");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error adding bird:", error);

      // Provide user-friendly error messages
      let errorMessage = "Failed to add bird. Please try again.";

      if (error.message?.includes("Session expired")) {
        errorMessage = "Your session has expired. Please log in again.";
        router.push("/welcome");
      } else if (error.status === 400) {
        errorMessage = "Invalid bird information. Please check your input.";
      } else if (error.status === 401) {
        errorMessage = "You must be logged in to add a bird.";
        router.push("/welcome");
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="xmark" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Bird</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={
            loading || !name.trim() || !species.trim() || !tagline.trim()
          }
        >
          <Text
            style={[
              styles.saveButton,
              (!name.trim() || !species.trim() || !tagline.trim() || loading) &&
                styles.saveButtonDisabled,
            ]}
          >
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Required Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Bird Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Charlie"
              placeholderTextColor="#95A5A6"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Species <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Hummingbird"
              placeholderTextColor="#95A5A6"
              value={species}
              onChangeText={setSpecies}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Common Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Anna's Hummingbird"
              placeholderTextColor="#95A5A6"
              value={commonName}
              onChangeText={setCommonName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scientific Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Calypte anna"
              placeholderTextColor="#95A5A6"
              value={scientificName}
              onChangeText={setScientificName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Tagline <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="A short, catchy description"
              placeholderTextColor="#95A5A6"
              value={tagline}
              onChangeText={setTagline}
              maxLength={100}
            />
            <Text style={styles.charCount}>{tagline.length}/100</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us more about this bird..."
              placeholderTextColor="#95A5A6"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2 years"
              placeholderTextColor="#95A5A6"
              value={age}
              onChangeText={setAge}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., California"
              placeholderTextColor="#95A5A6"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#95A5A6"
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            {imageUrl.trim() && (
              <Image
                source={{ uri: imageUrl }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cover Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/cover.jpg"
              placeholderTextColor="#95A5A6"
              value={coverImageUrl}
              onChangeText={setCoverImageUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            {coverImageUrl.trim() && (
              <Image
                source={{ uri: coverImageUrl }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips for listing your bird</Text>
          <Text style={styles.tipsText}>• Use clear, high-quality photos</Text>
          <Text style={styles.tipsText}>
            • Write a compelling tagline that captures personality
          </Text>
          <Text style={styles.tipsText}>
            • Include details about care, behavior, and needs
          </Text>
          <Text style={styles.tipsText}>
            • Be honest and transparent with supporters
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  saveButtonDisabled: {
    color: "#BDC3C7",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  required: {
    color: "#E74C3C",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#2C3E50",
  },
  textArea: {
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: "#95A5A6",
    textAlign: "right",
    marginTop: 4,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: "#E8E8E8",
  },
  tipsSection: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: "#7F8C8D",
    marginBottom: 4,
  },
});
