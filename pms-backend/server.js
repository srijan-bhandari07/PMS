const app = require("./src/app");
const { PORT, JWT_SECRET, JWT_EXPIRES_IN } = require("./src/config/env");
const { connectDBs } = require("./src/config/db");

async function startServer() {
  try {
    await connectDBs();

    app.listen(PORT, () => {
      console.log(`✅ PMS backend running on http://localhost:${PORT}`);
      console.log(`🔓 Public routes: /api/health, /api/auth/*, /api/dashboard/*`);
      console.log(`🔒 Protected admin routes: /api/admin/*`);
      console.log(`🔐 JWT Secret: ${JWT_SECRET === "dev-secret" ? "⚠️ Using dev secret" : "✅ Configured"}`);
      console.log(`⏰ JWT Expires: ${JWT_EXPIRES_IN}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();