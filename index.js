import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import { db } from "./firebase/index.js"; // Ensure this matches your file structure
import { doc, setDoc } from "firebase/firestore";

const app = express();
app.use(bodyParser.json());

// Validate Telegram Data
const validateTelegramData = (data) => {
  const { hash, ...dataCheck } = data;
  const secretKey = crypto
    .createHash("sha256")
    .update("7513363925:AAHQNB6vfz1wrLeXIlWhYsf-4AWbprzF9Eg") // Replace with your bot token
    .digest();

  const checkString = Object.keys(dataCheck)
    .sort()
    .map((key) => `${key}=${dataCheck[key]}`)
    .join("\n");

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return hash === computedHash;
};

// Telegram authentication endpoint
app.post("/auth/telegram", async (req, res) => {
  const telegramData = req.body;

  if (!validateTelegramData(telegramData)) {
    return res.status(400).json({ error: "Invalid Telegram data" });
  }

  try {
    const userDoc = doc(db, "users", telegramData.id.toString());
    await setDoc(
      userDoc,
      {
        telegramId: telegramData.id,
        firstName: telegramData.first_name,
        lastName: telegramData.last_name || "",
        username: telegramData.username || "",
        authDate: new Date(telegramData.auth_date * 1000),
      },
      { merge: true }
    );

    res.status(200).json({ message: "User authenticated successfully" });
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
