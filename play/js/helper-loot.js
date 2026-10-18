// DM2 field helpers: coin collection uses the same durable claim as a click.
(function () {
    'use strict';
    const proto = DogeMinerGame.prototype;
    const fieldScale = .42;
    const config = Object.freeze({"enabled": true, "startAtLanding": true, "range": 100, "reachMargin": 10, "hopPx": 14, "loopsPerHop": 2, "minWaitMs": 250, "maxWaitMs": 2000, "alignToLoop": true, "hopMs": 240, "hopHeight": 9, "style": "hop", "ease": "sine.inOut", "squash": 0.12, "landDip": true, "freeze": true, "bump": true, "baseSeekers": 1, "shibesPerExtraSeeker": 5, "pileRadius": 50, "slack": 0, "retargetConeDeg": 90, "detourDeg": 150, "maxSkirtHops": 20, "maxStalls": 2});
    // Pure target planner and hop cadence ported from pinned DM2 Kb/Qb.
function pointDistance(e, t, n, i) {
  var o = e - n,
    r = t - i;
  return Math.sqrt(o * o + r * r);
}
function reachRange(e) {
  return Math.max(0, e.range - e.reachMargin);
}
function reachableInTime(e, t, n, i) {
  if (!(i.slack > 0)) return !0;
  if (!Number.isFinite(t)) return !0;
  var o = Math.max(0, t) / Math.max(1, n);
  return (
    (function (e, t) {
      var n = e - reachRange(t);
      return n <= 0 ? 0 : Math.ceil(n / Math.max(1, t.hopPx));
    })(e, i) <=
    o * i.slack
  );
}
function overlapsTarget(e, t, n) {
  for (var i = 0; i < t.length; i++)
    if (pointDistance(e.x, e.y, t[i].x, t[i].y) <= n) return !0;
  return !1;
}
function inRetargetCone(e, t, n) {
  var i = pointDistance(e.x, e.y, t.x, t.y);
  if (i <= reachRange(n) + 2 * n.hopPx) return !0;
  if (!e.heading) return !0;
  var o = (t.x - e.x) / i,
    r = (t.y - e.y) / i;
  return (
    o * e.heading.x + r * e.heading.y >=
    Math.cos((Math.max(0, Math.min(180, n.retargetConeDeg)) * Math.PI) / 180) -
      1e-9
  );
}
function planSeekers(e, t, n) {
  for (
    var i = n.range,
      o = (function (e, t) {
        if (!(e > 0)) return 0;
        var n = Math.max(0, Math.floor(t.baseSeekers)),
          i = Math.max(1, Math.floor(t.shibesPerExtraSeeker));
        return n + Math.floor(Math.max(0, e - i) / i);
      })(t.length, n),
      r = new Map(),
      a = new Set(),
      s = 0;
    s < e.length;
    s++
  ) {
    var l = e[s];
    r.set(l.id, l);
    for (var d = !1, c = 0; c < t.length; c++)
      if (pointDistance(t[c].x, t[c].y, l.x, l.y) <= i) {
        d = !0;
        break;
      }
    d || a.add(l.id);
  }
  for (
    var u = new Map(),
      h = new Map(),
      p = new Set(),
      m = new Map(),
      g = [],
      f = [],
      y = 0;
    y < t.length;
    y++
  ) {
    var v = t[y];
    v.seeking &&
      (f.push(v),
      null != v.targetId &&
        a.has(v.targetId) &&
        (u.set(v.id, v.targetId), g.push(r.get(v.targetId))));
  }
  for (var w = u.size, b = 0; b < f.length && w > o; b++)
    u.has(f[b].id) && (u.delete(f[b].id), p.add(f[b].id), w--);
  ((g = []),
    u.forEach(function (e) {
      g.push(r.get(e));
    }));
  for (var x = 0; x < f.length; x++) {
    var k = f[x];
    if (!u.has(k.id) && !p.has(k.id)) {
      var S = null,
        T = 1 / 0;
      (w < o &&
        a.forEach(function (e) {
          var t = r.get(e);
          if (
            !overlapsTarget(t, g, n.pileRadius) &&
            (!k.blocked || !k.blocked.has(e)) &&
            inRetargetCone(k, t, n)
          ) {
            var i = pointDistance(k.x, k.y, t.x, t.y);
            i < T && reachableInTime(i, t.lifeLeftMs, k.msPerHop, n) && ((S = t), (T = i));
          }
        }),
        S && w < o ? (h.set(k.id, S.id), g.push(S), w++) : p.add(k.id));
    }
  }
  if (w < o) {
    for (var M = [], C = 0; C < t.length; C++) {
      var _ = t[C];
      _.free &&
        !_.seeking &&
        a.forEach(function (e) {
          if (!_.blocked || !_.blocked.has(e)) {
            var t = r.get(e),
              i = pointDistance(_.x, _.y, t.x, t.y);
            reachableInTime(i, t.lifeLeftMs, _.msPerHop, n) &&
              M.push({ shibe: _, coin: t, d: i });
          }
        });
    }
    M.sort(function (e, t) {
      return e.d - t.d;
    });
    for (var A = new Set(), P = 0; P < M.length && w < o; P++) {
      var D = M[P];
      A.has(D.shibe.id) ||
        overlapsTarget(D.coin, g, n.pileRadius) ||
        (m.set(D.shibe.id, D.coin.id), A.add(D.shibe.id), g.push(D.coin), w++);
    }
  }
  return {
    cap: o,
    unreachable: a,
    keep: u,
    retarget: h,
    release: p,
    assign: m,
  };
}
function rotatePoint(e, t, n) {
  var i = (n * Math.PI) / 180,
    o = t.x - e.x,
    r = t.y - e.y,
    a = Math.cos(i),
    s = Math.sin(i);
  return { x: e.x + o * a - r * s, y: e.y + o * s + r * a };
}
function waitPerHop(e, t, n) {
  var i = Math.abs(Number(t)),
    o =
      (i > 0 ? (Math.max(1, e) / i) * (1e3 / 60) : 1 / 0) *
      Math.max(0, n.loopsPerHop);
  return Math.min(Math.max(o, n.minWaitMs), Math.max(n.minWaitMs, n.maxWaitMs));
}

    const canLoot = new Set(['miningShibe', 'moonShibe', 'partyShibe', 'superShibe', 'roboShibe', 'coinSeeker5000']);
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    proto.helperLootCanRun = function () {
        return this._bootComplete && this.isPlaying && !document.hidden && !this.isTransitioning
            && !this.isIntroPlaying && !this.isCutscenePlaying && !this.isBetaReportOpen && !this.isStoryOpen;
    };
    proto.getHelperLootActors = function (all = false) {
        const actors = [], field = document.getElementById('helper-container');
        if (!field || field.offsetWidth === 0 || field.offsetHeight === 0) return actors;
        const sprites = new Map([...field.querySelectorAll('.helper-sprite[data-helper-id]')].map(node => [node.dataset.helperId, node]));
        for (const record of this.placedHelpers) {
            if (!all && !canLoot.has(record.type)) continue;
            const sprite = sprites.get(String(record.id));
            if (!sprite?.isConnected || sprite._helperMotion || sprite.classList.contains('attached-to-mouse')) continue;
            if (sprite.getClientRects && !sprite.getClientRects().length) continue;
            if (typeof getComputedStyle === 'function' && getComputedStyle(sprite).visibility !== 'visible') continue;
            const members = this.getHelperGroupMembers(record);
            if (members[0] !== record) continue;
            const width = sprite.offsetWidth || this.getHelperDisplaySize(record.type), height = sprite.offsetHeight || width;
            actors.push({ id: String(record.id), record, sprite, members, width, height,
                x: (record.x + width / 2) / fieldScale, y: (record.y + height / 2) / fieldScale,
                free: !sprite._helperLootDip && !sprite._helperHop });
        }
        return actors;
    };
    proto.getHelperLootCoins = function () {
        const field = document.getElementById('helper-container'); if (!field) return [];
        const rect = field.getBoundingClientRect(), ratio = rect.width / (field.offsetWidth || rect.width) || 1;
        return [...document.querySelectorAll('.coin-pile:not([data-collected])')].filter(node => node.isConnected
            && node._fieldLanded && node._fieldPlanet === this.currentLevel && node._fieldEpoch === (this._currencyFlightEpoch || 0))
            .map(node => { const r = node.getBoundingClientRect(); return { node, id: node,
                x: (r.left + r.width / 2 - rect.left) / ratio / fieldScale,
                y: (r.top + r.height / 2 - rect.top) / ratio / fieldScale }; });
    };
    proto.dipLootHelper = function (actor, duration = 220, depth = 4, squash = .12) {
        const node = actor.sprite, scale = this.getHelperGroupScale(actor.members.length);
        if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
        node.classList.add('helper-loot-motion');
        node._helperLootDip = window.LootMotion.sample(node, duration, t => {
            const k = (1 - Math.cos(2 * Math.PI * t)) / 2;
            return { transform: `translateY(${depth * fieldScale * k}px) scale(${scale},${scale * (1 - squash * k)})` };
        }, () => {
            node._helperLootDip = null; node.style.transform = ''; node.classList.remove('helper-loot-motion');
        });
    };
    proto.cancelHelperLoot = function () {
        for (const move of [...(this._helperLootMoves || [])]) this.cancelLootHelperMove(move);
        this._helperSeekers = new Map(); this._helperSeekBlocked = new WeakMap();
        document.querySelectorAll('.helper-loot-motion').forEach(node => {
            node._helperLootDip?.cancel(); node._helperLootDip = null; node.style.transform = '';
            node.classList.remove('helper-loot-motion');
        });
    };
    proto.collectNearbyHelperCoins = function (coins, actors) {
        // Source gC/Ub: newest pile first, one collection per helper each poll,
        // closest eligible helper inside 100 source pixels, and 1.8s after landing.
        const used = new Set();
        for (const coin of [...coins].reverse()) {
            if (this._helperLootClock < coin.node._helperGrabAt) continue;
            let nearest = null, best = 100;
            for (const actor of actors) {
                if (!actor.free || used.has(actor.id)) continue;
                const d = distance(actor, coin);
                if (d <= best) { nearest = actor; best = d; }
            }
            if (!nearest) continue;
            if (this.collectCoinPile(coin.node)) { used.add(nearest.id); this.dipLootHelper(nearest); }
        }
    };
    proto.syncHelperLootPause = function () {
        const active = Boolean(this.helperLootCanRun());
        if (this._helperLootPaused !== !active) {
            this._helperLootPaused = !active;
            for (const move of this._helperLootMoves || []) active ? move.animation?.play?.() : move.animation?.pause?.();
            document.querySelectorAll('.helper-loot-motion').forEach(node => {
                if (node._helperLootDip) active ? node._helperLootDip.play?.() : node._helperLootDip.pause?.();
            });
        }
        return active;
    };
    document.addEventListener?.('visibilitychange', () => window.game?.syncHelperLootPause());
    proto.advanceHelperLoot = function (dt) {
        const active = this.syncHelperLootPause();
        if (!active) return;
        this.advanceSeekingHops(Math.max(0, Math.min(dt, 250)));
        this._helperLootClock = (this._helperLootClock || 0) + Math.max(0, Math.min(dt, 250));
        this._helperLootPoll = (this._helperLootPoll || 0) + Math.max(0, Math.min(dt, 250));
        if (this._helperLootPoll < 500) return;
        this._helperLootPoll %= 500;
        const coins = this.getHelperLootCoins();
        if (!coins.length && !this._helperSeekers?.size) return;
        const actors = this.getHelperLootActors();
        this.collectNearbyHelperCoins(coins, actors);
        this.planHelperSeeking(coins.filter(coin => !coin.node.dataset.collected), actors);
    };
    function nextHop(from, target, state, landing) {
        const d = distance(from, target), remaining = d - reachRange(config);
        if (remaining <= .5) return null;
        const length = Math.min(config.hopPx, remaining);
        const direct = { x: from.x + (target.x - from.x) / d * length, y: from.y + (target.y - from.y) / d * length };
        const degrees = [0]; for (let angle = 15; angle <= config.detourDeg; angle += 15) degrees.push(angle, -angle);
        const choices = []; let best = null, bestDistance = Infinity;
        for (const angle of degrees) {
            const aim = angle ? rotatePoint(from, direct, angle) : direct, land = landing(aim);
            if (!land) continue;
            const moved = distance(from, land), left = distance(land, target), choice = { angle, aim, land, moved, left };
            choices.push(choice);
            if (moved >= .5 * config.hopPx && left < d - .3 * config.hopPx && left < bestDistance - (angle ? 1 : 0)) {
                best = choice; bestDistance = left;
            }
        }
        if (best) {
            if ((best.angle || distance(best.aim, best.land) > 1) && ++state.skirts > config.maxSkirtHops) return null;
        } else {
            if (++state.skirts > config.maxSkirtHops) return null;
            const sideChoice = side => choices.filter(c => c.moved >= .5 * config.hopPx && (!c.angle || Math.sign(c.angle) === side))
                .sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle))[0];
            if (!state.side) {
                const left = sideChoice(1), right = sideChoice(-1);
                if (!left && !right) return null;
                state.side = !right || left && Math.abs(left.angle) <= Math.abs(right.angle) ? 1 : -1;
            }
            best = sideChoice(state.side); if (!best) return null;
        }
        const moved = distance(from, best.land);
        return { ...best.land, heading: moved ? { x: (best.land.x - from.x) / moved, y: (best.land.y - from.y) / moved } : null };
    }
    proto.helperSeekLanding = function (actor, aim) {
        const field = document.getElementById('helper-container'), rect = field.getBoundingClientRect();
        const ratio = rect.width / (field.offsetWidth || rect.width) || 1;
        const scale = this.getHelperGroupScale(actor.members.length), w = actor.width * scale, h = actor.height * scale;
        const maxY = (Math.min(rect.bottom, innerHeight - (innerWidth <= 768 ? 65 : 0)) - rect.top) / ratio;
        const x = Math.max(10 + w / 2, Math.min(aim.x * fieldScale, field.offsetWidth - 10 - w / 2));
        const y = Math.max(30 + h / 2, Math.min(aim.y * fieldScale, maxY - 10 - h / 2));
        if (x - w / 2 < 220 && y - h / 2 < 110 || x + w / 2 > field.offsetWidth - 180 && y - h / 2 < 75) return null;
        // Source ZN/lF avoids Doge, rather than excluding the entire rock area.
        // Fit the collision ellipse to CE's visible character, with padded feet.
        const doge = document.getElementById('main-character')?.getBoundingClientRect();
        if (doge?.width && doge.height) {
            const cx = (doge.left + doge.width / 2 - rect.left) / ratio, cy = (doge.top + doge.height * .55 - rect.top) / ratio;
            const rx = doge.width * .37 / ratio + w / 2 + 3 * fieldScale, ry = doge.height * .42 / ratio + h / 2 + 3 * fieldScale;
            if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1) return null;
        }
        return { x: x / fieldScale, y: y / fieldScale };
    };
    proto.cancelLootHelperMove = function (move, retainPosition = false) {
        const { actor, node } = move;
        if (retainPosition && node.isConnected) {
            const style = getComputedStyle(node), x = parseFloat(style.left), y = parseFloat(style.top);
            if (Number.isFinite(x) && Number.isFinite(y)) for (const member of actor.members) { member.x = x; member.y = y; }
        }
        move.cancelled = true; move.animation?.cancel(); this._helperLootMoves?.delete(move);
        if (node._helperHop === move) {
            node._helperHop = null; node.classList.remove('helper-loot-motion'); node.style.transform = '';
            node.style.left = actor.record.x + 'px'; node.style.top = actor.record.y + 'px';
            this.setHelperRestDepth?.(actor.record, node);
            if (node.isConnected) this.startHelperMining(actor.record);
        }
    };
    proto.moveLootHelper = function (actor, to, duration = config.hopMs, hop = true) {
        const node = actor.sprite, from = { x: actor.record.x, y: actor.record.y };
        const target = { x: to.x * fieldScale - actor.width / 2, y: to.y * fieldScale - actor.height / 2 };
        const scale = this.getHelperGroupScale(actor.members.length), reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
        const move = { actor, node, epoch: this._helperFieldEpoch, planet: this.currentLevel };
        node._helperLootDip?.cancel(); node._helperLootDip = null; node._helperHop = move;
        node.classList.remove('place-bounce'); node.classList.add('helper-loot-motion'); this.stopHelperAnimation(node);
        if (hop && config.freeze) node.src = this.getHelperSpritePaths(actor.record.type, this.helperUpgradeLevels?.[actor.record.type] || 0).idle;
        this._helperLootMoves ||= new Set(); this._helperLootMoves.add(move);
        move.animation = window.LootMotion.sample(node, duration, t => {
            const ease = (1 - Math.cos(t * Math.PI)) / 2, lift = hop && !reduced ? 4 * t * (1 - t) : 0;
            return { left: from.x + (target.x - from.x) * ease + 'px', top: from.y + (target.y - from.y) * ease + 'px',
                transform: `translateY(${-config.hopHeight * fieldScale * lift}px) scale(${scale * (1 - config.squash * lift * .5)},${scale * (1 + config.squash * lift)})` };
        }, () => {
            if (move.cancelled || !node.isConnected || move.epoch !== this._helperFieldEpoch || move.planet !== this.currentLevel) return;
            for (const member of actor.members) { member.x = target.x; member.y = target.y; }
            this._helperLootMoves.delete(move); node._helperHop = null; node.style.transform = ''; node.classList.remove('helper-loot-motion');
            this.setHelperRestDepth?.(actor.record, node);
            this.startHelperMining(actor.record); this.updateDPS(); this.updateUI(true); window.saveManager?.saveGame(false);
            const state = this._helperSeekers?.get(actor.id);
            if (state) { state.hopping = false; state.elapsed = 0; state.lastFrame = 0; }
            if (hop && !reduced) this.dipLootHelper(actor, 160, 2, .1);
        });
        return move;
    };
    proto.bumpLootHelperPeers = function (actor, to) {
        const all = this.getHelperLootActors(true), width = actor.width / fieldScale, height = actor.height / fieldScale;
        for (const peer of all) {
            if (peer.id === actor.id || !peer.free || this._helperSeekers?.has(peer.id)) continue;
            const w = peer.width / fieldScale, h = peer.height / fieldScale;
            if (to.x - width / 2 >= peer.x - w / 2 + .6 * w || to.x - width / 2 + .6 * width <= peer.x - w / 2
                || to.y + height / 3 >= peer.y + h / 3 + .4 * h || to.y + height / 3 + .4 * height <= peer.y + h / 3) continue;
            const aim = { x: peer.x + (peer.x >= to.x ? 1 : -1) * (10 + Math.floor(10 * Math.random())),
                y: peer.y + (peer.y >= to.y + 6 ? 1 : -1) * (4 + Math.floor(3 * Math.random())) };
            const land = this.helperSeekLanding(peer, aim); if (land) this.moveLootHelper(peer, land, 300, false);
        }
    };
    proto.planHelperSeeking = function (coins, actors) {
        this._helperSeekers ||= new Map(); this._helperSeekBlocked ||= new WeakMap();
        const byId = new Map(actors.map(actor => [actor.id, actor])), byCoin = new Map(coins.map(coin => [coin.id, coin]));
        for (const [id, state] of this._helperSeekers) if (!byId.has(id) || !byCoin.has(state.coin)) this._helperSeekers.delete(id);
        const helpers = actors.map(actor => {
            const state = this._helperSeekers.get(actor.id);
            const blocked = new Set(coins.filter(coin => this._helperSeekBlocked.get(coin.node)?.has(actor.id)).map(coin => coin.id));
            return { ...actor, free: actor.free, seeking: !!state, targetId: state?.coin, heading: state?.heading,
                msPerHop: waitPerHop(2, .05, config) + config.hopMs, blocked };
        });
        const plan = planSeekers(coins, helpers, config);
        this._helperSeekSummary = { cap: plan.cap, shibes: actors.length, unreachable: plan.unreachable.size };
        for (const id of plan.release) this._helperSeekers.delete(id);
        for (const [id, coin] of plan.retarget) Object.assign(this._helperSeekers.get(id), { coin, stalls: 0, side: 0, skirts: 0 });
        for (const [id, coin] of plan.assign) this._helperSeekers.set(id, { coin, actor: byId.get(id), elapsed: 0,
            lastFrame: byId.get(id).sprite._helperFrame, wait: waitPerHop(2, .05, config), heading: null, skirts: 0, side: 0 });
    };
    proto.advanceSeekingHops = function (dt) {
        if (!this._helperSeekers?.size) return;
        for (const [id, state] of this._helperSeekers) {
            const actor = state.actor, node = actor.sprite, coin = state.coin;
            if (!node.isConnected || node._helperMotion || !coin.isConnected || coin.dataset.collected) { this._helperSeekers.delete(id); continue; }
            if (state.hopping) continue;
            state.elapsed += dt;
            const loopStart = node._helperFrame === 0 && state.lastFrame !== 0; state.lastFrame = node._helperFrame;
            if (state.elapsed < state.wait || !loopStart && state.elapsed < state.wait + 600 || node._helperLootDip) continue;
            const target = this.getHelperLootCoins().find(c => c.id === coin);
            if (!target) { this._helperSeekers.delete(id); continue; }
            const from = { x: (actor.record.x + actor.width / 2) / fieldScale, y: (actor.record.y + actor.height / 2) / fieldScale };
            const to = nextHop(from, target, state, aim => this.helperSeekLanding(actor, aim));
            if (!to) {
                if (distance(from, target) > reachRange(config)) {
                    const blocked = this._helperSeekBlocked.get(coin) || new Set(); blocked.add(id); this._helperSeekBlocked.set(coin, blocked);
                }
                this._helperSeekers.delete(id); continue;
            }
            state.hopping = true; state.heading = to.heading; this.bumpLootHelperPeers(actor, to); this.moveLootHelper(actor, to);
        }
    };

    const reset = proto.resetFieldLootPresentation, clear = proto.clearAllHelperSprites, hold = proto.makeHeldHelper;
    proto.resetFieldLootPresentation = function (...args) { this.cancelHelperLoot(); return reset.apply(this, args); };
    proto.clearAllHelperSprites = function (...args) { this.cancelHelperLoot(); return clear.apply(this, args); };
    proto.makeHeldHelper = function (record, node, ...args) {
        if (node._helperHop) this.cancelLootHelperMove(node._helperHop, true);
        this._helperSeekers?.delete(String(record.id));
        node._helperLootDip?.cancel(); node._helperLootDip = null; node.classList.remove('helper-loot-motion'); node.style.transform = '';
        return hold.call(this, record, node, ...args);
    };
    window.DogeMinerHelperLoot = Object.freeze({ canLoot, fieldScale, distance, config, planSeekers, waitPerHop, rotatePoint, nextHop });
})();
