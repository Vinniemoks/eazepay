import { MQTTBroker } from './mqtt-broker';
import { DeviceRegistry } from './device-registry';
import { TelemetryProcessor } from './telemetry-processor';
import { LocationTracker } from './location-tracker';

export const mqttBroker = new MQTTBroker();
export const deviceRegistry = new DeviceRegistry();
export const telemetryProcessor = new TelemetryProcessor();
export const locationTracker = new LocationTracker();