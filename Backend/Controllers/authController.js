import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import bcrypt from 'bcrypt';

export const registerController = async (req, res) => {
  try {
    const { email, password, cpassword } = req.body;

    if (!email || !password || !cpassword) {
      return res.status(400).json({ status: false, message: 'Email, password, and confirm password are required' });
    }
    if (password !== cpassword) {
      return res.status(400).json({ status: false, message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ status: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ status: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ status: false, message: error.message || 'Server error' });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: false, message: 'Invalid email or password' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ status: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      maxAge: 1000 * 60 * 15,      // 15 minutes
      httpOnly: true,              // safer
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,              // required for cross-site cookies in prod
    });

    return res.status(200).json({ status: true, message: 'Login successful' });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ status: false, message: error.message || 'Server error' });
  }
};

export const logoutController = (_req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
  });
  res.status(200).json({ status: true, message: 'Logged out successfully' });
};

export const getUserController = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('email products sales');
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized user' });
    }
    return res.status(200).json({ status: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};
