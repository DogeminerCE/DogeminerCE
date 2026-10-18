# Checkpoint 46: cloud/local save reconciliation

Open `http://localhost:8011/play/?parityTest=checkpoint-46`, then **Ctrl+\**. Four local previews cover newer local progress, newer cloud progress, deferred bag rewards and rejected invalid cloud data. They never initialize Firebase or contact an account.

Compare validated saves by timeline, lifetime earnings, then timestamp. A spent wallet cannot make a mature save lose to a newer novice save. Compare the latest live state when a read finishes and after any reward/event deferral. Use the last real save time rather than the timestamp created by a comparison's serialization.

Cloud restoration commits primary, rolling backup and the pre-cloud recovery snapshot in one existing storage transaction. Failed writes roll back local state and restore its prior autosave status. `dogeminer_ce_before_cloud_v1` retains the previous save, including rejected original bytes when cloud data rescues a corrupt local save. Invalid cloud data is retained without overwriting either side. Account changes, save replacement and resets invalidate pending responses.

Cloud upload reads and compares within a Firestore transaction; retries reconsider concurrent progress. Only progress fields are merged. Root supporter entitlement and payment fields remain account-owned; embedded `isSupporter` is removed from uploads. The account's existing supporter sync still runs independently of save selection. No infrastructure, security rules or live accounts were changed.

Verification: 71 CJS suites/65 parses; source `Gc` executed as the comparison oracle. Tests cover timestamp ties, spent balances, large finite earnings, fixed rewards, account/reset races, deferred reward re-comparison, malformed/future versions, primary/backup/recovery failures, autosave recovery, transaction retry and supporter-field separation. Native browser evaluation verifies all four private scenarios, including an actual bag-close → deferred cloud commit. Native screenshot capture timed out; no screenshot certification is claimed. Firebase CLI15.34.0/project context are present; interactive remote authentication was not completed and live writes were not tested. SDK usage follows the repository Firebase/Firestore skills and the official transaction documentation.

Evidence: `scratch/checkpoint-46-baseline/`, `scratch/checkpoint-46-qa/`. Source bundle/hash and historical checkpoint records are retained. Required CRLF is preserved. M30 complete; 92 implemented, 10 pending, 1 intentionally omitted. Continuing under the user's sustained-work authorization.
