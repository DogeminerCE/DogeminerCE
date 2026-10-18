import { n as o } from "./rolldown-runtime-B9HzOTsb.js";
import { M as e, N as t, O as n, P as a, j as i } from "./pixi-CzhK9Vru.js";
import {
  d as r,
  i as s,
  l,
  n as d,
  r as u,
  s as p,
} from "./vendor-BBzg8X1X.js";
var c = o({
    destroySprite: () => h,
    destroyTree: () => b,
    detachFromLayers: () => U,
    getArray: () => w,
    pause: () => x,
    prepareForDestroy: () => k,
    resetArray: () => g,
    resume: () => m,
  }),
  f = [],
  y = !0,
  v = !1;
function h(o, e) {
  (e && void 0 !== o && (o._dogetexture = !0),
    !v && y
      ? ((y = !1),
        (function (o) {
          requestAnimationFrame(() => {
            v
              ? ((y = !0), void 0 !== o && (o.destroyed || f.push(o)))
              : (void 0 === o && f.length > 0 && (o = f.pop()),
                void 0 === o || o.destroyed
                  ? (void 0 === o || o.destroyed) && (y = !0)
                  : (o._dogetexture ? o.destroy(!0) : o.destroy(), (y = !0)),
                f.length > 0 && h());
          });
        })(o))
      : f.push(o));
}
function x() {
  ((v = !0), (y = !0));
}
function m() {
  ((v = !1), (y = !0));
}
function g() {
  ((f = []), (y = !0));
}
function w() {
  return f;
}
function U(o) {
  if (o && (o.parentRenderLayer && o.parentRenderLayer.detach(o), o.children))
    for (var e = 0; e < o.children.length; e++) U(o.children[e]);
}
function k(o) {
  if (o && ((o.renderable = !1), o.children))
    for (var e = 0; e < o.children.length; e++) k(o.children[e]);
}
function b(o, e) {
  var t = [];
  C(o, Object.assign({}, e, { children: !1 }), t);
  for (var n = 1; n < t.length; n++)
    console.error("destroyTree: another listener threw:", t[n]);
  if (t.length > 0) throw t[0];
}
function C(o, e, t) {
  if (o) {
    for (
      var n = o.children ? o.children.slice().reverse() : [], a = 0;
      a < n.length;
      a++
    )
      if (n[a].parent === o)
        try {
          o.removeChild(n[a]);
        } catch (r) {
          t.push(r);
        }
    if (!o.destroyed)
      try {
        o.destroy(e);
      } catch (r) {
        t.push(r);
      }
    for (var i = 0; i < n.length; i++) C(n[i], e, t);
  }
}
var T =
    "\nstruct GlobalFilterUniforms {\n  uInputSize: vec4<f32>, uInputPixel: vec4<f32>, uInputClamp: vec4<f32>,\n  uOutputFrame: vec4<f32>, uGlobalFrame: vec4<f32>, uOutputTexture: vec4<f32>,\n};\nstruct GradientUniforms {\n  uTime: f32, uSpeed: f32, uAngle: f32, uWidth: f32, uSaturation: f32,\n};\n@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;\n@group(0) @binding(1) var uTexture: texture_2d<f32>;\n@group(0) @binding(2) var uSampler: sampler;\n@group(1) @binding(0) var<uniform> gradientUniforms: GradientUniforms;\nstruct VertexOutput {\n  @builtin(position) position: vec4<f32>,\n  @location(0) uv: vec2<f32>,\n};\n@vertex\nfn mainVertex(@location(0) aPosition: vec2<f32>) -> VertexOutput {\n  var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;\n  position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;\n  position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;\n  return VertexOutput(vec4<f32>(position, 0.0, 1.0),\n    aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw));\n}\nfn hsl2rgb(h: f32, s: f32, l: f32) -> vec3<f32> {\n  let c = (1.0 - abs(2.0 * l - 1.0)) * s;\n  let hp = h * 6.0;\n  let x = c * (1.0 - abs((hp % 2.0) - 1.0));\n  let m = l - c * 0.5;\n  var rgb: vec3<f32>;\n  if (hp < 1.0) { rgb = vec3<f32>(c, x, 0.0); }\n  else if (hp < 2.0) { rgb = vec3<f32>(x, c, 0.0); }\n  else if (hp < 3.0) { rgb = vec3<f32>(0.0, c, x); }\n  else if (hp < 4.0) { rgb = vec3<f32>(0.0, x, c); }\n  else if (hp < 5.0) { rgb = vec3<f32>(x, 0.0, c); }\n  else { rgb = vec3<f32>(c, 0.0, x); }\n  return rgb + vec3<f32>(m);\n}\n@fragment\nfn mainFragment(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {\n  let texel = textureSample(uTexture, uSampler, uv);\n  if (texel.a < 0.001) { return texel; }\n  let angle = gradientUniforms.uAngle;\n  let t = uv.x * cos(angle) + uv.y * sin(angle);\n  let hue = fract(t * gradientUniforms.uWidth + gradientUniforms.uTime * gradientUniforms.uSpeed);\n  let rgb = hsl2rgb(hue, gradientUniforms.uSaturation, 0.6);\n  return vec4<f32>(rgb * texel.a, texel.a);\n}\n",
  I = {
    rainbow: { speed: 0.4, angle: 0, width: 1, saturation: 1 },
    gold: { speed: 0.3, angle: 0.2, width: 0.5, saturation: 0.8 },
    holo: { speed: 0.6, angle: 0.3, width: 2, saturation: 0.9 },
    fire: { speed: 0.5, angle: 0, width: 0.3, saturation: 1 },
    ice: { speed: 0.2, angle: 0, width: 0.4, saturation: 0.7 },
    doge: { speed: 0.35, angle: 0.1, width: 0.6, saturation: 0.85 },
  },
  M = class o extends n {
    constructor(o) {
      var t = o || {},
        n = t.preset ? I[t.preset] || I.rainbow : {},
        a = null != t.speed ? t.speed : null != n.speed ? n.speed : 0.4,
        r = null != t.angle ? t.angle : null != n.angle ? n.angle : 0,
        s = null != t.width ? t.width : null != n.width ? n.width : 1,
        l =
          null != t.saturation
            ? t.saturation
            : null != n.saturation
              ? n.saturation
              : 1;
      (super({
        glProgram: e.from({
          vertex:
            "in vec2 aPosition;\nout vec2 vTextureCoord;\n\nuniform vec4 uInputSize;\nuniform vec4 uOutputFrame;\nuniform vec4 uOutputTexture;\n\nvec4 filterVertexPosition(void)\n{\n    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;\n    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;\n    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;\n    return vec4(position, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord(void)\n{\n    return aPosition * (uOutputFrame.zw * uInputSize.zw);\n}\n\nvoid main(void)\n{\n    gl_Position = filterVertexPosition();\n    vTextureCoord = filterTextureCoord();\n}\n",
          fragment:
            "in vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform float uTime;\nuniform float uSpeed;\nuniform float uAngle;\nuniform float uWidth;\nuniform float uSaturation;\n\nvec3 hsl2rgb(float h, float s, float l)\n{\n    float c = (1.0 - abs(2.0 * l - 1.0)) * s;\n    float hp = h * 6.0;\n    float x = c * (1.0 - abs(mod(hp, 2.0) - 1.0));\n    float m = l - c * 0.5;\n    vec3 rgb;\n    if (hp < 1.0)      rgb = vec3(c, x, 0.0);\n    else if (hp < 2.0) rgb = vec3(x, c, 0.0);\n    else if (hp < 3.0) rgb = vec3(0.0, c, x);\n    else if (hp < 4.0) rgb = vec3(0.0, x, c);\n    else if (hp < 5.0) rgb = vec3(x, 0.0, c);\n    else                rgb = vec3(c, 0.0, x);\n    return rgb + m;\n}\n\nvoid main(void)\n{\n    vec4 texel = texture(uTexture, vTextureCoord);\n    if (texel.a < 0.001) {\n        finalColor = texel;\n        return;\n    }\n    float angle = uAngle;\n    float t = vTextureCoord.x * cos(angle) + vTextureCoord.y * sin(angle);\n    float hue = fract(t * uWidth + uTime * uSpeed);\n    vec3 rgb = hsl2rgb(hue, uSaturation, 0.6);\n    finalColor = vec4(rgb * texel.a, texel.a);\n}\n",
          name: "gradient-filter",
        }),
        gpuProgram: i.from({
          vertex: { source: T, entryPoint: "mainVertex" },
          fragment: { source: T, entryPoint: "mainFragment" },
        }),
        resources: {
          gradientUniforms: {
            uTime: { value: 0, type: "f32" },
            uSpeed: { value: a, type: "f32" },
            uAngle: { value: r, type: "f32" },
            uWidth: { value: s, type: "f32" },
            uSaturation: { value: l, type: "f32" },
          },
        },
      }),
        (this.uniforms = this.resources.gradientUniforms.uniforms));
    }
    static fromPreset(e) {
      return new o({ preset: e });
    }
  };
