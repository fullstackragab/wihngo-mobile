/**
 * useAudioRecorder Hook
 * Reusable hook for audio recording with expo-av
 */

import { Audio } from "expo-av";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

export interface AudioRecorderOptions {
  maxDurationMs?: number;
  quality?: Audio.AndroidAudioEncoder | Audio.IOSAudioQuality;
}

export interface AudioRecorderResult {
  uri: string | null;
  duration: number | null; // in milliseconds
  isRecording: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  loading: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  clearRecording: () => void;
  playRecording: () => Promise<void>;
  stopPlayback: () => Promise<void>;
}

const DEFAULT_OPTIONS: AudioRecorderOptions = {
  maxDurationMs: 180000, // 3 minutes max
  quality: Platform.OS === "ios"
    ? Audio.IOSAudioQuality.HIGH
    : Audio.AndroidAudioEncoder.AAC,
};

export function useAudioRecorder(
  options: AudioRecorderOptions = {},
  onRecordingComplete?: (uri: string, duration: number) => void
): AudioRecorderResult {
  const [uri, setUri] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  // Update duration while recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (recording && isRecording && !isPaused) {
      interval = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording) {
            setDuration(status.durationMillis);
          }
        } catch (error) {
          console.error("Error getting recording status:", error);
        }
      }, 100); // Update every 100ms for smooth timer
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [recording, isRecording, isPaused]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
    };
  }, [recording, sound]);

  const startRecording = useCallback(async () => {
    setError(null);
    setLoading(true);
    setDuration(0); // Reset duration at start

    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow microphone access to record audio for your stories."
        );
        setLoading(false);
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Configure recording options
      const recordingOptions: Audio.RecordingOptions = {
        isMeteringEnabled: true,
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: finalOptions.quality as Audio.AndroidAudioEncoder,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: finalOptions.quality as Audio.IOSAudioQuality,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      };

      // Create and start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions
      );

      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);

      // Set up auto-stop on max duration
      if (finalOptions.maxDurationMs) {
        setTimeout(async () => {
          if (newRecording) {
            await stopRecording();
          }
        }, finalOptions.maxDurationMs);
      }

      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Failed to start recording");
      Alert.alert("Error", "Failed to start recording. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [finalOptions.maxDurationMs, finalOptions.quality]);

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    setLoading(true);

    try {
      await recording.stopAndUnloadAsync();

      const recordingUri = recording.getURI();
      const status = await recording.getStatusAsync();

      if (recordingUri) {
        setUri(recordingUri);
        setDuration(status.durationMillis);

        if (onRecordingComplete && status.durationMillis) {
          onRecordingComplete(recordingUri, status.durationMillis);
        }
      }

      setIsRecording(false);
      setIsPaused(false);
      setRecording(null);

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      console.log("Recording stopped:", recordingUri);
    } catch (err) {
      console.error("Failed to stop recording:", err);
      setError("Failed to stop recording");
    } finally {
      setLoading(false);
    }
  }, [recording, onRecordingComplete]);

  const pauseRecording = useCallback(async () => {
    if (!recording || !isRecording) return;

    try {
      await recording.pauseAsync();
      setIsPaused(true);
      console.log("Recording paused");
    } catch (err) {
      console.error("Failed to pause recording:", err);
    }
  }, [recording, isRecording]);

  const resumeRecording = useCallback(async () => {
    if (!recording || !isPaused) return;

    try {
      await recording.startAsync();
      setIsPaused(false);
      console.log("Recording resumed");
    } catch (err) {
      console.error("Failed to resume recording:", err);
    }
  }, [recording, isPaused]);

  const clearRecording = useCallback(() => {
    setUri(null);
    setDuration(null);
    setError(null);
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);

    if (sound) {
      sound.unloadAsync().catch(console.error);
      setSound(null);
    }
  }, [sound]);

  const playRecording = useCallback(async () => {
    if (!uri) return;

    try {
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Auto-unload when playback finishes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          newSound.unloadAsync();
          setSound(null);
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error("Failed to play recording:", err);
      setIsPlaying(false);
      Alert.alert("Error", "Failed to play recording");
    }
  }, [uri, sound]);

  const stopPlayback = useCallback(async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  }, [sound]);

  return {
    uri,
    duration,
    isRecording,
    isPaused,
    isPlaying,
    loading,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    playRecording,
    stopPlayback,
  };
}
