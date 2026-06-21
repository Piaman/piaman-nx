import { Http, Response } from '@piaman/piaman-nx/http';
import { logger } from '@piaman/piaman-nx/logger';
import config from './piaman.config.js';
import healthHandler from './modules/example/example.handler.js';
import exampleRoutes from './routes/example/example.routes.js';

const app = new Http({ viewsDir: config.viewsDir });

app.get('/health', healthHandler.health);
app.get('/health/log', healthHandler.logs);
app.use(exampleRoutes);

app.get('/', (req, res) => {
  res(200, { status: 'ok', message: 'welcome' });
});

app.get('/example', (req, res) => {
  res.views('index.html');
});

app.listen(config.port, () => logger.info(`Piaman-NX running on ${config.host}:${config.port}`));
