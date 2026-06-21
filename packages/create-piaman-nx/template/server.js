import { Http, Response } from 'piaman-nx/http';
import { logger } from 'piaman-nx/logger';
import config from './piaman.config.js';
import exampleRoutes from './routes/example/example.routes.js';

const app = new Http({ port: config.port, host: config.host, viewsDir: config.viewsDir });

app.use(exampleRoutes);

app.get('/', (req, res) => {
  res(200, { status: 'ok', message: 'welcome' });
});

app.get('/example', (req, res) => {
  res.views('index.html');
});

app.listen(config.port, () => logger.info(`Piaman-NX running on ${config.host}:${config.port}`));
