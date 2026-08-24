const COLUMN_COUNT = 9;

function renderSkeletonRows(count) {
  const tbody = document.getElementById("applicantsBody");
  tbody.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const row = document.createElement("tr");
    let cells = "";
    for (let j = 0; j < COLUMN_COUNT; j++) {
      cells += '<td><span class="skeleton-cell"></span></td>';
    }
    row.innerHTML = cells;
    tbody.appendChild(row);
  }
}

function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  const datePart = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return datePart + " " + timePart;
}

function attachDeleteHandlers() {
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const confirmed = confirm("Delete this application?");
      if (!confirmed) return;

      btn.disabled = true;
      const { error } = await sb.from("applications").delete().eq("id", id);

      if (error) {
        alert("Failed to delete. Please try again.");
        btn.disabled = false;
        return;
      }

      const row = btn.closest("tr");
      row.remove();

      const statValue = document.getElementById("statValue");
      const current = parseInt(statValue.textContent, 10) || 0;
      statValue.textContent = Math.max(current - 1, 0);

      const tbody = document.getElementById("applicantsBody");
      if (tbody.children.length === 0) {
        tbody.innerHTML = '<tr><td colspan="' + COLUMN_COUNT + '" class="empty-row">No applications yet.</td></tr>';
      }
    });
  });
}

function renderApplicants(data) {
  const tbody = document.getElementById("applicantsBody");
  const statValue = document.getElementById("statValue");

  statValue.textContent = data.length;
  statValue.classList.remove("skeleton");

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="' + COLUMN_COUNT + '" class="empty-row">No applications yet.</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  data.forEach((app) => {
    const row = document.createElement("tr");
    row.innerHTML =
      "<td>" + (app.student_name ?? "") + "</td>" +
      "<td>" + (app.student_age ?? "") + "</td>" +
      "<td>" + (app.grade_level ?? "") + "</td>" +
      "<td>" + (app.parent_name ?? "") + "</td>" +
      "<td>" + (app.email ?? "") + "</td>" +
      "<td>" + (app.contact_number ?? "") + "</td>" +
      "<td>" + (app.additional_info ?? "—") + "</td>" +
      "<td>" + formatDate(app.created_at) + "</td>" +
      '<td><button class="btn-delete" data-id="' + app.id + '">Delete</button></td>';
    tbody.appendChild(row);
  });

  attachDeleteHandlers();
}

async function loadApplicants() {
  renderSkeletonRows(5);

  const { data, error } = await sb
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  const statValue = document.getElementById("statValue");

  if (error) {
    document.getElementById("applicantsBody").innerHTML =
      '<tr><td colspan="' + COLUMN_COUNT + '" class="empty-row">Could not load applications.</td></tr>';
    statValue.textContent = "—";
    statValue.classList.remove("skeleton");
    return;
  }

  renderApplicants(data);
}

async function logout() {
  await sb.auth.signOut();
  window.location.href = "login.html";
}

async function init() {
  const { data } = await sb.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
    return;
  }
  await loadApplicants();
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  document.getElementById("logoutBtnHeader").addEventListener("click", logout);
  document.getElementById("logoutBtnSide").addEventListener("click", logout);
  document.getElementById("year").textContent = new Date().getFullYear();
});
