#!/usr/bin/env python3
import argparse
import json
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

import requests


def load_config(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_token(tenant_id: str, client_id: str, client_secret: str) -> str:
    url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "client_credentials",
        "scope": "https://graph.microsoft.com/.default",
    }
    resp = requests.post(url, data=data, timeout=20)
    resp.raise_for_status()
    return resp.json()["access_token"]


def iso_now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def iso_in_days(days: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def fetch_events(token: str, user_principal: str, days_ahead: int) -> List[Dict[str, Any]]:
    url = f"https://graph.microsoft.com/v1.0/users/{user_principal}/calendarView"
    params = {
        "startDateTime": iso_now_utc(),
        "endDateTime": iso_in_days(days_ahead),
        "$top": "200",
    }
    headers = {"Authorization": f"Bearer {token}"}
    items: List[Dict[str, Any]] = []
    while url:
        resp = requests.get(url, headers=headers, params=params, timeout=20)
        if resp.status_code >= 400:
            raise RuntimeError(f"Graph error {resp.status_code}: {resp.text}")
        data = resp.json()
        for ev in data.get("value", []):
            items.append({
                "title": ev.get("subject") or "Untitled Event",
                "start": ev.get("start", {}).get("dateTime"),
                "end": ev.get("end", {}).get("dateTime"),
                "organizer": (ev.get("organizer") or {}).get("emailAddress", {}).get("address"),
            })
        url = data.get("@odata.nextLink")
        params = None
    return items


def write_calendar(bridge_root: str, events: List[Dict[str, Any]]) -> None:
    out_path = os.path.join(bridge_root, "calendar.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2)
    print(f"Wrote {len(events)} events to {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch Outlook calendar via Microsoft Graph")
    parser.add_argument("--config", default=os.path.join(os.path.dirname(__file__), "..", "config.json"))
    args = parser.parse_args()

    config_path = os.path.abspath(args.config)
    cfg = load_config(config_path)
    graph = cfg.get("graph", {})
    tenant_id = graph.get("tenant_id")
    client_id = graph.get("client_id")
    client_secret = graph.get("client_secret")
    user_principal = graph.get("user_principal")
    days_ahead = int(graph.get("days_ahead", 30))

    if not all([tenant_id, client_id, client_secret, user_principal]):
        print("Graph config missing tenant_id, client_id, client_secret, or user_principal")
        return

    token = get_token(tenant_id, client_id, client_secret)
    events = fetch_events(token, user_principal, days_ahead)
    bridge_root = os.path.abspath(os.path.join(os.path.dirname(config_path)))
    write_calendar(bridge_root, events)


if __name__ == "__main__":
    main()
