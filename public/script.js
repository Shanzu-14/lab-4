// ----- Element references -----
const form = document.getElementById("registrationForm");
const resetBtn = document.getElementById("resetBtn");
const registerBtn = form.querySelector('button[type="submit"]');
const formMessage = document.getElementById("formMessage");

const previewName = document.getElementById("previewName");
const previewEmail = document.getElementById("previewEmail");
const previewEvent = document.getElementById("previewEvent");
const eventInfo = document.getElementById("eventInfo");
const avatar = document.getElementById("avatar");
const statusBadge = document.getElementById("statusBadge");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const phoneCounter = document.getElementById("phoneCounter");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");
const checklistItems = document.querySelectorAll("#passwordChecklist li");
const toggleButtons = document.querySelectorAll(".toggle-btn");

const fieldIds = [
  "fullName",
  "email",
  "phone",
  "event",
  "password",
  "confirmPassword",
  "terms",
];

// GCIT email format (change this one pattern if your college email format differs)
const GCIT_EMAIL_PATTERN = /^[A-Za-z0-9._]+\.gcit@rub\.edu\.bt$/;

// Event options and descriptions come from events.js
const eventDetails = {};
const eventField = document.getElementById("event");
const openEvents = EVENTS.filter(function (ev) {
  return ev.open;
});
openEvents.forEach(function (ev) {
  eventDetails[ev.name] = ev.description;
  eventField.add(new Option(ev.name, ev.name));
});

// With only one open event there is nothing to choose, so select it
function applyDefaultEvent() {
  if (openEvents.length === 1) eventField.value = openEvents[0].name;
}
applyDefaultEvent();

// ----- Validation rules: each returns an error message, or "" when valid -----
const rules = {
  fullName() {
    const name = document.getElementById("fullName").value.trim();
    if (name === "") return "Full name is required.";
    if (name.length < 3) return "Full name must be at least 3 characters.";
    return "";
  },
  email() {
    const email = document.getElementById("email").value.trim();
    if (email === "") return "Email is required.";
    if (!GCIT_EMAIL_PATTERN.test(email))
      return "Use your GCIT email, for example name.gcit@rub.edu.bt.";
    return "";
  },
  phone() {
    const phone = document.getElementById("phone").value;
    if (phone === "") return "Contact number is required.";
    if (!/^[0-9]{8}$/.test(phone))
      return "Contact number must be exactly 8 digits.";
    return "";
  },
  event() {
    if (document.getElementById("event").value === "")
      return "Select one of the events.";
    return "";
  },
  password() {
    const password = document.getElementById("password").value;
    if (password === "") return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password))
      return "Password must contain an uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain a number.";
    return "";
  },
  confirmPassword() {
    const confirm = document.getElementById("confirmPassword").value;
    if (confirm === "") return "Confirm your password.";
    if (confirm !== document.getElementById("password").value)
      return "Passwords do not match.";
    return "";
  },
  terms() {
    if (!document.getElementById("terms").checked)
      return "You must accept the terms and conditions.";
    return "";
  },
};

// Validate one field, show its message and mark it valid or invalid. Returns true if valid.
function validateField(id) {
  const input = document.getElementById(id);
  const errorBox = document.getElementById(id + "Error");
  const message = rules[id]();

  errorBox.textContent = message;
  input.classList.toggle("invalid", message !== "");
  input.classList.toggle("valid", message === "");
  return message === "";
}

// ----- Live preview (never shows the password) -----
function setPreview(element, text, emptyText) {
  const newText = text || emptyText;
  if (element.textContent !== newText) {
    element.textContent = newText;
    // Restart the short "pop" animation so every change is noticeable
    element.classList.remove("pop");
    void element.offsetWidth;
    element.classList.add("pop");
  }
  element.classList.toggle("placeholder", !text);
}

function getInitials(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (parts[0][0] + last).toUpperCase();
}

function updatePreview() {
  const eventSelect = document.getElementById("event");
  const eventText =
    eventSelect.value === ""
      ? ""
      : eventSelect.options[eventSelect.selectedIndex].text;
  const name = document.getElementById("fullName").value.trim();

  setPreview(previewName, name, "Not entered yet");
  setPreview(
    previewEmail,
    document.getElementById("email").value.trim(),
    "Not entered yet",
  );
  setPreview(previewEvent, eventText, "Not selected yet");

  avatar.textContent = getInitials(name);
  avatar.classList.toggle("empty", name === "");
  eventInfo.textContent =
    eventDetails[eventText] || "Choose an event to see what it is about.";
}

function setRegistered(isRegistered) {
  statusBadge.textContent = isRegistered ? "Registered" : "Not registered";
  statusBadge.classList.toggle("registered", isRegistered);
}

function clearFormMessage() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
}

// ----- Interactive helpers -----
// Progress bar: how many fields are currently valid
function updateProgress() {
  const done = fieldIds.filter(function (id) {
    return rules[id]() === "";
  }).length;
  progressBar.style.width = (done / fieldIds.length) * 100 + "%";
  progressBar.classList.toggle("complete", done === fieldIds.length);
  registerBtn.classList.toggle("ready", done === fieldIds.length);
  progressText.textContent =
    done + " of " + fieldIds.length + " fields complete";
}

// Password checklist and strength meter update on every keystroke
function updatePasswordHelp() {
  const password = document.getElementById("password").value;
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  checklistItems.forEach(function (item) {
    item.classList.toggle("met", checks[item.dataset.rule]);
  });

  let score = Object.values(checks).filter(Boolean).length;
  if (score === 3 && password.length >= 12) score = 4;
  if (password === "") score = 0;

  const labels = ["not entered", "weak", "fair", "good", "strong"];
  strengthBar.style.width = (score / 4) * 100 + "%";
  strengthBar.className = "strength-bar" + (score > 0 ? " s" + score : "");
  strengthText.textContent = "Strength: " + labels[score];
}

