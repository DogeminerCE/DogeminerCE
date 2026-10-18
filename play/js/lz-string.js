// LZ-String, Copyright (c) 2013 Pieroxy, MIT license.
// Pinned implementation from the audited DM2 bundle; see docs/credits/lz-string.md.
window.DogeMinerLZString = (function () {
      var e = String.fromCharCode,
        t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",
        i = {};
      function o(e, t) {
        if (!i[e]) {
          i[e] = {};
          for (var n = 0; n < e.length; n++) i[e][e.charAt(n)] = n;
        }
        return i[e][t];
      }
      var r = {
        compressToBase64: function (e) {
          if (null == e) return "";
          var n = r._compress(e, 6, function (e) {
            return t.charAt(e);
          });
          switch (n.length % 4) {
            default:
            case 0:
              return n;
            case 1:
              return n + "===";
            case 2:
              return n + "==";
            case 3:
              return n + "=";
          }
        },
        decompressFromBase64: function (e) {
          return null == e
            ? ""
            : "" == e
              ? null
              : r._decompress(e.length, 32, function (n) {
                  return o(t, e.charAt(n));
                });
        },
        compressToUTF16: function (t) {
          return null == t
            ? ""
            : r._compress(t, 15, function (t) {
                return e(t + 32);
              }) + " ";
        },
        decompressFromUTF16: function (e) {
          return null == e
            ? ""
            : "" == e
              ? null
              : r._decompress(e.length, 16384, function (t) {
                  return e.charCodeAt(t) - 32;
                });
        },
        compressToUint8Array: function (e) {
          for (
            var t = r.compress(e),
              n = new Uint8Array(2 * t.length),
              i = 0,
              o = t.length;
            i < o;
            i++
          ) {
            var a = t.charCodeAt(i);
            ((n[2 * i] = a >>> 8), (n[2 * i + 1] = a % 256));
          }
          return n;
        },
        decompressFromUint8Array: function (t) {
          if (null == t) return r.decompress(t);
          for (var n = new Array(t.length / 2), i = 0, o = n.length; i < o; i++)
            n[i] = 256 * t[2 * i] + t[2 * i + 1];
          var a = [];
          return (
            n.forEach(function (t) {
              a.push(e(t));
            }),
            r.decompress(a.join(""))
          );
        },
        compressToEncodedURIComponent: function (e) {
          return null == e
            ? ""
            : r._compress(e, 6, function (e) {
                return n.charAt(e);
              });
        },
        decompressFromEncodedURIComponent: function (e) {
          return null == e
            ? ""
            : "" == e
              ? null
              : ((e = e.replace(/ /g, "+")),
                r._decompress(e.length, 32, function (t) {
                  return o(n, e.charAt(t));
                }));
        },
        compress: function (t) {
          return r._compress(t, 16, function (t) {
            return e(t);
          });
        },
        _compress: function (e, t, n) {
          if (null == e) return "";
          var i,
            o,
            r,
            a = {},
            s = {},
            l = "",
            d = "",
            c = "",
            u = 2,
            h = 3,
            p = 2,
            m = [],
            g = 0,
            f = 0;
          for (r = 0; r < e.length; r += 1)
            if (
              ((l = e.charAt(r)),
              Object.prototype.hasOwnProperty.call(a, l) ||
                ((a[l] = h++), (s[l] = !0)),
              (d = c + l),
              Object.prototype.hasOwnProperty.call(a, d))
            )
              c = d;
            else {
              if (Object.prototype.hasOwnProperty.call(s, c)) {
                if (c.charCodeAt(0) < 256) {
                  for (i = 0; i < p; i++)
                    ((g <<= 1),
                      f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++);
                  for (o = c.charCodeAt(0), i = 0; i < 8; i++)
                    ((g = (g << 1) | (1 & o)),
                      f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++,
                      (o >>= 1));
                } else {
                  for (o = 1, i = 0; i < p; i++)
                    ((g = (g << 1) | o),
                      f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++,
                      (o = 0));
                  for (o = c.charCodeAt(0), i = 0; i < 16; i++)
                    ((g = (g << 1) | (1 & o)),
                      f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++,
                      (o >>= 1));
                }
                (0 == --u && ((u = Math.pow(2, p)), p++), delete s[c]);
              } else
                for (o = a[c], i = 0; i < p; i++)
                  ((g = (g << 1) | (1 & o)),
                    f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++,
                    (o >>= 1));
              (0 == --u && ((u = Math.pow(2, p)), p++),
                (a[d] = h++),
                (c = String(l)));
            }
          if ("" !== c) {
            if (Object.prototype.hasOwnProperty.call(s, c)) {
              if (c.charCodeAt(0) < 256) {
                for (i = 0; i < p; i++)
                  ((g <<= 1),
                    f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++);
                for (o = c.charCodeAt(0), i = 0; i < 8; i++)
                  ((g = (g << 1) | (1 & o)),
                    f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++,
                    (o >>= 1));
              } else {
                for (o = 1, i = 0; i < p; i++)
                  ((g = (g << 1) | o),
                    f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++,
                    (o = 0));
                for (o = c.charCodeAt(0), i = 0; i < 16; i++)
                  ((g = (g << 1) | (1 & o)),
                    f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++,
                    (o >>= 1));
              }
              (0 == --u && ((u = Math.pow(2, p)), p++), delete s[c]);
            } else
              for (o = a[c], i = 0; i < p; i++)
                ((g = (g << 1) | (1 & o)),
                  f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++,
                  (o >>= 1));
            0 == --u && ((u = Math.pow(2, p)), p++);
          }
          for (o = 2, i = 0; i < p; i++)
            ((g = (g << 1) | (1 & o)),
              f == t - 1 ? ((f = 0), m.push(n(g)), (g = 0)) : f++,
              (o >>= 1));
          for (;;) {
            if (((g <<= 1), f == t - 1)) {
              m.push(n(g));
              break;
            }
            f++;
          }
          return m.join("");
        },
        decompress: function (e) {
          return null == e
            ? ""
            : "" == e
              ? null
              : r._decompress(e.length, 32768, function (t) {
                  return e.charCodeAt(t);
                });
        },
        _decompress: function (t, n, i) {
          var o,
            r,
            a,
            s,
            l,
            d,
            c,
            u = [],
            h = 4,
            p = 4,
            m = 3,
            g = "",
            f = [],
            y = { val: i(0), position: n, index: 1 };
          for (o = 0; o < 3; o += 1) u[o] = o;
          for (a = 0, l = Math.pow(2, 2), d = 1; d != l; )
            ((s = y.val & y.position),
              (y.position >>= 1),
              0 == y.position && ((y.position = n), (y.val = i(y.index++))),
              (a |= (s > 0 ? 1 : 0) * d),
              (d <<= 1));
          switch (a) {
            case 0:
              for (a = 0, l = Math.pow(2, 8), d = 1; d != l; )
                ((s = y.val & y.position),
                  (y.position >>= 1),
                  0 == y.position && ((y.position = n), (y.val = i(y.index++))),
                  (a |= (s > 0 ? 1 : 0) * d),
                  (d <<= 1));
              c = e(a);
              break;
            case 1:
              for (a = 0, l = Math.pow(2, 16), d = 1; d != l; )
                ((s = y.val & y.position),
                  (y.position >>= 1),
                  0 == y.position && ((y.position = n), (y.val = i(y.index++))),
                  (a |= (s > 0 ? 1 : 0) * d),
                  (d <<= 1));
              c = e(a);
              break;
            case 2:
              return "";
          }
          for (u[3] = c, r = c, f.push(c); ; ) {
            if (y.index > t) return "";
            for (a = 0, l = Math.pow(2, m), d = 1; d != l; )
              ((s = y.val & y.position),
                (y.position >>= 1),
                0 == y.position && ((y.position = n), (y.val = i(y.index++))),
                (a |= (s > 0 ? 1 : 0) * d),
                (d <<= 1));
            switch ((c = a)) {
              case 0:
                for (a = 0, l = Math.pow(2, 8), d = 1; d != l; )
                  ((s = y.val & y.position),
                    (y.position >>= 1),
                    0 == y.position &&
                      ((y.position = n), (y.val = i(y.index++))),
                    (a |= (s > 0 ? 1 : 0) * d),
                    (d <<= 1));
                ((u[p++] = e(a)), (c = p - 1), h--);
                break;
              case 1:
                for (a = 0, l = Math.pow(2, 16), d = 1; d != l; )
                  ((s = y.val & y.position),
                    (y.position >>= 1),
                    0 == y.position &&
                      ((y.position = n), (y.val = i(y.index++))),
                    (a |= (s > 0 ? 1 : 0) * d),
                    (d <<= 1));
                ((u[p++] = e(a)), (c = p - 1), h--);
                break;
              case 2:
                return f.join("");
            }
            if ((0 == h && ((h = Math.pow(2, m)), m++), u[c])) g = u[c];
            else {
              if (c !== p) return null;
              g = r + r.charAt(0);
            }
            (f.push(g),
              (u[p++] = r + g.charAt(0)),
              (r = g),
              0 == --h && ((h = Math.pow(2, m)), m++));
          }
        },
      };
      return r;
    })();
