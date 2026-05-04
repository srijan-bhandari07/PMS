const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";

  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      error: "Missing Authorization header",
    });
  }

  const token = auth.slice("Bearer ".length).trim();

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({
      ok: false,
      error: "Invalid or expired token",
    });
  }
}

module.exports = { requireAuth };