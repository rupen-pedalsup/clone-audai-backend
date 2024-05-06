import { Router } from 'express';
import { trycatch } from '@/middlewares/trycatch';
import { ProcessController } from '@/controllers';
import { uploadStorage } from '@/middlewares/multer';

const router = Router();

router
    .route('/')
    .post(uploadStorage.single('zipfile'), trycatch(ProcessController.post));

export default router;
