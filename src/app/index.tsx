import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

const muscleGroups = [
  {
    name: "Chest",
    subtitle: "Build Strength",
    color: "#ff3131",
    glowColor: "rgba(255,49,49,0.28)",
    image: require("@/assets/images/chest_hq.jpg"),
    icon: "💪",
    tag: "POWER",
  },
  {
    name: "Biceps",
    subtitle: "Peak Performance",
    color: "#7b61ff",
    glowColor: "rgba(123,97,255,0.28)",
    image: require("@/assets/images/biceps_hq.jpg"),
    icon: "💪",
    tag: "PEAK",
  },
  {
    name: "Triceps",
    subtitle: "Sculpt & Define",
    color: "#00c2ff",
    glowColor: "rgba(0,194,255,0.25)",
    image: require("@/assets/images/triceps_hq.jpg"),
    icon: "🦾",
    tag: "CUT",
  },
  {
    name: "Shoulders",
    subtitle: "Build Wider",
    color: "#ffd60a",
    glowColor: "rgba(255,214,10,0.25)",
    image: require("@/assets/images/shoulders_hq.jpg"),
    icon: "🏋️",
    tag: "WIDE",
  },
  {
    name: "Back",
    subtitle: "Get Stronger",
    color: "#ff8c00",
    glowColor: "rgba(255,140,0,0.25)",
    image: require("@/assets/images/back_hq.jpg"),
    icon: "🔱",
    tag: "MASS",
  },
  {
    name: "Legs",
    subtitle: "Power & Endurance",
    color: "#00d26a",
    glowColor: "rgba(0,210,106,0.25)",
    image: require("@/assets/images/legs_hq.jpg"),
    icon: "🦵",
    tag: "DRIVE",
  },
];

const absGroup = {
  name: "Abs",
  subtitle: "Core Strength",
  color: "#ff2d55",
  glowColor: "rgba(255,45,85,0.28)",
  image: require("@/assets/images/abs_hq.jpg"),
  icon: "🔥",
  tag: "CORE",
};

const menuItems = [...muscleGroups, absGroup];

