const crypto = require("crypto");
const { promisify } = require("util");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const userDB = require("./model.js");

dotenv.config();

const app = express();
const scryptAsync = promisify(crypto.scrypt);

const DEFAULT_ALLOWED_ORIGINS = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
];
const MAX_IMAGE_SELECTIONS = 9;

const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeTheme = (theme) => theme.trim();

const isNonEmptyString = (value, maxLength = 120) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= maxLength;

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));

const isValidIdArray = (ids) =>
  Array.isArray(ids) &&
  ids.length > 0 &&
  ids.length <= MAX_IMAGE_SELECTIONS &&
  ids.every((id) => isNonEmptyString(id, 200));

const isValidLinkArray = (links) =>
  Array.isArray(links) &&
  links.length > 0 &&
  links.length <= MAX_IMAGE_SELECTIONS &&
  links.every((link) => link && isNonEmptyString(link.id, 200));

const getAllowedOrigins = () => {
  const configuredOrigins = process.env.FRONTEND_ORIGIN
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins?.length ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;
};

const buildSecret = (theme, ids) =>
  JSON.stringify({
    theme,
    ids,
  });

const buildLegacyPassword = (theme, ids) => {
  let encodedSecret = Buffer.from(theme).toString("base64");

  for (const id of ids) {
    encodedSecret += Buffer.from(id).toString("base64");
  }

  return encodedSecret;
};

const hashSecret = async (theme, ids, salt) => {
  const derivedKey = await scryptAsync(buildSecret(theme, ids), salt, 64);
  return Buffer.from(derivedKey).toString("hex");
};

const createPasswordRecord = async (theme, ids) => {
  const passwordSalt = crypto.randomBytes(16).toString("hex");
  const passwordHash = await hashSecret(theme, ids, passwordSalt);

  return {
    passwordHash,
    passwordSalt,
  };
};

const safeEqualHex = (left, right) => {
  if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = async (normalizedEmail) => {
  const exactMatch = await userDB.findOne({ normalizedEmail });

  if (exactMatch) {
    return exactMatch;
  }

  return userDB.findOne({
    email: new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i"),
  });
};

const validateCredentials = ({ email, theme, id, links, requireIds = false, requireLinks = false }) => {
  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    return "Please enter a valid email address.";
  }

  if (!isNonEmptyString(theme, 80)) {
    return "Please enter a valid theme.";
  }

  if (requireIds && !isValidIdArray(id)) {
    return "Please select a valid graphical password.";
  }

  if (requireLinks && !isValidLinkArray(links)) {
    return "Unable to validate the selected image set.";
  }

  return null;
};

const migrateLegacyPassword = async (user, theme, ids) => {
  const passwordRecord = await createPasswordRecord(theme, ids);

  user.passwordHash = passwordRecord.passwordHash;
  user.passwordSalt = passwordRecord.passwordSalt;
  user.password = null;
  user.normalizedEmail = normalizeEmail(user.email);

  await user.save();
};

const verifyPassword = async (user, theme, ids) => {
  if (user.passwordHash && user.passwordSalt) {
    const passwordHash = await hashSecret(theme, ids, user.passwordSalt);
    return safeEqualHex(passwordHash, user.passwordHash);
  }

  if (!user.password) {
    return false;
  }

  const matchesLegacyPassword = buildLegacyPassword(theme, ids) === user.password;

  if (matchesLegacyPassword) {
    await migrateLegacyPassword(user, theme, ids);
  }

  return matchesLegacyPassword;
};

const database = () => mongoose.connect(process.env.MONGO_URI);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts. Please try again in a few minutes.",
});

app.disable("x-powered-by");

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cors({
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
}));

app.get("/", (req, res) => {
  res.send("welcome to node server");
});

app.post("/signup", authLimiter, async (req, res, next) => {
  try {
    const { theme, email, links, id } = req.body;
    const validationError = validateCredentials({
      email,
      theme,
      id,
      links,
      requireIds: true,
      requireLinks: true,
    });

    if (validationError) {
      res.status(400).send(validationError);
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedTheme = normalizeTheme(theme);
    const normalizedIds = id.map((imageId) => imageId.trim());
    const allowedIds = new Set(links.map((link) => link.id.trim()));

    if (normalizedIds.some((imageId) => !allowedIds.has(imageId))) {
      res.status(400).send("Selected images do not match the generated image set.");
      return;
    }

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      res.status(409).send("Email already registered.");
      return;
    }

    const passwordRecord = await createPasswordRecord(normalizedTheme, normalizedIds);

    await userDB.create({
      email: normalizedEmail,
      normalizedEmail,
      allId: links.map((link) => link.id.trim()),
      passwordHash: passwordRecord.passwordHash,
      passwordSalt: passwordRecord.passwordSalt,
      theme: normalizedTheme,
    });

    res.status(201).send("User added successfully.");
  } catch (error) {
    next(error);
  }
});

app.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, theme } = req.body;
    const validationError = validateCredentials({ email, theme });

    if (validationError) {
      res.status(400).send(validationError);
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedTheme = normalizeTheme(theme);
    const user = await findUserByEmail(normalizedEmail);

    if (!user || normalizeTheme(user.theme) !== normalizedTheme) {
      res.status(401).send("Invalid credentials.");
      return;
    }

    if (!Array.isArray(user.allId) || user.allId.length === 0) {
      res.status(500).send("Account is missing graphical password data.");
      return;
    }

    if (!user.normalizedEmail) {
      user.normalizedEmail = normalizedEmail;
      await user.save();
    }

    res.status(200).json({ Ids: user.allId });
  } catch (error) {
    next(error);
  }
});

app.post("/loginVerify", authLimiter, async (req, res, next) => {
  try {
    const { email, id, theme } = req.body;
    const validationError = validateCredentials({
      email,
      theme,
      id,
      requireIds: true,
    });

    if (validationError) {
      res.status(400).send(validationError);
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedTheme = normalizeTheme(theme);
    const normalizedIds = id.map((imageId) => imageId.trim());
    const user = await findUserByEmail(normalizedEmail);

    if (!user || normalizeTheme(user.theme) !== normalizedTheme) {
      res.status(401).send("Invalid credentials.");
      return;
    }

    const isPasswordValid = await verifyPassword(user, normalizedTheme, normalizedIds);

    if (!isPasswordValid) {
      res.status(401).send("Invalid credentials.");
      return;
    }

    res.status(200).send("Successfully logged in.");
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.message === "Not allowed by CORS") {
    res.status(403).send("Request origin is not allowed.");
    return;
  }

  if (error?.code === 11000) {
    res.status(409).send("Email already registered.");
    return;
  }

  console.error(error);

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(500).send("Internal server error.");
});

const port = process.env.PORT || 5000;

const connectDatabase = async () => {
  try {
    await database();
    app.listen(port, () => {
      console.log(`server listening to port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

connectDatabase();
