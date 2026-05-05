#!/usr/bin/env python3
import argparse
import json
import os
from typing import Any, Dict, List

import requests
from icalendar import Calendar


def load_config(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def ensure_bridge_root(config_path: str) -> str:
    return os.path.abspath(os.path.join(os.path.dirname(config_path)))


def fetch_ics(url: str, username: str | None, password: str | None) -> str:
    auth = (username, password) if username else None
    resp = requests.get(url, auth=auth, timeout=20)
    resp.raise_for_status()
    return resp.text


def to_iso(dt_value: Any) -> str | None:
    try:
        dt = dt_value.dt if hasattr(dt_value, "dt") else dt_value
        if hasattr(dt, "isoformat"):
            return dt.isoformat()
    except Exception:
        return None
    return None


def parse_calendar(ics_text: str) -> List[Dict[str, Any]]:
    cal = Calendar.from_ical(ics_text)
    items: List[Dict[str, Any]] = []
    for component in cal.walk():
        if component.name != "VEVENT":
            continue
        title = str(component.get("summary", "Untitled Event"))
        start = to_iso(component.get("dtstart"))
        items.append({"title": title, "start": start})
    return items


def parse_reminders(ics_text: str) -> List[Dict[str, Any]]:
    cal = Calendar.from_ical(ics_text)
    items: List[Dict[str, Any]] = []
    for component in cal.walk():
        if component.name != "VTODO":
            continue
        name = str(component.get("summary", "Untitled Task"))
        due = to_iso(component.get("due") or component.get("dtstart"))
        items.append({"name": name, "dueDate": due})
    return items


def write_output(bridge_root: str, name: str, data: List[Dict[str, Any]]) -> None:
    out_path = os.path.join(bridge_root, f"{name}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Wrote {len(data)} {name} items to {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=os.path.join(os.path.dirname(__file__), "..", "config.json"))
    parser.add_argument("--mode", choices=["calendar", "reminders", "all"], default="all")
    args = parser.parse_args()

    config_path = os.path.abspath(args.config)
    config = load_config(config_path)
    bridge_root = ensure_bridge_root(config_path)
    sources = config.get("ics_sources", [])

    calendars: List[Dict[str, Any]] = []
    reminders: List[Dict[str, Any]] = []

    for src in sources:
        url = src.get("url")
        if not url:
            continue
        username = src.get("username")
        password = src.get("password")
        target = src.get("target", "calendar")
        try:
            ics_text = fetch_ics(url, username, password)
            if target == "calendar" and args.mode in ("calendar", "all"):
                calendars.extend(parse_calendar(ics_text))
            if target == "reminders" and args.mode in ("reminders", "all"):
                reminders.extend(parse_reminders(ics_text))
        except Exception as exc:
            print(f"[WARN] Failed to fetch {url}: {exc}")

    if args.mode in ("calendar", "all"):
        write_output(bridge_root, "calendar", calendars)
    if args.mode in ("reminders", "all"):
        write_output(bridge_root, "reminders", reminders)


if __name__ == "__main__":
    main()
