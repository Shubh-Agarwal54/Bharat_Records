import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, no token provided'
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
      
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }
      
      if (!req.user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'User account is inactive'
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error in authentication'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this resource'
      });
    }
    next();
  };
};
