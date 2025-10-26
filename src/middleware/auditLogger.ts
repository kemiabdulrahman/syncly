import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import AuditLog from '../models/AuditLog.js';

export const auditLog = (action: string, resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;

    res.send = function(data: any): Response {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const resourceId = req.params.id || req.body?.id || 'unknown';

        AuditLog.create({
          userId: req.user?.userId || 'anonymous',
          action,
          resourceType,
          resourceId,
          details: {
            method: req.method,
            path: req.path,
            body: action !== 'read' ? req.body : undefined
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }).catch(err => console.error('Audit log error:', err));
      }

      return originalSend.call(this, data);
    };

    next();
  };
};
