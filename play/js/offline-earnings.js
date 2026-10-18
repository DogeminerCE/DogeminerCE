// DM2 2.15: loadGame/lI, permanent total DPS × elapsed seconds × 30%.
// SaveManager commits the credit and its receipt together before gameplay resumes.
(function () {
    'use strict';

    const RATE = 0.3;
    const MIN_ABSENCE_MS = 5 * 60 * 1000;
    const MAX_ABSENCE_MS = 24 * 60 * 60 * 1000;

    function calculate(savedAt, now, dps) {
        if (!Number.isFinite(savedAt) || savedAt <= 0 || !Number.isFinite(now)
            || now - savedAt <= MIN_ABSENCE_MS || !Number.isFinite(dps) || dps <= 0) return null;
        const elapsedMs = Math.min(now - savedAt, MAX_ABSENCE_MS);
        const amount = Math.round(dps * (elapsedMs / 1000) * RATE);
        if (!Number.isFinite(amount) || amount < 1) return null;
        return { amount, dps, elapsedMs, awayMs: now - savedAt, from: savedAt, to: now, rate: RATE };
    }

    function normalizeReport(value) {
        if (!value || typeof value.id !== 'string' || value.id.length > 100
            || !Number.isFinite(value.amount) || value.amount < 1
            || !Number.isFinite(value.dps) || value.dps <= 0
            || !Number.isFinite(value.from) || value.from <= 0
            || !Number.isFinite(value.to) || value.to - value.from <= MIN_ABSENCE_MS
            || !Number.isFinite(value.elapsedMs) || value.elapsedMs <= 0
            || value.elapsedMs > MAX_ABSENCE_MS) return null;
        return { id: value.id, amount: value.amount, dps: value.dps, from: value.from, to: value.to,
            elapsedMs: value.elapsedMs, awayMs: value.to - value.from, rate: RATE,
            acknowledged: value.acknowledged === true };
    }

    // Stable across parsed local/cloud/import snapshots, independent of key order.
    function fingerprint(value) {
        function canonical(item) {
            if (Array.isArray(item)) return item.map(canonical);
            if (!item || typeof item !== 'object') return item;
            const result = {};
            for (const key of Object.keys(item).sort()) result[key] = canonical(item[key]);
            return result;
        }
        const json = JSON.stringify(canonical(value));
        let first = 0x811c9dc5;
        let second = 0x9e3779b9;
        for (let i = 0; i < json.length; i++) {
            first = Math.imul(first ^ json.charCodeAt(i), 0x01000193);
            second = Math.imul(second ^ json.charCodeAt(i), 0x85ebca6b);
        }
        return `${(first >>> 0).toString(16)}-${(second >>> 0).toString(16)}-${json.length}`;
    }

    function readReceipts(value) {
        if (!Array.isArray(value)) return [];
        return value.map(normalizeReport).filter(Boolean).slice(-64);
    }

    function prepare(snapshot, dps, receipts, now = Date.now()) {
        if (!Number.isFinite(snapshot.timestamp) || snapshot.timestamp <= 0 || snapshot.timestamp > now) return null;
        const id = fingerprint(snapshot);
        const existing = receipts.find(receipt => receipt.id === id);
        // Applying a snapshot restores its original wallet first. Reapply exactly
        // its committed delta, including its acknowledgment, rather than rolling
        // a new absence from the same old cloud/import snapshot.
        if (existing) return { report: { ...existing }, receipts, replayed: true };
        const earnings = calculate(snapshot.timestamp, now, dps);
        if (!earnings) return null;
        const report = { id, ...earnings, acknowledged: false };
        return { report, receipts: [...receipts.filter(receipt => receipt.id !== id), report].slice(-64), replayed: false };
    }

    window.DogeMinerOfflineEarnings = Object.freeze({ RATE, MIN_ABSENCE_MS, MAX_ABSENCE_MS,
        calculate, normalizeReport, fingerprint, readReceipts, prepare });
})();
