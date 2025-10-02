import { Request, Response, NextFunction } from 'express';
import { TerminalService } from '../services/TerminalService';

const terminalService = new TerminalService();

export class TerminalController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const terminal = await terminalService.registerTerminal(req.body);
      res.status(201).json(terminal);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const terminal = await terminalService.updateTerminal(req.params.id, req.body);
      res.json(terminal);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { agent_id, status } = req.query;
      const terminals = await terminalService.listTerminals({
        agent_id: agent_id as string | undefined,
        status: status as string | undefined
      });
      res.json({ data: terminals });
    } catch (error) {
      next(error);
    }
  }
}
