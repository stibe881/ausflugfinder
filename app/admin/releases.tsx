import { Stack } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, SemanticColors, Spacing } from "@/constants/theme";
import { useAdmin } from "@/contexts/admin-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { confirmAsync, notify } from "@/lib/confirm";
import { getReleaseRuns, startRelease, type ReleaseRun, type ReleaseTarget } from "@/lib/release-api";

const BUILDS_URL = "https://expo.dev/accounts/stibe88/projects/ausflugfinder-app/builds";

const ACTIONS: { target: ReleaseTarget; title: string; subtitle: string; icon: string }[] = [
  { target: "web", title: "Web aktualisieren", subtitle: "Neue Version der Webseite veröffentlichen", icon: "globe" },
  { target: "ios", title: "iOS-App aktualisieren", subtitle: "Build für TestFlight erstellen", icon: "iphone" },
  { target: "android", title: "Android-App aktualisieren", subtitle: "Build für Google Play erstellen", icon: "square.grid.2x2.fill" },
  { target: "all", title: "Alles aktualisieren", subtitle: "Web, iOS und Android zusammen", icon: "paperplane.fill" },
];

const TARGET_LABEL: Record<ReleaseTarget, string> = {
  web: "die Webseite",
  ios: "die iOS-App",
  android: "die Android-App",
  all: "Web, iOS und Android",
};

function runLabel(run: ReleaseRun): { text: string; color: string } {
  if (run.status === "queued") return { text: "Wartet", color: SemanticColors.warning };
  if (run.status !== "completed") return { text: "Läuft", color: SemanticColors.info };
  if (run.conclusion === "success") return { text: "Fertig", color: SemanticColors.success };
  if (run.conclusion === "cancelled") return { text: "Abgebrochen", color: SemanticColors.warning };
  return { text: "Fehlgeschlagen", color: SemanticColors.error };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("de-CH", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function ReleasesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAdmin } = useAdmin();

  const [submit, setSubmit] = useState(true);
  const [newVersion, setNewVersion] = useState(true);
  const [runs, setRuns] = useState<ReleaseRun[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState<ReleaseTarget | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    const result = await getReleaseRuns();
    if (!mounted.current) return;
    if (result.success) {
      setRuns(result.runs ?? []);
      setLoadError(null);
    } else {
      setLoadError(result.error ?? "Status konnte nicht geladen werden");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  // While a release is running, check again every 15 seconds
  const active = runs.some((r) => r.status !== "completed");
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [active, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onStart = async (target: ReleaseTarget) => {
    if (starting) return;
    const toStores = submit && target !== "web";
    const bumpsVersion = newVersion && target !== "web";
    const ok = await confirmAsync(
      "Update veröffentlichen?",
      `Jetzt ${TARGET_LABEL[target]} aktualisieren.` +
        (bumpsVersion ? "\n\nDie Versionsnummer der Apps wird um eins erhöht." : "") +
        (toStores ? "\n\nDie App-Builds werden danach automatisch an TestFlight bzw. Google Play gesendet." : "") +
        "\n\nDas lässt sich nicht zurücknehmen.",
      { confirmText: "Starten" },
    );
    if (!ok) return;

    setStarting(target);
    const result = await startRelease(target, submit, newVersion);
    setStarting(null);

    if (result.success) {
      notify("Gestartet", "Das Update wurde gestartet. Der Fortschritt erscheint unten.");
      // GitHub needs a moment before the new run shows up
      setTimeout(load, 3000);
    } else {
      notify("Start fehlgeschlagen", result.error);
    }
  };

  if (!isAdmin) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: "Updates veröffentlichen" }} />
        <ThemedText style={{ color: colors.textSecondary }}>Nur für Admins.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Updates veröffentlichen", headerBackTitle: "Zurück" }} />
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <View style={styles.column}>
            <ThemedText style={[styles.intro, { color: colors.textSecondary }]}>
              Veröffentlicht den aktuellen Stand von main. Bei den Apps erhöht das System die Build-Nummer selbst.
            </ThemedText>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.switchText}>
                <ThemedText style={styles.cardTitle}>An die Stores senden</ThemedText>
                <ThemedText style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Nach dem Build automatisch an TestFlight bzw. Google Play
                </ThemedText>
              </View>
              <Switch
                value={submit}
                onValueChange={setSubmit}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.switchText}>
                <ThemedText style={styles.cardTitle}>Neue Versionsnummer</ThemedText>
                <ThemedText style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Zählt die Version der Apps hoch, zum Beispiel 2.0.1 auf 2.0.2. Apple lehnt sonst Builds ab, wenn die
                  aktuelle Version schon freigegeben ist.
                </ThemedText>
              </View>
              <Switch
                value={newVersion}
                onValueChange={setNewVersion}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {ACTIONS.map((action) => (
              <Pressable
                key={action.target}
                onPress={() => onStart(action.target)}
                disabled={starting !== null || active}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed || starting !== null || active ? 0.6 : 1 },
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: colors.primary + "15" }]}>
                  <IconSymbol name={action.icon as any} size={22} color={colors.primary} />
                </View>
                <View style={styles.switchText}>
                  <ThemedText style={styles.cardTitle}>{action.title}</ThemedText>
                  <ThemedText style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{action.subtitle}</ThemedText>
                </View>
                {starting === action.target ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                )}
              </Pressable>
            ))}
            {active && (
              <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>
                Es läuft gerade ein Update. Ein neues kann erst nach dessen Ende gestartet werden.
              </ThemedText>
            )}

            <ThemedText style={styles.sectionTitle}>Letzte Durchläufe</ThemedText>
            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: Spacing.lg }} />
            ) : loadError ? (
              <ThemedText style={[styles.hint, { color: SemanticColors.error }]}>{loadError}</ThemedText>
            ) : runs.length === 0 ? (
              <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>Noch keine Updates.</ThemedText>
            ) : (
              runs.map((run) => {
                const label = runLabel(run);
                return (
                  <Pressable
                    key={run.id}
                    onPress={() => Linking.openURL(run.url)}
                    style={[styles.run, { borderColor: colors.border }]}
                  >
                    <View style={styles.switchText}>
                      <ThemedText style={styles.cardTitle} numberOfLines={1}>
                        {formatTime(run.createdAt)}
                        {run.actor ? `  ·  ${run.actor}` : ""}
                      </ThemedText>
                    </View>
                    <View style={[styles.badge, { backgroundColor: label.color + "22" }]}>
                      <ThemedText style={[styles.badgeText, { color: label.color }]}>{label.text}</ThemedText>
                    </View>
                  </Pressable>
                );
              })
            )}

            <Pressable onPress={() => Linking.openURL(BUILDS_URL)} style={styles.link}>
              <ThemedText style={[styles.linkText, { color: colors.primary }]}>
                App-Builds bei Expo ansehen
              </ThemedText>
            </Pressable>
            <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>
              Die Liste zeigt den Start der Builds. Die App-Builds selbst laufen danach noch einige Minuten bei Expo.
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: Spacing.lg, alignItems: "center" },
  column: { width: "100%", maxWidth: 640 },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.lg },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  iconBox: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: "center", justifyContent: "center" },
  switchText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardSubtitle: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: "600", marginTop: Spacing.xl, marginBottom: Spacing.sm },
  run: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  badgeText: { fontSize: 12, fontWeight: "600" },
  link: { marginTop: Spacing.lg },
  linkText: { fontSize: 15, fontWeight: "500" },
  hint: { fontSize: 13, lineHeight: 18, marginTop: Spacing.sm },
});
