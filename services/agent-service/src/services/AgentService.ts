import { Repository } from 'typeorm';
import { AgentDataSource } from '../config/database';
import { Agent } from '../entities/Agent';
import { logger } from '../utils/logger';

export interface CreateAgentDto {
  user_id: string;
  agent_code: string;
  business_name: string;
  business_type?: string;
  license_number?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  county?: string;
  daily_limit?: number;
  monthly_limit?: number;
  commission_rate?: number;
}

export interface UpdateAgentDto {
  business_name?: string;
  business_type?: string;
  license_number?: string;
  address?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  daily_limit?: number;
  monthly_limit?: number;
  commission_rate?: number;
  is_active?: boolean;
}

export class AgentService {
  private repository: Repository<Agent>;

  constructor() {
    this.repository = AgentDataSource.getRepository(Agent);
  }

  private static buildPoint(lat?: number, lon?: number): string | undefined {
    if (lat === undefined || lon === undefined) {
      return undefined;
    }

    return `(${lon},${lat})`;
  }

  private static parsePoint(point?: string | null): { latitude: number; longitude: number } | undefined {
    if (!point) {
      return undefined;
    }

    const match = point.match(/\((-?\d+\.?\d*),(-?\d+\.?\d*)\)/);
    if (!match) {
      return undefined;
    }

    return {
      longitude: Number(match[1]),
      latitude: Number(match[2])
    };
  }

  private static mapAgent(agent: Agent) {
    const { terminals, transactions, location, ...rest } = agent;
    const coordinates = AgentService.parsePoint(location);

    return {
      ...rest,
      location: coordinates ? { latitude: coordinates.latitude, longitude: coordinates.longitude } : null
    };
  }

  async createAgent(payload: CreateAgentDto) {
    const existing = await this.repository.findOne({ where: { agent_code: payload.agent_code } });
    if (existing) {
      throw new Error('Agent code already exists');
    }

    const agent = this.repository.create({
      user_id: payload.user_id,
      agent_code: payload.agent_code,
      business_name: payload.business_name,
      business_type: payload.business_type,
      license_number: payload.license_number,
      address: payload.address,
      county: payload.county,
      location: AgentService.buildPoint(payload.latitude, payload.longitude),
      daily_limit: payload.daily_limit !== undefined ? payload.daily_limit.toString() : undefined,
      monthly_limit: payload.monthly_limit !== undefined ? payload.monthly_limit.toString() : undefined,
      commission_rate: payload.commission_rate !== undefined ? payload.commission_rate.toString() : undefined
    });

    const saved = await this.repository.save(agent);
    logger.info(`Agent created with code ${saved.agent_code}`);
    return AgentService.mapAgent(saved);
  }

  async listAgents(filters?: { county?: string; is_active?: boolean }) {
    const where: Record<string, unknown> = {};
    if (filters?.county) {
      where.county = filters.county;
    }
    if (typeof filters?.is_active === 'boolean') {
      where.is_active = filters.is_active;
    }

    const agents = await this.repository.find({ where, order: { created_at: 'DESC' } });
    return agents.map(AgentService.mapAgent);
  }

  async getAgentById(agentId: string) {
    const agent = await this.repository.findOne({ where: { agent_id: agentId } });
    if (!agent) {
      return null;
    }

    return AgentService.mapAgent(agent);
  }

  async updateAgent(agentId: string, payload: UpdateAgentDto) {
    const agent = await this.repository.findOne({ where: { agent_id: agentId } });
    if (!agent) {
      throw new Error('Agent not found');
    }

    if (payload.latitude !== undefined && payload.longitude !== undefined) {
      agent.location = AgentService.buildPoint(payload.latitude, payload.longitude);
    }

    Object.assign(agent, {
      business_name: payload.business_name ?? agent.business_name,
      business_type: payload.business_type ?? agent.business_type,
      license_number: payload.license_number ?? agent.license_number,
      address: payload.address ?? agent.address,
      county: payload.county ?? agent.county,
      daily_limit:
        payload.daily_limit !== undefined ? payload.daily_limit.toString() : agent.daily_limit,
      monthly_limit:
        payload.monthly_limit !== undefined ? payload.monthly_limit.toString() : agent.monthly_limit,
      commission_rate:
        payload.commission_rate !== undefined ? payload.commission_rate.toString() : agent.commission_rate,
      is_active: payload.is_active ?? agent.is_active
    });

    const updated = await this.repository.save(agent);
    logger.info(`Agent ${updated.agent_id} updated`);
    return AgentService.mapAgent(updated);
  }
}