M.PRESETS = I;
var O = class extends n {
  constructor(o) {
    var t = o || {},
      n = t.resolution || [700, 700],
      a = null != t.seed ? t.seed : 1e3 * Math.random();
    (super({
      glProgram: e.from({
        vertex:
          "in vec2 aPosition;\nout vec2 vTextureCoord;\n\nuniform vec4 uInputSize;\nuniform vec4 uOutputFrame;\nuniform vec4 uOutputTexture;\n\nvec4 filterVertexPosition(void)\n{\n    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;\n    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;\n    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;\n    return vec4(position, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord(void)\n{\n    return aPosition * (uOutputFrame.zw * uInputSize.zw);\n}\n\nvoid main(void)\n{\n    gl_Position = filterVertexPosition();\n    vTextureCoord = filterTextureCoord();\n}\n",
        fragment:
          "precision highp float;\nin vec2 vTextureCoord;\nout vec4 finalColor;\nuniform sampler2D uTexture;\nuniform vec4 uInputSize;\nuniform float uTime;\nuniform vec2  uResolution;\nuniform float uSeed;\n\nfloat hash11(float p){ p = fract(p*0.1031); p *= p+33.33; p *= p+p; return fract(p); }\nfloat hash21(vec2 p){\n  p = fract(p*vec2(123.34, 456.21));\n  p += dot(p, p+45.32);\n  return fract(p.x*p.y);\n}\n\nfloat snoise(vec2 p){\n  vec2 i = floor(p), f = fract(p);\n  vec2 u = f*f*(3.0-2.0*f);\n  float a = hash21(i);\n  float b = hash21(i+vec2(1,0));\n  float c = hash21(i+vec2(0,1));\n  float d = hash21(i+vec2(1,1));\n  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);\n}\n\nfloat tendril(vec2 p, vec2 origin, vec2 dir, float length, float thickness, float seedOff){\n  vec2 d = p - origin;\n  float t = dot(d, dir);\n  float along = t / length;\n  if(along < 0.0 || along > 1.0) return 0.0;\n  vec2 perp = vec2(-dir.y, dir.x);\n  float side = dot(d, perp);\n  float warp = (snoise(vec2(t*0.05 + seedOff, seedOff*1.7)) - 0.5) * 60.0;\n  warp += (snoise(vec2(t*0.18 + seedOff*2.0, seedOff)) - 0.5) * 14.0;\n  float dx = abs(side - warp);\n  float core = exp(-dx*dx/(thickness*thickness));\n  float taper = smoothstep(0.0, 0.06, along) * smoothstep(1.0, 0.55, along);\n  return core * taper;\n}\n\nfloat radialGate(vec2 p, vec2 c, float gateRadius){\n  float r = length(p - c);\n  return 1.0 - smoothstep(gateRadius*0.55, gateRadius, r);\n}\n\nvoid main(){\n  vec2 fragCoord = vTextureCoord * uInputSize.xy;\n  vec2 p = fragCoord;\n  vec2 center = uResolution * 0.5;\n  vec2 strikeC = center;\n\n  float T = 4.5;\n  float t = mod(uTime, T);\n  float tailFade = 1.0 - smoothstep(3.25, 4.40, t);\n\n  float gate = radialGate(p, strikeC, 440.0);\n  if(gate <= 0.0){\n    finalColor = vec4(0.0);\n    return;\n  }\n\n  float strikeDist = length(p - strikeC);\n\n  float lightning = 0.0;\n  float halo = 0.0;\n\n  // ===== CRACKLE 1 (0.30 - 0.55) =====\n  if(t > 0.28 && t < 0.58){\n    float ct = (t - 0.28)/0.30;\n    float env = exp(-ct*9.0) + exp(-pow(ct-0.35,2.0)*40.0)*0.6;\n    env *= 0.55;\n    float angle = uSeed*1.7 + 1.2;\n    float arc = 0.0;\n    for(int i=0;i<3;i++){\n      float fi = float(i);\n      float a = angle + fi*2.094 + sin(uSeed+fi)*0.4;\n      vec2 dir = vec2(cos(a), sin(a));\n      arc += tendril(p, strikeC, dir, 80.0 + 30.0*hash11(uSeed+fi), 1.8, uSeed+fi*4.3+1.0);\n    }\n    lightning += arc * env * 1.4;\n    halo += env * exp(-strikeDist*strikeDist/(110.0*110.0)) * 0.6;\n  }\n\n  // ===== CRACKLE 2 (0.80 - 1.05) =====\n  if(t > 0.78 && t < 1.10){\n    float ct = (t - 0.78)/0.32;\n    float env = exp(-ct*7.0) + exp(-pow(ct-0.30,2.0)*30.0)*0.7;\n    env *= 0.85;\n    float angle = uSeed*2.3 + 0.4;\n    float arc = 0.0;\n    for(int i=0;i<4;i++){\n      float fi = float(i);\n      float a = angle + fi*1.5707 + sin(uSeed*2.0+fi)*0.5;\n      vec2 dir = vec2(cos(a), sin(a));\n      arc += tendril(p, strikeC, dir, 120.0 + 50.0*hash11(uSeed+fi+10.0), 2.0, uSeed+fi*5.1+20.0);\n    }\n    lightning += arc * env * 1.3;\n    halo += env * exp(-strikeDist*strikeDist/(140.0*140.0)) * 0.8;\n  }\n\n  // ===== IMPACT FLASH (2.05 - 2.40) =====\n  if(t > 2.03 && t < 2.50){\n    float ft = clamp((t - 2.05)/0.25, 0.0, 1.5);\n    float pulse = exp(-ft*7.0) + exp(-ft*1.6)*0.45;\n    halo += pulse * exp(-strikeDist*strikeDist/(70.0*70.0)) * 2.6;\n    halo += pulse * exp(-strikeDist*strikeDist/(220.0*220.0)) * 1.0;\n  }\n\n  // ===== TENDRILS (2.20 - 3.25) =====\n  if(t > 2.18 && t < 3.30){\n    float tt = clamp((t - 2.20)/1.05, 0.0, 1.0);\n    float aliveEnv = smoothstep(0.0, 0.12, tt) * (1.0 - smoothstep(0.82, 1.0, tt));\n    const int N = 28;\n    float arc = 0.0;\n    for(int i=0;i<N;i++){\n      float fi = float(i);\n      float baseAng = fi * (6.2831853/float(N)) + uSeed*0.7;\n      float phase = fi*0.4 + hash11(uSeed + fi)*1.5;\n      float life = max(0.0, sin(tt*3.14159*2.5 + phase));\n      life *= aliveEnv;\n      if(life < 0.02) continue;\n      float reach = (sin(tt*3.14*1.5 + fi*0.5)*0.5+0.5) * 320.0 + 60.0;\n      reach *= 0.7 + 0.6*hash11(uSeed + fi*2.7);\n      float ang = baseAng + 0.18*sin(uTime*3.0 + fi);\n      vec2 dir = vec2(cos(ang), sin(ang));\n      arc += tendril(p, strikeC, dir, reach, 2.2, uSeed + fi*3.1 + tt*2.0) * life;\n    }\n    lightning += arc * 1.6;\n    halo += aliveEnv * exp(-strikeDist*strikeDist/(160.0*160.0)) * 0.55;\n  }\n\n  vec3 boltColor = vec3(0.95, 0.97, 1.0);\n  vec3 haloColor = vec3(0.45, 0.62, 1.0);\n\n  vec3 col =\n    lightning * mix(haloColor, boltColor, clamp(lightning, 0.0, 1.0)) +\n    halo * haloColor;\n\n  col *= tailFade;\n  col *= gate;\n\n  col = col / (1.0 + col*0.5);\n\n  float a = clamp(max(max(col.r, col.g), col.b), 0.0, 1.0);\n  a = pow(a, 0.85);\n\n  finalColor = vec4(col, a);\n}\n",
        name: "lightning-filter",
      }),
      resources: {
        lightningUniforms: {
          uTime: { value: 0, type: "f32" },
          uResolution: {
            value: new Float32Array([n[0], n[1]]),
            type: "vec2<f32>",
          },
          uSeed: { value: a, type: "f32" },
        },
      },
    }),
      (this.uniforms = this.resources.lightningUniforms.uniforms));
  }
};
function S() {
  return !(!window.dogeminer || !window.dogeminer.webGL);
}
function F(o, e) {
  if (S()) {
    var t = e || {};
    o.filters = [
      new s({
        thickness: null != t.thickness ? t.thickness : 2,
        color: null != t.color ? t.color : 0,
        quality: null != t.quality ? t.quality : 0.25,
      }),
    ];
  }
}
function P(o) {
  S() && (o.filters = null);
}
function X(o, e) {
  if (S()) {
    var t = e || {},
      n = null != t.distance ? t.distance : 4,
      a = null != t.rotation ? t.rotation : Math.PI / 4;
    o.filters = [
      new p({
        color: null != t.color ? t.color : 0,
        offset: { x: n * Math.sin(a), y: n * Math.cos(a) },
        alpha: null != t.alpha ? t.alpha : 0.5,
        blur: null != t.blur ? t.blur : 4,
        quality: null != t.quality ? t.quality : 1,
        resolution: 2,
      }),
    ];
  }
}
function _(o, e) {
  S() && (o.filters = e);
}
function q(o, e) {
  S() && (o.filters = o.filters && o.filters.length ? [...o.filters, e] : [e]);
}
function A(o, e) {
  if (S() && o && !o.destroyed && o.filters) {
    var t = (Array.isArray(o.filters) ? o.filters : [o.filters]).filter(
      function (o) {
        return o !== e;
      },
    );
    o.filters = t.length ? t : null;
  }
}
function Y(o) {
  return window.dogeminer?.rendererCapabilities?.proceduralLightning
    ? new O(o)
    : null;
}
var D = [
    [0, 0, 0, 0],
    [0.028, 4.5, 1.8, -0.035],
    [0.055, -3, -1.2, 0.026],
    [0.08, 0, 0, 0],
    [0.11, 0, 0, 0],
    [0.133, 2.8, 1.1, -0.02],
    [0.159, -1.6, -0.6, 0.012],
    [0.21, 0, 0, 0],
  ],
  E = D[D.length - 1][0];
function z(o, e) {
  if (o.destroyed) return;
  let t = 1;
  for (; t < D.length - 1 && e > D[t][0]; ) t++;
  const n = D[t - 1],
    a = D[t],
    i = Math.max(0, Math.min(1, (e - n[0]) / (a[0] - n[0])));
  (o.pivot.set(n[1] + (a[1] - n[1]) * i, n[2] + (a[2] - n[2]) * i),
    (o.rotation = n[3] + (a[3] - n[3]) * i));
}
function L(o) {
  if (((o._recordCritPop = !0), dogeminer.webGL)) {
    if (!o._recordCritFilters) {
      const e = new l({
        type: l.LINEAR,
        angle: 24,
        alpha: 0.9,
        replace: !1,
        stops: [
          { offset: 0, color: 0, alpha: 0.1 },
          { offset: 0.27, color: 0, alpha: 0.18 },
          { offset: 0.34, color: 0, alpha: 0.52 },
          { offset: 0.37, color: 0, alpha: 0.12 },
          { offset: 0.59, color: 0, alpha: 0.23 },
          { offset: 0.62, color: 0, alpha: 0.6 },
          { offset: 0.67, color: 0, alpha: 0.18 },
          { offset: 1, color: 0, alpha: 0.1 },
        ],
      });
      ((e.resolution = "inherit"),
        (o._recordCritFilters = [e]),
        o.once("destroyed", () => {
          (e.destroy(), (o._recordCritFilters = null));
        }));
    }
    o.filters = o._recordCritFilters;
  } else o.tint = 13158600;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ? void 0
    : z;
}
function R(o) {
  o._recordCritPop &&
    ((o._recordCritPop = !1),
    o.destroyed ||
      ((o.filters = null),
      (o.tint = 16777215),
      o.pivot.set(0, 0),
      (o.rotation = 0)));
}
var G = o({
  animateButton: () => Xo,
  animateRocket: () => ne,
  autoLootFly: () => lt,
  beginLootDespawning: () => je,
  bounceIn: () => Yo,
  bounceInShop: () => Do,
  breatheScale: () => yt,
  cardHover: () => mt,
  cardTiltTransform: () => ht,
  changePickaxe: () => Lo,
  coinPopFly: () => ct,
  coinsClick: () => Fe,
  containerEnter: () => Pe,
  dip: () => fe,
  driveKitler: () => Qe,
  enterFromTeleport: () => Me,
  fadeAlpha: () => Ue,
  fadeIn: () => te,
  fadeInDelay: () => Xe,
  fadeInLeft: () => oe,
  fadeInRight: () => ee,
  fadeInSafe: () => $e,
  fadeOut: () => No,
  fadeOut2: () => Ho,
  fadeOutDelay: () => Vo,
  fadeOutLeft: () => Zo,
  fadeOutRight: () => $o,
  fadeOutSafe: () => Bo,
  fadeOutUp: () => Ko,
  fadeTo: () => Go,
  fallIn: () => Be,
  flash: () => Eo,
  flashInfinite: () => zo,
  float: () => So,
  floatPrecise: () => Po,
  floatSafe: () => Ze,
  flyArrowTo: () => nt,
  flyByItem: () => tt,
  glowSafe: () => Je,
  grabItem: () => Wo,
  growIn: () => Ie,
  growInBounce: () => Oe,
  growInBounceFriendly: () => Se,
  growShrinkFade: () => Fo,
  gsap: () => r,
  heartbeat: () => He,
  hideLevel: () => rt,
  hopY: () => ue,
  jumpUp: () => ye,
  justFadeOutAndUp: () => Jo,
  moveTo: () => Re,
  moveX: () => le,
  moveY: () => ve,
  mysteryBoxReady: () => pt,
  pick: () => _e,
  pivot: () => he,
  planetAtmosphere: () => H,
  popFadeContinual: () => Qo,
  popScale: () => ge,
  punchScale: () => ft,
  rgbwow: () => Le,
  rotateFX: () => ut,
  safeDestroy: () => jo,
  scale: () => xe,
  scaleFadeInSafe: () => ot,
  scaleFadeOutSafe: () => et,
  scaleInSafe: () => me,
  scaleOutBouncy: () => we,
  scaleX: () => ke,
  seekHop: () => ce,
  shakeX: () => de,
  shockwave: () => Ge,
  shootProjectile: () => dt,
  shrinkOut: () => be,
  shrinkOutX: () => Te,
  shrinkOutY: () => Ce,
  slashMove: () => st,
  slideInRight: () => ae,
  slideInRightGeneric: () => ie,
  slideNews: () => it,
  slideOutLeft: () => re,
  slideOutLeftAndDestroy: () => se,
  slightFadeSafe: () => at,
  spawnLoot: () => We,
  specialPick: () => De,
  specialUnpick: () => Ee,
  spinX: () => Ke,
  stopEverything: () => Ne,
  stopPickaxe: () => Ro,
  swingPickaxe: () => qe,
  switchPage: () => _o,
  tada: () => qo,
  tadaDelay: () => Ao,
  triggered: () => Oo,
  unpick: () => Ye,
});
function N(o) {
  return ((o.stop = () => o.kill()), o);
}
function B(o, e, t) {
  if (void 0 !== o && !o.destroyed) {
    for (
      var n = e.length,
        a = function () {
          for (var o = 0; o < e.length; o++) e[o].kill();
          void 0 !== t && t();
        },
        i = function (e) {
          var t = !1,
            i = function (i) {
              var r = e.eventCallback(i);
              e.eventCallback(i, function () {
                (t ||
                  ((t = !0), 0 !== --n || o.destroyed || o.off("removed", a)),
                  r && r.apply(this, arguments));
              });
            };
          (i("onComplete"), i("onInterrupt"));
        },
        r = 0;
      r < e.length;
      r++
    )
      i(e[r]);
    o.once("removed", a);
  }
}
function H(o, e, t, n = 0, a = 0.3) {
  ((e.wind = n), (e.wind2 = a));
  const i = r.timeline();
  return (
    i.to(
      e,
      { wind: n + 2 * Math.PI, duration: t, repeat: -1, ease: "none" },
      0,
    ),
    i.to(
      e,
      { wind2: a + 2 * Math.PI, duration: 1.6 * t, repeat: -1, ease: "none" },
      0,
    ),
    N(i),
    B(o, [i]),
    i
  );
}
var V,
  W = (o) => 1 - Math.pow(1 - o, 4),
  j = (o) => 1 - Math.pow(1 - o, 2);
function K(o, e, n, i, r) {
  const s = t.shared,
    l = performance.now(),
    d = n - e;
  let u = !0;
  const p = () => {
    if (o.destroyed) return c();
    const t = Math.min((performance.now() - l) / i, 1);
    ((o.rotation = e + d * r(t)), t >= 1 && c());
  };
  function c() {
    u && ((u = !1), s.remove(p), o.off("removed", c), o.off("destroyed", c));
  }
  return (
    o.once("removed", c),
    o.once("destroyed", c),
    s.add(p, null, a.HIGH),
    { stop: c }
  );
}
function J() {
  !V &&
    "undefined" != typeof dogeminer &&
    dogeminer.helperfunctions &&
    (V = dogeminer.helperfunctions.random);
}
var Q,
  Z,
  $,
  oo,
  eo,
  to,
  no,
  ao,
  io,
  ro,
  so = "quad.inOut",
  lo = "sine.out",
  uo = "circ.inOut",
  po = "quad.inOut",
  co = "cubic.in",
  fo = "back.out",
  yo = "circ.inOut",
  vo = "back.in(1.8)",
  ho = "power2.out",
  xo = "sine.inOut",
  mo = "quart.out",
  go = "quad.inOut",
  wo = function (o) {
    var e = 2.5949095;
    return (o *= 2) < 1
      ? o * o * ((e + 1) * o - e) * 0.5
      : 0.5 * ((o -= 2) * o * ((e + 1) * o + e) + 2);
  },
  Uo = (Math.PI / 180) * -9,
  ko = (Math.PI / 180) * -10,
  bo = (Math.PI / 180) * 10,
  Co = !1,
  To = 5,
  Io = 220,
  Mo =
    ((oo = function (o) {
      return o;
    }),
    (eo = 1 - ($ = 0.5)),
    function (o) {
      return $ * Math.random() + eo * oo(o);
    });
