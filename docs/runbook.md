# GlitchDash14 Deployment & Operational Runbook

## Overview
GlitchDash14 is a client-side arcade endless runner optimized for educational Chromebook environments. It runs as a standalone Next.js 14 container.

## Prerequisites
- Google Cloud SDK (`gcloud`) authenticated and configured.
- Terraform `>= 1.6.0`.
- Docker installed locally for container builds.

## Deployment Steps
1. **Build and Push Container via Cloud Build:**