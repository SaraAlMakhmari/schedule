#!/bin/bash
# Double-click in Finder to host Weekplan + Ollama on this Mac.
cd "$(dirname "$0")"
chmod +x ./mac-ollama.sh 2>/dev/null || true
exec ./mac-ollama.sh
