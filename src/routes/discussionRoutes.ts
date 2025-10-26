import express from 'express';
import { DiscussionController } from '../controllers/discussionController.ts';
import { authenticate } from '../middleware/auth.ts';
import { auditLog } from '../middleware/auditLogger.ts';

const router = express.Router();

router.get(
  '/case/:caseId',
  authenticate,
  auditLog('read', 'discussion'),
  DiscussionController.getDiscussion
);

router.post(
  '/case/:caseId/message',
  authenticate,
  auditLog('create', 'discussion'),
  DiscussionController.addMessage
);

router.delete(
  '/case/:caseId/message/:messageId',
  authenticate,
  auditLog('delete', 'discussion'),
  DiscussionController.deleteMessage
);

export default router;