// Phone: live digit counter
function updatePhoneCounter() {
  phoneCounter.textContent =
    document.getElementById("phone").value.length + " / 8 digits";
}

// Show / hide password buttons
toggleButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const input = document.getElementById(button.dataset.target);
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.textContent = showing ? "Show" : "Hide";
    button.setAttribute(
      "aria-label",
      (showing ? "Show " : "Hide ") +
        (button.dataset.target === "password"
          ? "password"
          : "confirm password"),
    );
  });
});

// Phone: only allow digits (runs before the general input handler below)
document.getElementById("phone").addEventListener("input", function (event) {
  event.target.value = event.target.value.replace(/\D/g, "");
  updatePhoneCounter();
});

// Small burst of blue and red pieces from the Register button after a successful registration
function launchConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colours = ["#2C99D6", "#E82F33", "#9AD0EE", "#F8FAFC"];
  const box = registerBtn.getBoundingClientRect();
  const startX = box.left + box.width / 2;
  const startY = box.top + box.height / 2;

  for (let i = 0; i < 28; i++) {
    const piece = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 70 + Math.random() * 110;

    piece.className = "confetti";
    piece.style.left = startX + "px";
    piece.style.top = startY + "px";
    piece.style.background = colours[i % colours.length];
    piece.style.setProperty("--dx", Math.cos(angle) * distance + "px");
    piece.style.setProperty("--dy", Math.sin(angle) * distance + "px");
    piece.addEventListener("animationend", function () {
      piece.remove();
    });
    document.body.appendChild(piece);
  }
}

// ----- Events -----
// input and change events: update the preview and validate while the user types
fieldIds.forEach(function (id) {
  const input = document.getElementById(id);
  const eventName =
    input.tagName === "SELECT" || input.type === "checkbox"
      ? "change"
      : "input";

  input.addEventListener(eventName, function () {
    clearFormMessage();
    setRegistered(false);
    updatePreview();
    validateField(id);

    if (id === "password") {
      updatePasswordHelp();
      // Editing the password can change whether the confirmation still matches
      if (document.getElementById("confirmPassword").value !== "") {
        validateField("confirmPassword");
      }
    }
    updateProgress();
  });
});

// submit event: validate everything and save to backend
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  let allValid = true;
  fieldIds.forEach(function (id) {
    if (!validateField(id)) allValid = false;
  });

  if (!allValid) {
    formMessage.textContent =
      "Please fix the highlighted fields before registering.";
    formMessage.className = "form-message error-message";
    setRegistered(false);

    // Shake the invalid fields, then move focus to the first one
    const invalidFields = form.querySelectorAll(".invalid");
    invalidFields.forEach(function (field) {
      field.classList.remove("shake");
      void field.offsetWidth;
      field.classList.add("shake");
      field.addEventListener(
        "animationend",
        function () {
          field.classList.remove("shake");
        },
        { once: true },
      );
    });
    invalidFields[0].focus();
    return;
  }

  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const eventSelect = document.getElementById("event");
  const eventText = eventSelect.options[eventSelect.selectedIndex].text;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: name,
        email: email,
        phone: phone,
        event: eventText,
        password: password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      formMessage.textContent = result.message;
      formMessage.className = "form-message error-message";
      setRegistered(false);
      return;
    }

    formMessage.textContent =
      "Registration successful. " +
      name +
      ", you are registered for " +
      eventText +
      ".";
    formMessage.className = "form-message success-message";
    setRegistered(true);
    launchConfetti();
  } catch (err) {
    formMessage.textContent =
      "Could not connect to the server. Make sure node server.js is running.";
    formMessage.className = "form-message error-message";
    setRegistered(false);
  }
});

// click event: reset the form, clear messages and restore the preview
resetBtn.addEventListener("click", function () {
  form.reset();
  applyDefaultEvent();
  clearFormMessage();

  fieldIds.forEach(function (id) {
    document.getElementById(id + "Error").textContent = "";
    document.getElementById(id).classList.remove("valid", "invalid");
  });

  // Hide passwords again and restore the helpers
  toggleButtons.forEach(function (button) {
    document.getElementById(button.dataset.target).type = "password";
    button.textContent = "Show";
  });

  setRegistered(false);
  updatePreview();
  updatePasswordHelp();
  updatePhoneCounter();
  updateProgress();
});

// Arriving from an event card (register.html?event=Web%20Design%20Workshop) pre-selects that event
const wantedEvent = new URLSearchParams(location.search).get("event");
if (wantedEvent && eventDetails[wantedEvent]) {
  eventField.value = wantedEvent;
  validateField("event");
}

updatePreview();
updatePasswordHelp();
updatePhoneCounter();
updateProgress();

// ----- Terms and conditions dialog -----
const termsDialog = document.getElementById("termsDialog");
const termsCheckbox = document.getElementById("terms");

document.getElementById("termsLink").addEventListener("click", function () {
  termsDialog.showModal();
});
document.getElementById("termsX").addEventListener("click", function () {
  termsDialog.close();
});
document.getElementById("termsClose").addEventListener("click", function () {
  termsDialog.close();
});
// Clicking the dark area outside the dialog closes it
termsDialog.addEventListener("click", function (event) {
  if (event.target === termsDialog) termsDialog.close();
});
// "I agree" ticks the checkbox and runs the normal change handling (validation, progress)
document.getElementById("termsAccept").addEventListener("click", function () {
  termsCheckbox.checked = true;
  termsCheckbox.dispatchEvent(new Event("change"));
  termsDialog.close();
  termsCheckbox.focus();
});
