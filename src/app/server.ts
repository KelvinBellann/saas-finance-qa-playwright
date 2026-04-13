import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { financeStore } from './data/finance-store.js';
import { applySecurityMiddleware } from './security.js';
import { registerApiRoutes } from './routes/api.js';
import { registerPageRoutes } from './routes/pages.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const port = Number(process.env.PORT ?? 3000);

applySecurityMiddleware(app);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(publicDir));

registerPageRoutes(app, financeStore, publicDir);
registerApiRoutes(app, financeStore);

app.use((_request, response) => {
  response.status(404).json({
    message: 'Recurso nao encontrado.',
  });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Sentinel Finance app disponivel em http://127.0.0.1:${port}`);
});
