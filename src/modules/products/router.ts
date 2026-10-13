import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middleware/index.ts';
import { tryCatch } from '../../utils/index.ts';
import * as productsController from './controller.ts';

const router = Router();

// @route   GET /api/v1/products
router.get('/', tryCatch(productsController.getAll));

// @route   GET /api/v1/products/:id
router.get('/:id', tryCatch(productsController.getById));

// @route   POST /api/v1/products
router.post('/', requireAuth, requireRoles('KEEPER', 'ADMIN'), tryCatch(productsController.create));

// @route   PATCH /api/v1/products/:id
router.patch('/:id', requireAuth, requireRoles('KEEPER', 'ADMIN'), tryCatch(productsController.update));

// @route   PUT /api/v1/products/:id (Support standard update)
router.put('/:id', requireAuth, requireRoles('KEEPER', 'ADMIN'), tryCatch(productsController.update));

// @route   DELETE /api/v1/products/:id
router.delete('/:id', requireAuth, requireRoles('KEEPER', 'ADMIN'), tryCatch(productsController.remove));

export default router;
