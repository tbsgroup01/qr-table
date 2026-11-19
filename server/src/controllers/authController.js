import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../models/adminModel.js";
import Restaurant from "../models/restroModel.js";

const getJwtSecret = () => process.env.JWT_SECRET || "quicktable_secure_jwt_secret_key_2026";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const admin = await Admin.findOne({
      where: { email: cleanEmail },
    });

    if (admin) {
      const storedPass = String(admin.password || "");
      const isMatch = storedPass.startsWith("$2")
        ? await bcrypt.compare(password, storedPass)
        : storedPass === password;

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password. Please try again.",
        });
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: "admin" },
        getJwtSecret(),
        { expiresIn: "7d" }
      );

      const safeAdmin = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: "admin",
        avatar: admin.avatar,
        address: admin.address,
      };

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        role: "admin",
        token,
        user: safeAdmin,
      });
    }

    const restaurant = await Restaurant.findOne({
      where: { email: cleanEmail },
    });

    if (restaurant) {
      if (!restaurant.password) {
        return res.status(401).json({
          success: false,
          message: "Password not set for this restaurant. Please contact admin or reset password.",
        });
      }

      const storedPass = String(restaurant.password);
      const isMatch = storedPass.startsWith("$2")
        ? await bcrypt.compare(password, storedPass)
        : storedPass === password;

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password. Please try again.",
        });
      }

      const token = jwt.sign(
        { id: restaurant.id, email: restaurant.email, role: "restaurant" },
        getJwtSecret(),
        { expiresIn: "7d" }
      );

      const rawRestro = restaurant.toJSON ? restaurant.toJSON() : { ...restaurant };
      delete rawRestro.password;

      return res.status(200).json({
        success: true,
        message: "Restaurant login successful",
        role: "restaurant",
        token,
        restaurant: rawRestro,
      });
    }

    return res.status(401).json({
      success: false,
      message: "No account found with this email. Please check your credentials.",
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (decoded.role === "admin") {
      const admin = await Admin.findByPk(decoded.id);
      if (!admin) {
        return res.status(404).json({ success: false, message: "Admin not found" });
      }
      const safeAdmin = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: "admin",
        avatar: admin.avatar,
        address: admin.address,
      };
      return res.status(200).json({
        success: true,
        role: "admin",
        user: safeAdmin,
      });
    }

    if (decoded.role === "restaurant") {
      const restaurant = await Restaurant.findByPk(decoded.id);
      if (!restaurant) {
        return res.status(404).json({ success: false, message: "Restaurant not found" });
      }
      const rawRestro = restaurant.toJSON ? restaurant.toJSON() : { ...restaurant };
      delete rawRestro.password;
      return res.status(200).json({
        success: true,
        role: "restaurant",
        restaurant: rawRestro,
      });
    }

    return res.status(401).json({ success: false, message: "Invalid role" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const admin = await Admin.findOne({ where: { email: cleanEmail } });
    const restaurant = !admin ? await Restaurant.findOne({ where: { email: cleanEmail } }) : null;

    if (!admin && !restaurant) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
      email: cleanEmail,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Email and new password (min 6 chars) are required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const admin = await Admin.findOne({ where: { email: cleanEmail } });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (admin) {
      admin.password = hashedPassword;
      await admin.save();
      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    }

    const restaurant = await Restaurant.findOne({ where: { email: cleanEmail } });
    if (restaurant) {
      restaurant.password = hashedPassword;
      await restaurant.save();
      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    }

    return res.status(404).json({
      success: false,
      message: "Account not found",
    });
  } catch (error) {
    next(error);
  }
};
