# Ko-fi supporter webhook

The `kofiWebhook` handler grants supporter status to the Cloud Save ID in the tip message. A delivery ID is recorded in `kofiWebhookReceipts` in the same Firestore transaction as the account update, so retries cannot increment a tip twice. Malformed JSON, nonpositive/nonfinite amounts and missing delivery IDs are rejected. No account data or verification tokens are logged. The existing amount-based key eligibility policy is retained; currency is recorded with the receipt.

The verification token is a Firebase secret rather than a source-code constant. Before the next **separate Functions deployment**, configure `KOFI_VERIFICATION_TOKEN` to match Ko-fi's webhook settings:

```sh
npx -y firebase-tools@latest functions:secrets:set KOFI_VERIFICATION_TOKEN
```

Enter the value privately in the CLI. Rotate the formerly hardcoded value in Ko-fi and Secret Manager together. Do not commit it. For an emulator, use an ignored `functions/.secret.local`. Firebase's [secret configuration documentation](https://firebase.google.com/docs/functions/config-env#secret-manager) describes binding secrets to a function.

Pushing the web repository does not deploy this function. The release review runs an in-memory handler/transaction test without an account, payment or Firestore write. Run it from the repository root with `node tests/kofi-webhook.cjs`.
