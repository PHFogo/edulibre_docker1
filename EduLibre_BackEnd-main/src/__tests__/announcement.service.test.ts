import AnnouncementService from '../services/announcement.service';
import RealtimeNotificationService from '../services/realtime-notification.service';
import EmailService from '../services/email.service';
import User from '../models/User';

jest.mock('../services/realtime-notification.service', () => ({
  __esModule: true,
  default: { broadcast: jest.fn() },
}));

jest.mock('../services/email.service', () => ({
  __esModule: true,
  default: { sendAnnouncementEmail: jest.fn() },
}));

jest.mock('../models/User', () => ({
  __esModule: true,
  default: { findAll: jest.fn() },
}));

describe('AnnouncementService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('publica um comunicado ao vivo e por e-mail para os usuários cadastrados', async () => {
    (User.findAll as jest.Mock).mockResolvedValue([
      { name: 'Ana', email: 'ana@exemplo.com' },
      { name: 'Bia', email: 'bia@exemplo.com' },
    ]);
    (EmailService.sendAnnouncementEmail as jest.Mock).mockResolvedValue(undefined);

    const announcement = await AnnouncementService.publish('maintenance');

    expect(announcement.templateKey).toBe('maintenance');
    expect(announcement.title).toBe('Manutenção programada');
    expect(RealtimeNotificationService.broadcast).toHaveBeenCalledWith(
      announcement.title,
      announcement.message,
    );
    expect(EmailService.sendAnnouncementEmail).toHaveBeenCalledTimes(2);
    expect(announcement).toMatchObject({
      recipientCount: 2,
      emailedCount: 2,
      emailFailureCount: 0,
    });
  });

  test('rejeita um comunicado inexistente', async () => {
    await expect(AnnouncementService.publish('nao-existe')).rejects.toThrow(
      'Comunicado inválido.',
    );
  });
});