function Oo(o, e, t) {
  var n = { x: o.position.x, y: o.position.y },
    a = { x: o.position.x, y: o.position.y },
    i = t / 1e3 / 2;
  N(
    (to = r.to(a, {
      keyframes: [
        { x: n.x + 2 * e, y: n.y - e / 2, duration: i },
        { x: n.x - 4 * e, y: n.y + e, duration: i },
      ],
      ease: Mo,
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o ||
          o.destroyed ||
          ((o.position.x = a.x), (o.position.y = a.y));
      },
      onComplete: function () {
        ((o.position.x = n.x), (o.position.y = n.y));
      },
    })),
  );
}
function So(o, e, t) {
  var n = { y: o.position.y },
    a = o.position.y,
    i = r.to(n, {
      y: a + e,
      duration: t / 1e3,
      ease: "sine.inOut",
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.y = n.y);
      },
      yoyo: !0,
      repeat: -1,
    });
  return (N(i), i);
}
function Fo(o, e, t = 0.5, n = 1.1) {
  var a;
  void 0 === o || o.destroyed || (a = { scale: o.scale.x, alpha: o.alpha });
  var i = r.to(void 0 !== a ? a : { scale: 1, alpha: 1 }, {
    scale: n,
    alpha: t,
    duration: e / 1e3,
    ease: "sine.inOut",
    overwrite: "auto",
    onUpdate: function () {
      void 0 === o ||
        o.destroyed ||
        ((o.scale.x = a.scale), (o.alpha = a.alpha));
    },
    yoyo: !0,
    repeat: -1,
  });
  return (N(i), i);
}
function Po(o, e, t) {
  var n, a;
  void 0 === o ||
    o.destroyed ||
    ((n = { y: o.position.y }), (a = o.position.y));
  var i = r.to(void 0 !== n ? n : { y: 0 }, {
    y: (void 0 !== a ? a : { y: 0 }) + e,
    duration: t / 1e3,
    ease: so,
    overwrite: "auto",
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.position.y = Math.floor(n.y));
    },
    yoyo: !0,
    repeat: -1,
  });
  return (N(i), i);
}
function Xo(o, e, t, n) {
  ("purchase" === e && Le(o),
    "hover" === e && ve(o, n - 4, 100),
    "idle" === e && ve(o, n, 150),
    "active" === e &&
      (ve(o, n + 4, 150, () => ve(o, n, 100)), xe(o, 0.8, 150)));
}
function _o(o, e, t) {
  var n;
  (void 0 !== ro &&
    ro !== t &&
    ro !== e &&
    !1 !== ro.visible &&
    (ro.visible = !1),
    void 0 !== no && (to.stop(), no.stop(), ao.stop(), io.stop()));
  ((n = "left" === o ? -1e3 : 1e3),
    (e.position.x = 0),
    (e.position.alpha = 1),
    (e.visible = !0),
    (t.alpha = 0),
    (t.position.x = n - 2 * n),
    (t.visible = !0));
  var a = { x: e.position.x },
    i = { alpha: e.alpha };
  (N(
    (ao = r.to(a, {
      x: n,
      duration: 0.2,
      ease: so,
      overwrite: "auto",
      onUpdate: function () {
        e.position.x = a.x;
      },
      onComplete: function () {
        e.visible = !1;
      },
    })),
  ),
    N(
      (io = r.to(i, {
        alpha: 0,
        duration: 0.1,
        overwrite: "auto",
        onUpdate: function () {
          e.alpha = i.alpha;
        },
      })),
    ));
  var s = { x: t.position.x };
  N(
    (to = r.to(s, {
      x: 0,
      duration: 0.2,
      ease: so,
      overwrite: "auto",
      onUpdate: function () {
        t.position.x = s.x;
      },
    })),
  );
  var l = { alpha: t.alpha };
  (N(
    (no = r.to(l, {
      alpha: 1,
      duration: 0.1,
      overwrite: "auto",
      onUpdate: function () {
        t.alpha = l.alpha;
      },
    })),
  ),
    (ro = e));
}
function qo(o) {
  var e = { alpha: o.alpha };
  r.to(e, {
    keyframes: [
      { alpha: 0, duration: 0.1 },
      { alpha: 1, duration: 0.1 },
    ],
    onUpdate: function () {
      o.alpha = e.alpha;
    },
  });
  var t = { x: 1, y: 1 };
  r.timeline()
    .to(t, {
      x: 0.6,
      y: 0.6,
      duration: 0.3,
      onUpdate: function () {
        ((o.scale.x = t.x), (o.scale.y = t.y));
      },
    })
    .to(t, {
      x: 1.2,
      y: 1.2,
      duration: 0.2,
      onUpdate: function () {
        ((o.scale.x = t.x), (o.scale.y = t.y));
      },
      onComplete: function () {
        r.to(t, {
          x: 1,
          y: 1,
          duration: 0.2,
          delay: 0.5,
          onUpdate: function () {
            ((o.scale.x = t.x), (o.scale.y = t.y));
          },
        });
      },
    });
  var n = { rotation: 0 },
    a = 0.7 / 6;
  r.timeline()
    .to(n, {
      rotation: Uo,
      duration: 0.2,
      onUpdate: function () {
        o.rotation = n.rotation;
      },
    })
    .to(n, {
      keyframes: [
        { rotation: bo, duration: a },
        { rotation: ko, duration: a },
        { rotation: bo, duration: a },
        { rotation: ko, duration: a },
        { rotation: bo, duration: a },
        { rotation: ko, duration: a },
      ],
      onUpdate: function () {
        o.rotation = n.rotation;
      },
    })
    .to(n, {
      rotation: 0,
      duration: 0.1,
      onUpdate: function () {
        o.rotation = n.rotation;
      },
    });
}
function Ao(o, e, t, n, a = 1, i = 1) {
  var s,
    l = { alpha: 1 },
    d = r.to(l, {
      alpha: 0,
      duration: 0.1,
      delay: e / 1e3,
      onUpdate: function () {
        o && !o.destroyed && (o.alpha = l.alpha);
      },
      onComplete: function () {
        void 0 === o ||
          o.destroyed ||
          (void 0 !== t && (o.textures = t),
          o.play(),
          (s = r.to(l, {
            alpha: 1,
            duration: 0.1,
            onUpdate: function () {
              void 0 === o || o.destroyed || (o.alpha = l.alpha);
            },
          })));
      },
    }),
    u = { x: 1, y: 1 },
    p = function () {
      void 0 !== o && o.myTadaTween === c && (o.myTadaTween = null);
    },
    c = r.timeline({
      delay: e / 1e3,
      onComplete: p,
      onInterrupt: function () {
        (p(),
          d.kill(),
          s && s.kill(),
          v && v.kill(),
          o &&
            !o.destroyed &&
            (void 0 !== t && (o.textures = t),
            (o.alpha = 1),
            (o.rotation = 0),
            (o.scale.x = a),
            (o.scale.y = i),
            o.play()));
      },
    });
  (void 0 !== o && (o.myTadaTween = c),
    c
      .to(u, {
        x: 0.6,
        y: 0.6,
        duration: 0.3,
        onUpdate: function () {
          void 0 === o || o.destroyed || ((o.scale.x = u.x), (o.scale.y = u.y));
        },
      })
      .to(u, {
        x: 1.2,
        y: 1.2,
        duration: 0.2,
        onUpdate: function () {
          void 0 === o || o.destroyed || ((o.scale.x = u.x), (o.scale.y = u.y));
        },
      }),
    c.call(function () {
      void 0 !== n && n();
    }),
    c.to(u, {
      x: a,
      y: i,
      duration: 0.2,
      delay: 0.5,
      onUpdate: function () {
        void 0 === o || o.destroyed || ((o.scale.x = u.x), (o.scale.y = u.y));
      },
    }));
  var f = { rotation: 0 },
    y = 0.7 / 6,
    v = r.timeline({ delay: e / 1e3 });
  v.to(f, {
    rotation: Uo,
    duration: 0.2,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.rotation = f.rotation);
    },
  })
    .to(f, {
      keyframes: [
        { rotation: bo, duration: y },
        { rotation: ko, duration: y },
        { rotation: bo, duration: y },
        { rotation: ko, duration: y },
        { rotation: bo, duration: y },
        { rotation: ko, duration: y },
      ],
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.rotation = f.rotation);
      },
    })
    .to(f, {
      rotation: 0,
      duration: 0.1,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.rotation = f.rotation);
      },
    });
}
function Yo(o) {
  void 0 === o || o.destroyed || (o.scale.x = o.scale.y = 0);
  var e = { alpha: 0 },
    t = r.to(e, {
      alpha: 1,
      duration: 0.3,
      ease: lo,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.alpha = e.alpha);
      },
    });
  N(t);
  var n = { x: 0, y: 0 },
    a = 0.125,
    i = r.to(n, {
      keyframes: [
        { x: 0.3, y: 0.3, duration: a },
        { x: 1.2, y: 1.2, duration: a },
        { x: 0.8, y: 0.8, duration: a },
        { x: 1.1, y: 1.1, duration: a },
        { x: 0.9, y: 0.9, duration: a },
        { x: 1, y: 1, duration: a },
      ],
      ease: lo,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.scale = n);
      },
    });
  (N(i), B(o, [t, i]));
}
function Do(o, e, t) {
  void 0 === o || o.destroyed || (o.scale.x = o.scale.y = 0);
  var n = { alpha: 0 };
  r.to(n, {
    alpha: 1,
    duration: 0.2,
    ease: lo,
    onUpdate: function () {
      o.alpha = n.alpha;
    },
  });
  var a = { scale: 0 },
    i = !1,
    s = 0.132,
    l = r.to(a, {
      keyframes: [
        { scale: e + 0.1, duration: s },
        { scale: e - 0.1, duration: s },
        { scale: e, duration: s },
      ],
      ease: lo,
      onUpdate: function () {
        void 0 === o ||
          o.destroyed ||
          ((o.scale.x = a.scale), (o.scale.y = a.scale));
      },
      onComplete: function () {
        (void 0 === o || o.destroyed || ((o.scale.x = e), (o.scale.y = e)),
          void 0 === t || i || ((i = !0), t()));
      },
      onInterrupt: function () {
        (void 0 === o || o.destroyed || ((o.scale.x = e), (o.scale.y = e)),
          void 0 === t || i || ((i = !0), t()));
      },
    });
  return (N(l), B(o, [l]), l);
}
function Eo(o, e, t) {
  if (e) {
    for (var n = 0; n < o.length; n++)
      if (void 0 !== o[n] && o[n]) {
        let e = {};
        e.alpha = o[n].alpha;
        var a = 0.125;
        r.to(e, {
          keyframes: [
            { alpha: 0, duration: a },
            { alpha: 1, duration: a },
            { alpha: 0, duration: a },
            { alpha: 1, duration: a },
          ],
          overwrite: "auto",
          onUpdate: function () {
            void 0 !== o[n] && o[n] && (o[n].alpha = e.alpha);
          },
        });
      }
  } else {
    let e = {};
    e.alpha = o.alpha;
    var i = t / 1e3 / 2;
    r.to(e, {
      keyframes: [
        { alpha: 0, duration: i },
        { alpha: 1, duration: i },
      ],
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.alpha = e.alpha);
      },
    });
  }
}
function zo(o, e, t = 0) {
  var n = { alpha: 0 },
    a = r.to(n, {
      alpha: 1,
      duration: e / 1e3,
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.alpha = n.alpha);
      },
      yoyo: !0,
      repeat: -1,
      delay: t / 1e3,
    });
  return (N(a), a);
}
function Lo(o, e, t, n, a) {
  var i;
  (Ro(o), (i = void 0 !== a ? 0 : n));
  var s = { alpha: o.alpha, x: e[0], y: e[1], rotation: i },
    l = t / 1e3 / 2;
  const d = r.to(s, {
    keyframes: [
      { alpha: 0, y: e[1] + 100, rotation: (Math.PI / 180) * 90, duration: l },
      { alpha: 1, y: e[1], rotation: i, duration: l },
    ],
    overwrite: "auto",
    onUpdate: function () {
      void 0 === o ||
        o.destroyed ||
        ((o.alpha = s.alpha),
        (o.position.y = s.y),
        (o.position.x = s.x),
        (o.rotation = s.rotation));
    },
  });
  return ((o._pickEquipTween = N(d)), B(o, [d]), d);
}
function Ro(o) {
  o &&
    (o._pickSwingTween?.stop(),
    o._pickEquipTween?.stop(),
    (o._pickSwingTween = null),
    (o._pickEquipTween = null));
}
function Go(o, e, t) {
  var n = { alpha: o.alpha },
    a = r.to(n, {
      alpha: t,
      duration: e / 1e3,
      onUpdate: function () {
        o.alpha = n.alpha;
      },
      onInterrupt: function () {
        o.alpha = t;
      },
    });
  return (N(a), a);
}
function No(o, e, t) {
  if (void 0 === o || o.destroyed) return { stop: () => {} };
  var n = { alpha: o.alpha },
    a = !1,
    i = r.to(n, {
      alpha: 0,
      duration: e / 1e3,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.alpha = n.alpha);
      },
      onComplete: function () {
        (void 0 === o || o.destroyed || (o.alpha = 0),
          void 0 === t || a || ((a = !0), t()));
      },
      onInterrupt: function () {
        (void 0 === o || o.destroyed || (o.alpha = 0),
          void 0 === t || a || ((a = !0), t()));
      },
    });
  return (N(i), B(o, [i]), i);
}
function Bo(o, e, t) {
  var n = { alpha: o.alpha },
    a = r.to(n, {
      alpha: 0,
      duration: e / 1e3,
      onUpdate: function () {
        o.alpha = n.alpha;
      },
      onComplete:
        void 0 !== t
          ? function () {
              t();
            }
          : void 0,
      onInterrupt:
        void 0 !== t
          ? function () {
              ((o.alpha = 0), t());
            }
          : void 0,
    });
  (N(a), B(o, [a]));
}
function Ho(o, e, t) {
  var n = { alpha: o.alpha },
    a = r.to(n, {
      alpha: 0,
      duration: e / 1e3,
      onUpdate: function () {
        o.alpha = n.alpha;
      },
      onComplete: t,
      onInterrupt:
        void 0 !== t
          ? function () {
              ((o.alpha = 0), t());
            }
          : void 0,
    });
  return (N(a), a);
}
function Vo(o, e, t, n) {
  var a = { alpha: o.alpha },
    i = r.to(a, {
      alpha: 0,
      duration: e / 1e3,
      delay: t / 1e3,
      onUpdate: function () {
        o.alpha = a.alpha;
      },
      onComplete: n,
      onInterrupt:
        void 0 !== n
          ? function () {
              ((o.alpha = 0), n());
            }
          : void 0,
    });
  return (N(i), B(o, [i]), i);
}
function Wo(o) {
  var e;
  void 0 === o ||
    o.destroyed ||
    ((o.eventMode = "none"),
    (o.cursor = "default"),
    (e = { alpha: o.alpha, scale: o.scale.x }));
  var t = !1,
    n = r.to(e || { alpha: 1, scale: 1 }, {
      alpha: 0,
      scale: 1.75,
      duration: 0.2,
      onUpdate: function () {
        null == o ||
          o.destroyed ||
          ((o.alpha = e.alpha), (o.scale.x = o.scale.y = e.scale));
      },
      onComplete: function () {
        t || ((t = !0), jo(o));
      },
      onInterrupt: function () {
        t || ((t = !0), jo(o));
      },
    });
  (N(n), B(o, [n]));
}
function jo(o) {
  h(o);
}
function Ko(o, e, t, n, a = 1, i) {
  let s = { alpha: o.alpha, y: o.position.y },
    l = { x: a, y: a },
    d = 0.65;
  1 !== a && ((d = 0.65 * a), d.toFixed(2));
  var u = 0.3 / 3;
  let p = r.to(l, {
    keyframes: [
      { x: a, y: a, duration: u },
      { x: a, y: a, duration: u },
      { x: d, y: d, duration: u },
    ],
    ease: so,
    onUpdate: function () {
      void 0 !== o &&
        !0 !== o.destroyed &&
        ((o.scale.x = l.x), (o.scale.y = l.y));
    },
  });
  N(p);
  let c = !1;
  var f = t / 1e3,
    y = f / 4;
  let v = r.to(s, {
    keyframes: [
      { alpha: 1, duration: y },
      { alpha: 1, duration: y },
      { alpha: 1, duration: y },
      { alpha: 0, duration: y },
    ],
    ease: so,
    onUpdate: function () {
      void 0 !== o && !0 !== o.destroyed && (o.alpha = s.alpha);
    },
  });
  var h = r.to(s, {
    y: s.y - e,
    duration: f,
    ease: so,
    onUpdate: function () {
      void 0 !== o &&
        !0 !== o.destroyed &&
        ((o.position.y = s.y), i && i(o, h.time()));
    },
    onComplete: function () {
      (void 0 === o || o.destroyed || (o.alpha = 0),
        void 0 === n || c || ((c = !0), n(o)));
    },
    onInterrupt: function () {
      (void 0 === o || o.destroyed || (o.alpha = 0),
        void 0 === n || c || ((c = !0), n(o)));
    },
  });
  return (
    (v.stop = () => {
      (v.kill(), h.kill(), p.kill());
    }),
    B(o, [v, p, h], function () {
      void 0 === n || c || ((c = !0), n(o));
    }),
    v
  );
}
function Jo(o, e, t) {
  if (void 0 !== o && !o.destroyed) {
    var n = { alpha: o.alpha, y: o.position.y };
    r.to(n, {
      alpha: 0,
      y: n.y - e,
      duration: t / 1e3,
      ease: so,
      onUpdate: function () {
        void 0 === o ||
          o.destroyed ||
          ((o.alpha = n.alpha), (o.position.y = n.y));
      },
      onComplete: function () {
        void 0 === o || o.destroyed || (o.alpha = 0);
      },
      onInterrupt: function () {
        void 0 === o || o.destroyed || (o.alpha = 0);
      },
    });
  }
}
function Qo(o, e, t = !0) {
  (o.myFadeTween && o.myFadeTween.stop(),
    o.myScaleTween && t && o.myScaleTween.stop());
  var n = { alpha: 1 };
  ((o.myFadeTween = r.to(n, {
    alpha: 0,
    duration: 0.75,
    delay: 0.75,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.alpha = n.alpha);
    },
    onComplete: function () {
      (void 0 === o || o.destroyed || (o.alpha = n.alpha), void 0 !== e && e());
    },
    onInterrupt: function () {
      (void 0 === o || o.destroyed || (o.alpha = 0), void 0 !== e && e());
    },
  })),
    N(o.myFadeTween));
  var a = [o.myFadeTween];
  if (t && void 0 !== o && !o.destroyed) {
    o.scale.x = o.scale.y = 1.4;
    var i = { x: 1.4, y: 1.4 };
    ((o.myScaleTween = r.to(i, {
      keyframes: [
        { x: 1.4, y: 1.4, duration: 0.15 },
        { x: 1, y: 1, duration: 0.15 },
      ],
      ease: so,
      onUpdate: function () {
        void 0 === o || o.destroyed || ((o.scale.x = i.x), (o.scale.y = i.y));
      },
    })),
      N(o.myScaleTween),
      a.push(o.myScaleTween));
  }
  B(o, a, function () {
    void 0 === o || o.destroyed || (o.filters = null);
  });
}
function Zo(o, e, t, n) {
  var a = Math.floor(t / 2),
    i = { alpha: o.alpha };
  r.to(i, {
    alpha: 0,
    duration: a / 1e3,
    onUpdate: function () {
      o.alpha = i.alpha;
    },
    onInterrupt: function () {
      o.alpha = 0;
    },
  });
  var s = !1,
    l = { x: o.position.x };
  r.to(l, {
    x: l.x - e,
    duration: t / 1e3,
    ease: so,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.position.x = l.x);
    },
    onComplete: function () {
      (void 0 === o || o.destroyed || (o.position.x = l.x),
        void 0 === n || s || ((s = !0), n(o)));
    },
    onInterrupt: function () {
      (void 0 === o || o.destroyed || (o.position.x = l.x),
        void 0 === n || s || ((s = !0), n(o)));
    },
  });
}
function $o(o, e, t, n) {
  var a = Math.floor(t / 2),
    i = { alpha: o.alpha };
  r.to(i, {
    alpha: 0,
    duration: a / 1e3,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.alpha = i.alpha);
    },
    onComplete: function () {
      void 0 === o || o.destroyed || (o.alpha = 0);
    },
    onInterrupt: function () {
      void 0 === o || o.destroyed || (o.alpha = 0);
    },
  });
  var s = !1,
    l = { x: o.position.x };
  r.to(l, {
    x: l.x + e,
    duration: t / 1e3,
    ease: so,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.position.x = l.x);
    },
    onComplete: function () {
      (void 0 === o || o.destroyed || (o.position.x = l.x),
        void 0 === n || s || ((s = !0), n(o)));
    },
    onInterrupt: function () {
      (void 0 === o || o.destroyed || (o.position.x = l.x),
        void 0 === n || s || ((s = !0), n(o)));
    },
  });
}
function oe(o, e, t, n = 1, a) {
  var i = Math.floor(t / 2),
    s = o.position.x,
    l = { alpha: o.alpha, target: 1 !== n ? n : 1 };
  (void 0 === o || o.destroyed || (o.position.x = o.position.x - e),
    r.to(l, {
      alpha: n,
      duration: i / 1e3,
      onUpdate: function () {
        o.alpha = l.alpha;
      },
      onInterrupt: function () {
        o.alpha = n;
      },
    }));
  var d = { x: o.position.x };
  r.to(d, {
    x: s,
    duration: t / 1e3,
    ease: so,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.position.x = d.x);
    },
    onComplete: function () {
      void 0 !== a && a(o);
    },
  });
}
function ee(o, e, t, n = 1, a) {
  var i = Math.floor(t / 2),
    s = o.position.x,
    l = { alpha: o.alpha, target: 1 !== n ? n : 1 };
  (void 0 === o || o.destroyed || (o.position.x = o.position.x + e),
    r.to(l, {
      alpha: n,
      duration: i / 1e3,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.alpha = l.target);
      },
      onInterrupt: function () {
        void 0 === o || o.destroyed || (o.alpha = l.target);
      },
    }));
  var d = { x: o.position.x };
  r.to(d, {
    x: s,
    duration: t / 1e3,
    ease: so,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.position.x = d.x);
    },
    onComplete: function () {
      void 0 !== a && a(o);
    },
  });
}
function te(o, e, t, n = 1) {
  var a = { alpha: o.alpha, target: 1 !== n ? n : 1 },
    i = r.to(a, {
      alpha: n,
      duration: e / 1e3,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.alpha = a.alpha);
      },
      onComplete: function () {
        (void 0 === o || o.destroyed || (o.alpha = a.target),
          void 0 !== t && t(o));
      },
      onInterrupt: function () {
        void 0 === o || o.destroyed || (o.alpha = a.target);
      },
    });
  return (N(i), B(o, [i]), i);
}
function ne(o, e) {
  J();
  var t = void 0 !== e ? e : o.position.y,
    n = Math.floor(20 * V() + 10);
  (n = V() < 0.5 ? Math.abs(n) : -Math.abs(n)) < -20 &&
    (n = Math.floor(5 * V() - 20));
  var a = t - n,
    i = { y: t },
    s = r.to(i, {
      y: a,
      duration: Math.floor(700 * V() + 700) / 1e3,
      ease: go,
      repeat: -1,
      yoyo: !0,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.y = i.y);
      },
      onInterrupt: function () {
        void 0 === o || o.destroyed || (o.position.y = t);
      },
    });
  return (N(s), s);
}
function ae(o, e, t = 600, n = 0) {
  var a = { x: o.position.x },
    i = r.to(a, {
      x: e,
      duration: t / 1e3,
      ease: po,
      delay: n / 1e3,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.x = a.x);
      },
    });
  (N(i), B(o, [i]));
}
function ie(o, e, t) {
  var n = { x: o.position.x };
  r.to(n, {
    x: e,
    duration: t / 1e3,
    ease: po,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.position.x = n.x);
    },
  });
}
function re(o, e, t) {
  var n = { x: o.position.x },
    a = r.to(n, {
      x: o.position.x - 1e3,
      duration: e / 1e3,
      ease: co,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.x = n.x);
      },
      onComplete: t,
    });
  (N(a), B(o, [a]));
}
function se(o, e) {
  var t = { x: o.position.x },
    n = r.to(t, {
      x: o.position.x - 1e3,
      duration: e / 1e3,
      ease: co,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.x = t.x);
      },
      onComplete: function () {
        jo(o);
      },
    });
  (N(n), B(o, [n]));
}
function le(o, e, t, n) {
  if (void 0 === o || o.destroyed) return { stop: function () {} };
  var a = { x: o.position.x },
    i = r.to(a, {
      x: e,
      duration: t / 1e3,
      ease: yo,
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.x = a.x);
      },
      onComplete: function () {
        (void 0 === o || o.destroyed || (o.position.x = e),
          void 0 !== n && n());
      },
    });
  return (N(i), B(o, [i]), i);
}
function de(o, e = 1200, t = 5, n = !0) {
  var a = { x: o.position.x },
    i = a.x,
    s = e / 1e3 / 7,
    l = r.to(a, {
      keyframes: [
        { x: i + t, duration: s },
        { x: i - t, duration: s },
        { x: i + t, duration: s },
        { x: i - t, duration: s },
        { x: i + t, duration: s },
        { x: i - t, duration: s },
        { x: i, duration: s },
      ],
      ease: so,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.x = a.x);
      },
      onInterrupt: function () {
        o.position.x = i;
      },
      repeat: n ? -1 : 0,
      repeatDelay: n ? (2 * e) / 1e3 : 0,
    });
  return (N(l), B(o, [l]), l);
}
function ue(o, e = 500, t = 6, n = !0, a = 4e3) {
  var i = { y: o.position.y },
    s = i.y,
    l = e / 1e3 / 2,
    d = r.to(i, {
      keyframes: [
        { y: s - t, duration: l },
        { y: s, duration: l },
      ],
      ease: so,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.y = i.y);
      },
      onInterrupt: function () {
        void 0 === o || o.destroyed || (o.position.y = s);
      },
      repeat: n ? -1 : 0,
      repeatDelay: n ? a / 1e3 : 0,
    });
  return (N(d), B(o, [d]), d);
}
var pe = {
  hop: function (o) {
    return 4 * o * (1 - o);
  },
  waddle: function (o) {
    return 0.55 * Math.abs(Math.sin(o * Math.PI * 2));
  },
  bounce: function (o) {
    if (o < 0.75) {
      var e = o / 0.75;
      return 4 * e * (1 - e);
    }
    var t = (o - 0.75) / 0.25;
    return 4 * t * (1 - t) * 0.25;
  },
  slide: function () {
    return 0;
  },
};
function ce(o, e, t, n, a, i) {
  var s = n || {},
    l = { x: o.position.x, y: o.position.y },
    d = { x: o.scale.x, y: o.scale.y },
    u = Math.max(0, Number(s.height) || 0),
    p = Math.max(0, Number(s.squash) || 0),
    c = pe[s.style] || pe.hop,
    f = r.parseEase(s.ease || "sine.inOut") || r.parseEase("none"),
    y = { t: 0 },
    v = { x: l.x, y: l.y };
  var h = r.to(y, {
    t: 1,
    duration: Math.max(1, Number(s.ms) || 1) / 1e3,
    ease: "none",
    onUpdate: function () {
      void 0 === o ||
        o.destroyed ||
        (function () {
          var n = f(y.t);
          ((v.x = l.x + (e - l.x) * n), (v.y = l.y + (t - l.y) * n));
          var a = c(y.t);
          (o.position.set(v.x, v.y - u * a),
            p > 0 && o.scale.set(d.x * (1 - p * a * 0.5), d.y * (1 + p * a)));
        })();
    },
    onComplete: function () {
      (void 0 === o ||
        o.destroyed ||
        (o.position.set(e, t), p > 0 && o.scale.set(d.x, d.y)),
        a && a());
    },
    onInterrupt: function () {
      (void 0 === o ||
        o.destroyed ||
        (o.helperLift || o.dragging || o.position.set(v.x, v.y),
        p > 0 && !o.helperLift && !o.myTadaTween && o.scale.set(d.x, d.y)),
        i && i());
    },
  });
  return (N(h), B(o, [h]), h);
}
function fe(o, e = 220, t = 4, n = 0.12) {
  var a = { y: 0 },
    i = 0,
    s = 1,
    l = void 0 === o || o.destroyed ? 0 : o.height,
    d = r.to(a, {
      y: t,
      duration: e / 1e3 / 2,
      ease: "sine.inOut",
      yoyo: !0,
      repeat: 1,
      onUpdate: function () {
        if (void 0 !== o && !o.destroyed) {
          var e = 0 === t ? 0 : a.y / t,
            r = 1 - n * e,
            d = a.y + (l * n * e) / 2;
          ((o.position.y += d - i), (o.scale.y *= r / s), (i = d), (s = r));
        }
      },
      onInterrupt: function () {
        (void 0 === o || o.destroyed || ((o.position.y -= i), (o.scale.y /= s)),
          (i = 0),
          (s = 1));
      },
    });
  return (N(d), B(o, [d]), d);
}
function ye(o, e = 1e3, t = 30) {
  var n = { y: o.position.y },
    a = n.y,
    i = e / 1e3 / 2,
    s = r.to(n, {
      keyframes: [
        { y: a - t, duration: i },
        { y: a, duration: i },
      ],
      ease: so,
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.y = n.y);
      },
      onInterrupt: function () {
        o.position.y = a;
      },
    });
  return (N(s), B(o, [s]), s);
}
function ve(o, e, t, n, a) {
  var i = { y: o.position.y },
    s = r.to(i, {
      y: e,
      duration: t / 1e3,
      ease: yo,
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.y = i.y);
      },
      onComplete: function () {
        void 0 !== n
          ? n()
          : void 0 !== a && a.destroyed && a.emit("t:moveY:end");
      },
      onInterrupt: function () {
        void 0 !== n && n();
      },
    });
  return (N(s), B(o, [s]), s);
}
function he(o, e, t, n) {
  var a = { x: o.pivot.x, y: o.pivot.y };
  N(
    r.to(a, {
      x: e.x,
      y: e.y,
      duration: t / 1e3,
      ease: yo,
      onUpdate: function () {
        void 0 === o || o.destroyed || ((o.pivot.x = a.x), (o.pivot.y = a.y));
      },
      onComplete: n,
    }),
  );
}
function xe(o, e, t, n) {
  var a;
  void 0 === o || o.destroyed || (a = { x: o.scale.x, y: o.scale.y });
  var i = !1,
    s = r.to(void 0 !== a ? a : { x: 1, y: 1 }, {
      y: e,
      x: e,
      duration: t / 1e3,
      ease: uo,
      onUpdate: function () {
        void 0 === o || o.destroyed || ((o.scale.x = a.x), (o.scale.y = a.y));
      },
      onComplete:
        void 0 !== n
          ? function () {
              i || ((i = !0), n());
            }
          : void 0,
      onInterrupt:
        void 0 !== n
          ? function () {
              i || ((i = !0), n());
            }
          : void 0,
    });
  return (N(s), B(o, [s]), s);
}
function me(o, e, t = 1, n) {
  var a;
  void 0 === o || o.destroyed || (a = { x: o.scale.x, y: o.scale.y });
  var i = r.to(void 0 !== a ? a : { x: 1, y: 1 }, {
    y: t,
    x: t,
    duration: e / 1e3,
    ease: "quad.out",
    onUpdate: function () {
      void 0 === o || o.destroyed || ((o.scale.x = a.x), (o.scale.y = a.y));
    },
    onComplete: n,
  });
  return (N(i), B(o, [i]), i);
}
function ge(o, e = 75, t = 140, n = 1.2, a) {
  var i;
  i =
    void 0 === o || o.destroyed
      ? { x: 1, y: 1 }
      : { x: o.scale.x, y: o.scale.y };
  var s = function () {
      void 0 === o || o.destroyed || ((o.scale.x = i.x), (o.scale.y = i.y));
    },
    l = r.timeline({ onComplete: a });
  return (
    l.to(i, { x: n, y: n, duration: e / 1e3, ease: ho, onUpdate: s }),
    l.to(i, { x: 1, y: 1, duration: t / 1e3, ease: xo, onUpdate: s }),
    N(l),
    B(o, [l]),
    l
  );
}
function we(o, e = 220, t) {
  var n;
  void 0 === o || o.destroyed || (n = { x: o.scale.x, y: o.scale.y });
  var a = r.to(void 0 !== n ? n : { x: 1, y: 1 }, {
    x: 0,
    y: 0,
    duration: e / 1e3,
    ease: vo,
    onUpdate: function () {
      void 0 === o || o.destroyed || ((o.scale.x = n.x), (o.scale.y = n.y));
    },
    onComplete: t,
  });
  return (N(a), B(o, [a]), a);
}
function Ue(o, e, t, n) {
  var a;
  void 0 === o || o.destroyed || (a = { alpha: o.alpha });
  var i = r.to(void 0 !== a ? a : { alpha: t }, {
    alpha: t,
    duration: e / 1e3,
    ease: n || "sine.out",
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.alpha = a.alpha);
    },
  });
  return (N(i), B(o, [i]), i);
}
function ke(o, e, t) {
  var n;
  void 0 === o || o.destroyed || (n = { x: o.scale.x });
  var a = r.to(void 0 !== n ? n : { x: 1 }, {
    x: e,
    duration: t / 1e3,
    ease: uo,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.scale.x = n.x);
    },
  });
  (N(a), B(o, [a]));
}
function be(o, e) {
  var t, n;
  void 0 === o ||
    o.destroyed ||
    ((n = { alpha: o.alpha }), (t = { x: o.scale.x, y: o.scale.y }));
  var a = r.to(void 0 !== n ? n : { alpha: 1 }, {
    alpha: 0,
    duration: e / 1e3,
    ease: yo,
    overwrite: "auto",
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.alpha = n.alpha);
    },
  });
  N(a);
  var i = r.to(void 0 !== t ? t : { x: 1, y: 1 }, {
    x: 0,
    y: 0,
    duration: e / 1e3,
    ease: yo,
    overwrite: "auto",
    onUpdate: function () {
      void 0 === o || o.destroyed || ((o.scale.x = t.x), (o.scale.y = t.y));
    },
  });
  N(i);
  var s = [a, i];
  return (B(o, s), s);
}
function Ce(o, e) {
  var t;
  void 0 === o || o.destroyed || (t = { y: o.scale.y });
  var n = r.to(void 0 !== t ? t : { y: 1 }, {
    y: 0,
    duration: e / 1e3,
    ease: yo,
    overwrite: "auto",
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.scale.y = t.y);
    },
  });
  (N(n), B(o, [n]));
}
function Te(o, e) {
  var t;
  void 0 === o || o.destroyed || (t = { x: o.scale.x });
  var n = r.to(void 0 !== t ? t : { x: 1 }, {
    x: 0,
    duration: e / 1e3,
    ease: yo,
    overwrite: "auto",
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.scale.x = t.x);
    },
  });
  (N(n), B(o, [n]));
}
function Ie(o, e, t = 1, n = 1, a = 0) {
  var i;
  void 0 === o || o.destroyed || (i = { alpha: o.alpha });
  var s = r.to(void 0 !== i ? i : { alpha: 0 }, {
    alpha: n,
    duration: e / 1e3,
    ease: yo,
    delay: a / 1e3,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.alpha = i.alpha);
    },
    onComplete: function () {
      void 0 === o || o.destroyed || (o.alpha = n);
    },
    onInterrupt: function () {
      void 0 === o || o.destroyed || (o.alpha = n);
    },
  });
  N(s);
  var l = { x: o.scale.x, y: o.scale.y },
    d = r.to(l, {
      x: t,
      y: t,
      duration: e / 1e3,
      ease: yo,
      delay: a / 1e3,
      onUpdate: function () {
        void 0 === o || o.destroyed || ((o.scale.x = l.x), (o.scale.y = l.y));
      },
      onInterrupt: function () {
        void 0 === o || o.destroyed || ((o.scale.x = t), (o.scale.y = t));
      },
      onComplete: function () {
        void 0 === o || o.destroyed || ((o.scale.x = t), (o.scale.y = t));
      },
    });
  return (
    N(d),
    B(o, [s, d]),
    {
      stop: function () {
        (s.kill(), d.kill());
      },
    }
  );
}
function Me(o, e, t, n, a = !1) {
  var i;
  void 0 === o ||
    o.destroyed ||
    (i = { alpha: o.alpha, scalex: o.scale.x, scaley: o.scale.y });
  var s = r.to(void 0 !== i ? i : { alpha: 0 }, {
    alpha: 1,
    duration: e / 2e3,
    ease: yo,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.alpha = i.alpha);
    },
  });
  N(s);
  var l = e / 1e3 / 3,
    d = r.to(void 0 !== i ? i : { scalex: 0, scaley: 0 }, {
      keyframes: [
        { scalex: -1.2, scaley: 1.2, duration: l },
        { scalex: -0.9, scaley: 0.9, duration: l },
        { scalex: t, scaley: n, duration: l },
      ],
      ease: "cubic.inOut",
      onUpdate: function () {
        void 0 === o ||
          o.destroyed ||
          ((o.scale.x = i.scalex), (o.scale.y = i.scaley));
      },
    });
  (N(d), B(o, [s, d]));
}
function Oe(o, e) {
  var t;
  void 0 === o || o.destroyed || (t = { x: o.scale.x, y: o.scale.y });
  var n = e / 1e3 / 3,
    a = r.to(void 0 !== t ? t : { x: 0, y: 0 }, {
      keyframes: [
        { x: 1.15, y: 1.15, duration: n },
        { x: 0.9, y: 0.9, duration: n },
        { x: 1, y: 1, duration: n },
      ],
      ease: po,
      onUpdate: function () {
        void 0 === o || o.destroyed || ((o.scale.x = t.x), (o.scale.y = t.y));
      },
    });
  (N(a), B(o, [a]));
}
function Se(o, e, t) {
  var n;
  void 0 === o || o.destroyed || (n = { x: o.scale.x, y: o.scale.y });
  var a = e / 1e3 / 2,
    i = r.to(void 0 !== n ? n : { x: 0, y: 0 }, {
      keyframes: [
        { x: 1.15, y: 1.15, duration: a },
        { x: 1, y: 1, duration: a },
      ],
      ease: "cubic.inOut",
      onUpdate: function () {
        void 0 === o || o.destroyed || ((o.scale.x = n.x), (o.scale.y = n.y));
      },
      onComplete: function () {
        (void 0 === o || o.destroyed || o.scale.set(1, 1), void 0 !== t && t());
      },
    });
  (N(i), B(o, [i]));
}
function Fe(o, e, t) {
  var n = 7;
  t > 1 && t < 100
    ? (n = 8)
    : t > 99 && t < 5e4
      ? (n = 9)
      : t > 49999 && t < 9e7
        ? (n = 10)
        : t >= 9e7 && (n = 11);
  var a,
    i = e - n;
  void 0 === o || o.destroyed || (a = { y: o.position.y });
  r.to(void 0 !== a ? a : { y: 0 }, {
    keyframes: [
      { y: i, duration: 0.1 },
      { y: e, duration: 0.1 },
    ],
    ease: fo,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.position.y = a.y);
    },
  });
}
function Pe(o, e, t, n) {
  var a = { x: 1500 };
  r.to(a, {
    x: 0,
    duration: e / 1e3,
    ease: "expo.out",
    delay: t / 1e3,
    onUpdate: function () {
      ((o.position.x = a.x), (o.alpha = 1));
    },
    onComplete: function () {
      void 0 !== n && n();
    },
  });
}
function Xe(o, e, t = 1, n = 0, a) {
  var i = { alpha: o.alpha },
    s = r.to(i, {
      alpha: t,
      duration: e / 1e3,
      ease: mo,
      delay: n / 1e3,
      onUpdate: function () {
        o.alpha = i.alpha;
      },
      onInterrupt: function () {
        void 0 === o || o.destroyed || (o.alpha = t);
      },
      onComplete: function () {
        (void 0 === o || o.destroyed || (o.alpha = t), void 0 !== a && a());
      },
    });
  return (N(s), B(o, [s]), s);
}
function _e(o, e, t, n, a, i, s, l) {
  (Co || (Co = !0),
    qe(o, e, l),
    Ae(t, n, s),
    (function (o, e) {
      var t = e,
        n = { y: o.position.y, scaley: 1 },
        a = Io / 1e3 / 2;
      ((Z = r.to(n, {
        keyframes: [
          { y: Math.ceil(t - 15), scaley: 0.9, duration: a },
          { y: t, scaley: 1, duration: a },
        ],
        ease: mo,
        overwrite: "auto",
        onUpdate: function () {
          ((o.position.y = n.y), (o.scale.y = n.scaley));
        },
        onInterrupt: function () {
          o.position.y = t;
        },
      })),
        N(Z));
    })(a, i));
}
function qe(o, e, t) {
  (o._pickSwingTween?.stop(), (o._pickSwingTween = K(o, o.rotation, e, t, W)));
}
function Ae(o, e, t) {
  if ((Q && Q.stop(), !t)) {
    var n = { y: o.position.y },
      a = Io / 2e3 / 2;
    N(
      (Q = r.to(n, {
        keyframes: [
          { y: Math.ceil(e + To), duration: a },
          { y: e, duration: a },
        ],
        ease: mo,
        overwrite: "auto",
        onUpdate: function () {
          o.position.y = n.y;
        },
        onInterrupt: function () {
          o.position.y = e;
        },
      })),
    );
  }
}
function Ye(o, e, t = 34) {
  Co &&
    (Z?.stop(),
    o._pickSwingTween?.stop(),
    (o._pickSwingTween = K(o, o.rotation, e, t, j)));
}
function De(o, e, t, n, a, i, s, l, d, u) {
  (Co || (Co = !0),
    "mini" === o &&
      (function (o, e) {
        Z && Z.stop();
        var t = e,
          n = { x: o.position.x, scalex: 1 },
          a = Io / 1e3 / 2;
        N(
          (Z = r.to(n, {
            keyframes: [
              { x: Math.ceil(t - 12), scalex: 0.9, duration: a },
              { x: t, scalex: 1, duration: a },
            ],
            ease: mo,
            overwrite: "auto",
            onUpdate: function () {
              ((o.position.x = n.x), (o.scale.x = n.scalex));
            },
            onInterrupt: function () {
              o.position.x = t;
            },
          })),
        );
      })(i, u),
    Ae(n, a, l));
}
function Ee(o, e, t, n = 34) {
  if (Co)
    if ((Z?.stop(), e._pickSwingTween?.stop(), "mini" === o));
    else if ("knife" === o);
    else if ("glove" === o);
    else {
      var a = { rotation: e.rotation };
      const o = r.to(a, {
        rotation: t,
        duration: n / 1e3,
        overwrite: "auto",
        onUpdate: function () {
          e.destroyed || (e.rotation = a.rotation);
        },
      });
      ((e._pickSwingTween = N(o)), B(e, [o]));
    }
}
var ze = { x: 1.5, y: 0.5, duration: 0.05, greenMult: 1.3, blueMult: 0.8 };
function Le(o) {
  if (void 0 === o || o.destroyed) return;
  (o._rgbTween && (o._rgbTween.kill(), (o._rgbTween = null)),
    o._rgbFilter && (A(o, o._rgbFilter), (o._rgbFilter = null)));
  let e = new u();
  ((e.green = [0, 0]),
    (e.red = [0, 0]),
    (e.blue = [0, 0]),
    (e.resolution = "inherit"),
    q(o, e),
    (o._rgbFilter = e));
  var t,
    n = { x: 0, y: 0 },
    a = function () {
      (A(o, e),
        o._rgbFilter === e && (o._rgbFilter = null),
        o._rgbTween === t && (o._rgbTween = null));
    };
  ((t = r.to(n, {
    x: ze.x,
    y: ze.y,
    duration: ze.duration,
    overwrite: "auto",
    onUpdate: function () {
      o.destroyed ||
        ((e.red = [n.x, n.y]),
        (e.green = [-n.x * ze.greenMult, -n.y * ze.greenMult]),
        (e.blue = [-n.x * ze.blueMult, -n.y * ze.blueMult]));
    },
    yoyo: !0,
    repeat: 1,
    onComplete: a,
    onInterrupt: a,
  })),
    (o._rgbTween = t),
    N(o._rgbTween));
}
function Re(o, e, t, n, a, i) {
  var s = { x: o.position.x, y: o.position.y },
    l = r.to(s, {
      x: e,
      y: t,
      duration: n / 1e3,
      ease: wo,
      onUpdate: function () {
        void 0 === o ||
          o.destroyed ||
          ((o.position.x = s.x), (o.position.y = s.y));
      },
      onComplete: function () {
        void 0 !== a && a();
      },
      onInterrupt: function () {
        void 0 !== i && i();
      },
    });
  return (N(l), l);
}
function Ge(o, e = 250, t = [0.5, 0.5], n = [10, 0.8, 0.1], a = 0.25) {
  var i = new d(),
    s = { time: 0 };
  (t && (i.center = t),
    n && (i.params = n),
    _(o, [i]),
    r.to(s, {
      time: a,
      duration: e / 1e3,
      ease: "circ.out",
      onUpdate: function () {
        i.time = s.time;
      },
      onComplete: function () {
        ((i.time = 0), (o.filters = null));
      },
      onInterrupt: function () {
        ((i.time = 0), (o.filters = null));
      },
    }));
}
function Ne() {
  r.globalTimeline.getChildren(!0).forEach((o) => o.kill());
}
function Be(o, e = 1500, t = 0, n) {
  var a = o.scale.x;
  ((o.position.y = -1e3), (o.alpha = 1));
  var i = { y: -1e3, scale: a },
    s = { scale: a, y: 0 },
    l = r.to(s, {
      keyframes: [
        { scale: 0.75, y: 100, duration: 0.125 },
        { scale: a, y: t, duration: 0.125 },
      ],
      ease: "quad.out",
      paused: !0,
      onUpdate: function () {
        ((o.scale.y = s.scale), (o.position.y = s.y));
      },
      onComplete: function () {
        o.scale.y = a;
      },
    });
  (window.dogeminer.scale, window.dogeminer.scale);
  var d = r.to(i, {
    y: t,
    duration: e / 1e3,
    ease: "cubic.in",
    onUpdate: function () {
      o.position.y = i.y;
    },
    onComplete: function () {
      ((o.position.y = t), l.play(), void 0 !== n && n());
    },
    onInterrupt: function () {
      ((o.position.y = t), void 0 !== n && n());
    },
  });
  return (N(d), d);
}
function He(o, e = 700) {
  var t = o.scale.x,
    n = { scale: t },
    a = r.to(n, {
      scale: 1.2 * t,
      duration: e / 2e3,
      ease: "sine.inOut",
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o || o.destroyed || o.scale.set(n.scale);
      },
      yoyo: !0,
      repeat: -1,
    });
  return (N(a), B(o, [a]), a);
}
var Ve = 800;
function We(o, e, t, n) {
  var a = { alpha: o.alpha };
  let i = r.to(a, {
    alpha: 1,
    duration: 0.2,
    onUpdate: function () {
      o.alpha = a.alpha;
    },
  });
  N(i);
  var s = { x: o.position.x, y: o.position.y },
    l = { y: t },
    d = r.to(l, {
      y: t + 5,
      duration: 2.2,
      ease: "sine.inOut",
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.y = l.y);
      },
      yoyo: !0,
      repeat: -1,
      paused: !0,
    });
  N(d);
  var u = r.to(s, {
    x: e,
    y: t,
    duration: Ve / 1e3,
    ease: "expo.out",
    onUpdate: function () {
      void 0 === o ||
        o.destroyed ||
        ((o.position.x = s.x), (o.position.y = s.y));
    },
    onComplete: function () {
      (d.play(), void 0 !== n && n());
    },
  });
  return (N(u), [i, u, d]);
}
function je(o) {
  var e = { alpha: 1 },
    t = 3 / 18,
    n = r.to(e, {
      keyframes: [
        { alpha: 1, duration: t },
        { alpha: 0, duration: t },
        { alpha: 1, duration: t },
        { alpha: 0, duration: t },
        { alpha: 1, duration: t },
        { alpha: 0, duration: t },
        { alpha: 1, duration: t },
        { alpha: 0, duration: t },
        { alpha: 1, duration: t },
        { alpha: 0, duration: t },
        { alpha: 1, duration: t },
        { alpha: 0, duration: t },
        { alpha: 1, duration: t },
        { alpha: 0, duration: t },
        { alpha: 1, duration: t },
        { alpha: 0, duration: t },
        { alpha: 1, duration: t },
        { alpha: 0, duration: t },
      ],
      overwrite: "auto",
      onUpdate: function () {
        o.alpha = e.alpha;
      },
    });
  return (N(n), n);
}
function Ke(o, e, t = 1) {
  var n = { x: t },
    a = r.to(n, {
      x: -t,
      duration: e / 1e3,
      ease: "none",
      onUpdate: function () {
        if (void 0 !== o && !o.destroyed)
          try {
            o.scale.x = n.x;
          } catch (e) {
            log("tweens.spinX caught an error: " + e.message);
          }
      },
      yoyo: !0,
      repeat: 10,
    });
  return (N(a), a);
}
function Je(o, e) {
  var t = { alpha: o.alpha },
    n = t.alpha + 0.1,
    a = r.to(t, {
      alpha: n,
      duration: e / 1e3,
      ease: lo,
      onUpdate: function () {
        o.alpha = t.alpha;
      },
      yoyo: !0,
      repeat: -1,
    });
  (N(a), B(o, [a]));
}
function Qe(o, e, t = 10, n = 1e3, a = 1500, i) {
  if (void 0 === o || o.destroyed)
    return [{ stop: () => {} }, { stop: () => {} }];
  {
    var s = o.scale.x,
      l = { x: o.position.x, y: o.position.y, scalex: s },
      d = r.to(l, {
        scalex: -1 === s ? -0.85 : -0.5,
        duration: 1.337,
        ease: "quad.out",
        overwrite: "auto",
        paused: !0,
        onUpdate: function () {
          void 0 === o || o.destroyed || (o.scale.x = l.scalex);
        },
        onComplete: function () {
          void 0 === o || o.destroyed || (o.scale.x = s);
        },
      });
    N(d);
    let c = o.position.y;
    var u = r.to(l, {
      x: e.x,
      duration: a / 1e3,
      ease: "quad.in",
      overwrite: "auto",
      paused: !0,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.x = l.x);
      },
      onComplete: function () {
        (setTimeout(() => {
          (void 0 !== p && p.kill(),
            void 0 !== u && u.kill(),
            void 0 !== d && d.kill(),
            void 0 === o || o.destroyed || (o.alpha = 0.1),
            (p = void 0),
            (u = void 0),
            (l = void 0));
        }, 1),
          void 0 !== i && i());
      },
    });
    N(u);
    var p = r.to(l, {
      y: c + t,
      duration: n / 1e3,
      ease: "sine.inOut",
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.y = l.y);
      },
      onComplete: function () {
        (void 0 !== u && u.play(), void 0 !== d && d.play());
      },
      onInterrupt: function () {
        void 0 !== i && i();
      },
      yoyo: !0,
      repeat: 2,
    });
    return (N(p), B(o, [p, u, d]), [p, u]);
  }
}
function Ze(o, e, t = 5) {
  var n = o.position.y,
    a = { y: n },
    i = r.to(a, {
      y: n + t,
      duration: e / 1e3,
      ease: "sine.inOut",
      overwrite: "auto",
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.y = a.y);
      },
      yoyo: !0,
      repeat: -1,
    });
  (N(i), B(o, [i]));
}
function $e(o, e, t = 1, n) {
  var a = { alpha: 0 },
    i = r.to(a, {
      alpha: t,
      duration: e / 1e3,
      ease: "sine.inOut",
      overwrite: "auto",
      onUpdate: function () {
        o.alpha = a.alpha;
      },
      onComplete: function () {
        (void 0 === o || o.destroyed || (o.alpha = t), void 0 !== n && n());
      },
      onInterrupt: function () {
        void 0 === o || o.destroyed || (o.alpha = t);
      },
    });
  (N(i), B(o, [i]));
}
function ot(o, e, t = 1, n = 1, a = 0) {
  var i = { alpha: o.alpha, x: o.scale.x, y: o.scale.y },
    s = r.to(i, {
      alpha: t,
      x: n,
      y: n,
      duration: e / 1e3,
      ease: "sine.inOut",
      overwrite: "auto",
      delay: a / 1e3,
      onUpdate: function () {
        ((o.alpha = i.alpha), (o.scale.x = i.x), (o.scale.y = i.y));
      },
    });
  (N(s), B(o, [s]));
}
function et(o, e, t = 0, n = 1, a = 0, i) {
  if (void 0 !== o && !o.destroyed) {
    var s = { alpha: o.alpha, x: o.scale.x, y: o.scale.y },
      l = r.to(s, {
        alpha: t,
        x: n,
        y: n,
        duration: e / 1e3,
        ease: "sine.inOut",
        overwrite: "auto",
        delay: a / 1e3,
        onUpdate: function () {
          void 0 === o ||
            o.destroyed ||
            ((o.alpha = s.alpha), (o.scale.x = s.x), (o.scale.y = s.y));
        },
        onComplete: function () {
          void 0 !== i && i();
        },
      });
    (N(l), B(o, [l]));
  }
}
function tt(o, e) {
  var t = { x: o.position.x },
    n = { x: o.position.x + 200, alpha: 0 };
  ((o.alpha = 0), (o.position.x = n.x));
  var a,
    i = e / 1e3 / 8,
    s = r.to(n, {
      keyframes: [
        { alpha: 1, duration: i },
        { alpha: 0.9, duration: i },
        { alpha: 1, duration: i },
        { alpha: 0.9, duration: i },
        { alpha: 1, duration: i },
        { alpha: 0.9, duration: i },
        { alpha: 1, duration: i },
        { alpha: 0, duration: i },
      ],
      overwrite: "auto",
      onUpdate: function () {
        o.alpha = n.alpha;
      },
      onInterrupt: function () {
        ((o.alpha = 0), a && a.kill());
      },
    });
  return (
    (a = r.to(n, {
      x: n.x - 400,
      duration: e / 1e3,
      ease: "quart.inOut",
      overwrite: "auto",
      onUpdate: function () {
        o.position.x = n.x;
      },
      onComplete: function () {
        ((o.alpha = 0), (o.position.x = t.x));
      },
      onInterrupt: function () {
        ((o.alpha = 0), (o.position.x = t.x));
      },
    })),
    (s.stop = () => {
      (s.kill(), a.kill());
    }),
    B(o, [s, a]),
    s
  );
}
function nt(o, e, t = 0) {
  var n,
    a = { x: o.position.x, y: o.position.y, alpha: 0, scale: 0.9 };
  (0 === t
    ? ((o.scale.y = 0.9),
      (n = r.to(a, {
        y: e.y + 15,
        scale: 1,
        duration: 0.6,
        ease: "quad.inOut",
        paused: !0,
        onUpdate: function () {
          ((o.position.y = a.y), (o.scale.y = a.scale));
        },
        yoyo: !0,
        repeat: -1,
      })))
    : 1 === t
      ? ((o.scale.x = 0.9),
        (n = r.to(a, {
          x: e.x - 15,
          scale: 1,
          duration: 0.6,
          ease: "quad.inOut",
          paused: !0,
          onUpdate: function () {
            ((o.position.x = a.x), (o.scale.x = a.scale));
          },
          yoyo: !0,
          repeat: -1,
        })))
      : 2 === t
        ? ((o.scale.y = 0.9),
          (n = r.to(a, {
            y: e.y - 15,
            scale: 1,
            duration: 0.6,
            ease: "quad.inOut",
            paused: !0,
            onUpdate: function () {
              ((o.position.y = a.y), (o.scale.y = a.scale));
            },
            yoyo: !0,
            repeat: -1,
          })))
        : ((o.scale.x = 0.9),
          (n = r.to(a, {
            x: e.x + 15,
            scale: 1,
            duration: 0.6,
            ease: "quad.inOut",
            paused: !0,
            onUpdate: function () {
              ((o.position.x = a.x), (o.scale.x = a.scale));
            },
            yoyo: !0,
            repeat: -1,
          }))),
    N(n));
  var i = r.to(a, {
    x: e.x,
    y: e.y,
    alpha: 0.5,
    duration: 1.25,
    ease: "quad.inOut",
    onUpdate: function () {
      ((o.position.x = a.x), (o.position.y = a.y), (o.alpha = a.alpha));
    },
    onComplete: function () {
      n.play();
    },
  });
  return (N(i), B(o, [i, n]), i);
}
function at(o, e = 500, t = 1, n = 0.8) {
  var a = { alpha: t },
    i = r.to(a, {
      alpha: n,
      duration: e / 1e3,
      ease: "sine.inOut",
      overwrite: "auto",
      onUpdate: function () {
        o.alpha = a.alpha;
      },
      yoyo: !0,
      repeat: -1,
    });
  return (N(i), B(o, [i]), i);
}
function it(o, e, t, n, a = !1) {
  if (void 0 === o || o.destroyed) return { stop: function () {} };
  {
    var i = a,
      s = { x: o.position.x };
    let l = r.to(s, {
      x: "-=100",
      duration: t / 1e3,
      ease: "none",
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.position.x = s.x);
      },
      onComplete: function () {
        void 0 === o || o.destroyed
          ? void 0 === n || i || ((i = !0), n())
          : o.position.x > e
            ? it(o, e, t, n, i)
            : void 0 === n || i || ((i = !0), n());
      },
      onInterrupt: function () {
        void 0 === n || i || ((i = !0), n());
      },
    });
    return (N(l), B(o, [l]), l);
  }
}
function rt(o, e, t) {
  var n = { y: o.position.y };
  N(
    r.to(n, {
      y: o.position.y + 1e3,
      duration: e / 1e3,
      ease: co,
      onUpdate: function () {
        o.position.y = n.y;
      },
      onComplete: function () {
        ((o.visible = !1), (o.position.y = 0), void 0 !== t && t());
      },
    }),
  );
}
function st(o, e, t, n) {
  var a = { x: e, y: t },
    i = r.to(a, {
      x: n.x,
      y: n.y,
      duration: 0.49,
      ease: "circ.out",
      onUpdate: function () {
        ((o.x = a.x), (o.y = a.y));
      },
      onComplete: function () {
        (dogeminer.miner.onButtonUp(), (o.alpha = 0));
      },
    });
  (N(i), B(o, [i]), dogeminer.miner.onButtonDown(), (o.alpha = 1));
}
function lt(o, e, t, n = 1e3, a) {
  let i = { x: o.position.x, y: o.position.y },
    s = t + 150,
    l = !1;
  n += Math.floor(151 * Math.random());
  let d = r.to(i, {
    x: e,
    y: t,
    duration: n / 1e3,
    ease: "quad.out",
    onUpdate: function () {
      void 0 !== o &&
        void 0 !== i &&
        void 0 !== i.x &&
        ((o.x = i.x), (o.y = i.y), i.y < s && Bo(o, 50));
    },
    onComplete: function () {
      void 0 === a || l || ((l = !0), a());
    },
    onInterrupt: function () {
      void 0 === a || l || ((l = !0), a());
    },
  });
  (N(d), B(o, [d]));
}
function dt(o, e, t, n, a) {
  let i = { x: e.x, y: e.y },
    s = !1;
  N(
    r.to(i, {
      x: t.x,
      y: t.y,
      duration: n / 1e3,
      ease: "none",
      overwrite: "auto",
      onUpdate: function () {
        ((o.position.x = i.x), (o.position.y = i.y));
      },
      onComplete: function () {
        ((o.position.x = t.x),
          (o.position.y = t.y),
          void 0 === a || s || ((s = !0), a()));
      },
      onInterrupt: function () {
        ((o.position.x = t.x),
          (o.position.y = t.y),
          void 0 === a || s || ((s = !0), a()));
      },
    }),
  );
}
function ut(o, e, t = !0) {
  var n = { rotation: o.rotation },
    a = r.to(n, {
      rotation: 2 * Math.PI,
      duration: e / 1e3,
      ease: "none",
      overwrite: "auto",
      onUpdate: function () {
        o.rotation = t ? n.rotation : -n.rotation;
      },
      repeat: -1,
    });
  (N(a), (o.myTween = a), B(o, [a]));
}
function pt(o, e = 2e3, t = 50) {
  let n = { y: o.position.y },
    a = n.y;
  var i = r.to(n, {
    y: a + t,
    duration: e / 1e3,
    onUpdate: function () {
      void 0 === o || o.destroyed || (o.position.y = n.y);
    },
    yoyo: !0,
    repeat: -1,
  });
  return (N(i), B(o, [i]), i);
}
function ct(o, e, t, n, a, i, s = 1, l) {
  J();
  var d = !1;
  function u(e) {
    void 0 === i || d || ((d = !0), i(o, e));
  }
  var p = o.position.x,
    c = o.position.y,
    f = c - (35 + Math.floor(10 * V())),
    y = p + 0.25 * (e - p),
    v = Math.min(f, t) - 60,
    h = { y: c, scale: 1.25 * s, p: 0 },
    x = r.timeline({
      onComplete: function () {
        (void 0 === o || o.destroyed || (o.alpha = 0), u(!0));
      },
      onInterrupt: function () {
        (void 0 === o || o.destroyed || (o.alpha = 0), u(!1));
      },
    });
  return (
    x.to(h, {
      y: f,
      scale: s,
      duration: n / 1e3,
      ease: "quad.out",
      onUpdate: function () {
        void 0 === o ||
          o.destroyed ||
          ((o.position.y = h.y),
          (o.scale.x = o.scale.y = h.scale),
          l && l(o, x.time()));
      },
    }),
    x.to(h, {
      p: 1,
      duration: a / 1e3,
      ease: "power2.in",
      onUpdate: function () {
        if (void 0 !== o && !o.destroyed) {
          var a = h.p,
            i = 1 - a;
          ((o.position.x = i * i * p + 2 * i * a * y + a * a * e),
            (o.position.y = i * i * f + 2 * i * a * v + a * a * t),
            (o.scale.x = o.scale.y = s * (1 - 0.75 * a)),
            (o.alpha = a < 0.8 ? 1 : 1 - (a - 0.8) / 0.2),
            l && l(o, Math.max(n / 1e3, E)));
        }
      },
    }),
    (x.stop = function () {
      x.kill();
    }),
    B(o, [x], function () {
      u(!1);
    }),
    x
  );
}
function ft(o, e = 1.06, t = 240, n, a) {
  var i = { scale: void 0 === o || o.destroyed ? 1 : o.scale.x },
    s = (t / 1e3) * 0.25,
    l = (t / 1e3) * 0.75,
    d = r.to(i, {
      keyframes: [
        { scale: e, duration: s, ease: "quad.out" },
        { scale: 1, duration: l, ease: "quad.inOut" },
      ],
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.scale.x = o.scale.y = i.scale);
      },
      onComplete: function () {
        (void 0 === o || o.destroyed || (o.scale.x = o.scale.y = 1),
          void 0 !== n && n());
      },
      onInterrupt: function () {
        (void 0 === o || o.destroyed || (o.scale.x = o.scale.y = 1),
          void 0 !== a && a());
      },
    });
  return (N(d), d);
}
function yt(o, e = 1.035, t = 700, n) {
  var a = { scale: 1 },
    i = r.to(a, {
      scale: e,
      duration: t / 1e3,
      ease: "sine.inOut",
      yoyo: !0,
      repeat: -1,
      onUpdate: function () {
        void 0 === o || o.destroyed || (o.scale.x = o.scale.y = a.scale);
      },
      onInterrupt: function () {
        (void 0 === o || o.destroyed || (o.scale.x = o.scale.y = 1),
          void 0 !== n && n());
      },
    });
  return (N(i), i);
}
var vt = 0.05;
function ht(o, e, t, n, a) {
  var i = t * (Math.PI / 180),
    r = 1 - (1 - Math.cos(i * o)) * n,
    s = 1 - (1 - Math.cos(i * e)) * n,
    l = -Math.sin(i * o) * Math.sin(i * e) * a || 0;
  return (
    r > vt || (r = vt),
    s > vt || (s = vt),
    {
      scaleX: r,
      scaleY: Math.sqrt(l * l + s * s),
      skewX: Math.atan2(l, s),
      a: r,
      c: l,
      d: s,
    }
  );
}
function xt(o) {
  return "number" == typeof o && isFinite(o)
    ? o < -1
      ? -1
      : o > 1
        ? 1
        : o
    : 0;
}
function mt(o, e, t, n) {
  var a,
    i,
    s,
    l,
    d,
    u,
    p,
    c,
    f = { lift: 0, nx: 0, ny: 0, bright: 0, flash: 0 },
    y = {
      x: 0,
      y: 0,
      lift: 0,
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      origin: !1,
      fixX: 0,
      fixY: 0,
    },
    v = o.pivot ? o.pivot.x : 0,
    h = o.pivot ? o.pivot.y : 0,
    x = o.origin ? o.origin.x : 0,
    m = o.origin ? o.origin.y : 0,
    g = 0,
    w = !1;
  function U() {
    return !w && void 0 !== o && !o.destroyed;
  }
  var k,
    b,
    C = [],
    T = [];
  var I = 1;
  function M(o) {
    return {
      child: o,
      x: o.position.x,
      y: o.position.y,
      scaleX: o.scale ? o.scale.x : 1,
      scaleY: o.scale ? o.scale.y : 1,
      skewX: o.skew ? o.skew.x : 0,
    };
  }
  function O(o) {
    var e = o.child;
    e.destroyed ||
      ((e.position.x = o.x),
      (e.position.y = o.y),
      e.scale && ((e.scale.x = o.scaleX), (e.scale.y = o.scaleY)),
      e.skew && (e.skew.x = o.skewX));
  }
  function S(o, e, t, n, a) {
    if (0 !== C.length)
      for (
        var i = 1 / o,
          r = 1 / t,
          s = -e * i * r,
          l = Math.sqrt(s * s + r * r),
          d = Math.atan2(s, r),
          u = C.length - 1;
        u >= 0;
        u--
      ) {
        var p = C[u],
          c = p.child;
        if (c.destroyed) C.splice(u, 1);
        else {
          var f = p.x - n,
            y = p.y - a;
          ((c.position.x = n + i * f + s * y),
            (c.position.y = a + r * y),
            c.scale && ((c.scale.x = p.scaleX * i), (c.scale.y = p.scaleY * l)),
            c.skew && (c.skew.x = p.skewX + d));
        }
      }
  }
  var F = { x: 1, y: 1 };
  function P() {
    return (
      (F.x = y.scaleX ? o.scale.x / y.scaleX : 1),
      (F.y = y.scaleY ? o.scale.y / y.scaleY : 1),
      F
    );
  }
  var X = "";
  function _(n) {
    if (U()) {
      var a =
        f.lift +
        "|" +
        f.nx +
        "|" +
        f.ny +
        "|" +
        f.bright +
        "|" +
        f.flash +
        "|" +
        C.length +
        "|" +
        T.length;
      if (n || a !== X) {
        X = a;
        var i = e.raise ? f.lift : 0,
          r = e.tilt ? f.nx : 0,
          s = e.tilt ? f.ny : 0,
          l = -e.raiseDistance * i,
          d = 1 + (e.raiseScale - 1) * i;
        d > vt || (d = vt);
        var u = d,
          p = d,
          c = 0,
          x = 1,
          m = 0,
          w = 1;
        if (0 !== r || 0 !== s) {
          var M = ht(r, s, e.tiltMaxDeg, e.tiltDepth, e.tiltShear);
          ((u *= M.scaleX),
            (p *= M.scaleY),
            (c = M.skewX),
            (x = M.a),
            (m = M.c),
            (w = M.d));
        }
        var O = t.centerX - e.tiltAnchor * r * t.halfWidth,
          F = t.centerY - e.tiltAnchor * s * t.halfHeight,
          _ = P(),
          q = 0,
          A = 0;
        if (
          (o.origin && ((q = (_.x - 1) * (O - v)), (A = (_.y - 1) * (F - h))),
          (o.position.x += q - y.x),
          (o.position.y += l + A - y.y),
          (o.scale.x *= u / y.scaleX),
          (o.scale.y *= p / y.scaleY),
          o.skew && (o.skew.x += c - y.skewX),
          (y.x = q),
          (y.y = l + A),
          (y.lift = l),
          (y.scaleX = u),
          (y.scaleY = p),
          (y.skewX = c),
          (y.fixX = O),
          (y.fixY = F),
          o.origin &&
            ((o.origin.x = O - v), (o.origin.y = F - h), (y.origin = !0)),
          !1 === e.tiltFlatChildren ? S(1, 0, 1, O, F) : S(x, m, w, O, F),
          (function () {
            if (0 !== T.length)
              for (
                var e = P(),
                  t = o.position.x - y.x,
                  n = o.position.y - y.y,
                  a = y.scaleX,
                  i = Math.cos(y.skewX) * y.scaleY,
                  r = e.x ? Math.sin(y.skewX) * y.scaleY * (e.y / e.x) : 0,
                  s = y.fixX - v,
                  l = y.fixY - h,
                  d = e.x * s,
                  u = e.y * l,
                  p = t + y.x + s - (a * d + r * u),
                  c = n + y.y + l - i * u,
                  f = T.length - 1;
                f >= 0;
                f--
              ) {
                var x = T[f],
                  m = x.child;
                if (m.destroyed) T.splice(f, 1);
                else {
                  var g = x.x - t,
                    w = x.y - n;
                  ((m.position.x = p + a * g + r * w),
                    (m.position.y = c + i * w));
                  var U = x.scaleX,
                    k = Math.sin(x.skewX) * x.scaleY,
                    b = Math.cos(x.skewX) * x.scaleY,
                    C = a * k + r * b,
                    I = i * b;
                  (m.scale &&
                    ((m.scale.x = a * U),
                    (m.scale.y = Math.sqrt(C * C + I * I))),
                    m.skew && (m.skew.x = Math.atan2(C, I)));
                }
              }
          })(),
          void 0 !== k && !k.destroyed)
        ) {
          var Y = !1 !== e.shadow && e.shadowAlpha > 0 ? e.shadowAlpha * i : 0;
          ((k.alpha = Y), (k.visible = Y > 0.002));
        }
        if (void 0 !== b && !b.destroyed) {
          var D =
              !1 !== e.brighten && e.brightenAlpha > 0
                ? e.brightenAlpha * f.bright
                : 0,
            E = g * f.flash,
            z = Math.min(1, D + E) * I;
          ((b.alpha = z), (b.visible = z > 0.002));
        }
      }
    }
  }
  function q() {
    ((X = ""),
      U() &&
        ((o.position.x -= y.x),
        (o.position.y -= y.y),
        (o.scale.x /= y.scaleX),
        (o.scale.y /= y.scaleY),
        o.skew && (o.skew.x -= y.skewX),
        y.origin && o.origin && ((o.origin.x = x), (o.origin.y = m))),
      (y.x = 0),
      (y.y = 0),
      (y.lift = 0),
      (y.scaleX = 1),
      (y.scaleY = 1),
      (y.skewX = 0),
      (y.origin = !1),
      (y.fixX = 0),
      (y.fixY = 0));
    for (var e = 0; e < C.length; e++) O(C[e]);
    for (var t = 0; t < T.length; t++) O(T[t]);
    (void 0 === k || k.destroyed || ((k.alpha = 0), (k.visible = !1)),
      void 0 === b || b.destroyed || ((b.alpha = 0), (b.visible = !1)),
      (f.lift = 0),
      (f.nx = 0),
      (f.ny = 0),
      (f.bright = 0));
  }
  var A = { nx: 0, ny: 0 };
  function Y() {
    void 0 !== n && n();
  }
  var D = 2 * t.halfWidth,
    E = 2 * t.halfHeight,
    z = 0;
  function L() {
    0 !== z && 0 === --z && (q(), Y());
  }
  function R() {
    (a && (a.kill(), (a = void 0)),
      i && (i.kill(), (i = void 0)),
      s && (s.tween.kill(), (s = void 0)),
      l && (l.tween.kill(), (l = void 0)),
      u && (u.kill(), (u = void 0)),
      (p = void 0),
      (z = 0),
      (d = void 0));
  }
  function G(o, t) {
    return (
      !(p !== o || !u) ||
      (u && (u.kill(), (u = void 0)),
      (p = void 0),
      !1 !== e.brighten &&
        void 0 !== b &&
        !b.destroyed &&
        f.bright !== o &&
        ((p = o),
        (u = r.to(f, {
          bright: o,
          duration: (o > f.bright ? e.brightenInMs : e.brightenOutMs) / 1e3,
          ease: o > f.bright ? e.raiseEase : e.settleEase,
          overwrite: "auto",
          onUpdate: _,
          onComplete: function () {
            ((u = void 0), (p = void 0), void 0 !== t && t());
          },
        })),
        !0))
    );
  }
  function N() {
    var o = void 0 !== c;
    (c && (c.kill(), (c = void 0)), (g = 0), (f.flash = 0), o && _(!0));
  }
  function B() {
    var o = e.tiltFollowMs + "|" + e.tiltFollowEase;
    if (d !== o) {
      (s && s.tween.kill(), l && l.tween.kill());
      var t = {
        duration: e.tiltFollowMs / 1e3,
        ease: e.tiltFollowEase,
        onUpdate: _,
      };
      ((s = r.quickTo(f, "nx", t)), (l = r.quickTo(f, "ny", t)), (d = o));
    }
  }
  return {
    enter: function (o, t) {
      U() &&
        (R(),
        (a = r.to(f, {
          lift: 1,
          duration: e.raiseMs / 1e3,
          ease: e.raiseEase,
          overwrite: "auto",
          onUpdate: _,
        })),
        e.tiltFollow
          ? (B(), s(xt(o)), l(xt(t)))
          : (i = r.to(f, {
              nx: xt(o),
              ny: xt(t),
              duration: e.tiltMs / 1e3,
              ease: e.tiltEase,
              overwrite: "auto",
              onUpdate: _,
            })),
        G(1));
    },
    move: function (o, t) {
      U() && e.tiltFollow && (B(), s(xt(o)), l(xt(t)));
    },
    leave: function () {
      if (!U()) return (q(), void Y());
      (R(),
        (z = 1),
        (a = r.to(f, {
          lift: 0,
          nx: 0,
          ny: 0,
          duration: e.settleMs / 1e3,
          ease: e.settleEase,
          overwrite: "auto",
          onUpdate: _,
          onComplete: L,
        })),
        G(0, L) && (z = 2));
    },
    stop: function () {
      w || (R(), N(), q(), (w = !0));
    },
    unit: function (e, n) {
      var a = P(),
        i = a.x,
        r = a.y,
        s = i ? (e - (o.position.x - y.x)) / i + v : v,
        l = r ? (n - (o.position.y - y.y)) / r + h : h;
      return (
        (A.nx = xt(t.halfWidth ? (s - t.centerX) / t.halfWidth : 0)),
        (A.ny = xt(t.halfHeight ? (l - t.centerY) / t.halfHeight : 0)),
        A
      );
    },
    refresh: function () {
      _(!0);
    },
    counter: function (o) {
      void 0 === o || o.destroyed || C.push(M(o));
    },
    uncounter: function (o) {
      for (var e = C.length - 1; e >= 0; e--)
        C[e].child === o && (O(C[e]), C.splice(e, 1));
    },
    follow: function (o) {
      if (void 0 !== o && !o.destroyed) {
        for (var e = 0; e < T.length; e++) if (T[e].child === o) return;
        (T.push(M(o)), _(!0));
      }
    },
    unfollow: function (o) {
      for (var e = T.length - 1; e >= 0; e--)
        T[e].child === o && (O(T[e]), T.splice(e, 1));
    },
    setShadow: function (o) {
      k = o;
    },
    setBrighten: function (o, e) {
      ((b = o), (I = "number" == typeof e && isFinite(e) ? e : 1));
    },
    brightenTo: function (o) {
      U() && G(o);
    },
    flash: function (o) {
      var e = o || {};
      if ((N(), !U() || void 0 === b || b.destroyed)) return !1;
      var t =
          "number" == typeof e.peak && isFinite(e.peak)
            ? Math.min(1, e.peak)
            : 0.5,
        n =
          "number" == typeof e.count && isFinite(e.count)
            ? Math.round(e.count)
            : 1;
      if (!(t > 0) || n < 1) return !1;
      var a = e.upMs >= 0 ? e.upMs : 150,
        i = e.downMs >= 0 ? e.downMs : 300,
        s = e.gapMs >= 0 ? e.gapMs : 100;
      g = t;
      for (
        var l = r.timeline({
            onUpdate: _,
            onComplete: function () {
              ((c = void 0),
                (g = 0),
                (f.flash = 0),
                _(!0),
                "function" == typeof e.onDone && e.onDone());
            },
          }),
          d = 0;
        d < n;
        d++
      )
        (l.to(f, { flash: 1, duration: a / 1e3, ease: e.upEase || "sine.out" }),
          l.to(f, {
            flash: 0,
            duration: i / 1e3,
            ease: e.downEase || "sine.inOut",
          }),
          d < n - 1 && s > 0 && l.to({}, { duration: s / 1e3 }));
      return ((c = l), !0);
    },
    isFlashing: function () {
      return void 0 !== c;
    },
    hitArea: {
      contains: function (o, e) {
        var t = P(),
          n = y.scaleX,
          a = Math.cos(y.skewX) * y.scaleY,
          i = Math.sin(y.skewX) * y.scaleY,
          r = o - y.fixX,
          s = e - y.fixY,
          l = y.fixX + n * r + i * s,
          d = y.fixY + a * s + (t.y ? y.lift / t.y : 0);
        return l >= 0 && l < D && d >= 0 && d < E;
      },
    },
    offset: function () {
      return { x: y.x, y: y.y };
    },
    state: f,
  };
}
export {
  M as $,
  ge as A,
  _o as B,
  Oe as C,
  Re as D,
  ue as E,
  ke as F,
  q as G,
  G as H,
  ce as I,
  F as J,
  X as K,
  de as L,
  Le as M,
  xe as N,
  le as O,
  we as P,
  P as Q,
  be as R,
  Ie as S,
  He as T,
  L as U,
  Ao as V,
  R as W,
  S as X,
  Y,
  A as Z,
  Zo as _,
  yt as a,
  k as at,
  Ko as b,
  ct as c,
  te as d,
  h as et,
  Xe as f,
  No as g,
  $e as h,
  Yo as i,
  x as it,
  ft as j,
  H as k,
  fe as l,
  ee as m,
  ne as n,
  c as nt,
  mt as o,
  g as ot,
  oe as p,
  _ as q,
  lt as r,
  U as rt,
  ht as s,
  m as st,
  Xo as t,
  b as tt,
  Ue as u,
  $o as v,
  Se as w,
  So as x,
  Bo as y,
  Ke as z,
};
