import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2];
if (!email) {
  console.error("Gunakan: npm run admin:grant -- admin@example.com");
  process.exit(1);
}

const required = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Environment server belum lengkap: ${missing.join(", ")}`);
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

try {
  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  const claims = user.customClaims || {};
  await auth.setCustomUserClaims(user.uid, { ...claims, admin: true });
  console.log(
    `Akses admin diberikan ke ${email}. Minta pengguna keluar-masuk lagi agar token diperbarui.`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
