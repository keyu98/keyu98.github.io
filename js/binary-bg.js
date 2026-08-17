/*
 * Binary background: a sparse grid of faint 0/1 characters.
 * Bright pulses flow in from the screen edge through the side margins;
 * when one reaches the article it continues as an electric current
 * sweeping across the text, then flows out as binary again on the
 * other side — one continuous trajectory.
 */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !document.body) return;

    var CELL = 22;
    var FONT = '13px Inconsolata, monospace';
    var FAINT = 'rgba(92, 110, 116, 0.09)';
    var BRIGHT = 'rgba(0, 103, 251, 0.65)';
    var SPAWN_INTERVAL = 700;
    var MUTATE_INTERVAL = 400;
    var MAX_ACTIVE = 3;
    var PULSE_PROBABILITY = 0.6;
    var TRAIL = 6;

    var canvas = document.createElement('canvas');
    canvas.className = 'binary-bg';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
    var base = document.createElement('canvas');
    var bctx = base.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    var cols = 0, rows = 0;
    var grid = [];
    var streaks = [];
    var pulses = [];
    var article = document.querySelector('.u-container');

    function randomBit() { return Math.random() < 0.5 ? '0' : '1'; }

    function drawChar(c, ch, x, y, style) {
        c.font = FONT;
        c.fillStyle = style;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(ch, x * CELL + CELL / 2, y * CELL + CELL / 2);
    }

    function paintBaseCell(x, y) {
        bctx.clearRect(x * CELL, y * CELL, CELL, CELL);
        drawChar(bctx, grid[y][x], x, y, FAINT);
    }

    function rebuild() {
        var w = window.innerWidth, h = window.innerHeight;
        canvas.width = base.width = w * dpr;
        canvas.height = base.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        cols = Math.ceil(w / CELL);
        rows = Math.ceil(h / CELL);
        grid = [];
        bctx.clearRect(0, 0, w, h);
        for (var y = 0; y < rows; y++) {
            var row = [];
            for (var x = 0; x < cols; x++) {
                var ch = randomBit();
                row.push(ch);
                drawChar(bctx, ch, x, y, FAINT);
            }
            grid.push(row);
        }
        streaks = [];
        for (var i = 0; i < pulses.length; i++) {
            if (pulses[i].el && pulses[i].el.parentNode) pulses[i].el.parentNode.removeChild(pulses[i].el);
        }
        pulses = [];
    }

    function articleRect() {
        if (!article) article = document.querySelector('.u-container');
        return article ? article.getBoundingClientRect() : null;
    }

    // Ambient short streaks that light up anywhere in the margins
    function spawnStreak() {
        var horizontal = Math.random() < 0.5;
        var len = 6 + Math.floor(Math.random() * 9);
        var x = horizontal ? Math.floor(Math.random() * Math.max(cols - len, 1))
                           : Math.floor(Math.random() * cols);
        var y = horizontal ? Math.floor(Math.random() * rows)
                           : Math.floor(Math.random() * Math.max(rows - len, 1));
        streaks.push({
            x: x, y: y,
            dx: horizontal ? 1 : 0,
            dy: horizontal ? 0 : 1,
            len: len,
            head: -1,
            speed: 0.22 + Math.random() * 0.22
        });
    }

    // A through-pulse: binary in from the edge -> current across the
    // article -> binary out the other side, all on one row.
    function spawnPulse() {
        var rect = articleRect();
        if (!rect || rect.width <= 0 || rows < 3) return false;

        var leftEdge = Math.floor(rect.left / CELL);
        var rightEdge = Math.ceil(rect.right / CELL);
        var dir = Math.random() < 0.5 ? 1 : -1;
        if (dir === 1 && leftEdge < 3) dir = -1;
        if (dir === -1 && cols - rightEdge < 3) dir = 1;
        if (dir === 1 && leftEdge < 3) return false;

        pulses.push({
            row: 1 + Math.floor(Math.random() * (rows - 2)),
            dir: dir,
            phase: 'in',
            head: dir === 1 ? 0 : cols - 1,
            edgeIn: dir === 1 ? leftEdge : rightEdge,
            speed: 0.4 + Math.random() * 0.25,
            segW: 0,
            el: null
        });
        return true;
    }

    function drawTrail(row, headF, dir) {
        var headC = Math.round(headF);
        for (var k = 0; k < TRAIL; k++) {
            var c = headC - k * dir;
            if (c < 0 || c >= cols) continue;
            ctx.globalAlpha = 1 - k / TRAIL;
            drawChar(ctx, randomBit(), c, row, BRIGHT);
        }
        ctx.globalAlpha = 1;
    }

    function stepPulse(p, now) {
        var rect = articleRect();
        if (!rect || rect.width <= 0) return false;

        if (p.phase === 'in' || p.phase === 'out') {
            p.head += p.speed * p.dir;
            drawTrail(p.row, p.head, p.dir);

            if (p.phase === 'in') {
                var reached = p.dir === 1 ? p.head >= p.edgeIn : p.head <= p.edgeIn;
                if (reached) {
                    p.phase = 'article';
                    p.t0 = now;
                    var pxPerMs = p.speed * CELL * 60 / 1000;
                    p.duration = Math.max(rect.width / pxPerMs, 320);
                    p.segW = Math.min(rect.width * 0.3, 200);
                    p.el = document.createElement('div');
                    p.el.className = 'current-flash' + (p.dir === -1 ? ' current-flash--rev' : '');
                    p.el.style.top = (p.row * CELL + CELL / 2) + 'px';
                    p.el.style.width = p.segW + 'px';
                    document.body.appendChild(p.el);
                }
                return true;
            }

            var done = p.dir === 1 ? p.head >= cols - 1 : p.head <= 0;
            return !done;
        }

        // phase === 'article': sweep the current across the text
        var pr = (now - p.t0) / p.duration;
        if (pr >= 1) {
            if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
            p.el = null;
            p.phase = 'out';
            p.head = p.dir === 1 ? Math.ceil(rect.right / CELL) : Math.floor(rect.left / CELL);
            return true;
        }
        var startX = p.dir === 1 ? rect.left - p.segW : rect.left + rect.width;
        var endX = p.dir === 1 ? rect.left + rect.width : rect.left - p.segW;
        p.el.style.transform = 'translateX(' + (startX + (endX - startX) * pr) + 'px)';
        p.el.style.opacity = pr < 0.15 ? pr / 0.15 : 1 - (pr - 0.15) / 0.85;
        return true;
    }

    var lastSpawn = 0, lastMutate = 0, resizeTimer = null;

    function frame(now) {
        var w = window.innerWidth, h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(base, 0, 0, w, h);

        if (now - lastSpawn > SPAWN_INTERVAL && streaks.length + pulses.length < MAX_ACTIVE) {
            var made = Math.random() < PULSE_PROBABILITY ? spawnPulse() : false;
            if (!made) spawnStreak();
            lastSpawn = now;
        }
        if (now - lastMutate > MUTATE_INTERVAL && cols > 0) {
            var mx = Math.floor(Math.random() * cols);
            var my = Math.floor(Math.random() * rows);
            grid[my][mx] = grid[my][mx] === '0' ? '1' : '0';
            paintBaseCell(mx, my);
            lastMutate = now;
        }

        for (var i = streaks.length - 1; i >= 0; i--) {
            var s = streaks[i];
            s.head += s.speed;
            if (s.head - 3 > s.len) { streaks.splice(i, 1); continue; }

            for (var j = 0; j < s.len; j++) {
                var d = Math.abs(s.head - j);
                if (d > 2.5) continue;
                ctx.globalAlpha = 1 - d / 2.5;
                drawChar(ctx, randomBit(), s.x + j * s.dx, s.y + j * s.dy, BRIGHT);
                ctx.globalAlpha = 1;
            }
        }

        for (var i2 = pulses.length - 1; i2 >= 0; i2--) {
            if (!stepPulse(pulses[i2], now)) pulses.splice(i2, 1);
        }

        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(rebuild, 150);
    });

    rebuild();
    requestAnimationFrame(frame);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(rebuild);
    }
})();