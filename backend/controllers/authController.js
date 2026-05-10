import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../config/db.js";

const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const normalizeRole = (role) => {
  const value = String(role || "Member").toLowerCase();
  if (value === "admin") return "Admin";
  return "Member";
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.error(`Registration error: Email already registered - ${email}`);
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = normalizeRole(role);
    
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: normalizedRole,
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await User.updateOne({ _id: user._id }, { last_login: new Date() });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name email role")
      .sort({ created_at: -1 });

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));

    return res.json(formattedUsers);
  } catch {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};
