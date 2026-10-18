// Per-timeline records mirror DM2's timelinecoins/timelinealltimecoins/
// timelineplayeds/kitlerstats without replacing CE's lifetime statistics.
(function () {
    'use strict';
    const finite = value => Number.isFinite(value) ? Math.max(0, value) : 0;
    const timelineOf = value => Math.max(1, Math.floor(finite(value)));
    const choiceOf = value => value === 'attack' || value === 0 ? 'attack'
        : value === 'go_home' || value === 1 ? 'go_home' : null;
    const badgeOf = value => ['luck', 'wow', 'loot'].includes(value) ? value : null;

    function normalize(raw, save = {}) {
        const timeline = timelineOf(save.timelineNumber);
        if (raw != null && raw.version !== 1) throw new Error('This timeline-history version is not supported.');
        if (raw?.completed != null && !Array.isArray(raw.completed)) throw new Error('Timeline history is invalid.');
        const completed = [], seen = new Set();
        for (const record of raw?.completed || []) {
            const number = timelineOf(record?.timeline);
            if (!record || !Number.isInteger(record.timeline) || record.timeline < 1 || number >= timeline || seen.has(number)) continue;
            seen.add(number);
            completed.push({ timeline: number, coins: finite(record.coins), earnedCoins: finite(record.earnedCoins),
                playTimeMs: finite(record.playTimeMs), choice: choiceOf(record.choice), badge: badgeOf(record.badge),
                diamonds: finite(record.diamonds), completedAt: finite(record.completedAt), estimated: record.estimated === true });
        }
        completed.sort((a, b) => a.timeline - b.timeline);
        const validCurrent = raw?.current?.timeline === timeline;
        // Alpha kept lifetime counters. Only its first timeline can be recovered
        // exactly; later runs start with a known lower bound, never invented history.
        const statistics = save.statistics || {};
        const savedSpan = Number.isFinite(save.timestamp) && Number.isFinite(statistics.startTime)
            ? finite(save.timestamp - statistics.startTime) : 0;
        const current = validCurrent ? {
            timeline, earnedCoins: finite(raw.current.earnedCoins), playTimeMs: finite(raw.current.playTimeMs),
            minedAtSync: finite(raw.current.minedAtSync), estimated: raw.current.estimated === true
        } : { timeline, earnedCoins: timeline === 1 ? finite(save.totalMined) : finite(save.dogecoins),
            playTimeMs: timeline === 1 ? finite(statistics.totalPlayTime) * 1000 + savedSpan : 0,
            minedAtSync: finite(save.totalMined), estimated: timeline > 1 };
        return { version: 1, trackingStartedTimeline: Math.min(timeline,
            timelineOf(raw?.trackingStartedTimeline || completed[0]?.timeline || timeline)), current, completed };
    }

    function snapshot(state, game) {
        const total = finite(game.totalMined);
        return { version: 1, trackingStartedTimeline: state.trackingStartedTimeline,
            current: { ...state.current, earnedCoins: state.current.earnedCoins + Math.max(0, total - state.current.minedAtSync), minedAtSync: total },
            completed: state.completed.map(record => ({ ...record })) };
    }

    const proto = DogeMinerGame.prototype;
    proto.restoreTimelineProgress = function (save = {}) {
        this.timelineProgress = normalize(save.timelineProgress, save);
    };
    proto.getTimelineProgressForSave = function () {
        const state = this.timelineProgress || normalize(null, {
            timelineNumber: this.timelineNumber, dogecoins: this.dogecoins, totalMined: this.totalMined });
        return snapshot(state, this);
    };
    proto.getCurrentTimelineStats = function () {
        const state = this.timelineProgress || normalize(null, {
            timelineNumber: this.timelineNumber, dogecoins: this.dogecoins, totalMined: this.totalMined });
        return { ...state.current, earnedCoins: state.current.earnedCoins
            + Math.max(0, finite(this.totalMined) - state.current.minedAtSync), minedAtSync: finite(this.totalMined) };
    };
    proto.advanceTimelineProgress = function (deltaMs) {
        if (!this._bootComplete || !this.isPlaying || document.hidden || this.isIntroPlaying || this.isCutscenePlaying
            || this.isTransitioning || this.isBetaReportOpen || this.isOfflineReportOpen) return;
        this.timelineProgress ||= normalize(null, { timelineNumber: this.timelineNumber,
            dogecoins: this.dogecoins, totalMined: this.totalMined });
        this.timelineProgress.current.playTimeMs += Math.min(1000, finite(deltaMs));
    };
    proto.completeTimelineRecord = function ({ choice = null, badge = null, diamonds = 0 } = {}) {
        const state = this.getTimelineProgressForSave(), number = timelineOf(this.timelineNumber);
        if (state.current.timeline !== number || state.completed.some(record => record.timeline === number)) return false;
        state.completed.push({ timeline: number, coins: finite(this.dogecoins), earnedCoins: state.current.earnedCoins,
            playTimeMs: state.current.playTimeMs, choice: choiceOf(choice), badge: badgeOf(badge),
            diamonds: finite(diamonds), completedAt: Date.now(), estimated: state.current.estimated });
        state.current = { timeline: number + 1, earnedCoins: 0, playTimeMs: 0, minedAtSync: finite(this.totalMined), estimated: false };
        this.timelineProgress = state;
        return true;
    };

    function node(tag, text, className) {
        const el = document.createElement(tag);
        if (text != null) el.textContent = text;
        if (className) el.className = className;
        return el;
    }
    proto.fitStatisticsViewport = function () {
        for (const id of ['achievements-tab','mobile-achievements-content']) {
            const panel = document.getElementById(id);
            if (!panel?.getClientRects?.().length || !panel.offsetWidth) continue;
            const bounds = panel.getBoundingClientRect();
            const scale = bounds.width / panel.offsetWidth || 1;
            const available = Math.max(0, (window.innerHeight - bounds.top - 4) / scale);
            const height = Math.min(panel.parentElement.clientHeight, available);
            const value = `${Math.floor(height)}px`;
            if (panel.style.maxHeight !== value) panel.style.maxHeight = value;
        }
    };
    window.addEventListener?.('resize', () => window.game?.fitStatisticsViewport?.());
    proto.updateTimelineHistoryUI = function () {
        this.fitStatisticsViewport();
        const discovered = (this.timelineNumber || 1) > 1;
        for (const id of ['timeline-summary','timeline-history','mobile-timeline-summary','mobile-timeline-history']) {
            const panel = document.getElementById(id);
            if (!panel) continue;
            panel.hidden = !discovered;
            if (!discovered) {
                panel.replaceChildren();
                panel._timelineKey = null;
                panel._timelineState = null;
            }
        }
        for (const title of document.querySelectorAll?.('.statistics-lifetime-title') || []) title.hidden = !discovered;
        if (!discovered) return;
        const panels = ['timeline-history', 'mobile-timeline-history'].map(id => document.getElementById(id))
            .filter(panel => panel?.getClientRects?.().length);
        if (!panels.length) return;
        const state = this.timelineProgress || this.getTimelineProgressForSave(), run = this.getCurrentTimelineStats();
        const estimate = run.estimated ? 'At least ' : '';
        for (const panel of panels) {
            const summary = document.getElementById(panel.id === 'timeline-history' ? 'timeline-summary' : 'mobile-timeline-summary');
            panel._timelineLimit ||= 20;
            const key = `${run.timeline}:${Math.floor(run.earnedCoins)}:${Math.floor(run.playTimeMs / 1000)}:${panel._timelineLimit}`;
            if (panel._timelineKey === key && panel._timelineState === state) continue;
            panel._timelineKey = key;
            panel._timelineState = state;
            const open = new Set(Array.from(panel.querySelectorAll('details[open]'), item => item.dataset.timeline));
            const content = document.createDocumentFragment();
            const overview = summary ? document.createDocumentFragment() : content;
            overview.appendChild(node('h3', `Timeline #${run.timeline}`, 'timeline-history-title'));
            const current = node('dl', null, 'timeline-record-values timeline-current-values');
            for (const [label, value] of [['Earned this timeline', estimate + this.formatNumber(run.earnedCoins)],
                ['Mining time', this.formatTime(Math.floor(run.playTimeMs / 1000))]]) {
                current.append(node('dt', label), node('dd', value));
            }
            overview.appendChild(current);
            if (state.trackingStartedTimeline > 1 || run.estimated) overview.appendChild(node('p',
                `History starts at timeline #${state.trackingStartedTimeline}; earlier runs were not recorded.`
                    + (run.estimated ? ' Current earnings show the known minimum.' : ''), 'timeline-history-note'));
            if (summary) summary.replaceChildren(overview);
            content.appendChild(node('h4', 'Completed timelines'));
            if (!state.completed.length) content.appendChild(node('p', 'Your first completed mission will appear here.', 'timeline-history-note'));
            for (const record of state.completed.slice(-panel._timelineLimit).reverse()) {
                const details = node('details', null, 'timeline-record');
                details.dataset.timeline = String(record.timeline); details.open = open.has(String(record.timeline));
                const choice = record.choice === 'attack' ? 'Attack' : record.choice === 'go_home' ? 'Go home' : 'Choice not recorded';
                details.appendChild(node('summary', `#${record.timeline} · ${choice}`));
                const values = node('dl', null, 'timeline-record-values');
                const badge = { luck: 'Luck', wow: 'Wow', loot: 'Loot Find' }[record.badge] || 'Not recorded';
                for (const [label, value] of [['Coins carried', this.formatNumber(record.coins)],
                    ['Coins earned', (record.estimated ? 'At least ' : '') + this.formatNumber(record.earnedCoins)],
                    ['Mining time', this.formatTime(Math.floor(record.playTimeMs / 1000))],
                    ['Reward', `${this.formatNumber(record.diamonds)} diamonds · ${badge}`]]) {
                    values.append(node('dt', label), node('dd', value));
                }
                details.appendChild(values); content.appendChild(details);
            }
            if (state.completed.length > panel._timelineLimit) {
                const more = node('button', 'Show 20 earlier timelines', 'timeline-history-more');
                more.type = 'button';
                more.addEventListener('click', () => { panel._timelineLimit += 20; this.updateTimelineHistoryUI(); });
                content.appendChild(more);
            }
            panel.replaceChildren(content);
        }
    };
    window.DogeMinerTimelineHistory = Object.freeze({ normalize, snapshot, choiceOf });
})();
