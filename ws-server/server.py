import asyncio, json, subprocess
import websockets

WS_HOST = '0.0.0.0'
WS_PORT = 6789


prev_connect_result = {}
test = False

async def handler(ws):
    global prev_connect_result
    global test
    async for raw in ws:
        try:
            msg = json.loads(raw)
        except json.JSONDecodeError:
            await ws.send(json.dumps({"error":"bad_json"}))
            continue

        t = msg.get("type")
        if t == "list_networks":
            # scan SSIDs
            try:
                raw = subprocess.check_output(
                    ['nmcli', '-t', '-f', 'SSID', 'dev', 'wifi'],
                    stderr=subprocess.DEVNULL,
                    encoding='utf-8'
                )
                ssids = [s for s in raw.splitlines() if s.strip()]
            except Exception:
                # ssids = []
                ssids = ["Test1", "Test2", "Test3"]
                test = True
            await ws.send(json.dumps({
                "type": "networks",
                "ssids": ssids
            }))

        elif t == "connect":
            if test:
                resp = {
                    "type":   "connect_result",
                    "status": "success",
                    "output": "test"
                }
            else:
                ssid     = msg.get("ssid")
                password = msg.get("password")
                proc = subprocess.run(
                    ['nmcli', 'dev', 'wifi', 'connect', ssid, 'password', password],
                    capture_output=True, text=True
                )
                resp = {
                    "type":   "connect_result",
                    "status": "success" if proc.returncode==0 else "error",
                    "output": proc.stdout if proc.returncode==0 else proc.stderr
                }
                # Sending response
                await ws.send(json.dumps(resp))
                # Storing last resp incase someone needs it again.
                prev_connect_result = resp

                # Deleting connection incase there was an error (should probably modify instead of delete if it exists...)
                if proc.returncode != 0:
                    subprocess.run(
                            ['nmcli', 'c', 'delete', ssid],
                            capture_output=False
                    )

        elif t == "get_prev_connect_result":
            print("asking to get previous connection result so sending it.")
            await ws.send(json.dumps(prev_connect_result))

        else:
            await ws.send(json.dumps({"error":"unknown_type","received":t}))

async def main():
    async with websockets.serve(handler, WS_HOST, WS_PORT):
        print(f"WS on ws://{WS_HOST}:{WS_PORT}")
        await asyncio.Future()

if __name__ == '__main__':
    asyncio.run(main())

