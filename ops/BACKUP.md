# Backups and disaster recovery

Back up Postgres (positions, orders, fills, audit_events) and WORM export of the audit chain.
Never back up private keys — they must not exist in AzureX.

Cadence: WAL shipping, nightly encrypted snapshot to a second region, monthly restore test.
Target RPO ≤ 15 minutes, RTO ≤ 4 hours for the control plane.
