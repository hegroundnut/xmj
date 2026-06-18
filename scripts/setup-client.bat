@echo off
chcp 65001 >nul
:: ============================================================================
:: 洗眉机小程序 — Windows 客户端准备脚本
:: 用法：双击运行，或命令行: setup-client.bat
:: 功能：修改 API 地址、安装依赖、检查 HBuilderX
:: ============================================================================
setlocal enabledelayedexpansion

echo ============================================
echo   洗眉机小程序 — Windows 客户端准备
echo ============================================
echo.

:: ======================== 路径常量 ========================
set ROOT=%~dp0..
pushd "%ROOT%"
set ROOT=%CD%
popd

set CONFIG_FILE=%ROOT%\template\uni-app\config\app.js
set MANIFEST_FILE=%ROOT%\template\uni-app\manifest.json

:: ======================== 1. 配置服务器 IP ========================
echo [1/4] 配置服务器地址
echo.
set /p SERVER_IP="请输入服务器 IP（如 121.41.54.226）: "
if "%SERVER_IP%"=="" (
    set SERVER_IP=121.41.54.226
    echo 未输入，使用默认: %SERVER_IP%
)

set OLD_URL=http://121.41.54.226:8011
set NEW_URL=http://%SERVER_IP%:8011

echo 旧地址: %OLD_URL%
echo 新地址: %NEW_URL%
echo.

:: 替换 config/app.js 中的 API 地址 (用 PowerShell 做文本替换)
powershell -Command "(Get-Content '%CONFIG_FILE%' -Raw) -replace '%OLD_URL%', '%NEW_URL%' | Set-Content '%CONFIG_FILE%' -Encoding UTF8"
echo [✓] API 地址已更新

:: ======================== 2. 配置 AppID ========================
echo.
echo [2/4] 配置微信小程序 AppID
set /p APPID="请输入你的微信小程序 AppID（回车跳过）: "
if not "%APPID%"=="" (
    powershell -Command "$m = Get-Content '%MANIFEST_FILE%' -Raw -Encoding UTF8 | ConvertFrom-Json; $m.'mp-weixin'.appid = '%APPID%'; $m | ConvertTo-Json -Depth 10 | Set-Content '%MANIFEST_FILE%' -Encoding UTF8"
    echo [✓] AppID 已更新为: %APPID%
) else (
    echo [!] 跳过 AppID 配置（仍使用占位 AppID，仅可用于测试号）
)

:: ======================== 3. 安装依赖 ========================
echo.
echo [3/4] 安装 UniApp 依赖
cd /d "%ROOT%\template\uni-app"

if exist "node_modules" (
    echo [✓] node_modules 已存在，跳过
) else (
    echo 正在 npm install...
    call npm install
    if errorlevel 1 (
        echo [!] npm install 失败，请检查 Node.js 安装
    ) else (
        echo [✓] npm install 完成
    )
)

:: ======================== 4. 检查 HBuilderX ========================
echo.
echo [4/4] 检查 HBuilderX

set HBUILDERX_FOUND=0
for %%p in (
    "%LOCALAPPDATA%\Programs\HBuilderX\HBuilderX.exe"
    "C:\Program Files\HBuilderX\HBuilderX.exe"
    "D:\HBuilderX\HBuilderX.exe"
    "%USERPROFILE%\AppData\Local\Programs\HBuilderX\HBuilderX.exe"
) do (
    if exist %%p (
        set HBUILDERX=%%p
        set HBUILDERX_FOUND=1
    )
)

if %HBUILDERX_FOUND%==1 (
    echo [✓] 已找到 HBuilderX: !HBUILDERX!
    echo.
    choice /C YN /M "是否立即打开 HBuilderX 导入项目"
    if !errorlevel!==1 (
        start "" "!HBUILDERX!"
    )
) else (
    echo [!] 未找到 HBuilderX，请手动安装
    echo     下载地址: https://www.dcloud.io/hbuilderx.html
    echo     注意: 必须用 HBuilderX，不是 HBuilder 2018
)

:: ======================== 完成 ========================
echo.
echo ============================================
echo   Windows 客户端准备完成！
echo ============================================
echo.
echo   API 地址: %NEW_URL%
echo   项目目录: %ROOT%\template\uni-app
echo.
echo   【下一步】
echo   1. 打开 HBuilderX
echo   2. 文件 → 导入 → 从本地目录导入
echo   3. 选择: %ROOT%\template\uni-app
echo   4. 运行 → 运行到小程序模拟器 → 微信小程序
echo.
echo   如遇到 AppID 未授权，可在 manifest.json
echo   中改为你自己的 AppID，或用测试号预览。
echo ============================================

pause
endlocal
