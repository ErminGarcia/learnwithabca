(function () {
  const hamburger = document.querySelector(".hamburger");
  const sideNav = document.querySelector(".side-nav");
  const overlay = document.querySelector(".overlay");
  const sideClose = document.querySelector(".side-close");

  function openMenu() {
    sideNav.classList.add("open");
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    sideNav.classList.remove("open");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  if (hamburger && sideNav && overlay) {
    hamburger.addEventListener("click", openMenu);
  }
  if (sideClose) {
    sideClose.addEventListener("click", closeMenu);
  }
  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }
  if (sideNav) {
    sideNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  const slider = document.querySelector("[data-slider]");
  if (slider) {
    const track = slider.querySelector(".slider-track");
    const slides = slider.querySelectorAll(".slide");
    const prevBtn = slider.querySelector(".slider-btn.prev");
    const nextBtn = slider.querySelector(".slider-btn.next");
    const dots = slider.querySelectorAll(".dot");
    let index = 0;
    const total = slides.length;

    function goTo(i) {
      index = (i + total) % total;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (dot, di) {
        dot.classList.toggle("active", di === index);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(index - 1);
        resetTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(index + 1);
        resetTimer();
      });
    }
    dots.forEach(function (dot, di) {
      dot.addEventListener("click", function () {
        goTo(di);
        resetTimer();
      });
    });

    let timer = setInterval(function () { goTo(index + 1); }, 5000);
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(function () { goTo(index + 1); }, 5000);
    }

    goTo(0);
  }
})();

// login javascript

(function () {
  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("loginError");
  const submitBtn = document.getElementById("loginBtn");

  function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
  }

  function hideError() {
    errorBox.style.display = "none";
  }

  sb.auth.getSession().then(({ data }) => {
    if (data.session) {
      window.location.href = "dashboard.html";
    }
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    hideError();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    const { error } = await sb.auth.signInWithPassword({ email, password });

    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";

    if (error) {
      showError("Invalid email or password. Please try again.");
      return;
    }

    window.location.href = "dashboard.html";
  });
})();
