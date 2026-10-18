// NewsDoge: source progress gates, bounded runtime queue and saved shown IDs.
(function () {
    'use strict';
    const PLANETS = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
    const reports = [
    {
        "id": "nws1",
        "text": "NewsDoge reporting, I'm here at a... mining operation without shibes? Hmm, it's a bold strategy. Exciting!"
    },
    {
        "id": "nws2",
        "text": "This is NewsDoge reporting live, from what appears to be a dogecoin mining operation. I'm going to try to find a shibe for an interview..."
    },
    {
        "id": "nws3",
        "text": "This just in: local, cate-financed news stations are bashing your quest to go to the moon, calling it \"A foolish pursuit\" ...."
    },
    {
        "id": "nws4",
        "text": "Recent studies suggest that the interior of the moon is made up entirely of dogecoins. Scientists are baffled. Further research required. More at eleven!"
    },
    {
        "id": "nws5",
        "text": "More dogecoin in the news today. It was recently discovered that if you submerge yourself entirely in dogecoins, your body appears to become younger! Wow ?!"
    },
    {
        "id": "nws6",
        "text": "Rumours about a large dogecoin mining operation are spreading to many parts of the world."
    },
    {
        "id": "nws7",
        "text": "PSA: The dogecoin mining operation has alerted several governments. They are at DEFCON wow!"
    },
    {
        "id": "nws9",
        "text": "Tensions around the world are rising, as your goal of going to the moon is looming ever closer. All scientists are taking a day off in anticipation of the upcoming launch..."
    },
    {
        "id": "nws10",
        "text": "Reporting live from the moon! The recent successful moon landing & mining operation seems to have gone well. We're monitoring the situation..."
    },
    {
        "id": "nws11",
        "text": "The DIA is reporting that Cate has secretly been running its own mining operation based on kitten labor."
    },
    {
        "id": "nws13",
        "text": "There's no news to report."
    },
    {
        "id": "nws14",
        "text": "Today I am hanging out with some Moon Shibes. We will be discussing what life is like on the moon, the best moon-doge-food, and finding out how high can you really jump on the moon!"
    },
    {
        "id": "nws16",
        "text": "\"Truly breathtaking... a glimpse of the true power of dogecoins.\" - National Dogeographic, regarding your Mars mining operation."
    },
    {
        "id": "nws17",
        "text": "Due to heavy mining, Mars is becoming more habitable - contrary to popular belief! \"Much Atmosphere\" is apparently a byproduct of dogecoin mining. Scientists are once again baffled."
    },
    {
        "id": "nws21",
        "text": "Extra, extra! Mars is now habitable. Wow! The world is in awe, master miner. A Doge statue, twice the size of any other statue, is being erected in your honor."
    },
    {
        "id": "nws22",
        "text": "This is NewsDoge, reporting live... Yes that's right, Jupiter! And boy is it wow! A recent study of the clouds of Jupiter indicated hidden dogecoin treasures. Mining clouds? Hmm..."
    },
    {
        "id": "nws23",
        "text": "Breakthroughs in science & technology due to your unstoppable quest for dogecoins, has unlocked new opportunities on both The Earth and The Moon!"
    },
    {
        "id": "nws25",
        "text": "The Doge Intelligence Agency, or the DIA for short, has received strong evidence of kitten labour by Cate. A warrant for Cates arrest is in effect, be on the lookout..."
    },
    {
        "id": "nws26",
        "text": "Rumour has it Doge went back to the future to invent dogecoin in the past."
    },
    {
        "id": "nws27",
        "text": "A wise Doge once said: \"You don't have to be WOW to START, but you have to START to be WOW.\" ... motivational stuff."
    },
    {
        "id": "nws28",
        "text": "The recent creation of an enormous so called 'DogeStar' has scientists worried. The mass of this moon-sized space station has an impact on the orbit of Jupiter itself, and by extension, the entire solar system..."
    },
    {
        "id": "nws29",
        "text": "Goood moorning Titan! It's a bright and beautiful day here at the first mining base on Titan, the most valuable moon of Saturn. It was recently discovered that Titan itself is a giant alloy of mysterious golden dogecoins..."
    }
];
    const themes = [
    {
        "text": "#111111",
        "fill": 16576703,
        "report": 16049584,
        "stroke": 12223244
    },
    {
        "text": "#111111",
        "fill": 13494526,
        "report": 10800623,
        "stroke": 6723544
    },
    {
        "text": "#111111",
        "fill": 14984898,
        "report": 16486335,
        "stroke": 11739713
    },
    {
        "text": "#111111",
        "fill": 16376242,
        "report": 16767907,
        "stroke": 12811555
    },
    {
        "text": "#601a00",
        "fill": 16765528,
        "report": 15317064,
        "stroke": 8612670
    }
];
    const helperIds = { 1: { miningShibe: 1, dogeKennels: 2 }, 2: { moonShibe: 7, dogeCar: 8, landerShibe: 10 },
        3: { partyShibe: 13, curiosiDoge: 14, djKittenz: 15, spaceBass: 16 },
        4: { cloudBase: 21, superShibe: 22, dogeAirShip: 29, flyingDoggo: 27, dogeStar: 24 }, 5: { titanBase: 35 } };
    function eligibleIds(s) {
        const count = (planet, id) => s.counts?.[`${planet}:${id}`] || 0;
        const on = planet => s.maxlevel === planet && s.level === planet;
        const earth = s.maxlevel < 2 && s.level === 1;
        const eligible = {
            nws1: s.timeline === 1 && count(1, 2) === 0 && count(1, 1) === 0 && s.timeplayed > 500,
            nws2: earth && s.alltimecoins >= 475, nws3: earth && s.alltimecoins >= 1000,
            nws4: earth && s.alltimecoins >= 2500, nws5: earth && s.alltimecoins >= 4100,
            nws6: earth && s.alltimecoins >= 8000, nws7: earth && s.alltimecoins >= 20000, nws9: earth && s.alltimecoins >= 40000,
            nws10: on(2) && count(2, 7) > 1, nws11: on(2) && count(2, 7) > 6,
            nws13: on(2) && count(2, 7) > 9 && count(2, 8) > 5, nws14: on(2) && count(2, 10) > 1,
            nws16: on(3) && count(3, 13) > 4 && count(3, 14) > 0,
            nws17: on(3) && count(3, 13) > 5 && count(3, 14) > 2,
            nws21: s.maxlevel === 4 && s.level === 3 && count(3, 15) > 2 && count(3, 16) > 2,
            nws22: on(4) && s.locationMs > 9100, nws23: on(4) && count(4, 21) > 0,
            nws25: on(4) && count(4, 22) > 2, nws26: on(4) && count(4, 29) > 1,
            nws27: on(4) && count(4, 27) > 0, nws28: on(4) && count(4, 24) > 0,
            nws29: on(5) && count(5, 35) > 0
        };
        return reports.filter(report => eligible[report.id]).map(report => report.id);
    }
    const proto = DogeMinerGame.prototype;
    proto.hideNewsDoge = function () { this._newsView?.close(); this._newsView = null; };
    proto.resetNewsDoge = function () {
        this.hideNewsDoge(); this._newsQueue = []; this._newsRetired = new Set();
        this._newsInitial = true; this._newsNextAt = 0; this._newsCheckMs = 0;
    };
    proto.getNewsDogeSnapshot = function (now = Date.now()) {
        const counts = {};
        for (const [index, key] of ['helpers', 'moonHelpers', 'marsHelpers', 'jupiterHelpers', 'titanHelpers'].entries()) {
            for (const helper of this[key] || []) {
                const id = helperIds[index + 1][helper.type];
                if (id != null) { const key = `${index + 1}:${id}`; counts[key] = (counts[key] || 0) + 1; }
            }
        }
        const level = Math.max(1, PLANETS.indexOf(this.currentLevel) + 1), current = this.getCurrentTimelineStats();
        return { level, maxlevel: Math.max(level, this.bonusCoinMaxPlanetLevel || 1), timeline: this.timelineNumber || 1,
            alltimecoins: current.earnedCoins, timeplayed: Math.floor(current.playTimeMs / 1000),
            locationMs: Number.isFinite(this._storyLocationStartedAt) ? now - this._storyLocationStartedAt : 0, counts };
    };
    proto.checkNewsDoge = function (now = Date.now(), random = Math.random) {
        if (this.newsEnabled === false || this.isStoryOpen || !this.canPresentStory()) return;
        this._newsRetired ||= new Set(); this._newsQueue ||= [];
        const seen = this.storyProgress?.seen || [];
        for (const id of eligibleIds(this.getNewsDogeSnapshot(now))) {
            if (this._newsRetired.has(id) || seen.includes(id)) continue;
            this._newsRetired.add(id); this._newsQueue.push(id);
            if (this._newsQueue.length > 3) this._newsQueue.shift();
        }
        if (this._newsInitial !== false) { this._newsQueue = []; this._newsInitial = false; return; }
        if (this._newsQueue.length && !this._newsView && !this._newsNextAt) this._newsNextAt = now + 500 + Math.floor(3000 * random());
    };
    proto.advanceNewsDoge = function (deltaMs) {
        if (!this._bootComplete || !this.isPlaying || document.hidden || this.newsEnabled === false) return;
        this._newsCheckMs = (this._newsCheckMs || 0) + Math.max(0, Math.min(1000, deltaMs || 0));
        const now = Date.now();
        if (this._newsCheckMs >= 1000) { this._newsCheckMs %= 1000; this.checkNewsDoge(now); }
        if (this._newsNextAt && now >= this._newsNextAt && !this._newsView && !this.isStoryOpen && this.canPresentStory()) {
            const id = this._newsQueue[0];
            // A queued report may become obsolete while a popup or planet
            // transition holds it. Check its progress/location again at delivery.
            if (!id || this.storyProgress?.seen.includes(id) || !eligibleIds(this.getNewsDogeSnapshot(now)).includes(id)) {
                this._newsQueue.shift(); this._newsNextAt = 0; return;
            }
            if (this.showNewsDoge(id)) { this._newsQueue.shift(); this._newsNextAt = 0; }
            else this._newsNextAt = now + 1000;
        }
    };
    proto.showNewsDoge = function (id) {
        const report = reports.find(report => report.id === id);
        if (!report || this.newsEnabled === false || this._newsView || this.storyProgress?.seen.includes(id)) return false;
        const next = this.getStoryProgressForSave(); next.seen.push(id);
        if (!this._commitStoryProgress(next)) return false;
        this._newsView = this._showNewsDogeView(report);
        window.audioManager?.playSound('news1');
        return true;
    };
    function el(tag, className, text) {
        const node = document.createElement(tag); node.className = className;
        if (text != null) node.textContent = text; return node;
    }
    // DM2 uses these curves on a logical 1344x756 canvas. Sample the
    // circular curve directly rather than approximating it with CSS ease.
    function tween(node, property, from, to, duration, curve, delay = 0) {
        const frames = Array.from({ length: 41 }, (_, index) => {
            const t = index / 40, progress = curve(t);
            return { offset: t, [property]: property === 'transform'
                ? `translateX(${from + (to - from) * progress}px)` : from + (to - from) * progress };
        });
        return node.animate(frames, { duration, delay, easing: 'linear', fill: 'both' });
    }
    const sineInOut = t => (1 - Math.cos(Math.PI * t)) / 2;
    const circInOut = t => t < .5 ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2
        : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2;
    class NewsView {
        constructor(game, report) {
            this.game = game; this.timers = []; this.motion = []; this.reaction = 0;
            this.node = el('aside', 'newsdoge'); this.node.id = 'news-container'; this.node.dataset.report = report.id;
            const theme = themes[Math.max(0, PLANETS.indexOf(game.currentLevel))];
            const hex = value => `#${value.toString(16).padStart(6, '0')}`;
            for (const [key, value] of Object.entries(theme)) this.node.style.setProperty(`--news-${key}`, key === 'text' ? value : hex(value));
            this.track = el('div', 'newsdoge-track'); this.track.setAttribute('role', 'status');
            this.text = el('span', 'newsdoge-text', report.text); this.track.append(this.text);
            const label = el('strong', 'newsdoge-label', 'NEWSDOGE');label.append(el('span', 'newsdoge-report-label', ' REPORT'));
            this.reporter = el('button', 'newsdoge-reporter'); this.reporter.type = 'button';
            this.reporter.setAttribute('aria-label', 'NewsDoge'); this.reporter.title = 'NewsDoge';
            const image = el('img', ''); image.src = 'assets/general/newsdoge/newsdoge.webp'; image.alt = ''; this.reporter.append(image);
            this.reporter.addEventListener('click', () => {
                clearTimeout(this.reactionTimer); this.reaction = this.reaction % 2 + 1;
                this.reporter.dataset.reaction = String(this.reaction);
                image.src = `assets/general/newsdoge/newsdoge_annoyed_${this.reaction}.webp`;
                this.reactionTimer = setTimeout(() => { delete this.reporter.dataset.reaction; image.src = 'assets/general/newsdoge/newsdoge.webp'; }, 700);
            });
            const reporterClip = el('div', 'newsdoge-reporter-clip'); reporterClip.append(this.reporter);
            this.surface = el('div', 'newsdoge-surface'); this.surface.append(this.track, label, reporterClip);
            this.node.append(this.surface);
            const panel = document.getElementById('left-panel'); panel.append(this.node);
            const fit = () => {
                const phone = matchMedia('(max-width:768px)').matches;
                const scale = phone ? panel.clientWidth / 370 : Math.min(panel.clientWidth / 770, panel.clientHeight / 756);
                this.node.style.top = `${240 * scale}px`; this.node.style.height = `${36 * scale}px`;
                this.surface.style.width = `${panel.clientWidth / scale}px`;
                this.surface.style.transform = `scale(${scale})`;
            };
            fit(); this.resize = new ResizeObserver(fit); this.resize.observe(panel);
            this.motion.push(tween(this.node, 'opacity', 0, 1, 600, sineInOut));
            this.motion.push(tween(this.reporter, 'transform', matchMedia('(max-width:768px)').matches ? 160 : 185,
                0, 500, circInOut, 900));
            requestAnimationFrame(() => {
                if (this.closed) return;
                const distance = Math.ceil((this.track.clientWidth + this.text.offsetWidth) / 100) * 100;
                this.duration = distance / 100 * 1300;
                // Scrolling conveys the report itself, including when decorative
                // motion is reduced. Never turn the ticker into a wrapping panel.
                this.animation = this.text.animate([{ transform: `translateX(${this.track.clientWidth}px)` },
                    { transform: `translateX(${this.track.clientWidth - distance}px)` }], { delay: 1500, duration: this.duration, fill: 'both', easing: 'linear' });
                this.animation.onfinish = () => this.finish();
                // The source also has a wall-clock watchdog for stalled tweens.
                this.timers.push(setTimeout(() => this.finish(), 1500 + this.duration + 5000));
            });
        }
        finish() {
            if (this.closed || this.finishing) return;
            this.finishing = true;
            this.timers.push(setTimeout(() => {
                if (this.closed) return;
                this.node.classList.add('newsdoge-exit');
                // The reporter leaves while the complete strip fades away.
                this.motion.push(tween(this.reporter, 'transform', 0, 200, 400, circInOut));
                this.motion.push(tween(this.node, 'opacity', 1, 0, 600, t => 1 - (1 - t) ** 2));
                this.timers.push(setTimeout(() => { if (this.game._newsView === this) this.game.hideNewsDoge(); }, 600));
            }, 1000));
        }
        close() {
            if (this.closed) return; this.closed = true;
            if (this.animation) this.animation.onfinish = null;
            this.animation?.cancel(); for (const timer of this.timers) clearTimeout(timer); clearTimeout(this.reactionTimer);
            for (const animation of this.motion) animation.cancel(); this.resize.disconnect();
            this.node.remove();
        }
    }
    proto._showNewsDogeView = function (report) { return new NewsView(this, report); };
    window.DogeMinerNewsDoge = Object.freeze({ eligibleIds, reports: Object.freeze(reports.map(report => Object.freeze(report))),
        themes: Object.freeze(themes.map(theme => Object.freeze(theme))), config: Object.freeze({ capacity: 3, checkMs: 1000, scrollMsPer100px: 1300,
            scrollDelayMs: 1500, reporterDelayMs: 900, reactionMs: 700 }) });
})();
