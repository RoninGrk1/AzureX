# AzureX operations runbook

## Kill switch
1. Controls → Global kill switch (principal or risk officer).
2. Confirm `/api/emergency` shows `globalKillSwitch: true`.
3. Confirm new orders return blocked and withdrawals pause.
4. Page on-call. Record the incident in the audit log.
5. Clear only after written principal + risk sign-off.

## Deploy
npm ci && npm test && npm run build
psql "$DATABASE_URL" -f src/prod/db/schema.sql

Do not give engineers wallet signing authority to debug an incident.
