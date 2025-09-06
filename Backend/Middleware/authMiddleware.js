import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
