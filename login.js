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
