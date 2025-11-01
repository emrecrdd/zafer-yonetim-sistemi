import { USER_ROLES } from '../config/constants.js';

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Kimlik doğrulama gerekli' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Bu işlem için yetkiniz yok' 
      });
    }

    next();
  };
};

export const isSuperAdmin = requireRole([USER_ROLES.SUPER_ADMIN]);
export const isIlBaskani = requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI]);
export const isIlceBaskani = requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]);
export const canManageUsers = requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]);