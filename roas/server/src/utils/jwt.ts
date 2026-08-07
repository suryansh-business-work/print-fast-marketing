import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import config from '../config/config';
import { ISessionUser } from '../types/common';
import { UserRole } from '../types/enums';

interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  vendorId: string | null;
}

export const signToken = (user: ISessionUser): string => {
  const payload: IJwtPayload = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    vendorId: user.vendorId,
  };

  const secret: Secret = config.jwtSecret;
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as StringValue };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): ISessionUser => {
  const secret: Secret = config.jwtSecret;
  const decoded = jwt.verify(token, secret) as IJwtPayload;

  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    firstName: decoded.firstName,
    lastName: decoded.lastName,
    vendorId: decoded.vendorId || null,
  };
};
