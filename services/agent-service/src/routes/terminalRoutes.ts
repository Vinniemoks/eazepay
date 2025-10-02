import { Router } from 'express';
import { TerminalController } from '../controllers/TerminalController';

export const terminalRoutes = Router();

terminalRoutes.post('/', TerminalController.register);
terminalRoutes.get('/', TerminalController.list);
terminalRoutes.patch('/:id', TerminalController.update);
