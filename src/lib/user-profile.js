import { useEffect, useState } from "react";
import { doc, onSnapshot, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { currentUser as fallbackUser } from "@/lib/api";

const LEVELS = [
  { name: "Level 1", title: "Pemula", minimum: 0, next: 100 },
  { name: "Level 2", title: "Berkembang", minimum: 100, next: 250 },
  { name: "Level 3", title: "Praktisi", minimum: 250, next: 500 },
  { name: "Level 4", title: "Siap Kerja", minimum: 500, next: null },
];

export function getLevelDetails(points = 0) {
  const safePoints = Math.max(0, Number(points) || 0);
  const level = [...LEVELS].reverse().find((item) => safePoints >= item.minimum) ?? LEVELS[0];
  const progress = level.next
    ? Math.min(100, Math.round(((safePoints - level.minimum) / (level.next - level.minimum)) * 100))
    : 100;
  return {
    levelName: level.name,
    title: level.title,
    minimum: level.minimum,
    next: level.next,
    points: safePoints,
    progress,
    label: `${level.name} · ${level.title}`,
  };
}

function getInitialProfile(user) {
  const name = user?.displayName || fallbackUser.name;
  const points = 0;
  return {
    name,
    email: user?.email || "",
    city: "",
    points,
    completedCourses: [],
    ...getLevelDetails(points),
  };
}

function normalizeProfile(data, user) {
  const points = Number(data?.points ?? 0);
  const level = getLevelDetails(points);
  return {
    ...getInitialProfile(user),
    ...data,
    name: data?.name || user?.displayName || fallbackUser.name,
    email: data?.email || user?.email || "",
    completedCourses: Array.isArray(data?.completedCourses) ? data.completedCourses : [],
    ...level,
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState(() => getInitialProfile(auth?.currentUser));
  const [loading, setLoading] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return undefined;
    }

    let unsubscribeProfile = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeProfile();
      if (!user) {
        setProfile(getInitialProfile());
        setLoading(false);
        return;
      }

      const profileRef = doc(db, "users", user.uid);
      unsubscribeProfile = onSnapshot(
        profileRef,
        async (snapshot) => {
          if (!snapshot.exists()) {
            const initialProfile = getInitialProfile(user);
            await setDoc(
              profileRef,
              {
                ...initialProfile,
                uid: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            );
            setProfile(initialProfile);
          } else {
            setProfile(normalizeProfile(snapshot.data(), user));
          }
          setLoading(false);
        },
        (error) => {
          console.error("Gagal memuat profil pengguna", error);
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  return { profile, loading };
}

export async function saveUserProfile(fields) {
  if (!auth?.currentUser || !db) throw new Error("Pengguna belum login atau Firebase belum siap.");
  const user = auth.currentUser;
  const profileRef = doc(db, "users", user.uid);
  const name = fields.name.trim();

  await setDoc(
    profileRef,
    {
      uid: user.uid,
      name,
      city: fields.city.trim(),
      email: fields.email.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  if (name && name !== user.displayName) {
    await updateProfile(user, { displayName: name });
  }
}

export async function completeCourse(course) {
  if (!auth?.currentUser || !db) throw new Error("Pengguna belum login atau Firebase belum siap.");
  const profileRef = doc(db, "users", auth.currentUser.uid);
  let awarded = false;

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(profileRef);
    const data = snapshot.exists() ? snapshot.data() : {};
    const completedCourses = Array.isArray(data.completedCourses) ? data.completedCourses : [];
    if (completedCourses.includes(course.id)) return;

    const points = Number(data.points || 0) + Number(course.points || 100);
    transaction.set(
      profileRef,
      {
        uid: auth.currentUser.uid,
        points,
        completedCourses: [...completedCourses, course.id],
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    awarded = true;
  });

  return awarded;
}
