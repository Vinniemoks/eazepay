import { Repository } from 'typeorm';
import { AgentDataSource } from '../config/database';
import { AgentTerminal } from '../entities/AgentTerminal';
import { logger } from '../utils/logger';

export interface RegisterTerminalDto {
  agent_id: string;
  serial_number: string;
  model?: string;
  firmware_version?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateTerminalStatusDto {
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SUSPENDED';
  firmware_version?: string;
  is_online?: boolean;
  latitude?: number;
  longitude?: number;
  battery_level?: number;
}

export class TerminalService {
  private repository: Repository<AgentTerminal>;

  constructor() {
    this.repository = AgentDataSource.getRepository(AgentTerminal);
  }

  private static buildPoint(lat?: number, lon?: number) {
    if (lat === undefined || lon === undefined) {
      return undefined;
    }

    return `(${lon},${lat})`;
  }

  private static parsePoint(point?: string | null) {
    if (!point) {
      return null;
    }

    const match = point.match(/\((-?\d+\.?\d*),(-?\d+\.?\d*)\)/);
    if (!match) {
      return null;
    }

    return {
      longitude: Number(match[1]),
      latitude: Number(match[2])
    };
  }

  private static mapTerminal(terminal: AgentTerminal) {
    const { agent, location, ...rest } = terminal;
    return {
      ...rest,
      location: TerminalService.parsePoint(location)
    };
  }

  async registerTerminal(payload: RegisterTerminalDto) {
    const existing = await this.repository.findOne({ where: { serial_number: payload.serial_number } });
    if (existing) {
      throw new Error('Terminal serial number already registered');
    }

    const terminal = this.repository.create({
      ...payload,
      location: TerminalService.buildPoint(payload.latitude, payload.longitude)
    });

    const saved = await this.repository.save(terminal);
    logger.info(`Terminal ${saved.serial_number} registered for agent ${saved.agent_id}`);
    return TerminalService.mapTerminal(saved);
  }

  async updateTerminal(terminalId: string, payload: UpdateTerminalStatusDto) {
    const terminal = await this.repository.findOne({ where: { terminal_id: terminalId } });
    if (!terminal) {
      throw new Error('Terminal not found');
    }

    if (payload.latitude !== undefined && payload.longitude !== undefined) {
      terminal.location = TerminalService.buildPoint(payload.latitude, payload.longitude);
    }

    if (payload.battery_level !== undefined) {
      terminal.battery_level = payload.battery_level;
    }

    Object.assign(terminal, {
      status: payload.status ?? terminal.status,
      firmware_version: payload.firmware_version ?? terminal.firmware_version,
      is_online: payload.is_online ?? terminal.is_online,
      last_ping: new Date()
    });

    const updated = await this.repository.save(terminal);
    logger.info(`Terminal ${updated.terminal_id} updated`);
    return TerminalService.mapTerminal(updated);
  }

  async listTerminals(filters?: { agent_id?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.agent_id) {
      where.agent_id = filters.agent_id;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const terminals = await this.repository.find({ where, order: { created_at: 'DESC' } });
    return terminals.map(TerminalService.mapTerminal);
  }
}
