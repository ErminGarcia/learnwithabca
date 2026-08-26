(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = document.getElementById("contactSubmitBtn");
  const statusBox = document.getElementById("contactStatus");

  function showStatus(message, type) {
    statusBox.textContent = message;
    statusBox.className = "form-status show " + type;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const parentName = document.getElementById("contactParentName").value.trim();
    const studentName = document.getElementById("contactStudentName").value.trim();
    const studentAge = document.getElementById("contactStudentAge").value.trim();
    const gradeLevel = document.getElementById("contactGradeLevel").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const contactNumber = document.getElementById("contactNumber").value.trim();
    const additionalInfo = document.getElementById("contactAdditionalInfo").value.trim();

    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
    statusBox.className = "form-status";

    const { error } = await sb.from("applications").insert([
      {
        parent_name: parentName,
        student_name: studentName,
        student_age: studentAge,
        grade_level: gradeLevel,
        email: email,
        contact_number: contactNumber,
        additional_info: additionalInfo || null
      }
    ]);

    submitBtn.disabled = false;
    submitBtn.classList.remove("is-loading");

    if (error) {
      showStatus("Something went wrong. Please try again.", "error");
      return;
    }

    showStatus("Application submitted. We'll get back to you soon.", "success");
    form.reset();
  });
})();
