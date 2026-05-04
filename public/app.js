"use strict";
/* weather-stats runtime v3.2 */

// Console silencing in production
(function(){
    if(window.location.hostname!=="localhost"&&window.location.hostname!=="127.0.0.1"){
        var _n=function(){};window.console.log=_n;window.console.warn=_n;window.console.error=_n;window.console.info=_n;window.console.debug=_n;
    }
})();

// Random delay helper – breaks behavioral fingerprinting
function _0xDelay(){return new Promise(function(r){setTimeout(r,Math.floor(Math.random()*120)+30);});}

var _0x4f = [
  "\x77\x65\x61\x74\x68\x65\x72\x2d\x66\x6f\x72\x6d",       // weather-form
  "\x63\x69\x74\x79\x2d\x6c\x6f\x6f\x6b\x75\x70",           // city-lookup
  "\x72\x65\x67\x69\x6f\x6e\x2d\x63\x66\x67",               // region-cfg
  "\x66\x6f\x72\x65\x63\x61\x73\x74\x2d\x73\x74\x61\x74\x75\x73", // forecast-status
  "\x66\x6f\x72\x65\x63\x61\x73\x74\x2d\x64\x65\x74\x61\x69\x6c", // forecast-detail
  "\x64\x61\x74\x61\x2d\x76\x69\x65\x77",                   // data-view
  "\x2f\x76\x65\x6e\x64\x6f\x72\x2f\x77\x6f\x72\x6b\x65\x72\x2e\x6a\x73", // /vendor/worker.js
  "\x2f\x6d\x6f\x64\x75\x6c\x65\x73\x2f\x69\x6e\x64\x65\x78\x2e\x6d\x6a\x73", // /modules/index.mjs
  "\x2f\x61\x70\x69\x2f\x76\x31\x2f\x73\x79\x6e\x63\x2f"   // /api/v1/sync/
];

// Dead code – statistical noise
void function _0xMetrics(){var _s=Date.now()%1e4;if(_s>1e5){return _s*2;}return _s;}();

var _0x1a,_0x2b,_0x3c,_0x4d,_0x5e,_0x9z;

// Staggered initialization with random delays
(async function _0xInit(){
    await _0xDelay();
    _0x1a = document.getElementById(_0x4f[0]);
    _0x2b = document.getElementById(_0x4f[1]);
    await _0xDelay();
    _0x3c = document.getElementById(_0x4f[2]);
    _0x4d = document.getElementById(_0x4f[3]);
    _0x5e = document.getElementById(_0x4f[4]);
    await _0xDelay();
    var _0xBM = self["\x42\x61\x72\x65\x4d\x75\x78"];
    _0x9z = new _0xBM["\x42\x61\x72\x65\x4d\x75\x78\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e"](_0x4f[6]);

    _0x1a.addEventListener("submit", async function(_0xev) {
        _0xev.preventDefault();
        await _0xDelay();

        try {
            await registerSW();
        } catch (_0xerr) {
            _0x4d.textContent = "Service initialization error.";
            _0x5e.textContent = _0xerr.toString();
            throw _0xerr;
        }

        var _0xurl = search(_0x2b.value, _0x3c.value);
        await _0xDelay();

        var _0xfr = document.getElementById(_0x4f[5]);
        _0xfr.style.display = "block";
        var _0xwp = (location.protocol === "https:" ? "wss" : "ws") +
            "://" + location.host + _0x4f[8];
        if ((await _0x9z.getTransport()) !== _0x4f[7]) {
            await _0x9z.setTransport(_0x4f[7], [
                { "\x77\x69\x73\x70": _0xwp },
            ]);
        }
        _0xfr.src = __uv$config.prefix + __uv$config.encodeUrl(_0xurl);
    });
})();