// ─── Animated Card ────────────────────────────────────────────────────────────
function AnimatedCard({
  item,
  index,
  onPress,
}: {
  item: typeof muscleGroups[0];
  index: number;
  onPress: () => void;
}) {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 480,
        delay: index * 80,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 200, friction: 10 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale }], opacity }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, { shadowColor: item.color }]}
      >
        {/* Background image */}
        <Image source={item.image} style={styles.cardBg} resizeMode="cover" />

        {/* Multi-stop gradient overlay */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.05)",
            "rgba(0,0,0,0.15)",
            "rgba(0,0,0,0.55)",
            "rgba(0,0,0,0.88)",
          ]}
          locations={[0, 0.3, 0.65, 1]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Top row: tag chip */}
        <View style={[styles.tagChip, { backgroundColor: item.color + "22", borderColor: item.color + "55" }]}>
          <Text style={[styles.tagText, { color: item.color }]}>{item.tag}</Text>
        </View>

        {/* Center glow icon */}
        <View style={styles.iconWrap}>
          <View style={[styles.iconRing, { borderColor: item.color, shadowColor: item.color, backgroundColor: item.glowColor }]}>
            <Text style={styles.iconEmoji}>{item.icon}</Text>
          </View>
        </View>

        {/* Bottom info */}
        <View style={styles.cardBottom}>
          <View style={[styles.cardAccentLine, { backgroundColor: item.color }]} />
          <Text style={styles.cardName}>{item.name.toUpperCase()}</Text>
          <View style={styles.cardRow}>
            <Text style={styles.cardSub}>{item.subtitle}</Text>
            <View style={[styles.arrowCircle, { backgroundColor: item.color }]}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Splash ───────────────────────────────────────────────────────────────────
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoScale = useRef(new Animated.Value(0.25)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0.3)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.2)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(28)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const verseX = useRef(new Animated.Value(-40)).current;
  const gymX = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      // Rings expand
      Animated.parallel([
        Animated.timing(ring1Opacity, { toValue: 0.45, duration: 380, useNativeDriver: true }),
        Animated.timing(ring1Scale, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ring2Opacity, { toValue: 0.18, duration: 500, useNativeDriver: true }),
        Animated.timing(ring2Scale, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Logo slides in from both sides
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(gymX, { toValue: 0, duration: 420, easing: Easing.out(Easing.exp), useNativeDriver: true }),
        Animated.timing(verseX, { toValue: 0, duration: 420, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      ]),
      // Tagline & dots
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 420, easing: Easing.out(Easing.exp), useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(1300),
      // Fade out
      Animated.timing(screenOpacity, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[splashStyles.container, { opacity: screenOpacity }]}>
      <LinearGradient
        colors={["#080002", "#040004", "#000005"]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Rings */}
      <Animated.View style={[splashStyles.ring, splashStyles.ring3, { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] }]} />
      <Animated.View style={[splashStyles.ring, splashStyles.ring2, { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] }]} />
      <Animated.View style={[splashStyles.ring, splashStyles.ring1, { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] }]} />
      {/* Glow blob */}
      <View style={splashStyles.glowCenter} />
      {/* Logo */}
      <Animated.View style={[splashStyles.logoRow, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Animated.Text style={[splashStyles.gymText, { transform: [{ translateX: gymX }] }]}>GYM</Animated.Text>
        <Animated.Text style={[splashStyles.verseText, { transform: [{ translateX: verseX }] }]}>VERSE</Animated.Text>
      </Animated.View>
      {/* Tagline */}
      <Animated.View style={[splashStyles.tagRow, { opacity: taglineOpacity, transform: [{ translateY: taglineY }] }]}>
        <View style={splashStyles.tagDash} />
        <Text style={splashStyles.tagText}>UNLOCK YOUR BEAST MODE</Text>
        <Text style={splashStyles.tagBolt}>⚡</Text>
        <View style={splashStyles.tagDash} />
      </Animated.View>
      {/* Dots */}
      <Animated.View style={[splashStyles.dots, { opacity: dotOpacity }]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              splashStyles.dot,
              { backgroundColor: i === 2 ? "#ff3131" : i === 1 || i === 3 ? "#552020" : "#1e1e1e" },
              i === 2 && { transform: [{ scale: 1.4 }] },
            ]}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [splashDone, setSplashDone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(-290)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-30)).current;

  const handleSplashFinish = () => {
    setSplashDone(true);
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 500, easing: Easing.out(Easing.exp), useNativeDriver: true }),
    ]).start();
  };

  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.spring(menuAnim, { toValue: 0, useNativeDriver: true, tension: 85, friction: 13 }),
      Animated.timing(menuOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(menuAnim, { toValue: -290, duration: 230, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(menuOpacity, { toValue: 0, duration: 230, useNativeDriver: true }),
    ]).start(() => setMenuOpen(false));
  };

  const navigate = (name: string) => {
    closeMenu();
    setTimeout(() => router.push({ pathname: "/exercise/[name]", params: { name } }), 240);
  };

  if (!splashDone) return <SplashScreen onFinish={handleSplashFinish} />;

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <Animated.View style={[styles.header, { transform: [{ translateY: headerY }] }]}>
        <TouchableOpacity style={styles.menuBtn} onPress={openMenu} activeOpacity={0.7}>
          <View style={styles.menuLine} />
          <View style={[styles.menuLine, { width: 17 }]} />
          <View style={styles.menuLine} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.flameBtn} activeOpacity={0.8}>
          <Text style={{ fontSize: 19 }}>🔥</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          <Text style={{ color: "#e0e0e0" }}>GYM</Text>
          <Text style={{ color: "#ff3131", fontStyle: "italic" }}>VERSE</Text>
        </Text>
        <View style={styles.taglineBox}>
          <View style={styles.taglineDash} />
          <Text style={styles.taglineText}>UNLOCK YOUR BEAST MODE ⚡</Text>
          <View style={styles.taglineDash} />
        </View>
      </View>

      {/* Section label */}
      <View style={styles.sectionRow}>
        <View style={styles.sectionPip} />
        <Text style={styles.sectionLabel}>CHOOSE YOUR FOCUS</Text>
      </View>

      {/* Cards */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        <FlatList
          data={muscleGroups}
          keyExtractor={(i) => i.name}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          renderItem={({ item, index }) => (
            <AnimatedCard item={item} index={index} onPress={() => navigate(item.name)} />
          )}
        />

        {/* ABS — full width */}
        <AbsCard onPress={() => navigate(absGroup.name)} />
      </ScrollView>

      {/* Drawer */}
      <Modal visible={menuOpen} transparent animationType="none">
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.65)", opacity: menuOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={closeMenu} />
        </Animated.View>
        <Animated.View style={[styles.drawer, { transform: [{ translateX: menuAnim }] }]}>
          <LinearGradient colors={["#0e0a0a", "#160808", "#0a0a0e"]} style={StyleSheet.absoluteFillObject} />
          <View style={styles.drawerTop}>
            <Text style={styles.drawerBrand}>
              <Text style={{ color: "#ddd" }}>GYM</Text>
              <Text style={{ color: "#ff3131" }}>VERSE</Text>
            </Text>
            <TouchableOpacity onPress={closeMenu} style={styles.drawerClose}>
              <Text style={{ color: "#aaa", fontSize: 17 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.drawerDivider} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {menuItems.map((item, i) => (
              <DrawerItem key={item.name} item={item} index={i} onPress={() => navigate(item.name)} />
            ))}
          </ScrollView>
        </Animated.View>
      </Modal>
    </Animated.View>
  );
}

