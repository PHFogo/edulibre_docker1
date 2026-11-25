import RealtimeNotificationService from './realtime-notification.service';
import EmailService from './email.service';
import User from '../models/User';
import HttpError from '../utils/http-error';

const ANNOUNCEMENT_TEMPLATES = {
  maintenance: {
    title: 'Manutenção programada',
    message:
      'A EduLivre passará por manutenção programada. Alguns recursos podem ficar temporariamente indisponíveis.',
  },
  instability: {
    title: 'Instabilidade identificada',
    message:
      'Identificamos uma instabilidade e nossa equipe já está trabalhando para normalizar o serviço.',
  },
  restored: {
    title: 'Serviço normalizado',
    message:
      'Os serviços da EduLivre foram normalizados. Agradecemos sua compreensão.',
  },
  news: {
    title: 'Novidades na EduLivre',
    message:
      'Há novidades disponíveis na plataforma. Explore as novas experiências de aprendizagem.',
  },
} as const;

export type AnnouncementKey = keyof typeof ANNOUNCEMENT_TEMPLATES;

export default class AnnouncementService {
  public static async publish(templateKey: string) {
    const announcement = ANNOUNCEMENT_TEMPLATES[
      templateKey as AnnouncementKey
    ];

    if (!announcement) {
      throw new HttpError(400, 'Comunicado inválido.');
    }

    RealtimeNotificationService.broadcast(announcement.title, announcement.message);

    const users = await User.findAll({ attributes: ['name', 'email'] });
    const emailResults: PromiseSettledResult<void>[] = [];
    const batchSize = 5;

    for (let index = 0; index < users.length; index += batchSize) {
      const batch = users.slice(index, index + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((user) =>
          EmailService.sendAnnouncementEmail({
            name: user.name,
            email: user.email,
            title: announcement.title,
            message: announcement.message,
          }),
        ),
      );
      emailResults.push(...batchResults);
    }
    const emailedCount = emailResults.filter(
      (result) => result.status === 'fulfilled',
    ).length;

    return {
      templateKey,
      ...announcement,
      deliveredAt: new Date().toISOString(),
      recipientCount: users.length,
      emailedCount,
      emailFailureCount: users.length - emailedCount,
    };
  }
}
