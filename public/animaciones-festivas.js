// Animaciones Festivas - UAEM Kiosco
// Canvas/CSS animations para cada fecha especial
(function () {
    function init() {
        const tema = window.TEMA_FESTIVO;
        if (!tema) return;
        const esPortada = !!document.getElementById('canvas-particulas');

        switch (tema.nombre) {
            case 'nochevieja':   animReloj(esPortada);   break;
            case 'anio-nuevo':   animFuegos(esPortada);  break;
            case 'san-valentin': animCorazon(esPortada); break;
            case 'bandera':      animBandera(esPortada); break;
            case 'muertos':      animMictlan(esPortada); break;
            case 'navidad':      animNavidad(esPortada); break;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }

    // ═══════════════════════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════════════════════
    function mkCanvas(w, h, style) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.style.cssText = style + ';pointer-events:none;';
        document.body.appendChild(c);
        return c;
    }
    function fullCanvas(zIndex) {
        const c = mkCanvas(innerWidth, innerHeight,
            `position:fixed;inset:0;z-index:${zIndex}`);
        window.addEventListener('resize', () => {
            c.width = innerWidth; c.height = innerHeight;
        });
        return c;
    }

    // ═══════════════════════════════════════════════════════════════
    //  1. NOCHEVIEJA – Reloj analógico + cuenta regresiva
    // ═══════════════════════════════════════════════════════════════
    function animReloj(esPortada) {
        const sz  = esPortada ? 230 : 175;
        const pos = esPortada ? 'bottom:80px;right:70px' : 'bottom:80px;right:28px';
        const c   = mkCanvas(sz, sz, `position:fixed;${pos};z-index:62;opacity:.92`);
        const ctx = c.getContext('2d');
        const cx  = sz / 2, r = sz / 2 - 10;

        function tick() {
            const now = new Date();
            const H = now.getHours(), M = now.getMinutes(), S = now.getSeconds(), ms = now.getMilliseconds();

            ctx.clearRect(0, 0, sz, sz);

            // Aura
            const aura = ctx.createRadialGradient(cx, cx, r * .3, cx, cx, r * 1.1);
            aura.addColorStop(0, 'rgba(255,215,0,.18)');
            aura.addColorStop(1, 'transparent');
            ctx.fillStyle = aura;
            ctx.beginPath(); ctx.arc(cx, cx, r * 1.1, 0, Math.PI * 2); ctx.fill();

            // Cara
            ctx.beginPath(); ctx.arc(cx, cx, r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(5,5,30,.88)'; ctx.fill();
            ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3; ctx.stroke();

            // Marcas
            for (let i = 0; i < 60; i++) {
                const a  = (i / 60) * Math.PI * 2 - Math.PI / 2;
                const l  = i % 5 === 0 ? 10 : 5;
                const r2 = r - 4;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * r2, cx + Math.sin(a) * r2);
                ctx.lineTo(cx + Math.cos(a) * (r2 - l), cx + Math.sin(a) * (r2 - l));
                ctx.strokeStyle = i % 5 === 0 ? '#ffd700' : 'rgba(255,215,0,.35)';
                ctx.lineWidth   = i % 5 === 0 ? 2 : 1;
                ctx.stroke();
            }

            // Manecillas
            function mano(angle, len, w, color) {
                ctx.save(); ctx.translate(cx, cx); ctx.rotate(angle - Math.PI / 2);
                ctx.beginPath();
                ctx.moveTo(-len * .18, 0); ctx.lineTo(len, 0);
                ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();
                ctx.restore();
            }
            mano(((H % 12) + M / 60) * Math.PI * 2 / 12,       r * .48, 4,   '#ffd700');
            mano((M + S / 60) * Math.PI * 2 / 60,              r * .68, 3,   '#ffffff');
            mano((S + ms / 1000) * Math.PI * 2 / 60,           r * .82, 1.5, '#ff6b00');

            // Centro
            ctx.beginPath(); ctx.arc(cx, cx, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffd700'; ctx.fill();

            // Cuenta regresiva a medianoche
            const mid  = new Date(now); mid.setHours(24, 0, 0, 0);
            const diff = mid - now;
            const rh   = String(Math.floor(diff / 3600000)).padStart(2, '0');
            const rm   = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
            const rs   = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

            ctx.fillStyle = '#ffd700';
            ctx.font = `bold ${sz * .1}px Montserrat,sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 8;
            ctx.fillText(`${rh}:${rm}:${rs}`, cx, cx + r * .44);
            ctx.font = `${sz * .065}px Montserrat,sans-serif`;
            ctx.fillStyle = 'rgba(255,215,0,.55)';
            ctx.fillText('FALTAN PARA MEDIANOCHE', cx, cx - r * .52);
            ctx.shadowBlur = 0;

            requestAnimationFrame(tick);
        }
        tick();
    }

    // ═══════════════════════════════════════════════════════════════
    //  2. AÑO NUEVO – Fuegos artificiales + mensaje
    // ═══════════════════════════════════════════════════════════════
    function animFuegos(esPortada) {
        const c   = fullCanvas(60);
        const ctx = c.getContext('2d');
        const anio = new Date().getFullYear();

        class Part {
            constructor(x, y, vx, vy, col) {
                this.x = x; this.y = y; this.vx = vx; this.vy = vy;
                this.col = col; this.a = 1; this.sz = Math.random() * 2.5 + .5;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.vy += .06; this.vx *= .985; this.vy *= .985;
                this.a -= .012;
            }
            draw() {
                if (this.a <= 0) return;
                ctx.save(); ctx.globalAlpha = this.a;
                ctx.fillStyle = this.col;
                ctx.shadowColor = this.col; ctx.shadowBlur = 5;
                ctx.beginPath(); ctx.arc(this.x, this.y, this.sz, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }

        class Cohete {
            constructor() {
                this.x  = innerWidth * (.1 + Math.random() * .8);
                this.y  = innerHeight;
                this.ty = innerHeight * (.12 + Math.random() * .38);
                this.sp = 7 + Math.random() * 5;
                this.col = `hsl(${Math.random() * 360},100%,65%)`;
                this.trail = []; this.ps = []; this.boom = false;
            }
            update() {
                if (!this.boom) {
                    this.trail.push({ x: this.x, y: this.y });
                    if (this.trail.length > 10) this.trail.shift();
                    this.y -= this.sp;
                    this.x += (Math.random() - .5) * 1.2;
                    if (this.y <= this.ty) {
                        this.boom = true;
                        const n = 90 + Math.random() * 50;
                        for (let i = 0; i < n; i++) {
                            const a = (Math.PI * 2 / n) * i + Math.random() * .4;
                            const s = 1.5 + Math.random() * 5;
                            this.ps.push(new Part(this.x, this.y, Math.cos(a) * s, Math.sin(a) * s, this.col));
                        }
                    }
                }
                this.ps = this.ps.filter(p => p.a > 0);
                this.ps.forEach(p => p.update());
            }
            draw() {
                if (!this.boom) {
                    this.trail.forEach((p, i) => {
                        ctx.save(); ctx.globalAlpha = (i / this.trail.length) * .55;
                        ctx.fillStyle = this.col;
                        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
                        ctx.restore();
                    });
                    ctx.save(); ctx.fillStyle = this.col;
                    ctx.shadowColor = this.col; ctx.shadowBlur = 12;
                    ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }
                this.ps.forEach(p => p.draw());
            }
            get done() { return this.boom && this.ps.length === 0; }
        }

        const cohetes = [];
        let frame = 0, textOpacity = 0;

        function loop() {
            // Fading trail (portada) or transparent (light pages)
            ctx.fillStyle = esPortada ? 'rgba(0,0,0,.15)' : 'rgba(0,0,0,.04)';
            ctx.fillRect(0, 0, c.width, c.height);

            if (frame % 60 === 0) cohetes.push(new Cohete());
            if (frame % 120 === 50) cohetes.push(new Cohete());
            frame++;

            for (let i = cohetes.length - 1; i >= 0; i--)
                if (cohetes[i].done) cohetes.splice(i, 1);
            cohetes.forEach(co => { co.update(); co.draw(); });

            if (frame > 100) {
                textOpacity = Math.min(1, textOpacity + .012);
                ctx.save();
                ctx.globalAlpha = textOpacity * .92;
                ctx.textAlign = 'center';
                // Año
                ctx.font = `bold ${c.width * .13}px Montserrat,sans-serif`;
                ctx.fillStyle = '#ffd700'; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 50;
                ctx.fillText(anio, c.width / 2, c.height * .38);
                // Mensaje
                ctx.font = `bold ${c.width * .048}px Montserrat,sans-serif`;
                ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 25;
                ctx.fillText('¡FELIZ AÑO NUEVO!', c.width / 2, c.height * .48);
                ctx.shadowBlur = 0; ctx.restore();
            }

            requestAnimationFrame(loop);
        }
        loop();
    }

    // ═══════════════════════════════════════════════════════════════
    //  3. SAN VALENTÍN – Matriz de corazones + corazón de partículas
    // ═══════════════════════════════════════════════════════════════
    function animCorazon(esPortada) {
        const c   = fullCanvas(58);
        const ctx = c.getContext('2d');
        const W   = () => c.width, H = () => c.height;

        // ── Matrix rain de corazones ──
        const COL_W = 22;
        let cols  = Math.floor(W() / COL_W);
        let drops = Array.from({ length: cols }, () => Math.random() * -50);
        window.addEventListener('resize', () => { cols = Math.floor(W() / COL_W); });

        // ── Partículas que forman corazón ──
        function heartPt(t, scale, ox, oy) {
            return {
                x: ox + scale * 16 * Math.pow(Math.sin(t), 3),
                y: oy - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
            };
        }

        class Pint {
            constructor(i, total) {
                this.i = i; this.total = total;
                this.x = Math.random() * W(); this.y = Math.random() * H();
                this.vx = 0; this.vy = 0;
            }
            update(scale, ox, oy, pulse) {
                const t  = (this.i / this.total) * Math.PI * 2;
                const tp = heartPt(t, scale * pulse, ox, oy);
                this.vx += (tp.x - this.x) * .045;
                this.vy += (tp.y - this.y) * .045;
                this.vx *= .87; this.vy *= .87;
                this.x += this.vx; this.y += this.vy;
            }
            draw() {
                const dx  = this.vx, dy = this.vy;
                const spd = Math.sqrt(dx * dx + dy * dy);
                const hue = 330 + spd * 3;
                ctx.beginPath(); ctx.arc(this.x, this.y, 2.8, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${hue},90%,65%)`; ctx.fill();
            }
        }

        const TOTAL = 280;
        const parts = Array.from({ length: TOTAL }, (_, i) => new Pint(i, TOTAL));
        let t = 0;

        function loop() {
            // Fondo degradado
            ctx.fillStyle = esPortada ? 'rgba(20,0,10,.14)' : 'rgba(255,240,245,.07)';
            ctx.fillRect(0, 0, W(), H());

            // Matrix rain
            ctx.fillStyle = 'rgba(255,100,150,.45)';
            ctx.font = '18px serif';
            drops.forEach((y, i) => {
                const ch = Math.random() > .65 ? '❤' : '♡';
                ctx.fillText(ch, i * COL_W, y * 20);
                if (y * 20 > H() && Math.random() > .975) drops[i] = 0;
                drops[i] += 0.5;
            });

            // Corazón de partículas
            const scale = Math.min(W(), H()) * .016;
            const pulse = 1 + Math.sin(t * 1.8) * .07;
            parts.forEach(p => { p.update(scale, W() / 2, H() / 2, pulse); p.draw(); });

            // Aura central pulsante
            const grd = ctx.createRadialGradient(W() / 2, H() / 2, 0, W() / 2, H() / 2, 100 * pulse);
            grd.addColorStop(0, `rgba(255,50,100,${.1 + Math.sin(t * 2) * .05})`);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, W(), H());

            t += .022;
            requestAnimationFrame(loop);
        }
        loop();
    }

    // ═══════════════════════════════════════════════════════════════
    //  4. DÍA DE LA BANDERA – Bandera mexicana ondeante
    // ═══════════════════════════════════════════════════════════════
    function animBandera(esPortada) {
        const BW   = esPortada ? 340 : 240;
        const BH   = Math.round(BW * 0.62);
        const pos  = esPortada
            ? `right:45px;top:50%;transform:translateY(-50%)`
            : `right:22px;bottom:90px`;
        const c    = mkCanvas(BW, BH,
            `position:fixed;${pos};z-index:62;border-radius:3px;` +
            `box-shadow:0 8px 30px rgba(0,0,0,.55)`);
        const ctx  = c.getContext('2d');

        // Mástil
        const mast = document.createElement('div');
        mast.style.cssText = (esPortada
            ? `position:fixed;right:${45 + BW}px;top:50%;transform:translateY(-50%)`
            : `position:fixed;right:${22 + BW}px;bottom:90px`)
            + `;width:5px;height:${BH}px;background:linear-gradient(180deg,#aaa,#777,#aaa);`
            + `border-radius:2px;z-index:61;pointer-events:none;`;
        document.body.appendChild(mast);

        let t = 0;

        function wave(x, time) {
            return (Math.sin(x * .035 + time) * .5 + Math.sin(x * .07 + time * 1.4) * .5)
                   * (x / BW) * 20;
        }

        function loop() {
            ctx.clearRect(0, 0, BW, BH);

            // Dibuja columna a columna para el efecto de onda
            for (let x = 0; x < BW; x++) {
                const wy      = wave(x, t);
                const relX    = x / BW;
                const color   = relX < 1 / 3 ? '#006847' : relX < 2 / 3 ? '#FFFFFF' : '#CE1126';
                const shade   = Math.sin(x * .035 + t);

                ctx.fillStyle = color;
                ctx.fillRect(x, wy, 1, BH);

                // Sombreado 3D
                const alpha = Math.abs(shade) * .15;
                ctx.fillStyle = shade > 0 ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`;
                ctx.fillRect(x, wy, 1, BH);
            }

            // Águila en el centro
            const cwy   = wave(BW / 2, t);
            ctx.font    = `${BH * .42}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🦅', BW / 2, BH / 2 + cwy);

            // Borde sutil
            ctx.strokeStyle = 'rgba(255,255,255,.2)';
            ctx.lineWidth   = 1;
            ctx.strokeRect(.5, .5, BW - 1, BH - 1);

            t += .04;
            requestAnimationFrame(loop);
        }
        loop();
    }

    // ═══════════════════════════════════════════════════════════════
    //  5. DÍA DE MUERTOS – Mictlantecuhtli
    // ═══════════════════════════════════════════════════════════════
    function animMictlan(esPortada) {
        const W  = esPortada ? 300 : 210;
        const H  = Math.round(W * 1.55);
        const pos = esPortada ? 'bottom:70px;right:65px' : 'bottom:75px;right:22px';
        const c  = mkCanvas(W, H, `position:fixed;${pos};z-index:62`);
        const ctx = c.getContext('2d');
        const cx  = W / 2;
        let t = 0;

        function loop() {
            ctx.clearRect(0, 0, W, H);
            const float = Math.sin(t) * 7;
            const chy   = H * .28 + float;
            const r     = W * .27;

            // ── Aura ──────────────────────────────────────
            const aura = ctx.createRadialGradient(cx, chy, 0, cx, chy, r * 2);
            aura.addColorStop(0, `rgba(255,107,0,${.2 + Math.sin(t * 1.5) * .08})`);
            aura.addColorStop(.5, `rgba(155,0,196,${.1 + Math.sin(t) * .05})`);
            aura.addColorStop(1, 'transparent');
            ctx.fillStyle = aura;
            ctx.beginPath(); ctx.ellipse(cx, chy, r * 2, r * 2.2, 0, 0, Math.PI * 2); ctx.fill();

            // ── Tocado (penacho) ──────────────────────────
            const plumColors = ['#ff6b00','#9b00c4','#ffd700','#ce1126','#00aa44','#ffd700','#ff6b00'];
            for (let fi = 0; fi < 7; fi++) {
                const ang   = (fi - 3) * .26;
                const baseX = cx + Math.sin(ang) * r * .5;
                const baseY = chy - r * .88;
                const tipX  = cx + Math.sin(ang) * r * 1.9;
                const tipY  = chy - r * 1.85 + Math.abs(fi - 3) * r * .14;

                ctx.beginPath();
                ctx.moveTo(baseX, baseY);
                ctx.quadraticCurveTo(
                    cx + Math.sin(ang) * r * 1.2,
                    chy - r * 1.1 + float * .25,
                    tipX, tipY
                );
                ctx.lineWidth   = Math.max(2, 9 - Math.abs(fi - 3) * 2);
                ctx.strokeStyle = plumColors[fi];
                ctx.lineCap     = 'round';
                ctx.globalAlpha = .88;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // ── Cráneo ────────────────────────────────────
            ctx.beginPath(); ctx.arc(cx, chy, r, 0, Math.PI * 2);
            ctx.fillStyle = '#1a0028'; ctx.fill();
            ctx.strokeStyle = '#ff6b00'; ctx.lineWidth = 2.5; ctx.stroke();

            // Decoraciones frente (arcos aztecas)
            for (let ring = 1; ring <= 3; ring++) {
                ctx.beginPath();
                ctx.arc(cx, chy - r * .22, r * .1 * ring, 0, Math.PI);
                ctx.strokeStyle = `rgba(255,107,0,${.7 - ring * .15})`;
                ctx.lineWidth = 1.5; ctx.stroke();
            }

            // Puntos en mejillas
            [cx - r * .52, cx + r * .52].forEach(ex => {
                for (let i = 0; i < 5; i++) {
                    const a = (i / 5) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.arc(ex + Math.cos(a) * r * .11, chy + r * .18 + Math.sin(a) * r * .11, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,200,0,.65)'; ctx.fill();
                }
            });

            // ── Cuencas de los ojos ───────────────────────
            const eyeY   = chy - r * .08;
            const eyeOff = r * .36;
            [cx - eyeOff, cx + eyeOff].forEach(ex => {
                ctx.beginPath();
                ctx.ellipse(ex, eyeY, r * .22, r * .27, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#000'; ctx.fill();
                ctx.strokeStyle = 'rgba(255,107,0,.5)'; ctx.lineWidth = 1; ctx.stroke();

                const pulse  = .75 + Math.sin(t * 2.5) * .25;
                const eyeGrd = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, r * .2);
                eyeGrd.addColorStop(0, `rgba(255,200,0,${pulse})`);
                eyeGrd.addColorStop(.45, `rgba(255,100,0,${pulse * .7})`);
                eyeGrd.addColorStop(1, 'transparent');
                ctx.fillStyle = eyeGrd;
                ctx.beginPath();
                ctx.ellipse(ex, eyeY, r * .18, r * .23, 0, 0, Math.PI * 2); ctx.fill();

                // Brillo
                ctx.beginPath(); ctx.arc(ex - r * .06, eyeY - r * .08, r * .04, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,200,${pulse * .8})`; ctx.fill();
            });

            // ── Nariz ─────────────────────────────────────
            ctx.beginPath();
            ctx.moveTo(cx, eyeY + r * .28);
            ctx.lineTo(cx - r * .1, eyeY + r * .5);
            ctx.lineTo(cx + r * .1, eyeY + r * .5);
            ctx.closePath(); ctx.fillStyle = '#000'; ctx.fill();

            // ── Dientes ───────────────────────────────────
            const ty  = chy + r * .44;
            const tw  = r * 1.5;
            const nth = 7;
            ctx.fillStyle = '#0d0018';
            ctx.fillRect(cx - tw / 2, ty, tw, r * .28);
            for (let i = 0; i < nth; i++) {
                const tx2 = cx - tw / 2 + i * (tw / nth);
                ctx.fillStyle = '#fffde7';
                ctx.fillRect(tx2 + 1, ty - r * .04, tw / nth - 2, r * .22);
                ctx.strokeStyle = 'rgba(255,107,0,.55)';
                ctx.lineWidth = .8; ctx.strokeRect(tx2 + 1, ty - r * .04, tw / nth - 2, r * .22);
            }

            // ── Manto ─────────────────────────────────────
            const cloakTop  = chy + r * .66;
            const swing     = Math.sin(t * .7) * 9;
            ctx.beginPath();
            ctx.moveTo(cx - r * .62, cloakTop);
            ctx.bezierCurveTo(cx - r * 1.05 + swing, H * .68, cx - r * .95 + swing, H * .87, cx - r * .55 + swing * .5, H);
            ctx.lineTo(cx + r * .55 - swing * .5, H);
            ctx.bezierCurveTo(cx + r * .95 - swing, H * .87, cx + r * 1.05 - swing, H * .68, cx + r * .62, cloakTop);
            ctx.closePath();
            const cg = ctx.createLinearGradient(cx - r, cloakTop, cx + r, H);
            cg.addColorStop(0, '#2a0040'); cg.addColorStop(.5, '#1a0028'); cg.addColorStop(1, '#0d0018');
            ctx.fillStyle = cg; ctx.fill();
            ctx.strokeStyle = 'rgba(155,0,196,.6)'; ctx.lineWidth = 2; ctx.stroke();

            // Adornos en el manto
            ctx.save();
            ctx.font    = `${W * .12}px serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.globalAlpha = .72;
            ctx.fillText('💀', cx, H * .70);
            ctx.font = `${W * .09}px serif`;
            ctx.fillText('🦴', cx - r * .5, H * .81);
            ctx.fillText('🦴', cx + r * .5, H * .81);
            ctx.globalAlpha = .5;
            ctx.fillText('🦋', cx, H * .90);
            ctx.restore();

            // ── Etiqueta ──────────────────────────────────
            ctx.save();
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = `bold ${W * .074}px Montserrat,sans-serif`;
            ctx.fillStyle = '#ff8c42'; ctx.shadowColor = '#ff6b00'; ctx.shadowBlur = 14;
            ctx.fillText('MICTLANTECUHTLI', cx, H - 22);
            ctx.font = `${W * .056}px Montserrat,sans-serif`;
            ctx.fillStyle = 'rgba(200,150,255,.85)'; ctx.shadowBlur = 7;
            ctx.fillText('Señor del Mictlán', cx, H - 8);
            ctx.restore();

            t += .025;
            requestAnimationFrame(loop);
        }
        loop();
    }

    // ═══════════════════════════════════════════════════════════════
    //  6. NAVIDAD – Árbol + Santa + Reyes Magos
    // ═══════════════════════════════════════════════════════════════
    function animNavidad(esPortada) {
        // ── CSS Santa y Reyes Magos ───────────────────────────────
        const topSanta = esPortada ? '7%' : '13%';
        const st = document.createElement('style');
        st.textContent = `
            @keyframes santaVuela   { 0%{right:-260px;top:${topSanta}} 100%{right:110%;top:${topSanta}} }
            @keyframes reyesCaminan { 0%{right:-360px}                 100%{right:110%}                 }
            .santa-wrap {
                position:fixed;z-index:65;pointer-events:none;
                animation:santaVuela 20s linear infinite;
                display:flex;align-items:center;gap:4px;
                filter:drop-shadow(0 0 8px rgba(255,255,255,.4));
            }
            .reyes-wrap {
                position:fixed;bottom:72px;z-index:65;pointer-events:none;
                animation:reyesCaminan 26s linear infinite 4s;
                display:flex;align-items:flex-end;gap:10px;
                filter:drop-shadow(0 2px 6px rgba(0,0,0,.5));
            }
            .santa-wrap span, .reyes-wrap span { line-height:1; }
        `;
        document.head.appendChild(st);

        const santa = document.createElement('div');
        santa.className = 'santa-wrap';
        santa.innerHTML =
            `<span style="font-size:1.8rem">🦌🦌🦌</span>` +
            `<span style="font-size:2.6rem">🎅🛷</span>`;
        document.body.appendChild(santa);

        const reyes = document.createElement('div');
        reyes.className = 'reyes-wrap';
        reyes.innerHTML =
            `<span style="font-size:2.2rem">🤴</span>` +
            `<span style="font-size:1.8rem">🐪</span>` +
            `<span style="font-size:2.2rem">👳</span>` +
            `<span style="font-size:1.8rem">🐫</span>` +
            `<span style="font-size:2.2rem">🧙</span>`;
        document.body.appendChild(reyes);

        // ── Canvas árbol de Navidad ───────────────────────────────
        const TW  = esPortada ? 270 : 185;
        const TH  = Math.round(TW * 1.25);
        const tpos = esPortada
            ? 'bottom:70px;left:50%;transform:translateX(-50%)'
            : 'bottom:70px;left:28px';
        const c   = mkCanvas(TW, TH, `position:fixed;${tpos};z-index:62`);
        const ctx  = c.getContext('2d');
        const tcx  = TW / 2;

        // Luces aleatorias
        const LUCES = Array.from({ length: 35 }, () => ({
            x:     tcx + (Math.random() - .5) * TW * .85,
            y:     TH * .08 + Math.random() * TH * .76,
            col:   `hsl(${Math.random() * 360},100%,62%)`,
            phase: Math.random() * Math.PI * 2
        }));

        let t = 0;

        function loop() {
            ctx.clearRect(0, 0, TW, TH);

            // Capas del árbol (triángulos apilados)
            const layers = [
                { y: TH * .05, w: TW * .22, h: TH * .28 },
                { y: TH * .25, w: TW * .48, h: TH * .30 },
                { y: TH * .42, w: TW * .72, h: TH * .32 },
                { y: TH * .60, w: TW * .88, h: TH * .26 },
            ];
            layers.forEach(l => {
                // Sombra
                ctx.beginPath();
                ctx.moveTo(tcx, l.y);
                ctx.lineTo(tcx - l.w / 2 - 4, l.y + l.h + 6);
                ctx.lineTo(tcx + l.w / 2 + 4, l.y + l.h + 6);
                ctx.closePath(); ctx.fillStyle = 'rgba(0,50,0,.35)'; ctx.fill();

                // Cuerpo
                const gr = ctx.createLinearGradient(tcx - l.w / 2, 0, tcx + l.w / 2, 0);
                gr.addColorStop(0, '#1a5e20'); gr.addColorStop(.5, '#2e7d32'); gr.addColorStop(1, '#1a5e20');
                ctx.beginPath();
                ctx.moveTo(tcx, l.y);
                ctx.lineTo(tcx - l.w / 2, l.y + l.h);
                ctx.lineTo(tcx + l.w / 2, l.y + l.h);
                ctx.closePath(); ctx.fillStyle = gr; ctx.fill();
            });

            // Tronco
            const trg = ctx.createLinearGradient(tcx - 14, 0, tcx + 14, 0);
            trg.addColorStop(0, '#5d4037'); trg.addColorStop(.5, '#795548'); trg.addColorStop(1, '#5d4037');
            ctx.fillStyle = trg;
            ctx.fillRect(tcx - 14, TH * .85, 28, TH * .13);

            // Luces parpadeantes
            LUCES.forEach(l => {
                const on = Math.sin(t * 2.5 + l.phase) > 0;
                const alpha = on ? (.65 + Math.sin(t * 3 + l.phase) * .35) : .12;
                ctx.save(); ctx.globalAlpha = alpha;
                ctx.beginPath(); ctx.arc(l.x, l.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = l.col;
                ctx.shadowColor = l.col; ctx.shadowBlur = on ? 14 : 0;
                ctx.fill(); ctx.restore();
            });

            // Estrella en la cima
            const starPulse = .65 + Math.sin(t * 3.5) * .35;
            ctx.save();
            ctx.globalAlpha = starPulse;
            ctx.font = `${TW * .17}px serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 22;
            ctx.fillText('⭐', tcx, TH * .055);
            ctx.restore();

            t += .04;
            requestAnimationFrame(loop);
        }
        loop();
    }

})();
