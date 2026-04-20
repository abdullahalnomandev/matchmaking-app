import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { ConversationRoutes } from '../app/modules/conversation/conversation.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { SupportRoutes } from '../app/modules/support/support.route';
import { QuestionRoutes } from '../app/modules/question/question.route';
import { QuestionCategoryRoutes } from '../app/modules/questionCategory/questionCategory.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
import { SettingsRoutes } from '../settings/settings.route';
import { NewsletterRoutes } from '../app/modules/newsletter/newsletter.route';
import { WebinarRoutes } from '../app/modules/webinar/webinar.route';
import { CompanyRoutes } from '../app/modules/company/company.route';
import { ChatRoomRoutes } from '../app/modules/chat-room/chat-room.route';
import { ChatRoomMessageRoutes } from '../app/modules/chat-room/chat-room-message/chat-room-message.routes';
import { ConsultationRoutes } from '../app/modules/consultation/consultation.routes';
import { ConsultationRequestRoutes } from '../app/modules/consultation/request';

const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/support',
    route: SupportRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/conversation',
    route: ConversationRoutes,
  },
  {
    path: '/message',
    route: MessageRoutes,
  },
  {
    path: '/question',
    route: QuestionRoutes,
  },
  {
    path: '/question-category',
    route: QuestionCategoryRoutes,
  },
  {
    path: '/faq',
    route: FaqRoutes,
  },
  {
    path: '/settings',
    route: SettingsRoutes,
  },
  {
    path: '/newsletter',
    route: NewsletterRoutes,
  },
  {
    path: '/webinar',
    route: WebinarRoutes,
  },
  {
    path: '/company',
    route: CompanyRoutes,
  },
  {
    path:'/chat-rooms',
    route:ChatRoomRoutes
  },
  {
    path:'/chat-messages',
    route:ChatRoomMessageRoutes
  },
  {
    path:'/consultation',
    route:ConsultationRoutes
  },
  {
    path:'/consultation/requests',
    route: ConsultationRequestRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
