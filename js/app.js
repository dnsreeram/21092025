(function () {
  const site = window.ANNIVERSARY || {};
  const AUTH_KEY = "twentyone-who";
  const USERS = {
    anagha: "b73b033d121949ca726d4f32ae01e14fb19452a31092f5e24707d18d34f6a33a",
    sreeram: "c5ad53a7cf52b61eb2d95b5c34ca492848061fc51f803465edf93561f7f83fe6",
  };

  const WELCOME = {
    anagha: {
      title: "Welcome, Green Rabbit",
      art: "assets/welcome-green-rabbit.png",
    },
    sreeram: {
      title: "Welcome, God of War",
      art: "assets/welcome-angry-bird.png",
    },
  };

  const body = document.body;
  const gate = document.getElementById("gate");
  const gateForm = document.getElementById("gate-form");
  const passwordInput = document.getElementById("gate-password");
  const gateError = document.getElementById("gate-error");
  const welcome = document.getElementById("welcome");
  const welcomeArt = document.getElementById("welcome-art");
  const welcomeTitle = document.getElementById("welcome-title");
  const nav = document.querySelector(".nav");

  let selectedUser = "";

  async function sha256(value) {
    const data = new TextEncoder().encode(value);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function openSite(who) {
    const greeting = WELCOME[who] || WELCOME.anagha;
    welcomeArt.src = greeting.art;
    welcomeArt.alt = greeting.title;
    welcomeTitle.textContent = greeting.title;
    gate.classList.add("is-gone");
    welcome.classList.toggle("is-war", who === "sreeram");
    welcome.classList.remove("is-gone");
    startSite();
    window.setTimeout(() => {
      welcome.classList.add("is-gone");
      body.classList.remove("is-locked");
    }, 4000);
  }

  document.querySelectorAll(".who-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedUser = btn.dataset.user;
      document.querySelectorAll(".who-btn").forEach((other) => {
        other.classList.toggle("is-active", other === btn);
      });
      gateForm.hidden = false;
      gateError.hidden = true;
      passwordInput.value = "";
      passwordInput.focus();
    });
  });

  gateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = passwordInput.value;
    if (!selectedUser || !USERS[selectedUser]) return;
    const digest = await sha256(`${selectedUser}|${password}`);
    if (digest !== USERS[selectedUser]) {
      gateError.hidden = false;
      gateForm.classList.remove("is-shake");
      void gateForm.offsetWidth;
      gateForm.classList.add("is-shake");
      return;
    }
    sessionStorage.setItem(AUTH_KEY, selectedUser);
    openSite(selectedUser);
  });

  sessionStorage.removeItem(AUTH_KEY);

  function fillGallery(gallery, photos) {
    if (!gallery) return;
    photos.forEach((photo, index) => {
      const figure = document.createElement("figure");
      figure.className = "polaroid";
      if (photo.wide) figure.classList.add("is-wide");
      const frame = document.createElement("div");
      frame.className = "frame";

      const fallback = document.createElement("div");
      fallback.className = "frame-fallback";
      fallback.innerHTML = `<span>21.09</span><em>A photograph belongs here</em>`;

      const img = document.createElement("img");
      img.alt = photo.caption || "A memory";
      img.hidden = true;
      img.decoding = "async";
      if (index > 0) img.loading = "lazy";
      img.src = photo.src || `photos/${index + 1}.jpg`;
      img.addEventListener("load", () => {
        fallback.remove();
        img.hidden = false;
      });
      img.addEventListener("error", () => {
        img.remove();
      });
      frame.appendChild(fallback);
      frame.appendChild(img);

      const caption = document.createElement("figcaption");
      caption.textContent = photo.caption || "";
      figure.appendChild(frame);
      figure.appendChild(caption);
      gallery.appendChild(figure);
    });
  }

  function startSite() {
    if (body.dataset.started === "true") return;
    body.dataset.started = "true";

    const names = [site.names?.a, site.names?.b]
      .map((n) => (n || "").trim())
      .filter(Boolean);
    const couple = names.length === 2 ? names.join(" & ") : "";

    document.getElementById("hero-tagline").textContent = site.tagline || "";
    document.getElementById("hero-long").textContent = site.displayDateLong || "";
    document.getElementById("hero-names").textContent = couple;
    document.getElementById("hero-between").textContent = site.between || "";
    document.getElementById("hero-eyebrow").textContent =
      site.eyebrow || "Our anniversary";
    document.getElementById("close-script").textContent =
      couple || "Forever starts here";
    document.getElementById("close-love").textContent = "I LOVE YOU";

    document.getElementById("together-lede").textContent = couple
      ? `${couple} — counted from ${site.displayDateLong}.`
      : `Counted from ${site.displayDateLong}.`;

    const countersEl = document.getElementById("counters");
    const units = ["years", "months", "days", "hours", "minutes", "seconds"];
    units.forEach((unit) => {
      const item = document.createElement("div");
      item.className = "counter";
      item.innerHTML = `<strong data-unit="${unit}">0</strong><span>${unit}</span>`;
      countersEl.appendChild(item);
    });

    const start = new Date(`${site.dateISO}T00:00:00`);

    function elapsedParts(from, to) {
      let years = to.getFullYear() - from.getFullYear();
      let months = to.getMonth() - from.getMonth();
      let days = to.getDate() - from.getDate();
      let hours = to.getHours() - from.getHours();
      let minutes = to.getMinutes() - from.getMinutes();
      let seconds = to.getSeconds() - from.getSeconds();

      if (seconds < 0) {
        seconds += 60;
        minutes -= 1;
      }
      if (minutes < 0) {
        minutes += 60;
        hours -= 1;
      }
      if (hours < 0) {
        hours += 24;
        days -= 1;
      }
      if (days < 0) {
        const previous = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
        days += previous;
        months -= 1;
      }
      if (months < 0) {
        months += 12;
        years -= 1;
      }

      return {
        years: Math.max(0, years),
        months: Math.max(0, months),
        days: Math.max(0, days),
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds),
      };
    }

    function nextAnniversary(now) {
      const next = new Date(now.getFullYear(), start.getMonth(), start.getDate());
      if (next < now) next.setFullYear(now.getFullYear() + 1);
      return next;
    }

    function ordinal(n) {
      const named = { 1: "first", 2: "second", 3: "third", 4: "fourth", 5: "fifth" };
      if (named[n]) return named[n];
      const rest = n % 10;
      const suffix =
        rest === 1 && n !== 11
          ? "st"
          : rest === 2 && n !== 12
            ? "nd"
            : rest === 3 && n !== 13
              ? "rd"
              : "th";
      return `${n}${suffix}`;
    }

    function pad(unit, value) {
      if (unit === "minutes" || unit === "seconds" || unit === "hours") {
        return String(value).padStart(2, "0");
      }
      return String(value);
    }

    function tick() {
      const now = new Date();
      const parts = elapsedParts(start, now);
      units.forEach((unit) => {
        const node = document.querySelector(`[data-unit="${unit}"]`);
        if (node) node.textContent = pad(unit, parts[unit]);
      });

      const next = nextAnniversary(now);
      const sameDay =
        now.getDate() === start.getDate() && now.getMonth() === start.getMonth();
      const note = document.getElementById("next-note");
      if (sameDay) {
        note.textContent = `Happy anniversary. ${site.displayDate} lives here.`;
      } else {
        const daysTo = Math.ceil((next - now) / 86400000);
        const yearNumber = next.getFullYear() - start.getFullYear();
        note.textContent = `${daysTo} day${daysTo === 1 ? "" : "s"} until our ${ordinal(yearNumber)} anniversary.`;
      }
    }

    tick();
    window.setInterval(tick, 250);

    const timeline = document.getElementById("timeline");
    (site.story || []).forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<p class="kicker">${item.kicker}</p><h3>${item.title}</h3><p>${item.text}</p>`;
      timeline.appendChild(li);
    });

    fillGallery(document.getElementById("gallery"), site.photos || []);
    fillGallery(document.getElementById("gallery-memories"), site.memoryPhotos || []);
    fillGallery(document.getElementById("gallery-time"), site.timePhotos || []);

    const letter = site.letter || {};
    document.getElementById("letter-greeting").textContent = letter.greeting || "";
    document.getElementById("letter-title").textContent = letter.title || "";
    document.getElementById("letter-signoff").textContent = letter.signoff || "";
    document.getElementById("letter-signature").textContent = letter.signature || "";
    const letterBody = document.getElementById("letter-body");
    (letter.body || []).forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      letterBody.appendChild(p);
    });

    const song = site.song || {};
    const audio = document.getElementById("song");
    const audioBtn = document.getElementById("audio-btn");
    if (song.src) {
      audio.src = song.src;
      audioBtn.hidden = false;
      audioBtn.addEventListener("click", async () => {
        if (audio.paused) {
          await audio.play();
          audioBtn.textContent = "Pause";
        } else {
          audio.pause();
          audioBtn.textContent = "Play";
        }
      });
    }

    function onScroll() {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    setupFeedback();
  }

  function setupFeedback() {
    const section = document.getElementById("feedback");
    const arena = document.getElementById("feedback-arena");
    const yesBtn = document.getElementById("feedback-yes");
    const noBtn = document.getElementById("feedback-no");
    const thanks = document.getElementById("feedback-thanks");
    if (!section || !arena || !yesBtn || !noBtn || !thanks) return;

    function pinNo() {
      if (noBtn.dataset.pinned === "true") return;
      const area = arena.getBoundingClientRect();
      const btn = noBtn.getBoundingClientRect();
      noBtn.style.left = `${btn.left - area.left}px`;
      noBtn.style.top = `${btn.top - area.top}px`;
      noBtn.classList.add("is-loose");
      noBtn.dataset.pinned = "true";
    }

    function placeNo(left, top) {
      pinNo();
      const maxLeft = Math.max(8, arena.clientWidth - noBtn.offsetWidth - 8);
      const maxTop = Math.max(8, arena.clientHeight - noBtn.offsetHeight - 8);
      noBtn.style.left = `${Math.min(Math.max(8, left), maxLeft)}px`;
      noBtn.style.top = `${Math.min(Math.max(8, top), maxTop)}px`;
    }

    function randomAway(clientX, clientY) {
      pinNo();
      const area = arena.getBoundingClientRect();
      const width = noBtn.offsetWidth;
      const height = noBtn.offsetHeight;
      let best = null;
      let bestDist = -1;
      for (let i = 0; i < 14; i += 1) {
        const left = 8 + Math.random() * Math.max(8, arena.clientWidth - width - 16);
        const top = 8 + Math.random() * Math.max(8, arena.clientHeight - height - 16);
        const centerX = area.left + left + width / 2;
        const centerY = area.top + top + height / 2;
        const dist = Math.hypot(centerX - clientX, centerY - clientY);
        if (dist > bestDist) {
          bestDist = dist;
          best = { left, top };
        }
      }
      if (best) placeNo(best.left, best.top);
    }

    function fleeFrom(clientX, clientY) {
      pinNo();
      const area = arena.getBoundingClientRect();
      const btn = noBtn.getBoundingClientRect();
      const cx = btn.left + btn.width / 2;
      const cy = btn.top + btn.height / 2;
      let dx = cx - clientX;
      let dy = cy - clientY;
      const mag = Math.hypot(dx, dy);
      if (mag < 1) {
        const angle = Math.random() * Math.PI * 2;
        dx = Math.cos(angle);
        dy = Math.sin(angle);
      } else {
        dx /= mag;
        dy /= mag;
      }
      const jump = 90 + Math.random() * 70;
      const nextLeft = btn.left - area.left + dx * jump;
      const nextTop = btn.top - area.top + dy * jump;
      const maxLeft = arena.clientWidth - noBtn.offsetWidth - 8;
      const maxTop = arena.clientHeight - noBtn.offsetHeight - 8;
      if (nextLeft < 8 || nextLeft > maxLeft || nextTop < 8 || nextTop > maxTop) {
        randomAway(clientX, clientY);
        return;
      }
      placeNo(nextLeft, nextTop);
    }

    noBtn.addEventListener("mouseenter", (event) => {
      randomAway(event.clientX, event.clientY);
    });
    noBtn.addEventListener("mousemove", (event) => {
      fleeFrom(event.clientX, event.clientY);
    });
    noBtn.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        randomAway(event.clientX, event.clientY);
      } else {
        fleeFrom(event.clientX, event.clientY);
      }
    });
    noBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    yesBtn.addEventListener("click", () => {
      thanks.hidden = false;
      noBtn.hidden = true;
      yesBtn.disabled = true;
      section.classList.add("is-answered");
    });

    window.addEventListener("resize", () => {
      if (noBtn.hidden || noBtn.dataset.pinned !== "true") return;
      const left = parseFloat(noBtn.style.left) || 8;
      const top = parseFloat(noBtn.style.top) || 8;
      placeNo(left, top);
    });
  }
})();
