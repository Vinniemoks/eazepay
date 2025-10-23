# Starting AfriPay Services

Multiple ways to start all AfriPay portals and services.

---

## 🚀 Quick Start (Recommended)

### Option 1: Using NPM Scripts (Cross-platform)

```bash
# Install concurrently (one-time setup)
npm install

# Start all portals at once
npm run start:all
```

This will start all 4 portals in a single terminal with color-coded output:
- 🔵 Customer Portal (port 3001)
- 🟣 Agent Portal (port 3002)
- 🟡 Admin Portal (port 3000)
- 🟢 Web Portal (port 8080)

---

## 🪟 Windows Users

### Method 1: Batch Script (Opens separate windows)

```cmd
start-all-portals.bat
```

This will:
1. Open 4 separate command windows (one for each portal)
2. Start each portal in its own window
3. Automatically open all portals in your browser

**To stop all portals:**
```cmd
stop-all-portals.bat
```

### Method 2: PowerShell

```powershell
# Start all portals
.\start-all-portals.bat

# Or use npm
npm run start:all
```

---

## 🐧 Linux/Mac Users

### Method 1: Shell Script (Opens separate terminals)

```bash
# Make script executable (first time only)
chmod +x start-all-portals.sh

# Run the script
./start-all-portals.sh
```

**To stop all portals:**
```bash
chmod +x stop-all-portals.sh
./stop-all-portals.sh
```

### Method 2: NPM (Single terminal)

```bash
npm run start:all
```

---

## 🐳 Docker Method

Start everything with Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Portal URLs (Docker):**
- Customer Portal: http://localhost:3001
- Agent Portal: http://localhost:3002
- Admin Portal: http://localhost:8080
- Web Portal: http://localhost:80

---

## 📋 Manual Start (Individual Portals)

If you prefer to start portals individually:

### Customer Portal
```bash
cd services/customer-portal
npm run dev
# Opens at http://localhost:3001
```

### Agent Portal
```bash
cd services/agent-portal
npm run dev
# Opens at http://localhost:3002
```

### Admin Portal
```bash
cd services/admin-portal
npm run dev
# Opens at http://localhost:3000
```

### Web Portal
```bash
cd services/web-portal
npx serve public -p 8080
# Opens at http://localhost:8080
```

---

## 🔧 First Time Setup

Before starting the portals for the first time:

### 1. Install Dependencies

**Option A: Install all at once**
```bash
npm run install:all
```

**Option B: Install individually**
```bash
cd services/customer-portal && npm install
cd ../agent-portal && npm install
cd ../admin-portal && npm install
```

### 2. Check Configuration

```bash
npm run check
# or
bash check-all.sh
```

This verifies:
- ✅ All .env files exist
- ✅ All Dockerfiles exist
- ✅ All README files exist
- ✅ Service health (if running)

---

## 🌐 Portal URLs

Once started, access the portals at:

| Portal | URL | Purpose |
|--------|-----|---------|
| **Web Portal** | http://localhost:8080 | Main website |
| **Customer Portal** | http://localhost:3001 | Customer dashboard |
| **Agent Portal** | http://localhost:3002 | Agent operations |
| **Admin Portal** | http://localhost:3000 | Admin management |

---

## 🔑 Demo Credentials

### Admin Portal
- **Super Admin**: superadmin@afripay.com / SuperAdmin@2024
- **Admin**: admin@afripay.com / Admin@2024
- **Manager**: manager@afripay.com / Manager@2024

### Customer Portal
- **Demo Customer**: customer@afripay.com / Customer@2024

### Agent Portal
- **Demo Agent**: AG001 / Agent@2024

---

## 🛑 Stopping Services

### Stop All (Windows)
```cmd
stop-all-portals.bat
```

### Stop All (Linux/Mac)
```bash
./stop-all-portals.sh
```

### Stop Individual Portals
Press `Ctrl+C` in each terminal window

### Stop Docker Services
```bash
docker-compose down
```

---

## 🐛 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

**Windows:**
```cmd
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3001 | xargs kill -9
```

### Node Modules Issues

```bash
# Clean install
cd services/customer-portal
rm -rf node_modules package-lock.json
npm install
```

### Vite Cache Issues

```bash
cd services/customer-portal
rm -rf node_modules/.vite
npm run dev
```

### Browser Cache

- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open in Incognito/Private mode

---

## 📊 Monitoring

### View All Logs (NPM)
When using `npm run start:all`, all logs appear in one terminal with color coding.

### View Docker Logs
```bash
docker-compose logs -f
# or specific service
docker-compose logs -f customer-portal
```

### Check Service Health
```bash
npm run check
```

---

## 🎯 Recommended Workflow

### Development
```bash
# Start all portals in one terminal
npm run start:all

# Or use the batch/shell script for separate windows
./start-all-portals.sh  # Linux/Mac
start-all-portals.bat   # Windows
```

### Production
```bash
# Use Docker Compose
docker-compose up -d
docker-compose logs -f
```

---

## 💡 Tips

1. **Use npm run start:all** for development - all logs in one place
2. **Use batch/shell scripts** if you prefer separate windows
3. **Use Docker** for production-like environment
4. **Check ports** before starting to avoid conflicts
5. **Hard refresh browser** if you don't see changes
6. **Check console** (F12) for any errors

---

## 📝 Available NPM Scripts

```bash
npm run start:all        # Start all portals
npm run start:customer   # Start customer portal only
npm run start:agent      # Start agent portal only
npm run start:admin      # Start admin portal only
npm run start:web        # Start web portal only
npm run install:all      # Install all dependencies
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run docker:logs      # View Docker logs
npm run check            # Run health checks
```

---

## 🎨 What You'll See

After starting all services:

1. **4 terminal windows** (if using batch/shell scripts)
2. **4 browser tabs** automatically opened
3. **Color-coded logs** (if using npm run start:all)
4. **All portals** with royal gold/purple theme
5. **Working dashboards** with mock data

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ No error messages in terminals
- ✅ All 4 URLs are accessible
- ✅ Portals show the royal gold/purple theme
- ✅ Dashboards display mock data
- ✅ Login works with demo credentials
- ✅ Navigation between pages works

---

## 🆘 Need Help?

1. Check `DEMO_CREDENTIALS.md` for login credentials
2. Check `DASHBOARDS_OVERVIEW.md` for dashboard features
3. Check `THEME_COLORS.md` for design system
4. Run `npm run check` to verify configuration
5. Check browser console (F12) for errors
6. Check terminal logs for error messages

---

## 🚀 Next Steps

Once all portals are running:

1. **Login to Admin Portal** with demo credentials
2. **Explore Customer Portal** features
3. **Test Agent Portal** operations
4. **View Web Portal** landing page
5. **Check dashboards** for each user type
6. **Test navigation** between pages
7. **Try different user roles** in admin portal

Enjoy your AfriPay platform! 🎉
