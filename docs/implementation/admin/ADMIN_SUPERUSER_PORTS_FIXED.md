# Admin & Superuser Ports - FIXED ✅

## Issues Fixed

### 1. Missing Superuser API Routes ✅
**Problem**: The SuperuserController existed but had no routes exposed.

**Solution**: 
- Created `services/identity-service/src/routes/superuser.routes.ts`
- Added superuser routes to main application in `services/identity-service/src/index.ts`
- Updated SuperuserController to use modern TypeORM DataSource pattern
- Added audit logging for superuser actions

**New Endpoints**:
- `POST /api/superuser/create` - Create new superuser (max 2)
- `GET /api/superuser/list` - List all superusers
- `DELETE /api/superuser/:userId/revoke` - Revoke superuser access

### 2. Wrong Admin Portal Configuration ✅
**Problem**: Docker-compose was pointing to `services/web-portal` (static site) instead of `services/admin-portal` (React app).

**Solution**:
- Updated docker-compose.yml to use correct `services/admin-portal` directory
- Added separate superuser portal on port 8090
- Fixed volume names and health checks
- Added proper environment variables

## Port Configuration

### Admin Portal
- **Port**: 8080
- **URL**: http://localhost:8080
- **Container**: eazepay-admin-portal
- **Features**: User management, permissions, access requests, analytics

### Superuser Portal
- **Port**: 8090
- **URL**: http://localhost:8090
- **Container**: eazepay-superuser-portal
- **Features**: Full system access, superuser management, system configuration

### API Endpoints

#### Superuser Management (requires SUPERUSER role)
```bash
# Create superuser
POST http://localhost:8000/api/superuser/create
Authorization: Bearer <token>
{
  "email": "superuser@eazepay.com",
  "phone": "+254712345678",
  "password": "SecurePassword123!",
  "fullName": "Super User",
  "twoFactorMethod": "BOTH"
}

# List superusers
GET http://localhost:8000/api/superuser/list
Authorization: Bearer <token>

# Revoke superuser
DELETE http://localhost:8000/api/superuser/:userId/revoke
Authorization: Bearer <token>
```

#### Admin Management (requires SUPERUSER role)
```bash
# Create admin
POST http://localhost:8000/api/admin/users
Authorization: Bearer <token>
{
  "email": "admin@eazepay.com",
  "phone": "+254712345679",
  "password": "SecurePassword123!",
  "fullName": "Admin User",
  "role": "MANAGER",
  "department": "OPERATIONS",
  "permissions": ["OPS-USERS-VIEW", "OPS-REQUESTS-APPROVE"]
}
```

## How to Deploy

### 1. Rebuild Identity Service
```bash
docker-compose build identity-service
```

### 2. Rebuild Admin Portals
```bash
docker-compose build admin-portal superuser-portal
```

### 3. Restart Services
```bash
docker-compose up -d identity-service admin-portal superuser-portal
```

### 4. Verify Services
```bash
# Check if containers are running
docker-compose ps identity-service admin-portal superuser-portal

# Check logs
docker-compose logs -f identity-service
docker-compose logs -f admin-portal
docker-compose logs -f superuser-portal
```

## Testing

### Test Admin Portal
```bash
# Open in browser
http://localhost:8080

# Should see admin login page
```

### Test Superuser Portal
```bash
# Open in browser
http://localhost:8090

# Should see superuser login page
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Test superuser endpoint (requires authentication)
curl -X GET http://localhost:8000/api/superuser/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Files Modified

1. `services/identity-service/src/index.ts` - Added superuser routes
2. `services/identity-service/src/routes/superuser.routes.ts` - NEW FILE
3. `services/identity-service/src/controllers/SuperuserController.ts` - Updated to use DataSource
4. `services/admin-portal/nginx.conf` - Added health endpoint
5. `docker-compose.yml` - Fixed admin portal configuration, added superuser portal

## Next Steps

1. **Start the services**: Run the deployment commands above
2. **Create first superuser**: Use the API or database script
3. **Test the portals**: Access both admin and superuser portals
4. **Configure permissions**: Set up admin roles and permissions

## Notes

- Superusers have full system access (permission: `*`)
- Maximum 2 superusers allowed in the system
- All superuser actions are logged in audit_logs table
- 2FA is required for all superusers (SMS, BIOMETRIC, or BOTH)
- Admin portal and superuser portal use the same React app but with different configurations
