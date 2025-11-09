// Eazepay Universal - MongoDB Initialization Script
// This script sets up the initial MongoDB database structure and indexes

// Switch to admin database for user creation
db = db.getSiblingDB('admin');

// Create application users
db.createUser({
  user: 'eazepay_app',
  pwd: 'eazepay_app_password_2024!',
  roles: [
    { role: 'readWrite', db: 'eazepay_analytics' },
    { role: 'readWrite', db: 'eazepay_logs' }
  ]
});

db.createUser({
  user: 'eazepay_readonly',
  pwd: 'eazepay_readonly_2024!',
  roles: [
    { role: 'read', db: 'eazepay_analytics' },
    { role: 'read', db: 'eazepay_logs' }
  ]
});

// Switch to analytics database
db = db.getSiblingDB('eazepay_analytics');

// Create collections and indexes for analytics data

// Transaction analytics collection
db.createCollection('transaction_analytics');
db.transaction_analytics.createIndex({ "timestamp": 1 });
db.transaction_analytics.createIndex({ "user_id": 1 });
db.transaction_analytics.createIndex({ "transaction_type": 1 });
db.transaction_analytics.createIndex({ "amount": 1 });
db.transaction_analytics.createIndex({ "status": 1 });
db.transaction_analytics.createIndex({ "agent_id": 1 });
db.transaction_analytics.createIndex({ "county": 1 });

// User behavior analytics
db.createCollection('user_behavior');
db.user_behavior.createIndex({ "user_id": 1 });
db.user_behavior.createIndex({ "session_id": 1 });
db.user_behavior.createIndex({ "timestamp": 1 });
db.user_behavior.createIndex({ "action_type": 1 });
db.user_behavior.createIndex({ "device_type": 1 });

// Agent performance metrics
db.createCollection('agent_metrics');
db.agent_metrics.createIndex({ "agent_id": 1 });
db.agent_metrics.createIndex({ "date": 1 });
db.agent_metrics.createIndex({ "terminal_id": 1 });
db.agent_metrics.createIndex({ "county": 1 });

// Biometric analytics
db.createCollection('biometric_analytics');
db.biometric_analytics.createIndex({ "user_id": 1 });
db.biometric_analytics.createIndex({ "template_type": 1 });
db.biometric_analytics.createIndex({ "timestamp": 1 });
db.biometric_analytics.createIndex({ "success": 1 });
db.biometric_analytics.createIndex({ "confidence_score": 1 });

// USSD session analytics
db.createCollection('ussd_analytics');
db.ussd_analytics.createIndex({ "session_id": 1 });
db.ussd_analytics.createIndex({ "phone_number": 1 });
db.ussd_analytics.createIndex({ "timestamp": 1 });
db.ussd_analytics.createIndex({ "menu_path": 1 });
db.ussd_analytics.createIndex({ "completion_status": 1 });

// Fraud detection data
db.createCollection('fraud_analytics');
db.fraud_analytics.createIndex({ "transaction_id": 1 });
db.fraud_analytics.createIndex({ "user_id": 1 });
db.fraud_analytics.createIndex({ "risk_score": 1 });
db.fraud_analytics.createIndex({ "timestamp": 1 });
db.fraud_analytics.createIndex({ "fraud_indicators": 1 });

// Geographic analytics
db.createCollection('location_analytics');
db.location_analytics.createIndex({ "coordinates": "2dsphere" });
db.location_analytics.createIndex({ "county": 1 });
db.location_analytics.createIndex({ "timestamp": 1 });
db.location_analytics.createIndex({ "transaction_volume": 1 });

// Financial inclusion metrics
db.createCollection('inclusion_metrics');
db.inclusion_metrics.createIndex({ "date": 1 });
db.inclusion_metrics.createIndex({ "county": 1 });
db.inclusion_metrics.createIndex({ "age_group": 1 });
db.inclusion_metrics.createIndex({ "gender": 1 });
db.inclusion_metrics.createIndex({ "account_tier": 1 });

// Switch to logs database
db = db.getSiblingDB('eazepay_logs');

// Application logs collection
db.createCollection('application_logs', {
    capped: true,
    size: 1073741824, // 1GB
    max: 1000000
});
db.application_logs.createIndex({ "timestamp": 1 });
db.application_logs.createIndex({ "service": 1 });
db.application_logs.createIndex({ "level": 1 });
db.application_logs.createIndex({ "user_id": 1 });

// Audit logs collection
db.createCollection('audit_logs');
db.audit_logs.createIndex({ "timestamp": 1 });
db.audit_logs.createIndex({ "user_id": 1 });
db.audit_logs.createIndex({ "action": 1 });
db.audit_logs.createIndex({ "resource_type": 1 });
db.audit_logs.createIndex({ "ip_address": 1 });

// Security events collection
db.createCollection('security_events');
db.security_events.createIndex({ "timestamp": 1 });
db.security_events.createIndex({ "event_type": 1 });
db.security_events.createIndex({ "severity": 1 });
db.security_events.createIndex({ "user_id": 1 });
db.security_events.createIndex({ "ip_address": 1 });

// Performance metrics collection
db.createCollection('performance_metrics', {
    capped: true,
    size: 536870912, // 512MB
    max: 500000
});
db.performance_metrics.createIndex({ "timestamp": 1 });
db.performance_metrics.createIndex({ "service": 1 });
db.performance_metrics.createIndex({ "metric_type": 1 });

