import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { exercisesData } from "@/data/exercises";

const { width } = Dimensions.get("window");

const groupMeta: Record<string, { color: string; dark: string; icon: string }> = {
  Chest:     { color: "#ff3131", dark: "#200a0a", icon: "💪" },
  Biceps:    { color: "#7b61ff", dark: "#0e0a20", icon: "💪" },
  Triceps:   { color: "#00c2ff", dark: "#0a1820", icon: "🦾" },
  Shoulders: { color: "#ffd60a", dark: "#1c1800", icon: "🏋️" },
  Back:      { color: "#ff8c00", dark: "#1c0e00", icon: "🔱" },
  Legs:      { color: "#00d26a", dark: "#0a1c0e", icon: "🦵" },
  Abs:       { color: "#ff2d55", dark: "#1c0810", icon: "🔥" },
};

// ─── Platform-aware Video Player ─────────────────────────────────────────────
function VideoPlayer({ videoId, color }: { videoId: string; color: string }) {
  const [loading, setLoading] = useState(true);
  // vq=hd1080 forces 1080p HD; hd=1 also hints HD
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&modestbranding=1&playsinline=1&vq=hd1080&hd=1`;

  if (Platform.OS === "web") {
    return (
      <View style={playerStyles.wrap}>
        {loading && (
          <View style={playerStyles.loader}>
            <ActivityIndicator size="large" color={color} />
            <Text style={[playerStyles.loadTxt, { color }]}>Loading HD video...</Text>
          </View>
        )}
        <iframe
          src={embedUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            opacity: loading ? 0 : 1,
            position: "absolute" as any,
            top: 0, left: 0,
          }}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
        {/* Transparent cover to prevent iframe stealing touch AFTER load */}
        {!loading && <View style={playerStyles.iframeCover} pointerEvents="none" />}
      </View>
    );
  }

  // Native
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { WebView } = require("react-native-webview");
  return (
    <View style={playerStyles.wrap}>
      {loading && (
        <View style={playerStyles.loader}>
          <ActivityIndicator size="large" color={color} />
          <Text style={[playerStyles.loadTxt, { color }]}>Loading HD video...</Text>
        </View>
      )}
      <WebView
        style={{ flex: 1 }}
        source={{ uri: embedUrl }}
        allowsFullscreenVideo
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        onLoad={() => setLoading(false)}
      />
    </View>
  );
}

const playerStyles = StyleSheet.create({
  wrap: { width, height: (width * 9) / 16, backgroundColor: "#000" },
  loader: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", gap: 14, backgroundColor: "#000", zIndex: 10 },
  loadTxt: { fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
  iframeCover: { ...StyleSheet.absoluteFillObject },
});

// ─── Animated Exercise Card ────────────────────────────────────────────────
function ExerciseCard({
  item,
  index,
  color,
  onPress,
}: {
  item: { id: number; name: string; description: string; sets: string; reps: string; videoId: string };
  index: number;
  color: string;
  onPress: () => void;
}) {
  const translateX = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 420,
        delay: index * 60,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 220, friction: 10 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();

  return (
    <Animated.View style={{ transform: [{ translateX }, { scale }], opacity }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[exStyles.card, { borderLeftColor: color }]}
      >
        {/* Number */}
        <View style={[exStyles.numBadge, { backgroundColor: color + "18", borderColor: color + "55" }]}>
          <Text style={[exStyles.numText, { color }]}>{String(index + 1).padStart(2, "0")}</Text>
        </View>

        {/* Content */}
        <View style={exStyles.content}>
          <Text style={exStyles.name}>{item.name}</Text>
          <Text style={exStyles.desc}>{item.description}</Text>
          <View style={exStyles.pills}>
            <View style={[exStyles.pill, { borderColor: color + "55", backgroundColor: color + "12" }]}>
              <Text style={[exStyles.pillTxt, { color }]}>📋 {item.sets} Sets</Text>
            </View>
            <View style={[exStyles.pill, { borderColor: color + "55", backgroundColor: color + "12" }]}>
              <Text style={[exStyles.pillTxt, { color }]}>🔁 {item.reps}</Text>
            </View>
          </View>
        </View>

        {/* Play */}
        <View style={[exStyles.play, { backgroundColor: color, shadowColor: color }]}>
          <Text style={exStyles.playIcon}>▶</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ExerciseScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const exercises = exercisesData[name as string] ?? [];
  const meta = groupMeta[name as string] ?? { color: "#ff3131", dark: "#200a0a", icon: "💪" };

  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);
  const modalY = useRef(new Animated.Value(800)).current;
  const headerAnim = useRef(new Animated.Value(-10)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  const openVideo = (id: string, title: string) => {
    setActiveVideo({ id, title });
    Animated.spring(modalY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 12 }).start();
  };

  const closeVideo = () => {
    Animated.timing(modalY, { toValue: 800, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() =>
      setActiveVideo(null)
    );
  };

  return (
    <View style={scrStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* Header */}
      <Animated.View style={{ transform: [{ translateY: headerAnim }], opacity: headerOpacity }}>
        <LinearGradient colors={["#0c0c0c", "#050505"]} style={scrStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={scrStyles.backBtn} activeOpacity={0.75}>
            <Text style={scrStyles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={scrStyles.headerMid}>
            <View style={[scrStyles.headerIconBadge, { backgroundColor: meta.color + "20", borderColor: meta.color + "50" }]}>
              <Text style={{ fontSize: 16 }}>{meta.icon}</Text>
            </View>
            <View>
              <Text style={[scrStyles.headerTitle, { color: meta.color }]}>{String(name).toUpperCase()}</Text>
              <Text style={scrStyles.headerSub}>{exercises.length} Exercises</Text>
            </View>
          </View>

          <View style={[scrStyles.headerPip, { backgroundColor: meta.color, shadowColor: meta.color }]} />
        </LinearGradient>
        <View style={[scrStyles.accentBar, { backgroundColor: meta.color }]} />
      </Animated.View>

      {/* Exercise List */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={scrStyles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <ExerciseCard
            item={item}
            index={index}
            color={meta.color}
            onPress={() => openVideo(item.videoId, item.name)}
          />
        )}
      />

      {/* Video Modal */}
      <Modal
        visible={activeVideo !== null}
        transparent
        animationType="none"
        onRequestClose={closeVideo}
      >
        <View style={scrStyles.modalBg}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={closeVideo} />
          <Animated.View style={[scrStyles.modalSheet, { transform: [{ translateY: modalY }] }]}>
            <LinearGradient colors={["#0a0a0a", "#050505"]} style={StyleSheet.absoluteFillObject} />

            {/* Pull bar */}
            <View style={scrStyles.pullBar} />

            {/* Modal header */}
            <View style={scrStyles.modalHeader}>
              <TouchableOpacity onPress={closeVideo} style={scrStyles.modalClose}>
                <Text style={{ color: "#aaa", fontSize: 16, fontWeight: "700" }}>✕</Text>
              </TouchableOpacity>
              <Text style={scrStyles.modalTitle} numberOfLines={1}>{activeVideo?.title}</Text>
              <View style={[scrStyles.hdBadge, { borderColor: meta.color + "80", backgroundColor: meta.color + "18" }]}>
                <Text style={[scrStyles.hdText, { color: meta.color }]}>HD</Text>
              </View>
            </View>

            {/* Video */}
            {activeVideo && <VideoPlayer videoId={activeVideo.id} color={meta.color} />}

            {/* Info */}
            <View style={scrStyles.modalInfo}>
              <View style={[scrStyles.modalAccent, { backgroundColor: meta.color }]} />
              <Text style={scrStyles.modalName}>{activeVideo?.title}</Text>
              <View style={scrStyles.modalMeta}>
                <Text style={{ fontSize: 13 }}>{meta.icon}</Text>
                <Text style={scrStyles.modalMetaTxt}>{name} • HD Quality</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Exercise Card Styles ────────────────────────────────────────────────────
const exStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0e0e0e",
    borderRadius: 20,
    marginBottom: 13,
    padding: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 7,
  },
  numBadge: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  numText: { fontSize: 16, fontWeight: "900" },
  content: { flex: 1 },
  name: { color: "#f0f0f0", fontSize: 17, fontWeight: "800", marginBottom: 3 },
  desc: { color: "#555", fontSize: 12, marginBottom: 9 },
  pills: { flexDirection: "row", gap: 8 },
  pill: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 4 },
  pillTxt: { fontSize: 11.5, fontWeight: "700" },
  play: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 },
  playIcon: { color: "#fff", fontSize: 14, marginLeft: 3 },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const scrStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 56, paddingBottom: 16, paddingHorizontal: 18, gap: 14 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#181818", borderWidth: 1, borderColor: "#2a2a2a", justifyContent: "center", alignItems: "center" },
  backIcon: { color: "#fff", fontSize: 21, fontWeight: "700", marginTop: -2 },
  headerMid: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerIconBadge: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "900", letterSpacing: 1.5 },
  headerSub: { color: "#484848", fontSize: 12, fontWeight: "600", marginTop: 2 },
  headerPip: { width: 10, height: 10, borderRadius: 5, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.7, shadowRadius: 6, elevation: 4 },
  accentBar: { height: 2, marginHorizontal: 18, borderRadius: 2, marginBottom: 6, opacity: 0.9 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 44 },

  // Modal
  modalBg: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.7)" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden", borderTopWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  pullBar: { width: 40, height: 4, backgroundColor: "#333", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 4 },
  modalHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14, gap: 12 },
  modalClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#1e1e1e", justifyContent: "center", alignItems: "center" },
  modalTitle: { flex: 1, color: "#f0f0f0", fontSize: 16, fontWeight: "700" },
  hdBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  hdText: { fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  modalInfo: { padding: 22, paddingTop: 18 },
  modalAccent: { width: 36, height: 3, borderRadius: 2, marginBottom: 10 },
  modalName: { color: "#f0f0f0", fontSize: 21, fontWeight: "900", marginBottom: 8 },
  modalMeta: { flexDirection: "row", alignItems: "center", gap: 7 },
  modalMetaTxt: { color: "#4a4a4a", fontSize: 13 },
});
