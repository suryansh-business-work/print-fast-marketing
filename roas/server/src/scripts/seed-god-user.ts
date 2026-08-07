import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../config/config';
import { UserModel } from '../features/users/users.models';
import { UserRole } from '../types/enums';
import logger from '../utils/logger';

const BCRYPT_ROUNDS = 12;

const seedGodUser = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('Connected to MongoDB');

    const existingGodUser = await UserModel.findOne({ role: UserRole.GOD_USER });

    if (existingGodUser) {
      logger.info(`God User already exists: ${existingGodUser.email}`);
      logger.info('Skipping seed. To recreate, manually remove the existing God User first.');
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(config.godUserPassword, BCRYPT_ROUNDS);

    const godUser = await UserModel.create({
      email: config.godUserEmail,
      password: hashedPassword,
      firstName: config.godUserFirstName,
      lastName: config.godUserLastName,
      role: UserRole.GOD_USER,
      isActive: true,
      createdBy: null,
    });

    logger.info(`God User created successfully: ${godUser.email}`);
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Failed to seed God User:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedGodUser();
