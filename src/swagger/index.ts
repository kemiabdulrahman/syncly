import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config.js';

// Import path documentation to ensure they're included
import './paths/auth.js';
import './paths/patients.js';
import './paths/cases.js';
import './paths/medical-records.js';
import './paths/referrals.js';
import './paths/emergency.js';
import './paths/discussions.js';
import './paths/notifications.js';

export { swaggerUi, swaggerSpec };
