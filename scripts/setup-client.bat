@echo off
chcp 65001 >nul
:: 洗眉机小程序 — 一键启动脚本（Windows 版）
:: 自动选择：Docker 服务端部署 / 小程序客户端准备
powershell -ExecutionPolicy Bypass -File "%~dp0setup-windows.ps1"
pause
