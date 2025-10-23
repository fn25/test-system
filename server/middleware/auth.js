import jwt from 'jsonwebtoken';import jwt from 'jsonwebtoken';

import { User } from '../models/index.js';import { User } from '../models/index.js';



const authenticateToken = async (req, res, next) => {const authenticateToken = async (req, res, next) => {

  try {  try {

    const authHeader = req.headers['authorization'];    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];    const token = authHeader && authHeader.split(' ')[1];



    if (!token) {    if (!token) {

      return res.status(401).json({      return res.status(401).json({

        success: false,        success: false,

        message: 'Access token required'        message: 'Access token required'

      });      });

    }    }



    const decoded = jwt.verify(token, process.env.JWT_SECRET);    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);    

        const user = await User.findByPk(decoded.userId);

    if (!user) {    

      return res.status(401).json({    if (!user || !user.isActive) {

        success: false,      return res.status(401).json({

        message: 'Invalid token'        success: false,

      });        message: 'Invalid token or inactive user'

    }      });

    }

    req.user = user;

    next();    req.user = user;

  } catch (error) {    next();

    console.error('Auth middleware error:', error);  } catch (error) {

        console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {    

      return res.status(401).json({    if (error.name === 'JsonWebTokenError') {

        success: false,      return res.status(401).json({

        message: 'Invalid token'        success: false,

      });        message: 'Invalid token'

    }      });

        }

    if (error.name === 'TokenExpiredError') {    

      return res.status(401).json({    if (error.name === 'TokenExpiredError') {

        success: false,      return res.status(401).json({

        message: 'Token expired'        success: false,

      });        message: 'Token expired'

    }      });

    }

    return res.status(500).json({

      success: false,    return res.status(500).json({

      message: 'Authentication error'      success: false,

    });      message: 'Authentication error'

  }    });

};  }

};

const requireAdmin = (req, res, next) => {

  if (!req.user) {const requireAdmin = (req, res, next) => {

    return res.status(401).json({  if (!req.user) {

      success: false,    return res.status(401).json({

      message: 'Authentication required'      success: false,

    });      message: 'Authentication required'

  }    });

  }

  if (req.user.role !== 'admin') {

    return res.status(403).json({  if (req.user.role !== 'admin') {

      success: false,    return res.status(403).json({

      message: 'Admin access required'      success: false,

    });      message: 'Admin access required'

  }    });

  }

  next();

};  next();

};

export {

  authenticateToken,const requireAdminOrOwner = (userIdParam = 'userId') => {

  requireAdmin  return (req, res, next) => {

};    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const targetUserId = req.params[userIdParam] || req.body[userIdParam];
    
    if (req.user.role === 'admin' || req.user.id === targetUserId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  };
};

export {
  authenticateToken,
  requireAdmin,
  requireAdminOrOwner
};