import { View, Text, StyleSheet } from "react-native";

const THEME = {
  bg: "#0d0f0c",
  accent: "#FF8762",
  surface: "#141612",
  bottom: "#1d201c",
  text: "#FFFFFF",
  textSoft: "#E3E7DE",
};

const RADII = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 100,
};

export default function Badge({ label, textColor, bg, scale }) {
    const styles = createStyles(scale)
    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
        </View>
    );
}

function createStyles(scale){
    return StyleSheet.create({
        badge: {
            paddingVertical: scale * 3,
            paddingHorizontal: scale * 6,
            borderRadius: RADII.pill,
        },
        badgeText: {
            fontSize: scale * 5,
            fontWeight: "800",
            fontFamily: "Inter-ExtraBold",
            letterSpacing: scale / 4,
        }
    })

}