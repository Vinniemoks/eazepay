#!/bin/bash

echo "========================================"
echo "  Eazepay - Stopping All Portals"
echo "========================================"
echo ""

echo "Stopping Node.js processes on ports 3000, 3001, 3002, 8080..."

# Kill processes on specific ports
for port in 3000 3001 3002 8080; do
    pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "  Stopping process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
    fi
done

echo ""
echo "All portals stopped!"
echo ""
