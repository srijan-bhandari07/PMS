const { loginUser } = require("../services/authService");

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const result = await loginUser(email, password);

    if (!result.ok) {
      return res.status(result.status).json({
        ok: false,
        error: result.error,
      });
    }

    return res.json({
      ok: true,
      data: result.data,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error during login",
    });
  }
}

function logout(_req, res) {
  return res.json({ ok: true });
}

module.exports = {
  login,
  logout,
};