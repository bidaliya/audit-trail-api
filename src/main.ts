import { createApp } from './bootstrap/app';
import { startServer } from './bootstrap/server';

const app = createApp();
startServer(app);
