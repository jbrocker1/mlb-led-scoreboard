#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Starting webserver
sudo "$SCRIPT_DIR"/../venv/bin/python3 -m http.server --directory "$SCRIPT_DIR"/static 80 &

# Starting websocket
"$SCRIPT_DIR"/../venv/bin/python3  "$SCRIPT_DIR"/server.py &


