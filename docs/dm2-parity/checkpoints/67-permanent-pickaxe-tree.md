# Checkpoint 67 — Permanent Pickaxe Tree

The user selected a permanent Dogediamond skill tree. Learned skills apply globally to every equipped pickaxe and survive D.I.A. time travel. They are independent of individual item rolls. Open **Pickaxe Tree** in Upgrades; learning unlocks after the first D.I.A. mission, while timeline-one players can inspect all skills.

Each branch has sequential tiers costing **5 / 15 / 40 Dogediamonds**. Branches are nonexclusive: 60 per completed branch, 180 for all nine skills. Purchases are permanent, with no refund/respec action.

| Branch | Tier 1 · 5 diamonds | Tier 2 · 15 diamonds | Tier 3 · 40 diamonds | Full branch |
| --- | --- | --- | --- | --- |
| Precision | Keen Eye: +2 percentage points Crit | True Strike: +3 points Crit | Such Critical: +5 points Crit | +10 percentage points Critical Chance |
| Power | Steady Paws: +3% Click Power | Much Force: +5% Click Power | Master Miner: +7% Click Power | +15% Click Power |
| Prospector | Nose for Loot: +5 Loot Find | Deep Pockets: +5 Loot Find | Diamond Doge: +10 Loot Find, +0.5 percentage points Diamond Drop Chance | +20 Loot Find, rock diamond chance 3% → 3.5% |

Power percentages add within the tree, then multiply the existing click-power multiplier. Critical chance and Loot Find add to existing totals. Loot Find enters the existing loot consumers. The first-ever diamond guarantee remains; Bare Paw still deals one damage and cannot crit. Item, fortune and permanent helper DPS rules are unchanged.

`play/js/pickaxe-tree.js` owns fixed version-one IDs/prices/effects and canonical `{version:1, learned:[...]}` state. Missing state in older CE/Alpha/DM2 saves starts empty without charging currency. Unsupported versions, unknown/duplicate skills and missing prerequisites are rejected before save application, CE import or cloud selection. Future changes to the version-one price/effect contract require an explicit migration.

The existing two-key save transaction commits the wallet and learned skill together. Either failed write restores the wallet, skill and saved bytes. Purchases reject blocked saves, active loads, busy presentations, duplicate skills and stale render/epoch tokens. D.I.A. reset retains progression; the existing two-confirmation full reset clears it. Cloud replacement waits while the tree is being reviewed. No authenticated cloud service was used during verification.

`tests/pickaxe-tree.cjs` checks schema, all nine purchases, exact totals/formulas, currency and primary/backup rollback, stale/busy guards, untouched rolls, repeated recalculation, drop boundaries, the Paw invariant, invalid load/cloud selection and the real time-travel reset. Eleven real-browser recovery cases cover both write failures with retry, CE export/load, older saves, three corrupt states, stale buttons after load, the local cloud receiver, actual mission persistence and full reset. See `scratch/checkpoint-67-qa/recovery-results.json` and its reusable script.
