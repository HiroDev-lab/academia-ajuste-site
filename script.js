/* =========================================================
   Academia Ajuste — animações do hero
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- menu hambúrguer (mobile) ---- */
  function setupMenu() {
    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navMenu");
    if (!nav || !toggle || !menu) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains("is-open"));
    });
    // fecha ao clicar num link
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    // fecha ao clicar fora
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target)) setOpen(false);
    });
    // fecha com ESC
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* As animações de ENTRADA são 100% CSS (auto-rodam no load) — o JS abaixo
     só cuida do menu mobile e dos contadores. Se o JS falhar, o hero aparece
     normalmente (nada fica escondido dependendo de JS). */
  function start() {
    setupMenu();
    setupReveal();
    setupAthletesScroll();
    setupDiffs();
    setupUnits();
    setupStory();
    setupSwitches();
    setupCarousel();
    // o bloco de números entra ~1,4s depois (CSS). O count-up = "primeiro aumento".
    setTimeout(runCounters, reduce ? 0 : 1600);
  }

  /* ---- diferenciais trocam imagem + texto da box (layout/botão fixos) ---- */
  function setupDiffs() {
    var fbox = document.getElementById("fbox");
    var img = document.getElementById("fboxImg");
    var title = document.getElementById("fboxTitle");
    var text = document.getElementById("fboxText");
    var diffs = document.querySelectorAll(".diff");
    if (!fbox || !img || !title || !text || !diffs.length) return;

    // padrão (volta ao tirar o mouse)
    var def = {
      img: fbox.getAttribute("data-img"),
      title: fbox.getAttribute("data-title"),
      desc: fbox.getAttribute("data-desc")
    };
    // pré-carrega as imagens p/ a troca ser instantânea
    Array.prototype.forEach.call(diffs, function (d) {
      var s = d.getAttribute("data-img"); if (s) { var p = new Image(); p.src = s; }
    });

    var container = document.querySelector(".diffs");
    var pending = null, curKey = null;
    function setContent(src, t, dsc, key) {
      if (key === curKey) return;          // já está mostrando isso → sem re-troca (evita flicker)
      curKey = key;
      if (pending) clearTimeout(pending);  // cancela troca anterior pendente (evita atropelo)
      fbox.classList.add("is-swapping");
      pending = setTimeout(function () {
        if (src) img.src = src;
        title.textContent = t || "";
        text.textContent = dsc || "";
        fbox.classList.remove("is-swapping");
      }, 130);
    }
    function activate(d) {
      Array.prototype.forEach.call(diffs, function (x) { x.classList.remove("is-active"); });
      d.classList.add("is-active");
      setContent(d.getAttribute("data-img"), d.getAttribute("data-title"), d.getAttribute("data-desc"), d.getAttribute("data-title"));
    }
    function reset() {
      Array.prototype.forEach.call(diffs, function (x) { x.classList.remove("is-active"); });
      setContent(def.img, def.title, def.desc, "__base__");
    }
    Array.prototype.forEach.call(diffs, function (d) {
      d.addEventListener("mouseenter", function () { activate(d); });
      d.addEventListener("focus", function () { activate(d); });
    });
    // só volta pra base ao sair do GRUPO inteiro (não a cada botão) → fim do flicker
    if (container) {
      container.addEventListener("mouseleave", reset);
      container.addEventListener("focusout", function (e) {
        if (!container.contains(e.relatedTarget)) reset();
      });
    }
  }

  /* ---- unidades: clique troca o mapa + marca a unidade ativa (estado vermelho) ---- */
  function setupUnits() {
    var frame = document.getElementById("locMapFrame");
    var chip = document.getElementById("locMapChip");
    var units = document.querySelectorAll(".unit");
    if (!frame || !units.length) return;

    function select(btn) {
      Array.prototype.forEach.call(units, function (u) {
        u.classList.remove("is-active");
        u.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      var q = btn.getAttribute("data-map") || btn.getAttribute("data-city") || "";
      frame.src = "https://maps.google.com/maps?q=" + encodeURIComponent(q) + "&z=15&output=embed";
      if (chip) chip.textContent = btn.getAttribute("data-city") || "";
    }

    Array.prototype.forEach.call(units, function (u) {
      u.setAttribute("aria-pressed", u.classList.contains("is-active") ? "true" : "false");
      // o iframe já vem com Campo Mourão no HTML; só recarrega quando o usuário troca
      u.addEventListener("click", function () { select(u); });
    });
  }

  /* ---- storytelling: texto CENTRALIZADO e FIXO, revelado caractere a caractere
     (esq->dir, estilo "escrevendo num docs") sobre o layout já reservado (sem reflow) ---- */
  function setupStory() {
    var section = document.querySelector(".story");
    if (!section) return;
    var blocks = section.querySelectorAll("[data-tw]");
    var cta = section.querySelector(".story__cta");
    if (!blocks.length) { if (cta) cta.classList.add("is-in"); return; }

    // reconstrói cada bloco com 1 <span.tw-c> por caractere (preserva <br> e .hl),
    // todos começam ocultos (mas ocupando espaço -> layout centralizado já correto)
    var blockChars = [];
    Array.prototype.forEach.call(blocks, function (el) {
      var chars = [];
      var frag = buildChars(el, chars);
      el.innerHTML = "";
      el.appendChild(frag);
      el.style.visibility = "visible";   // o bloco aparece; quem está oculto são os caracteres
      blockChars.push({ el: el, chars: chars });
    });

    function buildChars(srcEl, collector) {
      var frag = document.createDocumentFragment();
      (function walk(node, target, hl) {
        Array.prototype.forEach.call(node.childNodes, function (n) {
          if (n.nodeType === 3) {
            var txt = n.nodeValue;
            for (var i = 0; i < txt.length; i++) {
              var ch = txt.charAt(i);
              // espaço = nó de texto normal (preserva a quebra de linha; senão a
              // linha vira "inquebrável" e estoura a largura no mobile)
              if (ch === " ") { target.appendChild(document.createTextNode(" ")); continue; }
              var sp = document.createElement("span");
              sp.className = "tw-c"; sp.textContent = ch;
              target.appendChild(sp); collector.push(sp);
            }
          } else if (n.nodeType === 1) {
            if (n.tagName === "BR") { target.appendChild(document.createElement("br")); }
            else if (hl || (n.classList && n.classList.contains("hl"))) {
              var span = document.createElement("span"); span.className = "hl";
              target.appendChild(span); walk(n, span, true);
            } else { walk(n, target, false); }
          }
        });
      })(srcEl, frag, false);
      return frag;
    }

    function showAll() {
      blockChars.forEach(function (b) { b.chars.forEach(function (c) { c.classList.add("on"); }); });
      if (cta) cta.classList.add("is-in");
    }

    // sem animação / sem suporte: mostra tudo de uma vez
    if (reduce || !("IntersectionObserver" in window)) { showAll(); return; }

    // ordem global de revelação + velocidade por tipo de bloco
    var order = [];
    blockChars.forEach(function (b) {
      var slow = !(b.el.classList.contains("story__p") || b.el.classList.contains("story__lead"));
      var sp = slow ? 27 : 12;   // ms por caractere (mais rápido)
      b.chars.forEach(function (c) { order.push({ c: c, sp: sp }); });
      order.push({ gap: 150 });  // respiro entre blocos
    });

    var started = false, skipped = false;
    section.addEventListener("click", function () { if (started) skipped = true; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !started) { started = true; io.disconnect(); run(); }
      });
    }, { threshold: 0.15 });
    io.observe(section);

    function run() {
      var i = 0;
      function step() {
        if (skipped) { showAll(); return; }
        if (i >= order.length) { if (cta) cta.classList.add("is-in"); return; }
        var it = order[i++];
        if (it.gap) { setTimeout(step, it.gap); return; }
        it.c.classList.add("on");   // revela o próximo caractere (texto fixo, preenche p/ a direita)
        setTimeout(step, it.sp);
      }
      step();
    }
  }

  /* ---- interruptores: clique liga/desliga; ligado = verde + texto aparece ---- */
  function setupSwitches() {
    var toggles = document.querySelectorAll(".switches .toggle");
    if (!toggles.length) return;
    Array.prototype.forEach.call(toggles, function (btn) {
      var card = btn.closest(".sw");
      function set(on) {
        if (card) card.classList.toggle("is-on", on);
        btn.setAttribute("aria-checked", on ? "true" : "false");
      }
      btn.addEventListener("click", function () {
        set(!(card && card.classList.contains("is-on")));
      });
      // suporte a teclado (Espaço/Enter já disparam click em <button>, mas garante o estado)
      btn.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); btn.click(); }
      });
    });
  }

  /* ---- carrossel: fotos giram suave (crossfade) + zoom leve; dots clicáveis ---- */
  function setupCarousel() {
    var root = document.getElementById("diffCarousel");
    if (!root) return;
    var slides = root.querySelectorAll(".carousel__slide");
    if (slides.length < 2) return;
    var dotsBox = document.getElementById("diffDots");
    var i = 0, timer = null, DELAY = 3800;

    // cria os dots
    var dots = [];
    if (dotsBox) {
      Array.prototype.forEach.call(slides, function (_, idx) {
        var d = document.createElement("button");
        d.type = "button";
        d.setAttribute("aria-label", "Ir para a foto " + (idx + 1));
        if (idx === 0) d.className = "is-active";
        d.addEventListener("click", function () { go(idx, true); });
        dotsBox.appendChild(d);
        dots.push(d);
      });
    }

    function show(n) {
      slides[i].classList.remove("is-active");
      if (dots[i]) dots[i].classList.remove("is-active");
      i = (n + slides.length) % slides.length;
      // reinicia a animação de zoom (ken burns) do slide ativo
      var s = slides[i];
      s.classList.remove("is-active"); void s.offsetWidth; s.classList.add("is-active");
      if (dots[i]) dots[i].classList.add("is-active");
    }
    function go(n, user) { show(n); if (user) restart(); }
    function next() { show(i + 1); }
    function restart() { if (timer) clearInterval(timer); if (!reduce) timer = setInterval(next, DELAY); }

    restart();
    // pausa ao passar o mouse (volta ao sair)
    root.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    root.addEventListener("mouseleave", restart);
  }

  /* ---- reveal de scroll: fade-in ao descer, fade-out ao subir ---- */
  function setupReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add("reveal--in"); });
      return;
    }
    try {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) e.target.classList.add("reveal--in");
          else if (e.boundingClientRect.top > 0) e.target.classList.remove("reveal--in"); // saiu por baixo (rolou p/ cima)
        });
      }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
      Array.prototype.forEach.call(els, function (e) { io.observe(e); });
    } catch (err) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add("reveal--in"); });
    }
  }

  /* ---- atletas: saem da tela ao rolar para baixo (e voltam ao subir) ---- */
  function setupAthletesScroll() {
    if (reduce) return;
    var hero = document.getElementById("home");
    var aL = document.querySelector(".athlete--left");
    var aR = document.querySelector(".athlete--right");
    if (!hero || !aL || !aR) return;
    var ticking = false;
    function update() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      var p = Math.min(Math.max(-rect.top / (rect.height * 0.7), 0), 1);
      if (p <= 0.001) {            // no topo: solta o inline p/ a animação de entrada/natural valer
        aL.style.transform = aR.style.transform = "";
        aL.style.opacity = aR.style.opacity = "";
        return;
      }
      var tx = (p * 135).toFixed(2);
      var op = (1 - p).toFixed(3);
      aL.style.transform = "translateX(-" + tx + "%)"; aL.style.opacity = op;
      aR.style.transform = "translateX(" + tx + "%)"; aR.style.opacity = op;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ---- contadores ---- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function format(el, value) {
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    return prefix + value.toFixed(dec);
  }

  function countUp(el, done) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);

    if (reduce) {                       // sem animação: vai direto ao valor
      el.textContent = format(el, target);
      if (done) done();
      return;
    }

    var dur = 1800, t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now;
      var p = Math.min((now - t0) / dur, 1);
      var v = target * easeOut(p);
      el.textContent = format(el, dec > 0 ? v : Math.floor(v));
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = format(el, target);   // garante o valor exato
        if (done) done();
      }
    }
    requestAnimationFrame(frame);
  }

  function runCounters() {
    var nodes = document.querySelectorAll(".num__v[data-count]");
    Array.prototype.forEach.call(nodes, function (el) {
      var isTicker = el.getAttribute("data-tick") === "1";
      countUp(el, isTicker ? function () { startTicker(el); } : null);
    });
  }

  /* ---- alunos: +1 a cada 10 segundos após o primeiro aumento ---- */
  function startTicker(el) {
    var prefix = el.getAttribute("data-prefix") || "";
    var value = parseInt(el.getAttribute("data-count"), 10);
    setInterval(function () {
      value += 1;
      el.textContent = prefix + value;
      el.classList.remove("num--bump");
      // reflow p/ reiniciar a animação de "bump"
      void el.offsetWidth;
      el.classList.add("num--bump");
    }, 10000);
  }

  // A logo tem tamanho reservado no CSS (117x48), então a caixa já existe no
  // DOMContentLoaded e a animação dela aparece — não precisa esperar o load.
  var started = false;
  function kick() {
    if (started) return;
    started = true;
    requestAnimationFrame(start);
  }
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", kick);
  } else {
    kick();
  }
})();
