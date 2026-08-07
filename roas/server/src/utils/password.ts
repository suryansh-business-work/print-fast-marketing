import crypto from 'crypto';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;

const getSecureRandomChar = (charset: string): string => {
  const randomIndex = crypto.randomInt(charset.length);
  return charset[randomIndex];
};

export const generatePassword = (length = 16): string => {
  if (length < 8) {
    throw new Error('Password length must be at least 8 characters');
  }

  // Ensure at least one character from each required category
  const required = [
    getSecureRandomChar(UPPERCASE),
    getSecureRandomChar(LOWERCASE),
    getSecureRandomChar(DIGITS),
    getSecureRandomChar(SPECIAL),
  ];

  // Fill remaining length with random characters from the full set
  const remaining = Array.from({ length: length - required.length }, () =>
    getSecureRandomChar(ALL_CHARS),
  );

  // Combine and shuffle using Fisher-Yates
  const chars = [...required, ...remaining];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
};
