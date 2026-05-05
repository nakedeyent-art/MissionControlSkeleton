# Antigravity Execution Notebook

This file describes the remaining steps to complete the calendar bridge and backend runtime.

## 1) Pull Latest
```
git pull
```

## 2) Create Environment File
Copy the example and set secrets locally (do not commit):
```
cp .env.example .env
```
Set:
- `PROVIDER_PUSH_TOKEN=<your-token>`
- `API_URL` and `GATEWAY_URL` if needed
- `VITE_API_BASE` if frontend is not same origin

## 3) Bridge Config
Create `bridge/config.json` from example:
```
cp bridge/config.example.json bridge/config.json
```
Update:
- `token` to match `PROVIDER_PUSH_TOKEN`
- `api_base` (backend URL)
- `ics_sources` (Google iCal URLs)
- `graph` (Microsoft Graph tenant/client/secret for Outlook)

## 4) Microsoft Graph Permissions
Azure Portal → App registration → API permissions:
- Add **Application** permission `Calendars.Read`
- Click **Grant admin consent**

If Graph returns 403, verify consent and check Exchange App Access Policy.

## 5) Install Bridge Dependencies
Use the local venv:
```
cd bridge
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## 6) Run Collectors (Test)
```
cd bridge
.venv/bin/python collectors/fetch_ics.py --config config.json --mode all
.venv/bin/python collectors/graph_calendar.py --config config.json
```
If Graph fails, recheck permissions/consent.

## 7) Start Backend
```
cd /path/to/missioncontrol
npm install
npm run dev
```

## 8) Push Provider Data
```
cd bridge
.venv/bin/python bridge.py --once
```

## 9) Optional Service Install
See:
- `bridge/systemd/missioncontrol-bridge.service`
- `bridge/launchd/com.missioncontrol.bridge.plist`
- `bridge/windows/missioncontrol-bridge.xml`
