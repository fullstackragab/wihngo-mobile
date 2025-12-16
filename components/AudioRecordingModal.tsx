import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AudioRecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onRecordingComplete: (uri: string, duration: number) => void;
  isRecording: boolean;
  isPaused: boolean;
  duration: number | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onPlayRecording: () => void;
  recordingUri: string | null;
}

export function AudioRecordingModal({
  visible,
  onClose,
  isRecording,
  isPaused,
  duration,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onPlayRecording,
  recordingUri,
}: AudioRecordingModalProps) {
  const { t } = useTranslation();
  const [displayDuration, setDisplayDuration] = useState("00:00");
  const [waveformHeights, setWaveformHeights] = useState<number[]>(
    Array(20).fill(0).map(() => 20 + Math.random() * 60)
  );

  // Format duration display
  useEffect(() => {
    if (duration) {
      const seconds = Math.floor(duration / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setDisplayDuration(
        `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    } else {
      setDisplayDuration("00:00");
    }
  }, [duration]);

  // Animate waveform while recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setWaveformHeights(
          Array(20).fill(0).map(() => 20 + Math.random() * 60)
        );
      }, 150); // Update every 150ms for smooth animation
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, isPaused]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {t("audioRecording.title")}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <FontAwesome6 name="xmark" size={20} color="#95A5A6" />
            </TouchableOpacity>
          </View>

          {/* Waveform visualization area */}
          <View style={styles.waveformContainer}>
            {isRecording && !isPaused ? (
              <View style={styles.animatedWave}>
                {waveformHeights.map((height, i) => (
                  <View
                    key={i}
                    style={[
                      styles.wavebar,
                      {
                        height: height,
                      },
                    ]}
                  />
                ))}
              </View>
            ) : !isRecording && recordingUri ? (
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <FontAwesome6 name="microphone" size={40} color="#4ECDC4" />
                </View>
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <FontAwesome6 name="microphone" size={40} color="#BDC3C7" />
                </View>
              </View>
            )}
          </View>

          {/* Timer */}
          <Text style={styles.timer}>{displayDuration}</Text>

          {/* Status Text */}
          <Text style={styles.statusText}>
            {isRecording && !isPaused
              ? t("audioRecording.recording")
              : isPaused
              ? t("audioRecording.paused")
              : recordingUri
              ? t("audioRecording.recorded")
              : t("audioRecording.ready")}
          </Text>

          {/* Controls */}
          <View style={styles.controls}>
            {!isRecording && !recordingUri && (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={onStartRecording}
              >
                <View style={styles.recordButtonInner} />
              </TouchableOpacity>
            )}

            {isRecording && (
              <>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={isPaused ? onResumeRecording : onPauseRecording}
                >
                  <FontAwesome6
                    name={isPaused ? "play" : "pause"}
                    size={20}
                    color="#F39C12"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={onStopRecording}
                >
                  <View style={styles.stopButtonInner} />
                </TouchableOpacity>
              </>
            )}

            {!isRecording && recordingUri && (
              <TouchableOpacity
                style={styles.playButton}
                onPress={onPlayRecording}
              >
                <FontAwesome6 name="play" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Instructions */}
          <Text style={styles.instructions}>
            {isRecording && !isPaused
              ? t("audioRecording.instructionRecording")
              : isPaused
              ? t("audioRecording.instructionPaused")
              : recordingUri
              ? t("audioRecording.instructionRecorded")
              : t("audioRecording.instructionStart")}
          </Text>

          {/* Max duration info */}
          <View style={styles.hintContainer}>
            <FontAwesome6 name="circle-info" size={12} color="#95A5A6" />
            <Text style={styles.hint}>
              {t("audioRecording.maxDuration", { duration: "3:00" })}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 48,
    paddingHorizontal: 24,
    minHeight: "75%",
    maxHeight: "90%",
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  waveformContainer: {
    height: 160,
    backgroundColor: "#F8FAFB",
    borderRadius: 20,
    marginBottom: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  animatedWave: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 100,
  },
  wavebar: {
    width: 3,
    backgroundColor: "#4ECDC4",
    borderRadius: 2,
    opacity: 0.8,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  timer: {
    fontSize: 56,
    fontWeight: "300",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 12,
    fontVariant: ["tabular-nums"],
    letterSpacing: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4ECDC4",
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 32,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: "#E74C3C",
  },
  recordButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E74C3C",
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF9F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F39C12",
  },
  stopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#E74C3C",
  },
  stopButtonInner: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: "#E74C3C",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  instructions: {
    fontSize: 15,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  hintContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  hint: {
    fontSize: 12,
    color: "#95A5A6",
    textAlign: "center",
  },
});
