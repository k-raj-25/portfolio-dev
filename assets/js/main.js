(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero video (plays in a box over the shader) ---------- */
  var heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    if (reduce) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
    } else {
      var showVideo = function () {
        var h = document.getElementById('hero');
        if (h) h.classList.add('has-video');
      };
      heroVideo.addEventListener('playing', showVideo);
      // Autoplay can start before this script runs, so 'playing' may already have fired.
      if (!heroVideo.paused && heroVideo.readyState > 2) showVideo();
      var playing = heroVideo.play();
      if (playing && playing.then) playing.then(showVideo, function () {});
    }
  }

  /* ---------- Shader hero (raw WebGL) ---------- */
  if (document.getElementById('shader')) (function () {
  var hero = document.getElementById('hero'), cv = document.getElementById('shader');
  var gl = null;
  try { gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false }); } catch (e) {}
  if (!gl) { hero.classList.add('noshader'); }
  else {
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
    var fs = [
      'precision mediump float;',
      'uniform vec2 r;uniform float t;uniform vec2 m;uniform vec2 c;',
      'void main(){',
      ' vec2 uv=(gl_FragCoord.xy*2.0-r)/min(r.x,r.y);',
      ' vec2 q=uv-c-m*0.08;',
      ' float d=length(q);',
      ' float a=atan(q.y,q.x);',
      ' vec3 col=vec3(0.0);',
      ' for(int j=0;j<3;j++){',
      '  for(int i=0;i<5;i++){',
      '   float fi=float(i);',
      '   float ring=fract(t*0.03-0.014*float(j)+fi*0.012)*5.0;',
      '   float wob=0.04*sin(a*5.0+t*0.5+fi*1.3)+0.02*sin(a*9.0-t*0.35);',
      '   col[j]+=0.0017*fi*fi/abs(ring-d+wob);',
      '  }',
      ' }',
      ' vec3 tint=vec3(0.39,0.89,1.0)*col.r+vec3(0.58,0.52,1.0)*col.g+vec3(1.0,0.70,0.49)*col.b;',
      ' tint*=0.9; tint=tint/(1.0+tint);',
      ' float vig=smoothstep(3.0,0.3,length(q*vec2(0.8,1.0)));',
      ' gl_FragColor=vec4(vec3(0.027,0.031,0.039)+tint*vig,1.0);',
      '}'
    ].join('\n');
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(s)); } return s; }
    try {
      var prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog); gl.useProgram(prog);
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't'), uM = gl.getUniformLocation(prog, 'm'), uC = gl.getUniformLocation(prog, 'c');
      var mx = 0, my = 0, tmx = 0, tmy = 0, t0 = performance.now(), onScreen = true;
      function size() {
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        var w = hero.clientWidth, h = hero.clientHeight;
        cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
        gl.viewport(0, 0, cv.width, cv.height);
        var mn = Math.min(w, h);
        if (w > 820) gl.uniform2f(uC, (w / mn) * 0.48, 0.05); else gl.uniform2f(uC, 0.0, (h / mn) * 0.42);
        draw(reduce ? 6.0 : (performance.now() - t0) / 1000);
      }
      function draw(sec) {
        gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, sec + 6.0); gl.uniform2f(uM, mx, my);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      window.addEventListener('pointermove', function (e) { tmx = e.clientX / innerWidth * 2 - 1; tmy = -(e.clientY / innerHeight * 2 - 1); }, { passive: true });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; }).observe(hero);
      function loop() {
        if (onScreen && !document.hidden) { mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04; draw((performance.now() - t0) / 1000); }
        requestAnimationFrame(loop);
      }
      size();
      if ('ResizeObserver' in window) new ResizeObserver(size).observe(hero); else window.addEventListener('resize', size);
      if (!reduce) requestAnimationFrame(loop);
    } catch (err) { hero.classList.add('noshader'); cv.style.display = 'none'; }
  }
  })();

  /* ---------- Text rotate ---------- */
  if (document.getElementById('rot')) (function () {
  var words = ['automations', 'lead funnels', 'CRMs', 'follow-ups'];
  var rot = document.getElementById('rot'), wi = 0;
  function build(w) {
    var s = document.createElement('span'); s.className = 'rw';
    Array.prototype.forEach.call(w, function (ch, i) {
      var l = document.createElement('span'); l.className = 'l';
      l.textContent = ch === ' ' ? ' ' : ch; l.style.transitionDelay = (i * 24) + 'ms'; s.appendChild(l);
    });
    return s;
  }
  rot.innerHTML = ''; rot.appendChild(build(words[0]));
  if (!reduce) setInterval(function () {
    var old = rot.querySelector('.rw:not(.out)');
    wi = (wi + 1) % words.length;
    var n = build(words[wi]); n.classList.add('enter'); rot.appendChild(n);
    old.classList.add('out');
    requestAnimationFrame(function () { requestAnimationFrame(function () { n.classList.remove('enter'); }); });
    setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 1000);
  }, 2600);
  })();

  /* ---------- Container scroll ---------- */
  if (document.getElementById('device')) (function () {
  var device = document.getElementById('device'), csHead = document.getElementById('cs-head'), showcase = document.getElementById('showcase');
  function onScroll() {
    if (reduce) return;
    var r = showcase.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
    var mobile = window.innerWidth < 760;
    device.style.setProperty('--rx', (20 * (1 - p)).toFixed(2) + 'deg');
    device.style.setProperty('--sc', mobile ? (0.92 + 0.08 * p).toFixed(3) : (1.05 - 0.05 * p).toFixed(3));
    csHead.style.transform = 'translateY(' + (-40 * p).toFixed(1) + 'px)';
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(onScroll); }, { passive: true });
  window.addEventListener('resize', onScroll); onScroll();
  })();

  /* ---------- Glowing bento ---------- */
  var cells = Array.prototype.slice.call(document.querySelectorAll('.cell'));
  window.addEventListener('pointermove', function (e) {
    cells.forEach(function (c) {
      var b = c.getBoundingClientRect(), pad = 70;
      var near = e.clientX > b.left - pad && e.clientX < b.right + pad && e.clientY > b.top - pad && e.clientY < b.bottom + pad;
      c.style.setProperty('--glow', near ? '1' : '0');
      if (near) {
        var cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        var ang = Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180 / Math.PI;
        c.style.setProperty('--angle', ang.toFixed(1));
      }
    });
  }, { passive: true });

  /* ---------- Image accordion ---------- */
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  function activate(p) { panels.forEach(function (x) { var on = x === p; x.classList.toggle('active', on); x.setAttribute('aria-expanded', on ? 'true' : 'false'); }); }
  panels.forEach(function (p) {
    p.addEventListener('mouseenter', function () { if (window.innerWidth > 760) activate(p); });
    p.addEventListener('click', function () { activate(p); });
    p.addEventListener('focus', function () { activate(p); });
  });

  /* ---------- Liquid glass highlight follows pointer ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.glass'), function (g) {
    g.addEventListener('pointermove', function (e) { var b = g.getBoundingClientRect(); g.style.setProperty('--mx', ((e.clientX - b.left) / b.width * 100).toFixed(0) + '%'); });
  });

  /* ---------- Curtain footer ---------- */
  if (document.getElementById('mf')) (function () {
  var mf = document.getElementById('mf'), main = document.querySelector('main');
  function fh() { main.style.setProperty('--fh', mf.offsetHeight + 'px'); }
  fh(); window.addEventListener('resize', fh);
  })();

  /* ---------- Magnetic pills ---------- */
  if (!reduce) Array.prototype.forEach.call(document.querySelectorAll('.mag'), function (el) {
    el.addEventListener('pointermove', function (e) {
      var b = el.getBoundingClientRect();
      el.style.transform = 'translate(' + ((e.clientX - b.left - b.width / 2) * 0.25).toFixed(1) + 'px,' + ((e.clientY - b.top - b.height / 2) * 0.35).toFixed(1) + 'px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  /* ---------- Copy email ---------- */
  if (document.getElementById('copy')) (function () {
  var copy = document.getElementById('copy');
  copy.addEventListener('click', function () {
    var mail = document.getElementById('mail');
    function sel() { var r = document.createRange(); r.selectNodeContents(mail); var s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = 'Selected, press Ctrl+C'; }
    try { navigator.clipboard.writeText(mail.textContent).then(function () { copy.textContent = 'Copied'; }, sel); } catch (e) { sel(); }
    setTimeout(function () { copy.textContent = 'Copy email'; }, 2000);
  });
  })();

  /* ---------- Request-a-call form (sent with FormSubmit) ---------- */
  if (document.getElementById('call-form')) (function () {
  var form = document.getElementById('call-form'), send = document.getElementById('send'), note = document.getElementById('note');
  function setNote(msg, ok) { note.className = ok ? 'note ok' : 'note'; note.textContent = msg; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (send.dataset.state) return;
    var n = document.getElementById('f-name'), em = document.getElementById('f-email');
    if (!n.value.trim() || !em.value.trim() || !em.checkValidity()) { setNote('Add your name and a valid email so I can reply.'); return; }
    if (form.querySelector('[name="_honey"]').value) return;
    var needs = Array.prototype.map.call(form.querySelectorAll('input[name="need"]:checked'), function (c) { return c.value; });
    var payload = {
      name: n.value.trim(),
      email: em.value.trim(),
      needs: needs.join(', ') || 'Not specified',
      best_time: document.getElementById('f-time').value.trim(),
      message: document.getElementById('f-msg').value.trim(),
      _subject: 'New call request from ' + n.value.trim(),
      _template: 'table',
      _replyto: em.value.trim()
    };
    setNote(''); send.dataset.state = 'loading';
    fetch(form.getAttribute('action'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().then(function (d) { if (!r.ok || String(d.success) === 'false') throw new Error(d.message || 'Request failed'); }); })
      .then(function () {
        send.dataset.state = 'done';
        setNote('Thanks, your request is in. I\u2019ll email you to set up a time.', true);
        form.reset();
        setTimeout(function () { delete send.dataset.state; }, 3500);
      })
      .catch(function () {
        delete send.dataset.state;
        setNote('That didn\u2019t go through. Please email me directly at ' + document.getElementById('mail2').textContent + '.');
      });
  });
  })();

  /* ---------- Second copy button ---------- */
  if (document.getElementById('copy2')) (function () {
  var copy2 = document.getElementById('copy2');
  copy2.addEventListener('click', function () {
    var m = document.getElementById('mail2');
    function sel() { var r = document.createRange(); r.selectNodeContents(m); var s = getSelection(); s.removeAllRanges(); s.addRange(r); copy2.textContent = 'Selected'; }
    try { navigator.clipboard.writeText(m.textContent).then(function () { copy2.textContent = 'Copied'; }, sel); } catch (e) { sel(); }
    setTimeout(function () { copy2.textContent = 'Copy'; }, 2000);
  });
  })();

  /* ---------- Spotlight cards ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.spot'), function (c) {
    c.addEventListener('pointermove', function (e) { var b = c.getBoundingClientRect(); c.style.setProperty('--sx', (e.clientX - b.left) + 'px'); c.style.setProperty('--sy', (e.clientY - b.top) + 'px'); });
  });

  /* ---------- Live IST clock ---------- */
  if (document.getElementById('clock')) (function () {
  var clock = document.getElementById('clock');
  function tick() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(new Date());
      var h = '', mi = '', ap = '';
      parts.forEach(function (p) { if (p.type === 'hour') h = p.value; if (p.type === 'minute') mi = p.value; if (p.type === 'dayPeriod') ap = p.value; });
      clock.innerHTML = h + ':' + mi + '<small>' + ap + ' IST</small>';
    } catch (e) { clock.textContent = 'IST'; }
  }
  tick(); setInterval(tick, 15000);
  })();

  /* ---------- Dotted globe (canvas 2D) ---------- */
  if (document.getElementById('globe')) (function () {
  var gc = document.getElementById('globe'), g2 = gc.getContext('2d');
  var GN = 700, gpts = [];
  for (var gi = 0; gi < GN; gi++) {
    var gy = 1 - (gi / (GN - 1)) * 2, gr = Math.sqrt(1 - gy * gy), gth = gi * 2.399963;
    gpts.push([Math.cos(gth) * gr, gy, Math.sin(gth) * gr]);
  }
  var lat = 21 * Math.PI / 180, lon = 79 * Math.PI / 180;
  var india = [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
  var rotA = lon - 0.6, tiltB = -0.35, dragging = false, lastX = 0, vel = 0;
  function proj(p) {
    var ca = Math.cos(rotA), sa = Math.sin(rotA), cb = Math.cos(tiltB), sb = Math.sin(tiltB);
    var x = p[0] * ca - p[2] * sa, z = p[0] * sa + p[2] * ca;
    var y = p[1] * cb - z * sb, z2 = p[1] * sb + z * cb;
    return [x, y, z2];
  }
  function drawGlobe(now) {
    var W = gc.width, H = gc.height, R = W * 0.44, cx = W / 2, cy = H / 2;
    g2.clearRect(0, 0, W, H);
    var grad = g2.createRadialGradient(cx - R * .3, cy - R * .35, R * .1, cx, cy, R * 1.05);
    grad.addColorStop(0, 'rgba(147,132,255,0.16)'); grad.addColorStop(1, 'rgba(99,227,255,0.02)');
    g2.fillStyle = grad; g2.beginPath(); g2.arc(cx, cy, R, 0, Math.PI * 2); g2.fill();
    g2.strokeStyle = 'rgba(237,238,240,0.08)'; g2.lineWidth = 1; g2.stroke();
    for (var i = 0; i < gpts.length; i++) {
      var q = proj(gpts[i]); if (q[2] < 0) continue;
      g2.fillStyle = 'rgba(237,238,240,' + (0.22 + q[2] * 0.7).toFixed(3) + ')';
      g2.fillRect(cx + q[0] * R - 1.4, cy - q[1] * R - 1.4, 2.8, 2.8);
    }
    var m = proj(india);
    if (m[2] > -0.05) {
      var mx2 = cx + m[0] * R, my2 = cy - m[1] * R, ph = ((now || 0) / 1600) % 1;
      g2.strokeStyle = 'rgba(99,227,255,' + (0.8 * (1 - ph)).toFixed(3) + ')'; g2.lineWidth = 2;
      g2.beginPath(); g2.arc(mx2, my2, 6 + ph * 22, 0, Math.PI * 2); g2.stroke();
      g2.fillStyle = '#63E3FF'; g2.shadowColor = '#63E3FF'; g2.shadowBlur = 14;
      g2.beginPath(); g2.arc(mx2, my2, 5.5, 0, Math.PI * 2); g2.fill(); g2.shadowBlur = 0;
    }
  }
  gc.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; vel = 0; try { gc.setPointerCapture(e.pointerId); } catch (er) {} });
  gc.addEventListener('pointermove', function (e) { if (!dragging) return; var dx = e.clientX - lastX; lastX = e.clientX; rotA += dx * 0.012; vel = dx * 0.012; if (reduce) drawGlobe(0); });
  gc.addEventListener('pointerup', function () { dragging = false; });
  gc.addEventListener('pointercancel', function () { dragging = false; });
  var globeVisible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { globeVisible = en[0].isIntersecting; }).observe(gc);
  function globeLoop(now) {
    if (globeVisible && !document.hidden) {
      if (!dragging) { vel *= 0.95; rotA += 0.004 + vel; }
      drawGlobe(now);
    }
    requestAnimationFrame(globeLoop);
  }
  drawGlobe(0);
  if (!reduce) requestAnimationFrame(globeLoop);
  })();
})();
