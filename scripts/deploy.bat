@echo off
setlocal

set PROJECT=glitchdash14-f65bec7c
set SERVICE=glitchdash14-staging
set REGION=us-central1

rem Run from anywhere; always build from the repo root (parent of this scripts/ folder).
set REPO_ROOT=%~dp0..

echo ============================================================
echo Deploying %SERVICE% to Cloud Run
echo Project: %PROJECT%   Region: %REGION%
echo Source:  %REPO_ROOT%
echo ============================================================

pushd "%REPO_ROOT%"

gcloud run deploy %SERVICE% --project %PROJECT% --region %REGION% --source .
set DEPLOY_RESULT=%ERRORLEVEL%

popd

if %DEPLOY_RESULT% neq 0 (
    echo.
    echo Deploy FAILED with exit code %DEPLOY_RESULT%.
    exit /b %DEPLOY_RESULT%
)

echo.
echo Deploy succeeded.
echo Live URL: https://glitchdash14-staging-ptehkqlioa-uc.a.run.app/
endlocal
