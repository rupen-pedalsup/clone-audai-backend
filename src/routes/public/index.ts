import { Router } from 'express';
import processRoutes from './process.router';

const router = Router();

const defaultRoutes = [
    {
        path: '/process',
        route: processRoutes,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
