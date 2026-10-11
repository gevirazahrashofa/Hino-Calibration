const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "ganti_dengan_secret_yang_kuat";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token tidak ditemukan." });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid." });
    req.user = decoded; // { id, username, role }
    next();
  });
}

function normalizeRole(role) {
  return String(role || "").toLowerCase();
}

function requireRole(role) {
  const allowed = Array.isArray(role) ? role.map(normalizeRole) : [normalizeRole(role)];
  return (req, res, next) => {
    if (!req.user || !allowed.includes(normalizeRole(req.user.role))) {
      return res.status(403).json({ message: "Akses ditolak." });
    }
    next();
  };
}

function isAdmin(user) {
  return normalizeRole(user && user.role) === "admin";
}

const adminOnly = requireRole("admin");

module.exports = { verifyToken, requireRole, isAdmin, adminOnly };