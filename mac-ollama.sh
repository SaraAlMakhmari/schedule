#!/bin/bash
# Host Weekplan + Ollama on this Mac so a phone on the same Wi-Fi can use them.
set -e
cd "$(dirname "$0")"

IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [ -z "$IP" ]; then
  IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
fi

export OLLAMA_HOST="${OLLAMA_HOST:-0.0.0.0:11434}"
export OLLAMA_ORIGINS="${OLLAMA_ORIGINS:-*}"

echo
echo "Quit Ollama in the menu bar first (this Mac), then this script can bind the Wi-Fi."
echo "If the llama is already running and chat works on the Mac only, quit it and re-run."
echo

if curl -sf "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
  echo "Ollama is already on 11434. If the phone cannot connect, it is listening on localhost only."
  echo "Quit the menu bar app, then start:"
  echo "  OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS='*' ollama serve"
  echo
else
  if command -v ollama >/dev/null 2>&1; then
    echo "Starting ollama serve on 0.0.0.0:11434 …"
    ollama serve >/tmp/weekplan-ollama.log 2>&1 &
    sleep 1
  else
    echo "ollama command not found. Open the Ollama app, then in its settings set:"
    echo "  OLLAMA_HOST=0.0.0.0:11434"
    echo "  OLLAMA_ORIGINS=*"
    echo
  fi
fi

PORT=5500
if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  PORT=5501
fi

echo "Mac browser:   http://127.0.0.1:${PORT}"
if [ -n "$IP" ]; then
  echo "Phone (Safari, same Wi-Fi, Mac awake):"
  echo "  http://${IP}:${PORT}"
  echo "Settings → Brain = Ollama. Remote URL can stay blank on that page."
else
  echo "Could not read a Wi-Fi IP. System Settings → Wi-Fi → Details, then"
  echo "  http://THAT_IP:${PORT}  on the phone."
fi
echo "Need a planner-sized model (once):"
echo "  ollama pull llama3.1:8b"
echo "Then Settings → Ollama model = llama3.1:8b"
echo
echo "Ctrl+C stops the website (Ollama may keep running)."
echo

# Stop the Mac sleeping while the phone is using the agent
exec caffeinate -i python3 -m http.server "$PORT" --bind 0.0.0.0
