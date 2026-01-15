import jwt from 'jsonwebtoken'; 

export const checkUserRole = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: Insufficient permissions",
        success: false,
      });
    }

    next();
  };
};
 
export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing", success: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token", success: false });
    }

    req.user = decoded; 
    next();
  });
};   