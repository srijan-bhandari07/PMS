const getUserModel = require("../models/User");
const { signToken } = require("../utils/jwt");

async function loginUser(email, password) {
  const User = getUserModel(); // 🔥 important

  const e = String(email || "").toLowerCase().trim();
  const p = String(password || "").trim();

  const user = await User.findOne({ email: e });

  if (!user || user.password !== p) {
    return { ok: false, status: 401, error: "Invalid email or password." };
  }

  if (user.active === false) {
    return { ok: false, status: 403, error: "Account is deactivated." };
  }

  const token = signToken({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return {
    ok: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        accessibleMachines: user.accessibleMachines || [],
      },
    },
  };
}

module.exports = {
  loginUser,
};