import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { NetworkConnectionRoutes } from '../app/modules/networkConnection/networkConnection.route';
import { CommentRoutes } from '../app/modules/post/comment/comment.route';
import { LikeRoutes } from '../app/modules/post/like';
import { PostRoutes } from '../app/modules/post/post.route';
import { SaveRoutes } from '../app/modules/post/save';
import { PreferenceRoutes } from '../app/modules/preference/preferences.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { ConversationRoutes } from '../app/modules/conversation/conversation.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { CompanyRoutes } from '../app/modules/company/company.route';
import { MatchingRoutes } from '../app/modules/matching/matching.route';
import { SupportRoutes } from '../app/modules/support/support.route';

const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/company',
    route: CompanyRoutes,
  },
  {
    path: '/matching',
    route: MatchingRoutes,
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
    path: '/preference',
    route: PreferenceRoutes,
  },
  {
    path: '/network-connection',
    route: NetworkConnectionRoutes,
  },
  {
    path: '/post',
    route: PostRoutes,
  },
  {
    path: '/post/comment',
    route: CommentRoutes,
  },
  {
    path: '/post/like',
    route: LikeRoutes,
  },
  {
    path: '/post/save',
    route: SaveRoutes,
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
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
