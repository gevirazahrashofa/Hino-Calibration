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

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Akses ditolak." });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };