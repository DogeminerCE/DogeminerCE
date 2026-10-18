import { N as e, W as n } from "./pixi-CzhK9Vru.js";
import "./vendor-BBzg8X1X.js";
import "./tweens-CyR_UHKv.js";
import "./download-save-Cx3yXoHA.js";
import {
  Gt as t,
  _ as i,
  cn as r,
  g as o,
  h as a,
  it as s,
  ln as u,
} from "./play-B7Micxas.js";
import {
  a as l,
  b as d,
  c,
  d as f,
  f as p,
  i as h,
  l as g,
  n as v,
  o as M,
  p as y,
  r as m,
  s as x,
  u as w,
  v as b,
  x as k,
  y as P,
} from "./drill-audio-DFHI8VZ5.js";
var S = Math.PI / 180;
function I(e) {
  return (
    (e ^= e << 13),
    1 -
      (2147483647 &
        (e =
          (Math.imul(e, (Math.imul(Math.imul(e, e), 15731) + 789221) | 0) +
            1376312589) |
          0)) /
        1073741824
  );
}
function L(e, n) {
  var t = Math.floor(e),
    i = e - t,
    r = I((57 * t + 7919 * n) | 0);
  return r + (I((57 * (t + 1) + 7919 * n) | 0) - r) * (i * i * (3 - 2 * i));
}
function H(e, n, t, i) {
  return i <= 0 ? n : e + (n - e) * (1 - Math.exp(-t / i));
}
var E = null,
  D = null,
  R = 0,
  B = 0,
  z = 0,
  j = 0,
  F = 0,
  O = 0,
  W = !1,
  q = 0,
  C = 0,
  G = { x: 0, y: 0, amt: 0 },
  T = { x: 0, y: 0, r: 0 },
  _ = !0,
  A = Math.random;
function N(e) {
  (E && E !== e && Z(E), (E = e || null));
}
function V(e, n) {
  ((z = e ? 1 : 0),
    e ? (_ = !0) : n && ((_ = !1), E && (Q(E.pick), Q(E.offhandPick))));
}
function X(e) {
  F = e ? 1 : 0;
}
function Y(e) {
  W = !!e;
}
function U() {
  return (
    z > 0 ||
    B > 0.001 ||
    j > 0.001 ||
    O > 0.001 ||
    C > 0.01 ||
    G.amt > 0.01 ||
    Math.abs(T.x) + Math.abs(T.y) > 0.05
  );
}
function J(e) {
  return !!e && !e.destroyed;
}
function K() {
  return !!E && J(E.pick);
}
function Q(e) {
  J(e) && (e.skew.set(0, 0), e.pivot.set(0, 0));
}
function Z(e) {
  e &&
    (Q(e.pick),
    Q(e.offhandPick),
    J(e.dogeStage) && e.dogeStage.pivot.set(0, 0),
    J(e.rock) && e.rock.pivot.set(0, 0));
}
function $(e, n, t, i, r, o, a, s) {
  var u = n.fx * s,
    l = i * (e.idleShakePx + (e.drillShakePx - e.idleShakePx) * r) * u,
    d = i * (e.idleShakeDeg + (e.drillShakeDeg - e.idleShakeDeg) * r) * u,
    c = t * e.shakeHz,
    f = E.restRotation || 0,
    p = o * (n.poseDeg * S - f),
    h = f + p,
    g = Math.sin(h),
    v = -Math.cos(h),
    M = o * n.poseX + L(c, a + 1) * l,
    y =
      o * n.poseY +
      L(c, a + 2) * l +
      Math.sin(2 * Math.PI * e.rumbleHz * t) * e.rumblePx * i * u,
    m = p + L(c, a + 3) * d * S,
    x = 0,
    w = !1,
    b = C * e.biteDepthPx * n.bite;
  if (((M += g * b), (y += v * b), "jackhammer" === n.style)) {
    var k =
      Math.sin(2 * Math.PI * e.pistonHz * (1 + 0.6 * r) * t) *
      e.pistonPx *
      u *
      i *
      (1 + 1.5 * r);
    ((M += g * k), (y += v * k));
  } else
    ((x =
      Math.sin(2 * Math.PI * e.spinHz * t) * e.spinWobble * u * i * (1 + r)),
      e.spinFlip && i > 0.5 && (w = Math.floor(t * e.spinHz * 2) % 2 == 1));
  return {
    x: M + T.x * s,
    y: y + T.y * s,
    delta: m + T.r * s,
    shear: x,
    flip: w,
  };
}
function ee(e, n) {
  if (J(e)) {
    e.skew.set(-n.delta + n.shear, n.delta + (n.flip ? Math.PI : 0));
    var t = e.scale.x,
      i = e.scale.y;
    if (Math.abs(t) < 0.05 || Math.abs(i) < 0.05) e.pivot.set(0, 0);
    else {
      var r = e.rotation + n.delta,
        o = Math.cos(r),
        a = Math.sin(r),
        s = -(o * n.x + a * n.y) / t,
        u = -(-a * n.x + o * n.y) / i;
      e.pivot.set(n.flip ? -s : s, u);
    }
  }
}
function ne(e) {
  var n = b(),
    t = P(D) || {
      style: "auger",
      fx: 1,
      poseDeg: -92,
      poseX: 0,
      poseY: 0,
      bite: 1,
      instability: 0,
    },
    i = Math.min(Math.max(e, 0), 100);
  ((R += i),
    z > B
      ? (B = Math.min(z, B + i / Math.max(1, n.spinupMs)))
      : z < B && (B = Math.max(z, B - i / Math.max(1, n.spindownMs))),
    (j = H(j, F, i, (F > j ? n.poseInMs : n.poseOutMs) / 3)));
  var r = W ? 1 - Math.min(1, Math.max(0, n.respawnLift)) : F,
    o = r > O ? n.poseInMs : W ? n.respawnLiftMs : n.poseOutMs;
  O = H(O, r, i, o / 3);
  var a = Math.max(5, n.biteMs);
  ((q *= Math.exp(-i / (0.45 * a))),
    (C = H(C, q, i, 0.12 * a)),
    (G.amt *= Math.exp(-i / (0.6 * a))));
  var s = (n.instability + (t.instability || 0)) * B;
  if (s > 0 && A() < (s * (1 + 2 * j) * i) / 1e3) {
    var u = A() * Math.PI * 2,
      l = (2.5 + 3.5 * A()) * t.fx;
    ((T.x += Math.cos(u) * l),
      (T.y += Math.sin(u) * l),
      (T.r += 4 * (A() - 0.5) * S * t.fx));
  }
  var d = Math.exp(-i / 70);
  if (((T.x *= d), (T.y *= d), (T.r *= d), !K())) return ((E = null), U());
  var c,
    f,
    p = (f = (c = B) < 0 ? 0 : c > 1 ? 1 : c) * f * (3 - 2 * f),
    h = j,
    g = O,
    v = R / 1e3;
  if (
    (_ &&
      (ee(E.pick, $(n, t, v, p, h, g, 0, 1)),
      J(E.offhandPick) &&
        ee(E.offhandPick, $(n, t, v + 0.013, p, h, g, 10, 0.85))),
    J(E.dogeStage))
  ) {
    var M =
        p *
        (n.idleShakePx + (n.drillShakePx - n.idleShakePx) * h) *
        t.fx *
        n.dogeFollow,
      y = ((R - n.dogeLagMs) / 1e3) * n.shakeHz * n.dogeHzScale,
      m =
        L(y, 21) * M -
        g * n.dogeBracePx -
        C * n.biteDepthPx * t.bite * 0.25 * n.dogeFollow,
      x = L(y, 22) * M;
    E.dogeStage.pivot.set(-m, -x);
  }
  if (J(E.rock)) {
    var w = 0,
      k = 0;
    if (!("function" == typeof E.isRockBroken && E.isRockBroken())) {
      var I = n.rockBuzzPx * h * p * t.fx,
        N = v * n.shakeHz * 1.3;
      ((w = G.x * G.amt * n.rockNudgePx * t.fx + L(N, 31) * I),
        (k = G.y * G.amt * n.rockNudgePx * t.fx + L(N, 32) * I));
    }
    E.rock.pivot.set(-w, -k);
  }
  var V = U();
  return (V || Z(E), V);
}
var te,
  ie = {
    on: !1,
    drilling: !1,
    cutting: !1,
    variant: null,
    lastVariant: null,
    profileId: null,
    nextHitMs: 0,
    sinceHitMs: 1 / 0,
    hitGapMs: 0,
    lastToggleAt: -1 / 0,
    burstLeftMs: 0,
    pressed: !1,
    hits: 0,
    pausedBy: "",
  },
  re = 0,
  oe = null,
  ae = !1,
  se = [],
  ue = !1,
  le = !1,
  de = !1,
  ce = !1,
  fe = { pointer: !1, id: void 0, over: !1, x: 0, y: 0 };
function pe() {
  return "undefined" != typeof window ? window.dogeminer : void 0;
}
function he() {
  return "undefined" != typeof performance ? performance.now() : Date.now();
}
function ge() {
  var e = pe();
  return e && e.helperfunctions && e.helperfunctions.random
    ? e.helperfunctions.random()
    : Math.random();
}
function ve() {
  return b().enabled;
}
function Me() {
  var e,
    n,
    t = pe();
  return (
    ve() &&
    !!t &&
    o(a(t.player)) &&
    !!(
      (n = pe() && pe().miner) &&
      n.isReady &&
      n.isReady() &&
      n.allowMining()
    ) &&
    !((e = pe().gamecanvas) && e.hasRendererFailed && e.hasRendererFailed())
  );
}
function ye() {
  return !!pe().pauseEvents || r();
}
function me() {
  return !ie.on && Me() && ye();
}
function xe() {
  return (
    "undefined" != typeof document &&
    (!!document.querySelector(
      ".dm-updates:not([hidden]), .dm-demo:not([hidden])",
    ) ||
      (!!(e = document.querySelector(".sweet-alert")) &&
        (!!e.classList.contains("showSweetAlert") ||
          we(e) ||
          we(document.querySelector(".sweet-overlay")))))
  );
  var e;
}
function we(e) {
  if (!e || "none" === e.style.display) return !1;
  var n = window.getComputedStyle(e);
  return "none" !== n.display && "hidden" !== n.visibility;
}
function be(e) {
  ((ie.profileId = e),
    (function (e) {
      D = e;
    })(e));
  var n = P(e);
  M(n ? n.pitch : 1);
}
function ke(e) {
  if (e && ie.on)
    if (ye()) le = !0;
    else {
      le = !1;
      var n = w();
      ie.cutting ? n.cut || c(ie.variant) : n.idle || g(!0);
    }
}
function Pe() {
  var e = pe(),
    n = !(!e || !e.player || o(a(e.player)));
  ((ie.on = !1),
    (ie.drilling = !1),
    (le = !1),
    Ne(),
    Se(!0),
    y(),
    V(!1, n),
    X(!1),
    Y(!1));
}
function Se(e) {
  ie.cutting && ((ie.cutting = !1), (ie.variant = null), e || p(), X(!1));
}
function Ie(e) {
  return (
    fe.pointer &&
    (void 0 === fe.id || !e || void 0 === e.pointerId || e.pointerId === fe.id)
  );
}
function Le(e) {
  e &&
    e.global &&
    Ie(e) &&
    ((fe.over = !0), (fe.x = e.global.x), (fe.y = e.global.y));
}
function He() {
  if (!fe.over)
    return (function () {
      if (K()) {
        var e = E.pick,
          t = e.texture ? e.texture.height : 0,
          i = e.toGlobal(new n(0, -t * e.anchor.y * 0.9));
        return {
          getLocalPosition: function (e) {
            return e.toLocal(i);
          },
        };
      }
    })();
  var e = fe.x,
    t = fe.y;
  return {
    getLocalPosition: function (i) {
      return i.toLocal(new n(e, t));
    },
  };
}
function Ee() {
  var e = pe(),
    n = e.miner;
  if (!n.isRockBroken()) {
    var i,
      r,
      o = n.isDualWielding() && t(ge);
    (e.rock.mineRock(
      He(),
      o,
      ((i = b()),
      (r = P(ie.profileId)),
      {
        hitSound: i.hitSounds,
        critSound: i.critSounds,
        textChance: i.textChance,
        strength: i.strength * (r ? r.strength : 1),
      }),
    ),
      (function (e) {
        q = e ? 1.4 : 1;
        var n = A() * Math.PI * 2;
        ((G.x = Math.cos(n)), (G.y = 0.6 * Math.sin(n)), (G.amt = e ? 1.5 : 1));
      })(o),
      ie.hits++,
      (ie.sinceHitMs = 0));
    var a = b().particlesEvery;
    a > 0 &&
      ie.hits % a === 0 &&
      !e.player.highperformance &&
      n.rockHitParticles();
    var s = he();
    for (se.push(s); se.length && s - se[0] > 1e3; ) se.shift();
  }
}
function De() {
  var e,
    n = Me();
  if (!n && ie.on) Pe();
  else if (n && !ie.on && he() >= re && !ye())
    ((e = pe()),
      (ie.on = !0),
      (ie.drilling = !1),
      be(a(e.player)),
      N(e.miner.getDrillRig()),
      V(!0),
      m() ? g(!0) : h().then(ke),
      je());
  else if (ie.on) {
    var t = a(pe().player);
    (t !== ie.profileId && be(t), K() || Re());
  }
}
function Re() {
  var e = pe().miner.getDrillRig();
  e && N(e);
}
function Be(e) {
  if ((De(), ie.on)) {
    le && !ye() && ke(!0);
    var n = b();
    ((ie.sinceHitMs += e),
      "burst" === n.trigger &&
        ie.drilling &&
        ((ie.burstLeftMs -= e), ie.burstLeftMs <= 0 && (ie.drilling = !1)),
      "hold" !== n.trigger || ie.pressed || (ie.drilling = !1));
    var t = ie.drilling
      ? ((o = pe()),
        (a = o.miner).allowMining(!0)
          ? o.pauseEvents
            ? "paused"
            : s()
              ? "story"
              : o.loot && o.loot.bagIsOpen && o.loot.bagIsOpen()
                ? "loot"
                : a.isMysteryBoxShowing && a.isMysteryBoxShowing()
                  ? "mysterybox"
                  : a.isInventoryOpen && a.isInventoryOpen()
                    ? "inventory"
                    : xe()
                      ? "dialog"
                      : b().pauseWhenUnfocused &&
                          o.hasWindowFocus &&
                          !o.hasWindowFocus()
                        ? "unfocused"
                        : b().rebiteOnNewRock && a.isRockBroken()
                          ? "rock"
                          : ""
          : "busy")
      : "idle";
    if (((ie.pausedBy = ie.drilling ? t : ""), ie.drilling && !t)) {
      if (
        (ie.cutting ||
          ((r = k(ge, ie.lastVariant)),
          (ie.variant = ie.lastVariant = r),
          (ie.cutting = !0),
          (ie.nextHitMs = Math.max(0, ie.hitGapMs - ie.sinceHitMs)),
          c(r),
          X(!0)),
        (ie.nextHitMs -= e),
        ie.nextHitMs <= 0)
      ) {
        Ee();
        var i = d(ge, P(ie.profileId), x(ie.variant));
        ((ie.nextHitMs = Math.max(0.5 * i, ie.nextHitMs + i)),
          (ie.hitGapMs = ie.nextHitMs));
      }
    } else ie.cutting && Se(!1);
    Y(ie.drilling && "rock" === t);
  }
  var r, o, a;
}
function ze(n) {
  var t = Math.min(n.deltaMS, 250);
  (Be(t), l());
  var i = ne(t);
  ie.on ||
    i ||
    me() ||
    (function () {
      if (!ae) return;
      ((ae = !1),
        e.shared.remove(ze),
        Z(E),
        (B = z = j = F = O = q = C = 0),
        (W = !1),
        (G.amt = 0),
        (T.x = T.y = T.r = 0));
    })();
}
function je() {
  ae || ((ae = !0), e.shared.add(ze));
}
function Fe() {
  ie.on && Be(0);
}
function Oe() {
  var e;
  ue ||
    ((ue = !0),
    (e = Math.random),
    (A = "function" == typeof e ? e : Math.random),
    u(Fe),
    "undefined" != typeof window &&
      window.dogeminerdevmode &&
      (window.__drill = {
        status: Qe,
        press: function () {
          return Ve();
        },
        release: function () {
          Xe();
        },
        toggle: Ke,
        sync: We,
        config: b(),
        profile: P,
      }));
}
function We(e) {
  var n = pe();
  if (n && n.player) {
    if (
      ("equip" === e &&
        ((re = he() + 200),
        clearTimeout(oe),
        (oe = setTimeout(function () {
          We("equip-settled");
        }, 210))),
      ve() && i(n.player))
    ) {
      var t = ie.on && !m(),
        r = h();
      t && r.then(ke);
    }
    (("feature-off" !== e && ve()) || (ie.on && Pe()),
      "tune" === e && (ie.on && be(ie.profileId), v()),
      De(),
      ie.on && Re(),
      (ie.on || U() || me()) && je());
  }
}
function qe() {
  Ne();
}
function Ce(e) {
  return (
    ce && (void 0 === te || !e || void 0 === e.pointerId || e.pointerId === te)
  );
}
function Ge(e) {
  Ce(e) && Ne();
}
function Te() {
  "undefined" != typeof document && document.hidden && Ne();
}
function _e(e) {
  Ce(e) && 0 === e.buttons && Ne();
}
function Ae(e) {
  !ce &&
    (function (e) {
      return (
        "Space" === e.code ||
        " " === e.key ||
        "Spacebar" === e.key ||
        32 === e.keyCode
      );
    })(e) &&
    Ne();
}
function Ne() {
  var e = ie.pressed;
  ((ie.pressed = !1),
    (ce = !1),
    (te = void 0),
    de &&
      ((de = !1),
      window.removeEventListener("pointerup", Ge, !0),
      window.removeEventListener("pointercancel", Ge, !0),
      window.removeEventListener("pointermove", _e, !0),
      window.removeEventListener("keyup", Ae, !0),
      window.removeEventListener("blur", qe),
      "undefined" != typeof document &&
        document.removeEventListener("visibilitychange", Te)),
    e && ((ie.drilling = !1), ie.on && Se(!1)));
}
function Ve(e) {
  if ((ie.on || De(), !ie.on)) return Me();
  !(function (e) {
    var n = e && e.global;
    ((fe.pointer = fe.over = !!n),
      (fe.id = n ? e.pointerId : void 0),
      n && ((fe.x = n.x), (fe.y = n.y)));
  })(e);
  var n = b(),
    t = he();
  if ("hold" === n.trigger)
    ((ie.pressed = !0),
      (ce = !!e),
      (te = e ? e.pointerId : void 0),
      (ie.drilling = !0),
      de ||
        "undefined" == typeof window ||
        ((de = !0),
        window.addEventListener("pointerup", Ge, !0),
        window.addEventListener("pointercancel", Ge, !0),
        window.addEventListener("pointermove", _e, !0),
        window.addEventListener("keyup", Ae, !0),
        window.addEventListener("blur", qe),
        "undefined" != typeof document &&
          document.addEventListener("visibilitychange", Te)));
  else if ("burst" === n.trigger)
    ((ie.drilling = !0), (ie.burstLeftMs = n.burstMs));
  else {
    if (t - ie.lastToggleAt < n.toggleDebounceMs) return !0;
    ((ie.lastToggleAt = t), (ie.drilling = !ie.drilling));
  }
  return (Be(0), !0);
}
function Xe(e) {
  (e && ce && !Ce(e)) || Ne();
}
function Ye(e) {
  (Ie(e) && (fe.over = !1),
    ie.pressed && Ce(e) && "hold" === b().trigger && (ie.drilling = !1));
}
function Ue(e) {
  Le(e);
}
function Je(e) {
  return (
    Le(e),
    !(!ie.on || !ie.pressed || ie.drilling || "hold" !== b().trigger) &&
      !!Ce(e) &&
      (ce && e && 0 === e.buttons
        ? (Ne(), !1)
        : ((ie.drilling = !0), Be(0), !0))
  );
}
function Ke() {
  if (!ie.on) return !1;
  var e = b();
  if ("hold" === e.trigger) {
    if (!ie.pressed) return Ve();
    Ne();
  } else
    ((ie.drilling = !ie.drilling),
      ie.drilling && "burst" === e.trigger && (ie.burstLeftMs = e.burstMs));
  return (Be(0), !0);
}
function Qe() {
  var e = w();
  return {
    gate: ve(),
    on: ie.on,
    trigger: b().trigger,
    pressed: ie.pressed,
    drilling: ie.drilling,
    cutting: ie.cutting,
    variant: ie.variant,
    profile: ie.profileId,
    pausedBy: ie.pausedBy,
    hits: ie.hits,
    hitsPerSec: se.length,
    audio: e,
    fx: {
      level: B,
      drill: j,
      pose: O,
      poseHeld: W,
      bite: C,
      bound: K(),
      profile: D,
    },
  };
}
var Ze = {
  spinup: function () {
    return h().then(function (e) {
      return (e && (f(20), g(!0)), e);
    });
  },
  cut: function (e) {
    return h().then(function (n) {
      return (n && c(e || k(ge, ie.lastVariant)), n);
    });
  },
  stopCut: function () {
    p();
  },
  windDown: function () {
    y();
  },
  silence: function () {
    f(60);
  },
};
export {
  ie as _state,
  Be as _step,
  Ze as audition,
  Qe as getStatus,
  Oe as init,
  Ve as onMineDown,
  Je as onMineEnter,
  Ye as onMineLeave,
  Ue as onMineMove,
  Xe as onMineUp,
  We as sync,
};
