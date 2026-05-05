#!/usr/bin/env python3
import argparse
import json
import os
from typing import Any, Dict, List


def load_config(path: str) -> Dict[str, Any]:
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_config(path: str, data: Dict[str, Any]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(description="Add an ICS source to bridge config.json")
    parser.add_argument("--config", default=os.path.join(os.path.dirname(__file__), "..", "config.json"))
    parser.add_argument("--url", required=True)
    parser.add_argument("--target", choices=["calendar", "reminders"], default="calendar")
    parser.add_argument("--username")
    parser.add_argument("--password")
    args = parser.parse_args()

    config_path = os.path.abspath(args.config)
    data = load_config(config_path)
    sources: List[Dict[str, Any]] = data.get("ics_sources", [])
    entry = {"url": args.url, "target": args.target}
    if args.username:
        entry["username"] = args.username
    if args.password:
        entry["password"] = args.password
    sources.append(entry)
    data["ics_sources"] = sources
    save_config(config_path, data)
    print(f"Added ICS source to {config_path}")


if __name__ == "__main__":
    main()
