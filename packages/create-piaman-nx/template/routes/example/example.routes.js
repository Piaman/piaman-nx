import { Router } from 'piaman-nx/http';
import healthHandler from '../../modules/example/example.handler.js';

const router = new Router();

router.get('/health', healthHandler.health);
router.get('/health/log', healthHandler.logs);

export default router;
