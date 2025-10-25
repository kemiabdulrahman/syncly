import express from 'express';
import { DiscussionController } from '../controllers/discussionController';
import { authenticate } from '../middleware/auth';
import { auditLog } from '../middleware/auditLogger';

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
