import bcrypt from 'bcrypt';
import User from '../models/User';
import EmailService from '../services/email.service';
import PasswordResetService from '../services/password-reset.service';
import HttpError from '../utils/http-error';

jest.mock('bcrypt');
jest.mock('../models/User');
jest.mock('../services/email.service');

const mockedBcrypt = jest.mocked(bcrypt);
const mockedUser = jest.mocked(User);
const mockedEmailService = jest.mocked(EmailService);

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Ana',
    email: 'ana@teste.com',
    password: 'senha-anterior',
    passwordResetCodeHash: 'hash-do-codigo',
    passwordResetExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    passwordResetAttempts: 0,
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('PasswordResetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not reveal whether an e-mail has an account', async () => {
    mockedUser.findOne.mockResolvedValue(null);

    await expect(
      PasswordResetService.requestCode('inexistente@teste.com'),
    ).resolves.toBeUndefined();

    expect(mockedEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  test('stores only a hash and sends a six-digit reset code', async () => {
    const user = makeUser();
    mockedUser.findOne.mockResolvedValue(user as never);
    mockedBcrypt.hash.mockResolvedValue('novo-hash' as never);

    await PasswordResetService.requestCode('ana@teste.com');

    expect(user.update).toHaveBeenCalledWith(expect.objectContaining({
      passwordResetCodeHash: 'novo-hash',
      passwordResetAttempts: 0,
    }));
    expect(mockedEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({ code: expect.stringMatching(/^\d{6}$/) }),
    );
  });

  test('changes the password and clears the code after a valid confirmation', async () => {
    const user = makeUser();
    mockedUser.findOne.mockResolvedValue(user as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedBcrypt.hash.mockResolvedValue('nova-senha-hash' as never);

    await PasswordResetService.resetPassword({
      email: 'ana@teste.com',
      code: '123456',
      password: 'Senha@123',
    });

    expect(user.update).toHaveBeenCalledWith({
      password: 'nova-senha-hash',
      passwordResetCodeHash: null,
      passwordResetExpiresAt: null,
      passwordResetAttempts: 0,
    });
  });

  test('counts an invalid code attempt', async () => {
    const user = makeUser();
    mockedUser.findOne.mockResolvedValue(user as never);
    mockedBcrypt.compare.mockResolvedValue(false as never);

    await expect(
      PasswordResetService.resetPassword({
        email: 'ana@teste.com',
        code: '123456',
        password: 'Senha@123',
      }),
    ).rejects.toBeInstanceOf(HttpError);

    expect(user.update).toHaveBeenCalledWith({ passwordResetAttempts: 1 });
  });
});
