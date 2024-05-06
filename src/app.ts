import dotenv from 'dotenv';
dotenv.config();
import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import config from '@/config';
import publicRoutes from '@/routes/public';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());

app.use('/', publicRoutes);

app.get('/ping', (req, res) => {
    res.send('pong 🏓');
});

app.listen(config.port, () => {
    console.log(`Application is listening at http://localhost:${config.port}`);
});
