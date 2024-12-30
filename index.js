import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import cors from "cors"; // Import the CORS package
import { db } from "./firebase/index.js"; // Ensure this matches your file structure
import { doc, setDoc } from "firebase/firestore";

const app = express();

// Enable CORS for your frontend domain (replace with your actual frontend URL)
const corsOptions = {
  origin: 'https://tip-wallet-check.web.app', // Allow requests only from this origin
  methods: 'GET,POST', // Specify allowed HTTP methods
  allowedHeaders: 'Content-Type,Authorization', // Specify allowed headers
};

// Use CORS middleware with the specified options
app.use(cors(corsOptions));

// Parse JSON requests
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
  const { address, telegramData } = req.body;

  if (!address || !telegramData) {
    return res.status(400).json({ error: "Address and Telegram data are required" });
  }

  if (!validateTelegramData(telegramData)) {
    return res.status(400).json({ error: "Invalid Telegram data" });
  }

  try {
    const userDoc = doc(db, "users", address, "telegram", "data");
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


    // Save the "telegram: true" field directly under the address document
    const addressDoc = doc(db, "users", address);
    await setDoc(
      addressDoc,
      { telegram: true },
      { merge: true }
    );

    res.status(200).json({ message: "User authenticated and data saved successfully" });
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
