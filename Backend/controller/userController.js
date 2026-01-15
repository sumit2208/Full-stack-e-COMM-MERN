import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../Models/User.js";
import Role from "../Models/Role.js";
import RefreshToken from "../Models/RefreshToken.js";
import { accesstoken, refreshtoken } from "./../token.js";
import UserRole from "../Models/UserRole.js";
import Kyc from "../Models/kyc.js";
export const CreateRole = async (req, res) => {
  const RoleData = req.body;
  const role = new Role({
    name: RoleData.name,
    description: RoleData.description,
    permission: RoleData.permission,
  });

  const result = await role.save();
  if (result) {
    res.status(201).send({
      message: "Role Created Successfully",
      success: true,
    });
  } else {
    res.status(401).send({
      message: "Something went Wrong",
      success: false,
    });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      message: "Email and password are required",
      success: false,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    const result = await user.save();

    res.status(201).send({
      message: "Signup Successfully",
      success: true,
      result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).send({
        message: "Email already exists",
        success: false,
      });
    }
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const accessToken = accesstoken(user._id, user.role);
    const refreshToken = refreshtoken(user._id);

    await RefreshToken.findOneAndUpdate(
      { userId: user._id },
      { token: refreshToken, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 },
      { upsert: true, new: true, useFindAndModify: false }
    );

    res.cookie("refreshToken", refreshToken, {
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken,
      user: {
        role: user.role,
        email: user.email,
        id: user._id,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const tokenDoc = await RefreshToken.findOne({ userId: decoded.id });

    if (!tokenDoc) {
      return res
        .status(401)
        .json({ success: false, message: "Token not found" });
    }

    if (tokenDoc.token !== refreshToken) {
      await RefreshToken.deleteOne({ userId: decoded.id });
      return res.status(401).json({ success: false, message: "Token revoked" });
    }

    if (tokenDoc.expiresAt < Date.now()) {
      await RefreshToken.deleteOne({ userId: decoded.id });
      return res
        .status(401)
        .json({ success: false, message: "Refresh token expired" });
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    const newAccessToken = accesstoken(user._id, user.role);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,

      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(401).json({
      success: false,
      message: "Invalid/expired refresh token",
    });
  }
};

// export const logout = async (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (refreshToken) {
//     try {
//       const decoded = jwt.verify(
//         refreshToken,
//         process.env.REFRESH_TOKEN_SECRET
//       );

//       await RefreshToken.deleteOne({ userId: decoded.id });
//     } catch (err) {}
//   }

//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     sameSite: "Strict",
//   });

//   res.json({ success: true, message: "Logged out successfully" });
// };
export const sendkyc = async (req, res) => {
  console.log("Request Body:", req.body);

  try {
    const { name, dob, address, _id } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (dob) updateData.dob = new Date(dob);
    if (address) updateData.address = address;

    updateData.userId = _id;
    updateData.idProof = "89r49";
    updateData.addressProof = "9384hfh893h9";

    const result = await Kyc.findOneAndUpdate({ userId: _id }, updateData, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).send({
      message: "KYC data saved or updated successfully",
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("KYC Error:", error);
    res.status(500).send({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};
export const ResumeKycData = async (req, res) => {
  try {
    const { _id } = req.params;

    const kycData = await Kyc.findOne({ userId: _id });

    if (kycData) {
      return res.status(200).send({
        message: "Resume Data Fetch",
        success: true,
        data: kycData,
      });
    } else {
      return res.status(404).send({
        message: "No KYC data found",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Server error while fetching KYC data",
      success: false,
    });
  }
};
export const getAllUser = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $lookup: {
          from: "User_Role",
          let: { user_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$user_id", { $toObjectId: "$user_id" }] },
              },
            },
            {
              $project: { role_id: 1 },
            },
          ],
          as: "roles",
        },
      },
    ]);

    if (result.length > 0) {
      return res.status(200).json({
        message: "All Users Fetched Successfully",
        success: true,
        result,
      });
    } else {
      return res.status(200).json({
        message: "No users found",
        success: true,
        result: [],
      });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export const UserUpdateData = async (req, res) => {
  try {
    const { _id } = req.params;

    const result = await User.findByIdAndUpdate(
      _id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res
        .status(404)
        .send({ message: "User not found", success: false });
    }

    res.status(200).send({
      message: "User updated successfully",
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error updating user",
      success: false,
      error: error.message,
    });
  }
};
export const UpdateRole = async (req, res) => {
  const { _id } = req.params;

  try {
    const result = await Role.updateOne({ _id }, { $set: req.body });

    const result2 = await UserRole.create({
      user_id: _id,
      role_id: req.body.role_id,
    });

    if (result.modifiedCount > 0) {
      res.status(200).json({
        message: "Successfully Updated The Role",
        success: true,
      });
    } else {
      res.status(400).json({
        message: "Role Not Updated",
        success: false,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const UserDelete = async (req, res) => {
  try {
    const { _id } = req.params;

    const result = await User.findByIdAndDelete(_id);

    if (!result) {
      return res
        .status(404)
        .send({ message: "User not found", success: false });
    }

    res.status(200).send({
      message: "User deleted successfully",
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error deleting user",
      success: false,
      error: error.message,
    });
  }
};

export const allpermission = async (req, res) => {
  try {
    const result = await Role.find();
    if (result && result.length > 0) {
      return res.status(201).json({
        message: "All permission fetch success",
        success: true,
        result,
      });
    } else {
      return res.status(401).json({
        message: "Not fetch success",
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getallpermission = async (req, res) => {
  const result = await Role.find();
  if (result) {
    res.status(201).send({
      message: "Succesfully Fetch The Role",
      success: true,
      result,
    });
  } else {
    res.status(401).send({
      message: "Role Not",
      success: false,
    });
  }
};

export const DeleteRole = async (req, res) => {
  try {
    const result = await Role.deleteOne({ _id: req.params._id });
    if (result.deletedCount)
      return res.send({
        message: "Product Deleted Successfully",
        success: true,
      });
    res.status(404).send({
      message: "Product Not Found",
      success: false,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const Profile = async (req, res) => {
  try {
    const { _id } = req.params;
    const result = await User.findOne({ _id: _id });
    if (result) {
      res.status(200).send({
        message: "Profile Get Succesfully",
        success: true,
        result,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};
