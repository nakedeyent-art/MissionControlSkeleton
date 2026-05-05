#!/usr/bin/env python3
import json
import os

OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def write_empty(name: str) -> None:
    path = os.path.join(OUT_DIR, f"{name}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump([], f, indent=2)
    print(f"Wrote empty {name} to {path}")

def main() -> None:
    write_empty("calendar")
    write_empty("reminders")

if __name__ == "__main__":
    main()
