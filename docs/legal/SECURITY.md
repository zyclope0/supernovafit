# Security Policy

- Authentication via Firebase Auth (email/password, magic links)
- Firestore rules enforce least privilege (athlete vs coach)
- Storage rules restrict access to user-owned photos
- GitHub Actions uses a dedicated service account with limited roles

## Reporting a Vulnerability
Please open a private issue or contact the maintainers. Include steps to reproduce and potential impact.

## Secrets & Access
- Never commit secrets. All public keys live in `.env.local` and GitHub Secrets.
- Rotate the service account key periodically and on suspicion of compromise.


