#!/bin/bash
# Double-click to open the certificate app on Mac.
set -e
cd "$(dirname "$0")/app"
PORT=8765
if lsof -i ":$PORT" >/dev/null 2>&1; then
  open "http://localhost:$PORT/"
  exit 0
fi
echo "Starting certificate app at http://localhost:$PORT/"
echo "Keep this window open while using the app. Press Ctrl+C to stop."
python3 -m http.server "$PORT" &
SERVER_PID=$!
sleep 1
open "http://localhost:$PORT/"
wait "$SERVER_PID"
