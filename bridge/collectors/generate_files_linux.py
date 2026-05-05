#!/usr/bin/env python3
import json
import os

HOME = os.path.expanduser("~")
ROOTS = [
    os.path.join(HOME, "Documents"),
    os.path.join(HOME, "Downloads"),
    os.path.join(HOME, "Desktop"),
]

def main() -> None:
    paths = []
    for root in ROOTS:
        if not os.path.isdir(root):
            continue
        for dirpath, _, filenames in os.walk(root):
            for name in filenames:
                paths.append(os.path.join(dirpath, name))
    out_path = os.path.join(os.path.dirname(__file__), "..", "files.json")
    out_path = os.path.abspath(out_path)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(paths, f, indent=2)
    print(f"Wrote {len(paths)} files to {out_path}")

if __name__ == "__main__":
    main()
