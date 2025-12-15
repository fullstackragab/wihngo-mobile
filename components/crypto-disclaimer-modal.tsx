import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CryptoDisclaimerModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  network?: string;
  walletAddress?: string;
}

export default function CryptoDisclaimerModal({
  visible,
  onClose,
  onAccept,
  network,
  walletAddress,
}: CryptoDisclaimerModalProps) {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Ionicons
              name="warning-outline"
              size={32}
              color="#FF9500"
              style={styles.headerIcon}
            />
            <Text style={styles.title}>{t("crypto.confirmationRequired")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
          >
            {network && walletAddress && (
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>
                  {t("crypto.networkLabel")}{" "}
                  <Text style={styles.networkText}>{network}</Text>
                </Text>
                <Text style={styles.addressLabel}>
                  {t("crypto.addressLabel")}
                </Text>
                <Text style={styles.addressText}>{walletAddress}</Text>
              </View>
            )}

            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.warningText}>
                {t("crypto.transactionsIrreversible")}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>
              {t("crypto.importantDisclaimers")}
            </Text>

            <View style={styles.disclaimerList}>
              <View style={styles.disclaimerItem}>
                <Ionicons name="close-circle" size={18} color="#E74C3C" />
                <Text style={styles.disclaimerText}>
                  {t("crypto.wihngoNotWallet")}
                </Text>
              </View>

              <View style={styles.disclaimerItem}>
                <Ionicons name="close-circle" size={18} color="#E74C3C" />
                <Text style={styles.disclaimerText}>
                  {t("crypto.wihngoNoGuarantee")}
                </Text>
              </View>

              <View style={styles.disclaimerItem}>
                <Ionicons name="close-circle" size={18} color="#E74C3C" />
                <Text style={styles.disclaimerText}>
                  {t("crypto.cryptoPeerToPeer")}
                </Text>
              </View>

              <View style={styles.disclaimerItem}>
                <Ionicons name="close-circle" size={18} color="#E74C3C" />
                <Text style={styles.disclaimerText}>
                  {t("crypto.noRecoveryPromise")}
                </Text>
              </View>

              <View style={styles.disclaimerItem}>
                <Ionicons name="alert-circle" size={18} color="#F39C12" />
                <Text style={styles.disclaimerText}>
                  {t("crypto.volatilityWarning")}
                </Text>
              </View>

              <View style={styles.disclaimerItem}>
                <Ionicons name="checkmark-circle" size={18} color="#27AE60" />
                <Text style={styles.disclaimerText}>
                  {t("crypto.doubleCheckAddress")}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAccepted(!accepted)}
            >
              <View
                style={[styles.checkbox, accepted && styles.checkboxChecked]}
              >
                {accepted && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                {t("crypto.iUnderstand")} {t("crypto.andAcceptAllRisks")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acceptButton,
                !accepted && styles.acceptButtonDisabled,
              ]}
              onPress={onAccept}
              disabled={!accepted}
            >
              <Text
                style={[
                  styles.acceptButtonText,
                  !accepted && styles.acceptButtonTextDisabled,
                ]}
              >
                {t("common.confirm")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  addressBox: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  addressLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    fontWeight: "600",
  },
  networkText: {
    color: "#4ECDC4",
    fontWeight: "700",
  },
  addressText: {
    fontSize: 12,
    color: "#333",
    fontFamily: "monospace",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  warningText: {
    fontSize: 14,
    color: "#C62828",
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  disclaimerList: {
    marginBottom: 20,
  },
  disclaimerItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingLeft: 4,
  },
  disclaimerText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#4ECDC4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#4ECDC4",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 1,
  },
  acceptButton: {
    backgroundColor: "#4ECDC4",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  acceptButtonDisabled: {
    backgroundColor: "#BDC3C7",
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  acceptButtonTextDisabled: {
    color: "#ECF0F1",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
});
