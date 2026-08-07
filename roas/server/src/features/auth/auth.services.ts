import bcrypt from 'bcrypt';
import { UserModel } from '../users/users.models';
import { UserRole } from '../../types/enums';
import { ISessionUser } from '../../types/common';
import { UnauthorizedError, ForbiddenError, ConflictError, AppError } from '../../utils/errors';
import config from '../../config/config';
import logger from '../../utils/logger';
import { generatePassword } from '../../utils/password';
import { sendEmail } from '../../utils/email';

const BCRYPT_ROUNDS = 12;

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export const loginUser = async (email: string, password: string): Promise<ISessionUser> => {
  const user = await UserModel.findOne({ email, isActive: true }).select('+password');

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  user.lastLoginAt = new Date();
  await user.save();

  logger.info(`User logged in: ${user.email}`);

  return {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    vendorId: user.vendor ? user.vendor.toString() : null,
  };
};

export const signupUser = async (data: SignupData): Promise<ISessionUser> => {
  if (data.role === UserRole.GOD_USER) {
    throw new ForbiddenError('God User accounts cannot be created via signup');
  }

  if (data.role === UserRole.ADMIN_USER && !config.allowAdminSignup) {
    throw new AppError('Admin signup is currently disabled', 403, 'ADMIN_SIGNUP_DISABLED');
  }

  const existingUser = await UserModel.findOne({ email: data.email });
  if (existingUser) {
    throw new ConflictError('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const user = await UserModel.create({
    email: data.email,
    password: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
    createdBy: null,
    lastLoginAt: new Date(),
  });

  logger.info(`New user signed up: ${user.email} (${user.role})`);

  return {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    vendorId: user.vendor ? user.vendor.toString() : null,
  };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await UserModel.findById(userId).select('+password');
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);
};

export const sendGodUserCredentials = async (): Promise<void> => {
  if (!config.allowSendGodCredentials) {
    throw new ForbiddenError('Sending Super Admin credentials is currently disabled');
  }

  const newPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  let godUser = await UserModel.findOne({
    role: UserRole.GOD_USER,
    isActive: true,
  }).select('+password');

  let action: 'created' | 'reset';

  if (godUser) {
    // God user exists — reset password
    godUser.password = hashedPassword;
    await godUser.save();
    action = 'reset';
  } else {
    // God user does not exist — create one
    godUser = await UserModel.create({
      email: config.godUserEmail,
      password: hashedPassword,
      firstName: config.godUserFirstName,
      lastName: config.godUserLastName,
      role: UserRole.GOD_USER,
      isActive: true,
      createdBy: null,
    });
    action = 'created';
  }

  const actionMessage =
    action === 'created'
      ? 'Your Super Admin account has been created. Below are your login details:'
      : 'Your Super Admin credentials have been reset. Below are your new login details:';

  const emailText = [
    'Hello,',
    '',
    actionMessage,
    '',
    `Email: ${godUser.email}`,
    `Password: ${newPassword}`,
    '',
    'Please change your password after logging in.',
    '',
    'Regards,',
    'ROAS PrintFast',
  ].join('\n');

  await sendEmail(godUser.email, 'ROAS PrintFast — Super Admin Credentials', emailText);

  logger.info(`God User ${action} and credentials sent to ${godUser.email}`);
};
