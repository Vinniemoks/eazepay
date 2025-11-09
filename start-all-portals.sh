#!/bin/bash

echo "========================================"
echo "  Eazepay - Starting All Portals"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Function to start a service in a new terminal
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    local command=$4
    
    echo "[$port] Starting $service_name..."
    
    # Detect OS and open appropriate terminal
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/$service_path && $command\""
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd $service_path && $command; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "cd $service_path && $command; bash" &
        else
            echo "  Warning: No suitable terminal found. Running in background..."
            (cd $service_path && $command) &
        fi
    else
        # Git Bash on Windows
        start bash -c "cd $service_path && $command"
    fi
    
    sleep 2
}

# Start all portals
start_service "Customer Portal" "services/customer-portal" "3001" "npm run dev"
start_service "Agent Portal" "services/agent-portal" "3002" "npm run dev"
start_service "Admin Portal" "services/admin-portal" "3000" "npm run dev"
start_service "Web Portal" "services/web-portal" "8080" "npx serve public -p 8080"

echo ""
echo "========================================"
echo "  All Portals Started Successfully!"
echo "========================================"
echo ""
echo "Portal URLs:"
echo "  - Customer Portal: http://localhost:3001"
echo "  - Agent Portal:    http://localhost:3002"
echo "  - Admin Portal:    http://localhost:3000"
echo "  - Web Portal:      http://localhost:8080"
echo ""
echo "Opening portals in browser..."

# Wait a bit for services to start
sleep 3

# Open in default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8080
    sleep 1
    open http://localhost:3001
    sleep 1
    open http://localhost:3002
    sleep 1
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:8080 &
    sleep 1
    xdg-open http://localhost:3001 &
    sleep 1
    xdg-open http://localhost:3002 &
    sleep 1
    xdg-open http://localhost:3000 &
else
    start http://localhost:8080
    sleep 1
    start http://localhost:3001
    sleep 1
    start http://localhost:3002
    sleep 1
    start http://localhost:3000
fi

echo ""
echo "All portals opened in browser!"
echo "Press Ctrl+C to exit (portal windows will remain open)"
echo ""

# Keep script running
tail -f /dev/null
