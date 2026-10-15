import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFile } from "node:fs/promises";

const email = process.argv[2];
if (!email) {
  console.error("Gunakan: npm run admin:grant -- admin@example.com");
  process.exit(1);
}

async function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const raw = await readFile(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8");
    const serviceAccount = JSON.parse(raw);
    return cert(serviceAccount);
  }

  const required = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Environment server belum lengkap: ${missing.join(", ")}. ` +
        "Atau gunakan FIREBASE_SERVICE_ACCOUNT_PATH ke file JSON service account.",
    );
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n").trim();
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY bukan PEM yang valid. Gunakan FIREBASE_SERVICE_ACCOUNT_PATH agar tidak perlu menyalin private key multiline.",
    );
  }

  return cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  });
}

try {
  if (!getApps().length) {
    initializeApp({ credential: await getCredential() });
  }
  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  const claims = user.customClaims || {};
  await auth.setCustomUserClaims(user.uid, {
    ...claims,
    role: "authenticated",
    admin: true,
  });
  console.log(
    `Akses admin diberikan ke ${email}. Minta pengguna keluar-masuk lagi agar token diperbarui.`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
