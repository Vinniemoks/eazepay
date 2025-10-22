# Eazepay IoT Service

Real-time device management, location tracking, and telemetry processing for IoT devices.

## Features

- ✅ Real-time agent location tracking
- ✅ Device registry and management
- ✅ Telemetry data processing
- ✅ Device health monitoring
- ✅ Geofencing and proximity detection
- ✅ MQTT protocol support
- ✅ RESTful API

## Quick Start

### 1. Install MQTT Broker (Mosquitto)

```bash
# Ubuntu/Debian
sudo apt-get install mosquitto mosquitto-clients

# macOS
brew install mosquitto

# Windows
# Download from https://mosquitto.org/download/
```

### 2. Start Mosquitto

```bash
mosquitto -v
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Service

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Device Management

**Register Device**
```http
POST /api/devices/register
Content-Type: application/json

{
  "deviceId": "device_001",
  "deviceType": "AGENT_PHONE",
  "agentId": "agent_123",
  "metadata": {
    "model": "Samsung Galaxy S21",
    "os": "Android 12"
  }
}
```

**Get Device**
```http
GET /api/devices/:deviceId
```

**Get All Devices**
```http
GET /api/devices?type=AGENT_PHONE&status=ONLINE
```

### Location Tracking

**Get Agent Location**
```http
GET /api/agents/:agentId/location
```

**Get Location History**
```http
GET /api/agents/:agentId/location/history?startTime=2025-10-22T00:00:00Z&limit=100
```

**Get Nearby Agents**
```http
GET /api/agents/nearby?latitude=-1.286389&longitude=36.817223&radius=5000
```

### Telemetry

**Get Device Telemetry**
```http
GET /api/devices/:deviceId/telemetry?metric=battery_level
```

**Get Device Health**
```http
GET /api/devices/:deviceId/health
```

## MQTT Topics

### Location Updates
```
Topic: eazepay/agents/{agentId}/location
Payload: {
  "latitude": -1.286389,
  "longitude": 36.817223,
  "accuracy": 10,
  "timestamp": "2025-10-22T10:00:00Z"
}
```

### Device Telemetry
```
Topic: eazepay/devices/{deviceId}/telemetry
Payload: {
  "metric": "battery_level",
  "value": 85,
  "unit": "%",
  "timestamp": "2025-10-22T10:00:00Z"
}
```

### Device Status
```
Topic: eazepay/devices/{deviceId}/status
Payload: {
  "status": "ONLINE"
}
```

## Device Types

- **AGENT_PHONE**: Mobile phone used by agents
- **POS_TERMINAL**: Point-of-sale terminal
- **KIOSK**: Self-service kiosk
- **SMART_WATCH**: Wearable device

## Telemetry Metrics

- **battery_level**: Battery percentage (0-100)
- **signal_strength**: Network signal strength (0-100)
- **temperature**: Device temperature (°C)
- **uptime**: Device uptime (seconds)

## Health Status

- **HEALTHY**: All metrics normal
- **WARNING**: 1-2 issues detected
- **CRITICAL**: 3+ issues detected

## Testing with MQTT

### Publish Location Update
```bash
mosquitto_pub -t "eazepay/agents/agent_123/location" -m '{
  "latitude": -1.286389,
  "longitude": 36.817223,
  "accuracy": 10,
  "timestamp": "2025-10-22T10:00:00Z"
}'
```

### Publish Telemetry
```bash
mosquitto_pub -t "eazepay/devices/device_001/telemetry" -m '{
  "metric": "battery_level",
  "value": 85,
  "unit": "%"
}'
```

### Subscribe to All Topics
```bash
mosquitto_sub -t "eazepay/#" -v
```

## Integration with Agent Service

```typescript
// In agent mobile app
import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://iot-service:1883');

// Send location updates
setInterval(() => {
  navigator.geolocation.getCurrentPosition((position) => {
    client.publish(`eazepay/agents/${agentId}/location`, JSON.stringify({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: new Date().toISOString()
    }));
  });
}, 30000); // Every 30 seconds

// Send telemetry
setInterval(() => {
  navigator.getBattery().then((battery) => {
    client.publish(`eazepay/devices/${deviceId}/telemetry`, JSON.stringify({
      metric: 'battery_level',
      value: battery.level * 100,
      unit: '%'
    }));
  });
}, 60000); // Every minute
```

## Geofencing

The service supports geofencing to:
- Restrict transactions outside allowed areas
- Alert when agents enter/exit zones
- Track agent movements

## Alerts

Automatic alerts for:
- Low battery (< 10%)
- High temperature (> 70°C)
- Weak signal (< 20%)
- Device offline

## Docker

```bash
docker build -t eazepay-iot-service .
docker run -p 8030:8030 eazepay-iot-service
```

## License

Proprietary - Eazepay
