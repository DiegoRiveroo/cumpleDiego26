const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7dGe0X_VSkxwJQuGeYyFrgUZr5jILHDKl1bCgG2_VSSq_1TqxDm9BFl_z7ui5vORY/exec";
const EVENT_DATE = new Date("2026-07-04T20:00:00-03:00");

const body = document.body;
const enterBtn = document.getElementById("enterBtn");
const musicToggle = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");
const cursorGlow = document.getElementById("cursorGlow");
const countdown = document.getElementById("countdown");

function unlockPage() {
  body.classList.remove("locked");

  setTimeout(() => {
    document.querySelector("main section:nth-of-type(2)")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 300);
}

enterBtn?.addEventListener("click", async () => {
  unlockPage();
  try {
    await bgMusic.play();
    musicToggle.textContent = "Sound on";
  } catch (error) {
    musicToggle.textContent = "Sound off";
  }
});

musicToggle?.addEventListener("click", async () => {
  if (bgMusic.paused) {
    try {
      await bgMusic.play();
      musicToggle.textContent = "Sound on";
    } catch (error) {
      musicToggle.textContent = "Sound off";
    }
  } else {
    bgMusic.pause();
    musicToggle.textContent = "Sound off";
  }
});

window.addEventListener("mousemove", (event) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

function updateCountdown() {
  if (!countdown) return;
  const now = new Date();
  const diff = EVENT_DATE - now;

  if (diff <= 0) {
    countdown.innerHTML = `<span><strong>Hoy</strong><small>nos vemos</small></span>`;
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdown.innerHTML = `
    <span><strong>${days}</strong><small>días</small></span>
    <span><strong>${hours}</strong><small>horas</small></span>
    <span><strong>${minutes}</strong><small>min</small></span>
    <span><strong>${seconds}</strong><small>seg</small></span>
  `;
}

updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

async function submitForm(form, statusElement, type) {
  statusElement.textContent = "Enviando...";

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.type = type;

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.ok) {
      statusElement.textContent = result.message || "No se pudo enviar. Intenta nuevamente.";
      return;
    }

    statusElement.textContent = result.message || "Enviado correctamente.";
    form.reset();
  } catch (error) {
    statusElement.textContent = "No se pudo conectar. Revisa la URL del Apps Script.";
  }
}

const rsvpForm = document.getElementById("rsvpForm");
const rsvpStatus = document.getElementById("rsvpStatus");
rsvpForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  submitForm(rsvpForm, rsvpStatus, "rsvp_diego");
});

const memoryForm = document.getElementById("memoryForm");
const memoryStatus = document.getElementById("memoryStatus");
memoryForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  submitForm(memoryForm, memoryStatus, "memory_diego");
});
