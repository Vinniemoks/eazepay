// Location Tracker - Tracks agent locations in real-time
import { logger } from './utils/logger';

interface Location {
  agentId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
  address?: string;
}

export class LocationTracker {
  private locations: Map<string, Location> = new Map();
  private locationHistory: Map<string, Location[]> = new Map();

  processLocationUpdate(topic: string, message: any): void {
    try {
      // Extract agent ID from topic: eazepay/agents/{agentId}/location
      const agentId = topic.split('/')[2];
      
      const location: Location = {
        agentId,
        latitude: message.latitude,
        longitude: message.longitude,
        accuracy: message.accuracy || 0,
        altitude: message.altitude,
        speed: message.speed,
        heading: message.heading,
        timestamp: new Date(message.timestamp || Date.now()),
        address: message.address
      };

      // Update current location
      this.locations.set(agentId, location);

      // Add to history
      if (!this.locationHistory.has(agentId)) {
        this.locationHistory.set(agentId, []);
      }
      
      const history = this.locationHistory.get(agentId)!;
      history.push(location);

      // Keep only last 1000 locations
      if (history.length > 1000) {
        history.shift();
      }

      logger.debug(`Location updated for agent ${agentId}: ${location.latitude}, ${location.longitude}`);
      
      // TODO: Save to time-series database (InfluxDB/TimescaleDB)
      
      // Check geofencing rules
      this.checkGeofencing(location);
      
    } catch (error) {
      logger.error('Error processing location update:', error);
    }
  }

  async getAgentLocation(agentId: string): Promise<Location | null> {
    return this.locations.get(agentId) || null;
  }

  async getLocationHistory(
    agentId: string,
    startTime?: string,
    endTime?: string,
    limit: number = 100
  ): Promise<Location[]> {
    const history = this.locationHistory.get(agentId) || [];
    
    let filtered = history;

    if (startTime) {
      const start = new Date(startTime);
      filtered = filtered.filter(loc => loc.timestamp >= start);
    }

    if (endTime) {
      const end = new Date(endTime);
      filtered = filtered.filter(loc => loc.timestamp <= end);
    }

    return filtered.slice(-limit);
  }

  async getNearbyAgents(
    latitude: number,
    longitude: number,
    radiusMeters: number
  ): Promise<Array<{ agentId: string; location: Location; distance: number }>> {
    const nearby: Array<{ agentId: string; location: Location; distance: number }> = [];

    for (const [agentId, location] of this.locations.entries()) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        location.latitude,
        location.longitude
      );

      if (distance <= radiusMeters) {
        nearby.push({ agentId, location, distance });
      }
    }

    // Sort by distance
    nearby.sort((a, b) => a.distance - b.distance);

    return nearby;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    // Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  private checkGeofencing(location: Location): void {
    // TODO: Implement geofencing rules
    // Example: Alert if agent is outside allowed area
    // Example: Restrict transactions if agent is in high-risk zone
  }

  getTrackedAgentsCount(): number {
    return this.locations.size;
  }
}
