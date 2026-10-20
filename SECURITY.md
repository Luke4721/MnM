# Security Policy

## Secret Handling & Committed Config Policy

- **No Server Secrets in Code**: AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`), Razorpay secret (`RAZORPAY_KEY_SECRET`), and other server secrets must **never** be committed to any file in this repository.
- **Environment Variables**:
  - **Local Development**: Stored strictly in `.env.local` (ignored by git).
  - **Production / Vercel Deployments**: Configured in Vercel Project Settings under Environment Variables.
- **Client-Safe Config**: Public/non-secret values (S3 bucket name, region, site URL, public token) live in `config/appConfig.ts`.

## Pre-Commit Secret Scanner

Run the secret scanner before pushing changes:

```bash
npm run check:secrets
```

This checks all staged files (or tracked repository files) for:
- AWS Access Key IDs (`AKIA...`)
- AWS Secret Access Key assignments
- Razorpay secret key assignments
- RSA/EC/SSH private key headers

## Key Rotation Policy

1. **Quarterly Rotation**: AWS IAM access keys should be rotated quarterly.
2. **Immediate Rotation on Exposure**: If a credential is ever committed to source control or exposed in logs, simply removing the commit or reverting the file is **insufficient**. The key must be immediately revoked and rotated in the provider dashboard (e.g., AWS IAM Console).
