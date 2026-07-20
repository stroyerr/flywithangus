/*
  FlyWithAngus site settings
  --------------------------
  When your Google Calendar appointment schedule is ready, paste the public
  booking URL below. The booking button will open it instead of creating an email.
*/
const BOOKING_URL = "";
const CONTACT_EMAIL = "angus@flywithangus.com";

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = document.querySelectorAll(".nav-links a");
const bookingButton = document.querySelector("#booking-button");
const bookingNote = document.querySelector("#booking-note");
const currentYear = document.querySelector("#current-year");

function closeNavigation() {
  if (!navToggle || !navLinks) return;

  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
  navLinks.classList.remove("is-open");
  document.body.classList.remove("nav-open");
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation" : "Close navigation"
    );
    navLinks.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navAnchors.forEach((anchor) => {
    anchor.addEventListener("click", closeNavigation);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeNavigation();
  });
}

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (bookingButton) {
  bookingButton.addEventListener("click", () => {
    if (BOOKING_URL.trim()) {
      window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
      return;
    }

    const service = document.querySelector("#service")?.value || "Flight instruction";
    const date = document.querySelector("#preferred-date")?.value || "Flexible";
    const time = document.querySelector("#preferred-time")?.value || "Flexible";
    const airport = document.querySelector("#airport")?.value.trim() || "To be confirmed";

    const subject = encodeURIComponent(`Flight request — ${service}`);
    const body = encodeURIComponent(
      [
        "Hi Angus,",
        "",
        "I would like to request a flight with the following details:",
        "",
        `Type of flying: ${service}`,
        `Preferred date: ${date}`,
        `Preferred time: ${time}`,
        `Airport or area: ${airport}`,
        "",
        "My aircraft / rental details:",
        "My current certificates and experience:",
        "Best phone number:",
        "",
        "Thanks,"
      ].join("\n")
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    if (bookingNote) {
      bookingNote.textContent =
        "Your email app should now open with the request details filled in.";
    }
  });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}