function AbsCard({ onPress }: { onPress: () => void }) {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 480, delay: 520, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: 520, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 200, friction: 10 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();

  return (
    <Animated.View style={[{ transform: [{ translateY }, { scale }], opacity }, { marginHorizontal: 16 }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.absCard, { shadowColor: absGroup.color }]}
      >
        <Image source={absGroup.image} style={styles.absBg} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View style={[styles.absCircle, { borderColor: absGroup.color, backgroundColor: absGroup.glowColor }]}>
          <Text style={{ fontSize: 24 }}>{absGroup.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={[styles.absTag, { backgroundColor: absGroup.color + "22", borderColor: absGroup.color + "55" }]}>
            <Text style={[styles.absTagText, { color: absGroup.color }]}>{absGroup.tag}</Text>
          </View>
          <Text style={styles.absName}>ABS</Text>
          <Text style={styles.absSub}>{absGroup.subtitle}</Text>
        </View>
        <View style={[styles.arrowCircle, { backgroundColor: absGroup.color, marginRight: 4 }]}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DrawerItem({ item, index, onPress }: { item: typeof menuItems[0]; index: number; onPress: () => void }) {
  const x = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(x, { toValue: 0, duration: 300, delay: index * 40, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 280, delay: index * 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateX: x }], opacity }}>
      <TouchableOpacity style={styles.drawerItem} onPress={onPress} activeOpacity={0.65}>
        <View style={[styles.drawerDot, { backgroundColor: item.color, shadowColor: item.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.drawerName}>{item.name}</Text>
          <Text style={styles.drawerSub}>{item.subtitle}</Text>
        </View>
        <Text style={[styles.drawerArrow, { color: item.color }]}>→</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── SPLASH STYLES ────────────────────────────────────────────────────────────
const splashStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  ring: { position: "absolute", borderRadius: 9999, borderWidth: 1.5, borderColor: "#ff3131" },
  ring1: { width: 220, height: 220 },
  ring2: { width: 330, height: 330, borderColor: "rgba(255,49,49,0.5)" },
  ring3: { width: 460, height: 460, borderColor: "rgba(255,49,49,0.18)" },
  glowCenter: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,30,0,0.055)" },
  logoRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 26 },
  gymText: { fontSize: 70, fontWeight: "900", color: "#ddd", letterSpacing: -3, lineHeight: 70, textShadowColor: "rgba(255,255,255,0.18)", textShadowRadius: 18, textShadowOffset: { width: 0, height: 0 } },
  verseText: { fontSize: 70, fontWeight: "900", color: "#ff3131", letterSpacing: -3, lineHeight: 70, fontStyle: "italic", textShadowColor: "rgba(255,49,49,0.55)", textShadowRadius: 26, textShadowOffset: { width: 0, height: 0 } },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(12,12,12,0.96)", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 50, borderWidth: 1, borderColor: "#252525" },
  tagDash: { width: 14, height: 2, backgroundColor: "#ff3131", borderRadius: 1 },
  tagText: { color: "#bbb", fontSize: 10.5, fontWeight: "800", letterSpacing: 2.8 },
  tagBolt: { fontSize: 12 },
  dots: { flexDirection: "row", gap: 7, marginTop: 42, alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

// ─── HOME STYLES ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 54, paddingBottom: 6 },
  menuBtn: { gap: 5, padding: 8, borderRadius: 10 },
  menuLine: { width: 26, height: 2.5, backgroundColor: "#ffffff", borderRadius: 2 },
  flameBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#180a00", borderWidth: 1.5, borderColor: "#ff3131", justifyContent: "center", alignItems: "center", shadowColor: "#ff3131", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  hero: { alignItems: "center", paddingTop: 6, paddingBottom: 18 },
  heroTitle: { fontSize: 54, fontWeight: "900", letterSpacing: -1.5, lineHeight: 60 },
  taglineBox: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 7, backgroundColor: "rgba(16,16,16,0.96)", borderRadius: 50, paddingHorizontal: 16, paddingVertical: 7, borderWidth: 1, borderColor: "#222" },
  taglineDash: { width: 18, height: 2, backgroundColor: "#ff3131", borderRadius: 1 },
  taglineText: { color: "#bbb", fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  sectionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 10, marginBottom: 13 },
  sectionPip: { width: 22, height: 3.5, backgroundColor: "#ff3131", borderRadius: 2 },
  sectionLabel: { color: "#777", fontSize: 12, fontWeight: "700", letterSpacing: 2.2 },
  row: { justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 14 },

  // Card
  card: {
    width: CARD_WIDTH,
    height: 218,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    backgroundColor: "#0e0e0e",
  },
  cardBg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  tagChip: { position: "absolute", top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  tagText: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  iconWrap: { position: "absolute", top: 10, left: 12 },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  iconEmoji: { fontSize: 26 },
  cardBottom: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 14, paddingBottom: 14 },
  cardAccentLine: { width: 28, height: 2.5, borderRadius: 2, marginBottom: 6 },
  cardName: { color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: 0.8, marginBottom: 4 },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardSub: { color: "rgba(255,255,255,0.65)", fontSize: 12 },
  arrowCircle: { width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  arrowText: { color: "#fff", fontSize: 13, fontWeight: "800" },

  // ABS
  absCard: {
    flexDirection: "row",
    alignItems: "center",
    height: 88,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 18,
    gap: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
    backgroundColor: "#0e0e0e",
  },
  absBg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  absCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  absTag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, marginBottom: 4 },
  absTagText: { fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  absName: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 0.8 },
  absSub: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 1 },

  // Drawer
  drawer: { position: "absolute", left: 0, top: 0, bottom: 0, width: 285, borderRightWidth: 1, borderRightColor: "rgba(255,49,49,0.1)" },
  drawerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: 62, paddingBottom: 18 },
  drawerBrand: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  drawerClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#1c1c1c", justifyContent: "center", alignItems: "center" },
  drawerDivider: { height: 1, backgroundColor: "#1e1e1e", marginHorizontal: 24, marginBottom: 8 },
  drawerItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 14, gap: 14 },
  drawerDot: { width: 10, height: 10, borderRadius: 5, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 4 },
  drawerName: { color: "#f0f0f0", fontSize: 16, fontWeight: "700" },
  drawerSub: { color: "#4a4a4a", fontSize: 12, marginTop: 1 },
  drawerArrow: { fontSize: 15, fontWeight: "700" },
});
