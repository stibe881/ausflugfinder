import { Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LEGAL_DOCUMENTS, type LegalDocumentKey } from "@/lib/legal-content";

const LINKS: { key: LegalDocumentKey; label: string; href: string }[] = [
  { key: "impressum", label: "Impressum", href: "/legal/impressum" },
  { key: "privacy", label: "Datenschutz", href: "/legal/privacy" },
  { key: "terms", label: "AGB", href: "/legal/terms" },
];

export function LegalPage({ docKey }: { docKey: LegalDocumentKey }) {
  const doc = LEGAL_DOCUMENTS[docKey];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: doc.title, headerBackTitle: "Zurück" }} />
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        >
          <View style={styles.column}>
            {doc.sections.map((section) => (
              <View key={section.heading} style={styles.section}>
                <ThemedText style={styles.heading}>{section.heading}</ThemedText>
                {section.paragraphs?.map((text, i) => (
                  <ThemedText key={i} style={[styles.paragraph, { color: colors.textSecondary }]}>
                    {text}
                  </ThemedText>
                ))}
                {section.bullets?.map((text, i) => (
                  <ThemedText key={i} style={[styles.paragraph, { color: colors.textSecondary }]}>
                    {"•  "}
                    {text}
                  </ThemedText>
                ))}
                {section.footer && (
                  <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                    {section.footer}
                  </ThemedText>
                )}
              </View>
            ))}

            {doc.updated && (
              <ThemedText style={[styles.updated, { color: colors.textSecondary }]}>{doc.updated}</ThemedText>
            )}

            <View style={[styles.links, { borderTopColor: colors.border }]}>
              {LINKS.filter((l) => l.key !== docKey).map((link) => (
                <Pressable key={link.key} onPress={() => router.push(link.href as any)} hitSlop={8}>
                  <ThemedText style={[styles.link, { color: colors.primary }]}>{link.label}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, alignItems: "center" },
  column: { width: "100%", maxWidth: 800 },
  section: { marginBottom: Spacing.lg },
  heading: { fontSize: 18, fontWeight: "600", marginBottom: Spacing.sm },
  paragraph: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.sm },
  updated: { fontSize: 13, marginTop: Spacing.sm },
  links: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  link: { fontSize: 15, fontWeight: "500" },
});
