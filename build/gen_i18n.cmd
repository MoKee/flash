@echo off
setlocal
set index=src\i18n\index.js
del /f %index%
for %%i in (src\i18n\*.json) do echo exports['%%~ni'] = require('./%%~ni.json'); >> %index%