// Error logs collection
db.createCollection('error_logs');
db.error_logs.createIndex({ "timestamp": 1 });
db.error_logs.createIndex({ "service": 1 });
db.error_logs.createIndex({ "error_type": 1 });
db.error_logs.createIndex({ "user_id": 1 });
db.error_logs.createIndex({ "stack_trace": "text" });

// Switch back to analytics database for sample data
db = db.getSiblingDB('eazepay_analytics');

// Insert sample data for testing
var sampleDate = new Date();

// Sample transaction analytics data
db.transaction_analytics.insertMany([
    {
        transaction_id: "TXN202501010001",
        user_id: "user_001",
        transaction_type: "P2P",
        amount: 1000.00,
        status: "completed",
        timestamp: sampleDate,
        county: "Nairobi",
        agent_id: null,
        device_type: "mobile_app",
        metadata: {
            channel: "mobile",
            completion_time: 2.5
        }
    },
    {
        transaction_id: "TXN202501010002",
        user_id: "user_002",
        transaction_type: "CASH_OUT",
        amount: 500.00,
        status: "completed",
        timestamp: sampleDate,
        county: "Mombasa",
        agent_id: "agent_001",
        device_type: "agent_terminal",
        metadata: {
            channel: "agent",
            completion_time: 45.2,
            terminal_id: "TERM001"
        }
    }
]);

// Sample user behavior data
db.user_behavior.insertMany([
    {
        user_id: "user_001",
        session_id: "sess_001",
        timestamp: sampleDate,
        action_type: "login",
        device_type: "android",
        metadata: {
            app_version: "1.0.0",
            device_model: "Samsung Galaxy",
            location: "Nairobi"
        }
    },
    {
        user_id: "user_001",
        session_id: "sess_001",
        timestamp: new Date(sampleDate.getTime() + 60000),
        action_type: "send_money",
        device_type: "android",
        metadata: {
            recipient_type: "contact",
            amount_range: "1000-5000"
        }
    }
]);

// Sample agent metrics
db.agent_metrics.insertMany([
    {
        agent_id: "agent_001",
        date: sampleDate.toISOString().split('T')[0],
        terminal_id: "TERM001",
        county: "Mombasa",
        metrics: {
            transactions_count: 45,
            total_volume: 125000.00,
            commission_earned: 625.00,
            uptime_percentage: 98.5,
            avg_transaction_time: 42.3
        }
    }
]);

// Sample biometric analytics
db.biometric_analytics.insertMany([
    {
        user_id: "user_001",
        template_type: "FINGERPRINT",
        timestamp: sampleDate,
        success: true,
        confidence_score: 0.95,
        metadata: {
            device_type: "android",
            scanner_type: "capacitive",
            quality_score: 0.87
        }
    },
    {
        user_id: "user_002",
        template_type: "FACE",
        timestamp: sampleDate,
        success: true,
        confidence_score: 0.89,
        metadata: {
            device_type: "agent_terminal",
            lighting_conditions: "good",
            quality_score: 0.82
        }
    }
]);

// Sample fraud analytics
db.fraud_analytics.insertMany([
    {
        transaction_id: "TXN202501010001",
        user_id: "user_001",
        risk_score: 0.15,
        timestamp: sampleDate,
        fraud_indicators: [],
        metadata: {
            model_version: "v1.2",
            processing_time: 125
        }
    }
]);

// Sample location analytics
db.location_analytics.insertMany([
    {
        coordinates: {
            type: "Point",
            coordinates: [36.8219, -1.2921] // Nairobi coordinates
        },
        county: "Nairobi",
        timestamp: sampleDate,
        transaction_volume: 15000.00,
        transaction_count: 25,
        unique_users: 18,
        metadata: {
            area_type: "urban",
            population_density: "high"
        }
    }
]);

// Sample inclusion metrics
db.inclusion_metrics.insertMany([
    {
        date: sampleDate.toISOString().split('T')[0],
        county: "Nairobi",
        age_group: "25-34",
        gender: "female",
        account_tier: "BASIC",
        metrics: {
            new_users: 45,
            active_users: 1250,
            transaction_volume: 75000.00,
            avg_transaction_size: 850.00
        }
    }
]);

// Switch to logs database and insert sample logs
db = db.getSiblingDB('eazepay_logs');

// Sample application logs
db.application_logs.insertMany([
    {
        timestamp: sampleDate,
        service: "identity-service",
        level: "INFO",
        message: "User registration completed successfully",
        user_id: "user_001",
        metadata: {
            request_id: "req_001",
            duration: 245,
            endpoint: "/api/auth/register"
        }
    },
    {
        timestamp: sampleDate,
        service: "biometric-service",
        level: "INFO",
        message: "Fingerprint enrollment completed",
        user_id: "user_001",
        metadata: {
            template_type: "FINGERPRINT",
            quality_score: 0.87,
            processing_time: 1250
        }
    }
]);

// Sample audit logs
db.audit_logs.insertMany([
    {
        timestamp: sampleDate,
        user_id: "user_001",
        action: "USER_REGISTRATION",
        resource_type: "USER",
        resource_id: "user_001",
        ip_address: "192.168.1.100",
        user_agent: "Eazepay Mobile App v1.0.0",
        metadata: {
            changes: {
                created: ["phone_number", "first_name", "last_name"]
            }
        }
    }
]);

print("MongoDB initialization completed successfully!");
print("Created databases: eazepay_analytics, eazepay_logs");
print("Created users: eazepay_app, eazepay_readonly");
print("Created collections with indexes and sample data");