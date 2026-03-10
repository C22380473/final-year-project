import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import admin from "./firebaseAdmin.js";
import s3 from "./s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const requiredEnv = [
  "PORT",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const BUCKET = process.env.S3_BUCKET_NAME;

async function requireFirebaseUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer (.+)$/);

    if (!match) {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    const idToken = match[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}

function extFromContentType(contentType) {
  switch (contentType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return "";
  }
}

app.get("/", (_req, res) => {
  res.json({ ok: true });
});

app.post("/profile-photo/upload-url", requireFirebaseUser, async (req, res) => {
  try {
    const { contentType } = req.body;
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

    if (!allowedTypes.has(contentType)) {
      return res.status(400).json({ error: "Unsupported content type" });
    }

    const uid = req.user.uid;
    const ext = extFromContentType(contentType);
    const key = `profile-images/${uid}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.json({
      uploadUrl,
      key,
      bucket: BUCKET,
      contentType,
      expiresIn: 60,
    });
  } catch (error) {
    console.error("Failed to create upload URL:", error);
    return res.status(500).json({ error: "Failed to create upload URL" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});