@echo off
REM Tunnel Vite (port 5173) to the public internet via ngrok.
REM Vite proxies /api -> localhost:3001 server-side, so one tunnel covers both.
ngrok http 5173 --host-header=rewrite
