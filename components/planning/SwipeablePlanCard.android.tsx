import { Pressable, View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StatusBadge } from "./StatusBadge";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Plan } from "@/lib/planning-api";

interface SwipeablePlanCardProps {
    plan: Plan;
    onPress: () => void;
    onDelete: (planId: string) => void;
}

export function SwipeablePlanCard({ plan, onPress, onDelete }: SwipeablePlanCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    return (
        <View style={styles.container}>
            <Pressable
                onPress={onPress}
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <ThemedText style={styles.title} numberOfLines={1}>
                            {plan.title}
                        </ThemedText>
                        {plan.description && (
                            <ThemedText
                                style={[styles.description, { color: colors.textSecondary }]}
                                numberOfLines={1}
                            >
                                {plan.description}
                            </ThemedText>
                        )}
                    </View>
                    <StatusBadge status={plan.status} />
                </View>

                <View style={styles.footer}>
                    <View style={styles.dateContainer}>
                        <IconSymbol name="calendar" size={16} color={colors.primary} />
                        <ThemedText style={[styles.date, { color: colors.text }]}>
                            {new Date(plan.created_at).toLocaleDateString("de-DE", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </ThemedText>
                    </View>
                    <Pressable
                        onPress={(e) => {
                            e.stopPropagation();
                            onDelete(plan.id);
                        }}
                        style={[styles.deleteButton, { backgroundColor: "#FF3B30" }]}
                    >
                        <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
                    </Pressable>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
        marginHorizontal: Spacing.md,
    },
    card: {
        borderWidth: 1,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: Spacing.sm,
    },
    headerLeft: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    date: {
        fontSize: 14,
        fontWeight: "500",
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
});
