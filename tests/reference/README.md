# Pinned DM2 parity references

These archived browser modules are test fixtures from the Dogeminer 2 **2.15.0** audit. They are not loaded by CE or included in the Windows runtime payload. Tests execute small extracted functions as independent oracles instead of mirroring the CE implementation.

The original `play-B7Micxas.js` is 982,083 bytes, SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`; the readable copy retains the audited function names and line references. Auxiliary drill/audio/tween fixtures and numeric samples belong to the same audit. Original sources are `https://dogeminer2.com/assets/<filename>`. Dogeminer 2 code and artwork remain credited to rkn and their respective authors; these references do not change their ownership.

Run `npm test` from the repository root. Fixtures make the checks independent of local scratch folders, user saves and the current upstream website. The tests do not execute the full upstream game or contact its services. The earlier audit notes retain historical `scratch/dm2-research` paths.
