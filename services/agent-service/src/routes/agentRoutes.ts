import { Router } from 'express';
import { AgentController } from '../controllers/AgentController';

export const agentRoutes = Router();

agentRoutes.post('/', AgentController.createAgent);
agentRoutes.get('/', AgentController.listAgents);
agentRoutes.get('/:id', AgentController.getAgent);
agentRoutes.patch('/:id', AgentController.updateAgent);
