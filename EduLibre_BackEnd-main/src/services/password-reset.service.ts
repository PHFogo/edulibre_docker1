import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import User from '../models/User';
import HttpError from '../utils/http-error';
import { requireText, validateEmail, validatePassword } from '../utils/validators';
import EmailService from './email.service';

const RESET_CODE_TTL_MS = 15 * 60 * 1000;
const MAX_RESET_ATTEMPTS = 5;
const INVALID_CODE_MESSAGE = 'Código inválido ou expirado.';

export default class PasswordResetService {
  public static async requestCode(emailValue: string): Promise<void> {
    const email = validateEmail(requireText(emailValue, 'E-mail'));
    const user = await User.findOne({ where: { email } });

    // A resposta pública é a mesma para e-mails existentes e inexistentes.
    if (!user) return;

    const code = String(randomInt(100_000, 1_000_000));
    await user.update({
      passwordResetCodeHash: await bcrypt.hash(code, 10),
      passwordResetExpiresAt: new Date(Date.now() + RESET_CODE_TTL_MS),
      passwordResetAttempts: 0,
    });

    await EmailService.sendPasswordResetEmail({
      name: user.name,
      email: user.email,
      code,
    });
  }

  public static async resetPassword(input: {
    email: string;
    code: string;
    password: string;
  }): Promise<void> {
    const email = validateEmail(requireText(input.email, 'E-mail'));
    const code = requireText(input.code, 'Código');
    const password = validatePassword(requireText(input.password, 'Senha'));

    if (!/^\d{6}$/.test(code)) {
      throw new HttpError(400, INVALID_CODE_MESSAGE);
    }

    const user = await User.findOne({ where: { email } });
    const isExpired = !user?.passwordResetExpiresAt
      || user.passwordResetExpiresAt.getTime() < Date.now();

    if (!user || !user.passwordResetCodeHash || isExpired
      || user.passwordResetAttempts >= MAX_RESET_ATTEMPTS) {
      throw new HttpError(400, INVALID_CODE_MESSAGE);
    }

    const isValid = await bcrypt.compare(code, user.passwordResetCodeHash);
    if (!isValid) {
      await user.update({
        passwordResetAttempts: user.passwordResetAttempts + 1,
      });
      throw new HttpError(400, INVALID_CODE_MESSAGE);
    }

    await user.update({
      password: await bcrypt.hash(password, 10),
      passwordResetCodeHash: null,
      passwordResetExpiresAt: null,
      passwordResetAttempts: 0,
    });
  }
}
