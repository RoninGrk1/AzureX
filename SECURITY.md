# Security

AzureX is designed fail-closed.

## Must never happen

- Private keys in app memory, logs, prompts, or agent context
- Agent-initiated fund movement without human approval
- Risk-engine bypass
- Permission or policy self-modification by an agent

## Production checklist

- Set a 64-byte SESSION_SECRET
- Terminate TLS at the load balancer / CDN
- Enable WAF + rate limits
- Hardware MFA for principal and risk officer
- Secrets in a managed vault
- Network isolation of execution adapters
- Immutable audit export to object storage
- Kill switch tested in staging every release
