import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AppText, AppHeader, AppButton, AppInput } from "../../src/components";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import { apiSendCollaborationRequest } from "../../src/services/api";

export default function CollaborationRequestScreen() {
  const router = useRouter();
  const { contentId, contentTitle, elderName } = useLocalSearchParams<{
    contentId: string;
    contentTitle: string;
    elderId: string;
    elderName: string;
  }>();

  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setMessageError("Please write a short message explaining how you can help");
      return;
    }
    if (message.trim().length > 500) {
      setMessageError("Message must be at most 500 characters");
      return;
    }
    setMessageError("");
    setError(null);
    setSubmitting(true);
    try {
      const result = await apiSendCollaborationRequest({
        contentId: contentId!,
        message: message.trim(),
      });
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || "Failed to send request");
      }
    } catch {
      setError("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <AppHeader title="Request Sent" onBack={() => router.back()} />
        <View style={styles.centered}>
          <View style={styles.successIcon}>
            <AppText variant="title" color={colors.primary.contrast}>✓</AppText>
          </View>
          <AppText variant="heading" style={styles.successTitle}>Request Sent!</AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.successBody}>
            Your collaboration request for "{contentTitle}" has been sent to {elderName}. You will be notified when they respond.
          </AppText>
          <View style={styles.successActions}>
            <AppButton
              label="View Outgoing Requests"
              onPress={() => router.replace("/youth/outgoing-requests")}
              fullWidth
            />
            <AppButton
              label="Back to Home"
              variant="outline"
              onPress={() => router.replace("/youth/(tabs)/home")}
              fullWidth
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Request Collaboration" onBack={() => router.back()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <AppText variant="subheading">Collaborate with {elderName}</AppText>
          <AppText variant="body" color={colors.text.secondary}>
            You are requesting to collaborate on:
          </AppText>
          <View style={styles.contentPreview}>
            <AppText variant="label">{contentTitle}</AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="body">
            Explain how you would like to contribute. This could be a translation, transcription, explanation, or cultural context.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppInput
            label="Your Message"
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              if (messageError) setMessageError("");
              if (error) setError(null);
            }}
            multiline
            numberOfLines={4}
            placeholder="I would like to help translate this story into English..."
            error={messageError}
            style={styles.messageInput}
          />
          <AppText variant="caption" color={colors.text.tertiary}>
            {message.length}/500 characters
          </AppText>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <AppText variant="bodySmall" color={colors.error.main}>{error}</AppText>
          </View>
        )}

        <View style={styles.actions}>
          <AppButton
            label={submitting ? "Sending..." : "Send Request"}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  contentPreview: {
    backgroundColor: colors.background.warm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  messageInput: {
    height: 100,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  errorBox: {
    backgroundColor: "#FFEBEE",
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success.main,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    textAlign: "center",
  },
  successBody: {
    textAlign: "center",
    lineHeight: 22,
  },
  successActions: {
    width: "100%",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
