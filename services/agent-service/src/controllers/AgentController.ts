import { Request, Response, NextFunction } from 'express';
import { AgentService } from '../services/AgentService';

const agentService = new AgentService();

export class AgentController {
  static async createAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await agentService.createAgent(req.body);
      res.status(201).json(agent);
    } catch (error) {
      next(error);
    }
  }

  static async listAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const { county, is_active } = req.query;
      const agents = await agentService.listAgents({
        county: county as string | undefined,
        is_active: typeof is_active === 'string' ? is_active === 'true' : undefined
      });
      res.json({ data: agents });
    } catch (error) {
      next(error);
    }
  }

  static async getAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await agentService.getAgentById(req.params.id);
      if (!agent) {
        res.status(404).json({ message: 'Agent not found' });
        return;
      }
      res.json(agent);
    } catch (error) {
      next(error);
    }
  }

  static async updateAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await agentService.updateAgent(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}
