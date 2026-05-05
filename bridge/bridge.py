#!/usr/bin/env python3
import json
import os
import sys
import time
import subprocess
from typing import Any, Dict, List

try:
    import requests
except Exception:
    print("Missing dependency: requests. Install with `pip install requests`.")
    sys.exit(1)


def load_config() -> Dict[str, Any]:
    config_path = os.environ.get("BRIDGE_CONFIG", os.path.join(os.path.dirname(__file__), "config.json"))
    if not os.path.exists(config_path):
        print(f"Config not found: {config_path}")
        sys.exit(1)
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def read_provider_file(path: str) -> List[Any]:
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        if isinstance(data, list):
            return data
        if isinstance(data, dict) and isinstance(data.get("data"), list):
            return data["data"]
        return []


def push_provider(api_base: str, token: str, name: str, payload: List[Any]) -> bool:
    url = f"{api_base.rstrip('/')}/api/providers/{name}"
    headers = {
        "Content-Type": "application/json",
        "x-provider-token": token,
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=15)
    if resp.status_code >= 200 and resp.status_code < 300:
        print(f"[OK] {name}: pushed {len(payload)} items")
        return True
    print(f"[ERR] {name}: {resp.status_code} {resp.text}")
    return False


def run_once(config: Dict[str, Any]) -> None:
    api_base = config.get("api_base")
    token = config.get("token")
    providers = config.get("providers", [])
    collector_commands = config.get("collector_commands", [])
    working_dir = config.get("working_dir")
    if not api_base or not token:
        print("Config missing api_base or token.")
        sys.exit(1)
    for cmd in collector_commands:
        try:
            print(f"[RUN] {cmd}")
            subprocess.run(cmd, shell=True, check=False, cwd=working_dir)
        except Exception as exc:
            print(f"[WARN] Collector failed: {exc}")
    for p in providers:
        name = p.get("name")
        path = p.get("path")
        if not name or not path:
            print("[SKIP] provider missing name or path")
            continue
        payload = read_provider_file(path)
        push_provider(api_base, token, name, payload)


def main() -> None:
    config = load_config()
    interval = int(config.get("interval_seconds", 60))
    once = "--once" in sys.argv
    if once:
        run_once(config)
        return
    while True:
        run_once(config)
        time.sleep(interval)


if __name__ == "__main__":
    main()
