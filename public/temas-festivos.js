// Sistema de Temas Festivos - UAEM Kiosco
// Detecta la fecha y aplica diseño temático + decoraciones en TODAS las páginas
(function () {
    const hoy  = new Date();
    const anio = hoy.getFullYear();
    const mes  = hoy.getMonth() + 1;  // 1-12
    const dia  = hoy.getDate();

    function en(m1, d1, m2, d2) {
        const n = mes * 100 + dia;
        return n >= m1 * 100 + d1 && n <= m2 * 100 + d2;
    }

    function tercerDomingo(m) {
        let d = new Date(anio, m - 1, 1), c = 0;
        while (d.getMonth() === m - 1) {
            if (d.getDay() === 0 && ++c === 3) return d.getDate();
            d.setDate(d.getDate() + 1);
        }
        return 21;
    }
    const dPadre = tercerDomingo(6);

  
    const TEMAS = [

        // 1. Nochevieja
        {
            nombre: 'nochevieja',
            check: () => en(12, 29, 12, 31),
            label: '¡Feliz Año Nuevo!',
            corners: ['🎆', '🎆', '✨', '✨'],
            emoji: ['🎆', '✨', '🥂', '⭐', '🎊', '🎉'],
            particleColors: ['#ffd700', '#ffffff', '#c0c0c0', '#fffacd', '#ffd700'],
            css: `
            html.tema-festivo .overlay{background:linear-gradient(160deg,rgba(5,5,20,.96) 0%,rgba(15,15,40,.88) 45%,rgba(5,5,20,.97) 100%)!important}
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(255,215,0,.40) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(192,192,192,.28) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,transparent,#ffd700,#fff,#ffd700,transparent)!important}
            html.tema-festivo .badge-dot{background:#ffd700!important;box-shadow:0 0 8px #ffd700!important}
            html.tema-festivo .hero-kw{color:#ffd700!important;text-shadow:0 0 25px rgba(255,215,0,.8)!important}
            html.tema-festivo .hero-h1{background:linear-gradient(90deg,#fff 0%,#ffd700 25%,#c0c0c0 50%,#ffd700 75%,#fff 100%)!important;background-size:200% auto!important;-webkit-background-clip:text!important;background-clip:text!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#ffd700,#ffffff,#c0c0c0,#ffffff,#ffd700)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(20,20,50,.90) 0%,rgba(10,10,30,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,transparent,rgba(255,215,0,.5),rgba(192,192,192,.4),rgba(255,215,0,.5),transparent)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#ffd700,#c0c0c0)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#b8960c,#888)!important;box-shadow:0 8px 20px rgba(255,215,0,.4)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#0d0d20 0%,#050510 100%)!important}
            `
        },

        //2. Año Nuevo
        {
            nombre: 'anio-nuevo',
            check: () => en(1, 1, 1, 6),
            label: '¡Feliz Año Nuevo!',
            corners: ['✨', '✨', '⭐', '⭐'],
            emoji: ['✨', '🎆', '🥂', '⭐', '🎊', '🌟'],
            particleColors: ['#ffd700', '#ffffff', '#c0c0c0', '#fffacd', '#ffd700'],
            css: `
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(255,215,0,.40) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(192,192,192,.28) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,transparent,#ffd700,#fff,#ffd700,transparent)!important}
            html.tema-festivo .badge-dot{background:#ffd700!important;box-shadow:0 0 8px #ffd700!important}
            html.tema-festivo .hero-kw{color:#ffd700!important;text-shadow:0 0 25px rgba(255,215,0,.7)!important}
            html.tema-festivo .hero-h1{background:linear-gradient(90deg,#fff 0%,#ffd700 25%,#c0c0c0 50%,#ffd700 75%,#fff 100%)!important;background-size:200% auto!important;-webkit-background-clip:text!important;background-clip:text!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#ffd700,#ffffff,#c0c0c0,#ffffff,#ffd700)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(20,20,50,.88) 0%,rgba(10,10,30,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,transparent,rgba(255,215,0,.5),rgba(192,192,192,.4),rgba(255,215,0,.5),transparent)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#ffd700,#c0c0c0)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#b8960c,#888)!important;box-shadow:0 8px 20px rgba(255,215,0,.4)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#0d0d20 0%,#050510 100%)!important}
            `
        },

        //3. San Valentín 
        {
            nombre: 'san-valentin',
            check: () => en(2, 11, 2, 15),
            label: '❤️ ¡Feliz San Valentín!',
            corners: ['❤️', '💕', '🌹', '💖'],
            emoji: ['❤️', '💕', '🌹', '💝', '💖', '🌷'],
            particleColors: ['#ff6b9d', '#ff1744', '#ffb3c6', '#ff85ab', '#ff6b9d'],
            css: `
            html.tema-festivo .overlay{background:linear-gradient(160deg,rgba(40,0,20,.95) 0%,rgba(80,0,35,.86) 45%,rgba(20,0,10,.97) 100%)!important}
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(255,20,80,.42) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(255,107,157,.30) 0%,transparent 70%)!important}
            html.tema-festivo .orb-3{background:radial-gradient(circle,rgba(255,180,200,.24) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,transparent,#ff6b9d,#ff1744,#ff6b9d,transparent)!important}
            html.tema-festivo .badge-dot{background:#ff6b9d!important;box-shadow:0 0 8px #ff6b9d!important}
            html.tema-festivo .hero-kw{color:#ff9abb!important;text-shadow:0 0 25px rgba(255,107,157,.8)!important}
            html.tema-festivo .hero-h1{background:linear-gradient(90deg,#fff 0%,#ffb3c6 15%,#ff6b9d 30%,#fff 50%,#ff1744 65%,#ffb3c6 80%,#fff 100%)!important;background-size:200% auto!important;-webkit-background-clip:text!important;background-clip:text!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#ff1744,#ff6b9d,#ffffff,#ff6b9d,#ff1744)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(80,0,30,.92) 0%,rgba(40,0,18,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,transparent,rgba(255,107,157,.50),rgba(255,23,68,.60),rgba(255,107,157,.50),transparent)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#ff1744,#ff6b9d)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#c0143c,#ff6b9d)!important;box-shadow:0 8px 20px rgba(255,23,68,.4)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#200010 0%,#100008 100%)!important}
            `
        },

        //4. Día de la Bandera
        {
            nombre: 'bandera',
            check: () => en(2, 23, 2, 24),
            label: '🇲🇽 Día de la Bandera Nacional',
            corners: ['🇲🇽', '🦅', '⭐', '🌿'],
            emoji: ['🇲🇽', '🦅', '⭐', '🌿', '🏳️', '⭐'],
            particleColors: ['#006847', '#ffffff', '#ce1126', '#ffffff', '#006847'],
            css: `
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(206,17,38,.40) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(0,104,71,.35) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,#006847 0%,#ffffff 33%,#ce1126 66%,#ffffff 80%,#006847 100%)!important}
            html.tema-festivo .badge-dot{background:#ce1126!important;box-shadow:0 0 8px #ce1126!important}
            html.tema-festivo .hero-kw{color:#68d391!important;text-shadow:0 0 25px rgba(0,104,71,.8)!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#006847,#ffffff,#ce1126,#ffffff,#006847)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(0,50,20,.90) 0%,rgba(0,25,10,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,#006847,rgba(0,0,0,.05),#ce1126,rgba(0,0,0,.05),#006847)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#006847,#ce1126)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#006847,#ce1126)!important;box-shadow:0 8px 20px rgba(0,104,71,.4)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#001505 0%,#000c03 100%)!important}
            `
        },

        //5. Día Internacional de la Mujer
        {
            nombre: 'dia-mujer',
            check: () => en(3, 7, 3, 9),
            label: '💜 ¡Día Internacional de la Mujer!',
            corners: ['💜', '🌸', '✊', '🌺'],
            emoji: ['💜', '🌸', '✊', '🌺', '💪', '🌷'],
            particleColors: ['#9b59b6', '#e74c8b', '#d7b4f3', '#ff85c8', '#c77dff'],
            css: `
            html.tema-festivo .overlay{background:linear-gradient(160deg,rgba(20,0,30,.95) 0%,rgba(45,0,55,.87) 45%,rgba(15,0,20,.97) 100%)!important}
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(155,89,182,.44) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(231,76,139,.32) 0%,transparent 70%)!important}
            html.tema-festivo .orb-3{background:radial-gradient(circle,rgba(215,180,243,.24) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,transparent,#9b59b6,#e74c8b,#9b59b6,transparent)!important}
            html.tema-festivo .badge-dot{background:#9b59b6!important;box-shadow:0 0 8px #9b59b6!important}
            html.tema-festivo .hero-kw{color:#c77dff!important;text-shadow:0 0 25px rgba(199,125,255,.8)!important}
            html.tema-festivo .hero-h1{background:linear-gradient(90deg,#fff 0%,#d7b4f3 20%,#9b59b6 35%,#fff 50%,#e74c8b 65%,#d7b4f3 80%,#fff 100%)!important;background-size:200% auto!important;-webkit-background-clip:text!important;background-clip:text!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#9b59b6,#e74c8b,#ffffff,#e74c8b,#9b59b6)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(50,0,70,.92) 0%,rgba(25,0,35,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,transparent,rgba(155,89,182,.50),rgba(231,76,139,.60),rgba(155,89,182,.50),transparent)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#9b59b6,#e74c8b)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#7d3c98,#e74c8b)!important;box-shadow:0 8px 20px rgba(155,89,182,.4)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#150020 0%,#0a0015 100%)!important}
            `
        },

        //6. Día del Niño
        {
            nombre: 'dia-nino',
            check: () => en(4, 29, 5, 1),
            label: '🎈 ¡Feliz Día del Niño!',
            corners: ['🎈', '🎉', '🌈', '🎊'],
            emoji: ['🎈', '🎉', '🎊', '🌈', '⭐', '🎁'],
            particleColors: ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2', '#ffffff'],
            css: `
            html.tema-festivo .overlay{background:linear-gradient(160deg,rgba(0,15,40,.88) 0%,rgba(5,30,60,.80) 45%,rgba(0,10,30,.92) 100%)!important}
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(255,107,107,.42) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(255,209,102,.32) 0%,transparent 70%)!important}
            html.tema-festivo .orb-3{background:radial-gradient(circle,rgba(6,214,160,.26) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,#ff6b6b,#ffd166,#06d6a0,#118ab2,#ff6b6b)!important}
            html.tema-festivo .badge-dot{background:#ffd166!important;box-shadow:0 0 8px #ffd166!important}
            html.tema-festivo .hero-kw{color:#ffd166!important;text-shadow:0 0 25px rgba(255,209,102,.8)!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#ff6b6b,#ffd166,#06d6a0,#118ab2,#ff6b6b)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(0,30,60,.87) 0%,rgba(0,15,35,.96) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,rgba(255,107,107,.4),rgba(255,209,102,.4),rgba(6,214,160,.4),rgba(17,138,178,.4),rgba(255,107,107,.4))!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#ff6b6b,#ffd166,#06d6a0)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#e53e3e,#ffd166)!important;box-shadow:0 8px 20px rgba(255,107,107,.4)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#000d1a 0%,#000810 100%)!important}
            `
        },

        //7. Día de las Madres (México = 10 mayo)
        {
            nombre: 'dia-madre',
            check: () => en(5, 8, 5, 11),
            label: '🌸 ¡Feliz Día de las Madres!',
            corners: ['🌹', '🌷', '💐', '🌸'],
            emoji: ['🌸', '🌹', '❤️', '🌷', '💐', '🌺'],
            particleColors: ['#ff6b9d', '#ffb3c6', '#ff9a76', '#ffd6e0', '#ff6b9d'],
            css: `
            html.tema-festivo .overlay{background:linear-gradient(160deg,rgba(35,0,20,.94) 0%,rgba(65,10,30,.86) 45%,rgba(20,0,12,.97) 100%)!important}
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(255,107,157,.42) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(255,154,118,.30) 0%,transparent 70%)!important}
            html.tema-festivo .orb-3{background:radial-gradient(circle,rgba(255,179,198,.24) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,transparent,#ff6b9d,#ff9a76,#ff6b9d,transparent)!important}
            html.tema-festivo .badge-dot{background:#ff6b9d!important;box-shadow:0 0 8px #ff6b9d!important}
            html.tema-festivo .hero-kw{color:#ff9abb!important;text-shadow:0 0 25px rgba(255,107,157,.8)!important}
            html.tema-festivo .hero-h1{background:linear-gradient(90deg,#fff 0%,#ffb3c6 15%,#ff6b9d 30%,#fff 50%,#ff9a76 65%,#ffb3c6 80%,#fff 100%)!important;background-size:200% auto!important;-webkit-background-clip:text!important;background-clip:text!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#ff6b9d,#ff9a76,#ffffff,#ff9a76,#ff6b9d)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(85,10,40,.92) 0%,rgba(45,5,22,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,transparent,rgba(255,107,157,.50),rgba(255,154,118,.60),rgba(255,107,157,.50),transparent)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#ff6b9d,#ff9a76)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#c0143c,#ff9a76)!important;box-shadow:0 8px 20px rgba(255,107,157,.4)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#200010 0%,#100008 100%)!important}
            `
        },

        //8. Día del Padre (3er domingo de junio) 
        {
            nombre: 'dia-padre',
            check: () => mes === 6 && dia >= dPadre - 1 && dia <= dPadre + 1,
            label: '👨 ¡Feliz Día del Padre!',
            corners: ['👨', '🏆', '💪', '⭐'],
            emoji: ['👨', '⭐', '🏆', '💪', '🎁', '🎖️'],
            particleColors: ['#3b82f6', '#93c5fd', '#fbbf24', '#dbeafe', '#ffffff'],
            css: `
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(59,130,246,.42) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(251,191,36,.30) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,transparent,#3b82f6,#fbbf24,#3b82f6,transparent)!important}
            html.tema-festivo .badge-dot{background:#3b82f6!important;box-shadow:0 0 8px #3b82f6!important}
            html.tema-festivo .hero-kw{color:#93c5fd!important;text-shadow:0 0 25px rgba(59,130,246,.8)!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#3b82f6,#fbbf24,#ffffff,#fbbf24,#3b82f6)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(0,20,60,.92) 0%,rgba(0,10,35,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,transparent,rgba(59,130,246,.50),rgba(251,191,36,.45),rgba(59,130,246,.50),transparent)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#1d4ed8,#fbbf24)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#1d4ed8,#2563eb)!important;box-shadow:0 8px 20px rgba(59,130,246,.4)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#000d2a 0%,#000815 100%)!important}
            `
        },

        //9. Independencia de México
        {
            nombre: 'independencia',
            check: () => en(9, 13, 9, 16),
            label: '🦅 ¡Viva México! ¡Viva la Independencia!',
            corners: ['🇲🇽', '🦅', '🌵', '⭐'],
            emoji: ['🇲🇽', '🦅', '🌵', '⭐', '🎆', '🎉'],
            particleColors: ['#006847', '#ffffff', '#ce1126', '#68d391', '#ffffff'],
            css: `
            html.tema-festivo .overlay{background:linear-gradient(160deg,rgba(0,20,5,.95) 0%,rgba(0,40,10,.87) 45%,rgba(0,10,5,.97) 100%)!important}
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(206,17,38,.42) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(0,104,71,.38) 0%,transparent 70%)!important}
            html.tema-festivo .orb-3{background:radial-gradient(circle,rgba(255,255,255,.20) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,#006847 0%,#ffffff 33%,#ce1126 66%,#ffffff 80%,#006847 100%)!important}
            html.tema-festivo .badge-dot{background:#ce1126!important;box-shadow:0 0 8px #ce1126!important}
            html.tema-festivo .hero-kw{color:#68d391!important;text-shadow:0 0 25px rgba(104,211,145,.8)!important}
            html.tema-festivo .hero-h1{background:linear-gradient(90deg,#fff 0%,#68d391 20%,#fff 40%,#fc8181 60%,#fff 80%,#68d391 100%)!important;background-size:200% auto!important;-webkit-background-clip:text!important;background-clip:text!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#006847,#ffffff,#ce1126,#ffffff,#006847)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(0,50,15,.92) 0%,rgba(0,22,7,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,#006847,rgba(0,0,0,.05),#ce1126,rgba(0,0,0,.05),#006847)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#006847,#ce1126)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#006847,#1a6e3a)!important;box-shadow:0 8px 20px rgba(0,104,71,.4)!important}
            html.tema-festivo .grid-bg{background-image:linear-gradient(rgba(0,104,71,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,104,71,.06) 1px,transparent 1px)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#001505 0%,#000c03 100%)!important}
            `
        },

        //10. Día de Muertos
        {
            nombre: 'muertos',
            check: () => en(10, 29, 11, 2),
            label: '💀 Día de Muertos',
            corners: ['💀', '🌼', '🕯️', '🦋'],
            emoji: ['💀', '🌼', '🕯️', '🌺', '🦋', '💀', '🌼'],
            particleColors: ['#ff6b00', '#ffd700', '#9b00c4', '#ff8c3a', '#ffcc00'],
            css: `
            html.tema-festivo body{background-color:#0d0010!important}
            html.tema-festivo .overlay{background:linear-gradient(160deg,rgba(13,0,20,.97) 0%,rgba(30,0,50,.89) 45%,rgba(10,0,15,.98) 100%)!important}
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(255,107,0,.46) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(155,0,196,.36) 0%,transparent 70%)!important}
            html.tema-festivo .orb-3{background:radial-gradient(circle,rgba(255,200,0,.26) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,transparent,#ff6b00,#9b00c4,#ffd700,#9b00c4,#ff6b00,transparent)!important}
            html.tema-festivo .badge-dot{background:#ff6b00!important;box-shadow:0 0 8px #ff6b00!important}
            html.tema-festivo .hero-kw{color:#ff8c42!important;text-shadow:0 0 25px rgba(255,107,0,.9)!important}
            html.tema-festivo .hero-h1{background:linear-gradient(90deg,#fff 0%,#ffd700 18%,#ff6b00 32%,#fff 50%,#9b00c4 66%,#ff6b00 82%,#fff 100%)!important;background-size:200% auto!important;-webkit-background-clip:text!important;background-clip:text!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#ff6b00,#9b00c4,#ffd700,#9b00c4,#ff6b00)!important}
            html.tema-festivo .grid-bg{background-image:linear-gradient(rgba(255,107,0,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,.06) 1px,transparent 1px)!important}
            html.tema-festivo .top-bar{background:#1a0028!important}
            html.tema-festivo .header-title h1{color:#ff8c42!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(50,0,80,.93) 0%,rgba(20,0,35,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,transparent,rgba(255,107,0,.55),rgba(155,0,196,.65),rgba(255,107,0,.55),transparent)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#ff6b00,#9b00c4)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#cc5500,#9b00c4)!important;box-shadow:0 8px 20px rgba(255,107,0,.45)!important}
            html.tema-festivo .menu-card h3{color:#cc5500!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#120020 0%,#0d0018 100%)!important}
            `
        },

        // 11. Revolución Mexicana
        {
            nombre: 'revolucion',
            check: () => en(11, 18, 11, 21),
            label: '⚔️ Día de la Revolución Mexicana',
            corners: ['🇲🇽', '⭐', '🌵', '🦅'],
            emoji: ['🇲🇽', '⭐', '🌵', '🦅', '🏛️', '⭐'],
            particleColors: ['#8B4513', '#DAA520', '#ce1126', '#ffffff', '#DAA520'],
            css: `
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(206,17,38,.40) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(218,165,32,.32) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,transparent,#ce1126,#daa520,#006847,transparent)!important}
            html.tema-festivo .badge-dot{background:#daa520!important;box-shadow:0 0 8px #daa520!important}
            html.tema-festivo .hero-kw{color:#daa520!important;text-shadow:0 0 25px rgba(218,165,32,.8)!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#ce1126,#daa520,#006847,#daa520,#ce1126)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(50,15,0,.92) 0%,rgba(25,8,0,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,#006847,rgba(0,0,0,.05),#ce1126,rgba(0,0,0,.05),#006847)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#ce1126,#daa520)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#8B1a1a,#daa520)!important;box-shadow:0 8px 20px rgba(218,165,32,.4)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#150500 0%,#0d0300 100%)!important}
            `
        },

        // 12. Navidad
        {
            nombre: 'navidad',
            check: () => en(12, 22, 12, 28),
            label: '🎄 ¡Feliz Navidad!',
            corners: ['🎄', '⭐', '🎁', '❄️'],
            emoji: ['❄️', '❄️', '🎄', '⭐', '🎁', '🔔', '❄️'],
            particleColors: ['#ffffff', '#ff3333', '#00cc44', '#ffd700', '#ffe4e1'],
            caen: true,   // copos de nieve caen hacia abajo
            css: `
            html.tema-festivo .overlay{background:linear-gradient(160deg,rgba(0,20,5,.95) 0%,rgba(10,35,10,.87) 45%,rgba(0,15,5,.97) 100%)!important}
            html.tema-festivo .orb-1{background:radial-gradient(circle,rgba(220,30,30,.42) 0%,transparent 70%)!important}
            html.tema-festivo .orb-2{background:radial-gradient(circle,rgba(0,180,60,.32) 0%,transparent 70%)!important}
            html.tema-festivo .orb-3{background:radial-gradient(circle,rgba(255,215,0,.24) 0%,transparent 70%)!important}
            html.tema-festivo .neon-top{background:linear-gradient(90deg,transparent,#cc0000,#00aa44,#ffd700,#00aa44,#cc0000,transparent)!important}
            html.tema-festivo .badge-dot{background:#cc0000!important;box-shadow:0 0 8px #cc0000!important}
            html.tema-festivo .hero-kw{color:#68d391!important;text-shadow:0 0 25px rgba(104,211,145,.8)!important}
            html.tema-festivo .hero-h1{background:linear-gradient(90deg,#fff 0%,#68d391 18%,#ffd700 32%,#fff 50%,#fc8181 66%,#68d391 82%,#fff 100%)!important;background-size:200% auto!important;-webkit-background-clip:text!important;background-clip:text!important}
            html.tema-festivo .btn-spin-border{background:conic-gradient(from 0deg,#cc0000,#00aa44,#ffd700,#00aa44,#cc0000)!important}
            html.tema-festivo .grid-bg{background-image:linear-gradient(rgba(0,180,60,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,60,.06) 1px,transparent 1px)!important}
            html.tema-festivo .hero-overlay{background:linear-gradient(135deg,rgba(0,50,15,.92) 0%,rgba(0,25,8,.97) 100%)!important}
            html.tema-festivo .top-bar::after{background:linear-gradient(90deg,transparent,rgba(204,0,0,.50),rgba(0,170,68,.60),rgba(204,0,0,.50),transparent)!important}
            html.tema-festivo .menu-card::before{background:linear-gradient(90deg,#cc0000,#00aa44)!important}
            html.tema-festivo .icon-small{background:linear-gradient(135deg,#990000,#00882e)!important;box-shadow:0 8px 20px rgba(204,0,0,.4)!important}
            html.tema-festivo .bottom-footer{background:linear-gradient(135deg,#001a05 0%,#000e03 100%)!important}
            `
        },
    ];


    //  DETECCIÓN

    let activo = null;
    for (const t of TEMAS) {
        if (t.check()) { activo = t; break; }
    }
    if (!activo) return;

    window.TEMA_FESTIVO = activo;
    document.documentElement.classList.add('tema-festivo');

    const styleEl = document.createElement('style');
    styleEl.textContent = activo.css;
    document.head.appendChild(styleEl);


    //  DECORACIONES (todas las páginas)

    function crearDecoraciones() {
        const esPortada = !!document.getElementById('canvas-particulas');

        // Keyframes de animación
        const estiloBase = document.createElement('style');
        estiloBase.textContent = `
            /* Flotantes que suben (portada + páginas claras) */
            @keyframes emojiSube {
                0%   { transform: translateY(110vh) rotate(0deg)    scale(1);   opacity: 0;    }
                8%   {                                                           opacity: 0.85; }
                92%  {                                                           opacity: 0.65; }
                100% { transform: translateY(-12vh)  rotate(540deg) scale(0.55); opacity: 0;    }
            }
            /* Copos / pétalos que caen (navidad y opción alternativa) */
            @keyframes emojiCae {
                0%   { transform: translateY(-12vh)  rotate(0deg)   scale(1);   opacity: 0;    }
                8%   {                                                           opacity: 0.80; }
                92%  {                                                           opacity: 0.55; }
                100% { transform: translateY(110vh)  rotate(-360deg) scale(0.6); opacity: 0;    }
            }
            @keyframes emojiSway { 0%,100%{margin-left:0} 50%{margin-left:45px} }

            /* Esquinas */
            @keyframes esquinaPulsa {
                0%,100% { transform: translateY(0)   scale(1)    rotate(-6deg); }
                50%      { transform: translateY(-9px) scale(1.12) rotate( 6deg); }
            }
            .emoji-flotante {
                position: fixed; pointer-events: none; z-index: 55; line-height: 1;
                animation: ${activo.caen ? 'emojiCae' : 'emojiSube'} linear infinite,
                           emojiSway ease-in-out infinite;
                ${activo.caen ? 'top:0; bottom:auto;' : 'bottom:0; top:auto;'}
                filter: drop-shadow(0 0 5px rgba(255,255,255,.2));
            }
            .esquina-festiva {
                position: fixed; pointer-events: none; z-index: 55; line-height: 1;
                animation: esquinaPulsa ease-in-out infinite;
                filter: drop-shadow(0 2px 8px rgba(0,0,0,.35));
                opacity: 0.75;
            }
            .esquina-festiva:nth-child(2){animation-delay:.9s}
            .esquina-festiva:nth-child(3){animation-delay:.5s}
            .esquina-festiva:nth-child(4){animation-delay:1.4s}
        `;
        document.head.appendChild(estiloBase);

        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:55;overflow:hidden;';

        // Emojis flotantes 
        const lista  = activo.emoji;
        const count  = esPortada ? 22 : 16;
        for (let i = 0; i < count; i++) {
            const el       = document.createElement('span');
            el.className   = 'emoji-flotante';
            el.textContent = lista[i % lista.length];
            const pos      = (Math.random() * 93).toFixed(1);
            const dur      = (9 + Math.random() * 14).toFixed(1);
            const delay    = (-(Math.random() * parseFloat(dur))).toFixed(1);
            const swayDur  = (3 + Math.random() * 5).toFixed(1);
            const size     = (1.3 + Math.random() * 1.6).toFixed(2);
            // posición: left para la mayoría, algunos a la derecha
            const lado     = i % 7 === 0 ? `right:${pos}%` : `left:${pos}%`;
            el.style.cssText = `${lado};font-size:${size}rem;animation-duration:${dur}s,${swayDur}s;animation-delay:${delay}s,${(parseFloat(delay)*.6).toFixed(1)}s;`;
            wrap.appendChild(el);
        }

        // Esquinas decorativas 
        const cs      = activo.corners || lista.slice(0, 4);
        const topY    = esPortada ? 24 : 135;   // portada: sin topbar; resto: debajo del header
        const botY    = 68;
        const lateral = 22;
        const posEsq  = [
            `top:${topY}px;left:${lateral}px`,
            `top:${topY}px;right:${lateral}px`,
            `bottom:${botY}px;left:${lateral}px`,
            `bottom:${botY}px;right:${lateral}px`,
        ];
        const tamEsq = esPortada ? '3.8rem' : '3.2rem';
        const durEsq = [3.8, 4.4, 4.1, 3.6];

        cs.forEach((emoji, i) => {
            const el       = document.createElement('span');
            el.className   = 'esquina-festiva';
            el.textContent = emoji;
            el.style.cssText = `${posEsq[i]};font-size:${tamEsq};animation-duration:${durEsq[i]}s;`;
            wrap.appendChild(el);
        });

        document.body.appendChild(wrap);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', crearDecoraciones);
    } else {
        crearDecoraciones();
    }

})();
