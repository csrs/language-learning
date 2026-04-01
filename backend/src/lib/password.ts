import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

export type PasswordVerificationResult = "match" | "invalid";

const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const HEX_PATTERN = /^[0-9a-f]+$/i;

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keyLength: number,
) => Promise<Buffer>;

export const createPasswordHash = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);

  return `${HASH_PREFIX}:${salt}:${derivedKey.toString("hex")}`;
};

export const getIsPasswordValid = async (
  enteredPassword: string,
  storedPasswordHash: string,
): Promise<boolean> => {
  if (!storedPasswordHash.startsWith(`${HASH_PREFIX}:`)) {
    return false;
  }

  const [prefix, salt, hashedPassword] = storedPasswordHash.split(":");

  if (
    prefix !== HASH_PREFIX ||
    !salt ||
    !hashedPassword ||
    !HEX_PATTERN.test(salt) ||
    !HEX_PATTERN.test(hashedPassword)
  ) {
    return false;
  }

  const derivedKey = await scrypt(enteredPassword, salt, KEY_LENGTH);
  const storedKey = Buffer.from(hashedPassword, "hex");

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey) ? true : false;
};
