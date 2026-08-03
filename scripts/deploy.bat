@echo off
setlocal

rem Project/service identifiers are deliberately NOT hardcoded here (this script is
rem tracked in a public repo) — set them once in your own shell/profile before running:
rem   set GLITCHDASH_GCP_PROJECT=your-project-id
rem   set GLITCHDASH_GCP_SERVICE=your-service-name
rem   set GLITCHDASH_GCP_REGION=us-central1   (optional, defaults below)
if "%GLITCHDASH_GCP_PROJECT%"=="" (
    echo ERROR: GLITCHDASH_GCP_PROJECT is not set. See comments in this script.
    exit /b 1
)
if "%GLITCHDASH_GCP_SERVICE%"=="" (
    echo ERROR: GLITCHDASH_GCP_SERVICE is not set. See comments in this script.
    exit /b 1
)

set PROJECT=%GLITCHDASH_GCP_PROJECT%
set SERVICE=%GLITCHDASH_GCP_SERVICE%
set REGION=%GLITCHDASH_GCP_REGION%
if "%REGION%"=="" set REGION=us-central1

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
echo Deploy succeeded. Fetch the live URL with:
echo   gcloud run services describe %SERVICE% --project %PROJECT% --region %REGION% --format "value(status.url)"
endlocal
