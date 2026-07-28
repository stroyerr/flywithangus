/*
  Fly With Angus Admin Portal
*/


/* ==========================================================
   CONFIG
========================================================== */

const SUPABASE_URL =
  "https://fqmnegjxnznadcqowguz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Z7WY7-rSQ76LF7f9oOEDDA_umKno_D5";

const ADMIN_USER_ID =
  "964ff2ae-85f9-4a63-bf13-1005bba5e083";


/* ==========================================================
   SUPABASE
========================================================== */

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* ==========================================================
   ELEMENTS
========================================================== */

const loadingScreen =
  document.getElementById(
    "admin-loading"
  );

const adminEmail =
  document.getElementById(
    "admin-email"
  );

const logoutButton =
  document.getElementById(
    "admin-logout-button"
  );

const activeStudentCount =
  document.getElementById(
    "active-student-count"
  );

const studentSearch =
  document.getElementById(
    "student-search"
  );

const studentList =
  document.getElementById(
    "student-list"
  );

const studentDetailEmpty =
  document.getElementById(
    "student-detail-empty"
  );

const studentDetailContent =
  document.getElementById(
    "student-detail-content"
  );

const detailStudentName =
  document.getElementById(
    "detail-student-name"
  );

const detailStudentEmail =
  document.getElementById(
    "detail-student-email"
  );

const detailStudentStatusBadge =
  document.getElementById(
    "detail-student-status-badge"
  );

const profileForm =
  document.getElementById(
    "student-profile-form"
  );

const profileId =
  document.getElementById(
    "profile-id"
  );

const profileFullName =
  document.getElementById(
    "profile-full-name"
  );

const profilePreferredName =
  document.getElementById(
    "profile-preferred-name"
  );

const profileEmail =
  document.getElementById(
    "profile-email"
  );

const profileTrainingProgram =
  document.getElementById(
    "profile-training-program"
  );

const profileStartDate =
  document.getElementById(
    "profile-start-date"
  );

const profileStatus =
  document.getElementById(
    "profile-status"
  );

const profileFormMessage =
  document.getElementById(
    "profile-form-message"
  );

const saveProfileButton =
  document.getElementById(
    "save-profile-button"
  );

const newStudentButton =
  document.getElementById(
    "new-student-button"
  );


/* ==========================================================
   STATE
========================================================== */

let students = [];

let selectedStudentId = null;


/* ==========================================================
   AUTH
========================================================== */

async function requireAdmin() {

  const {
    data: { session },
    error
  } =
    await supabaseClient.auth.getSession();


  if (
    error ||
    !session
  ) {

    window.location.replace(
      "/students.html"
    );

    return null;
  }


  const user =
    session.user;


  if (
    user.id !== ADMIN_USER_ID
  ) {

    window.location.replace(
      "/dashboard.html"
    );

    return null;
  }


  return user;
}


/* ==========================================================
   LOAD STUDENTS
========================================================== */

async function loadStudents() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("profiles")
      .select(`
        id,
        full_name,
        preferred_name,
        email,
        training_program,
        start_date,
        status,
        created_at
      `)
      .order(
        "full_name",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      "Could not load students:",
      error
    );

    studentList.innerHTML =
      `
        <div class="student-list-empty">
          Could not load student records.
        </div>
      `;

    return;
  }


  students =
    data || [];


  updateSummary();

  renderStudents(
    students
  );
}


/* ==========================================================
   SUMMARY
========================================================== */

function updateSummary() {

  const activeCount =
    students.filter(
      student =>
        student.status === "Active"
    ).length;


  activeStudentCount.textContent =
    activeCount;
}


/* ==========================================================
   RENDER STUDENTS
========================================================== */

function renderStudents(studentArray) {

  studentList.innerHTML = "";


  if (
    !studentArray.length
  ) {

    studentList.innerHTML =
      `
        <div class="student-list-empty">
          No students found.
        </div>
      `;

    return;
  }


  studentArray.forEach(
    student => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "student-list-item";


      if (
        student.id ===
        selectedStudentId
      ) {

        button.classList.add(
          "is-selected"
        );

      }


      const displayName =
        student.full_name ||
        student.email ||
        "Unnamed student";


      const program =
        student.training_program ||
        "Flight Training";


      const status =
        student.status ||
        "Active";


      button.innerHTML =
        `
          <span class="student-list-main">

            <strong>
              ${escapeHtml(displayName)}
            </strong>

            <span>
              ${escapeHtml(student.email || "")}
            </span>

          </span>


          <span class="student-list-meta">

            <span class="student-list-program">
              ${escapeHtml(program)}
            </span>

            <span class="student-list-status">
              ${escapeHtml(status)}
            </span>

          </span>
        `;


      button.addEventListener(
        "click",
        () => {

          selectStudent(
            student.id
          );

        }
      );


      studentList.appendChild(
        button
      );

    }
  );

}


/* ==========================================================
   SELECT STUDENT
========================================================== */

function selectStudent(id) {

  const student =
    students.find(
      item =>
        item.id === id
    );


  if (!student) {
    return;
  }


  selectedStudentId =
    id;


  renderStudents(
    getFilteredStudents()
  );


  studentDetailEmpty.hidden =
    true;


  studentDetailContent.hidden =
    false;


  populateProfileForm(
    student
  );
}


/* ==========================================================
   PROFILE FORM
========================================================== */

function populateProfileForm(student) {

  profileId.value =
    student.id || "";


  profileFullName.value =
    student.full_name || "";


  profilePreferredName.value =
    student.preferred_name || "";


  profileEmail.value =
    student.email || "";


  profileTrainingProgram.value =
    student.training_program || "";


  profileStartDate.value =
    student.start_date || "";


  profileStatus.value =
    student.status || "Active";


  detailStudentName.textContent =
    student.full_name ||
    student.email ||
    "Student";


  detailStudentEmail.textContent =
    student.email ||
    "No email";


  detailStudentStatusBadge.textContent =
    student.status ||
    "Active";


  updateStatusBadge(
    student.status
  );


  showProfileMessage(
    ""
  );
}


/* ==========================================================
   SAVE PROFILE
========================================================== */

profileForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    if (
      !profileForm.reportValidity()
    ) {

      return;
    }


    const id =
      profileId.value;


    if (!id) {

      showProfileMessage(
        "No student selected.",
        "error"
      );

      return;
    }


    saveProfileButton.disabled =
      true;


    saveProfileButton.textContent =
      "Saving…";


    const updates =
      {

        full_name:
          profileFullName.value.trim(),

        preferred_name:
          profilePreferredName.value.trim() ||
          null,

        email:
          profileEmail.value.trim(),

        training_program:
          profileTrainingProgram.value.trim() ||
          null,

        start_date:
          profileStartDate.value ||
          null,

        status:
          profileStatus.value

      };


    const {
      data,
      error
    } =
      await supabaseClient
        .from("profiles")
        .update(
          updates
        )
        .eq(
          "id",
          id
        )
        .select()
        .single();


    if (error) {

      console.error(
        "Profile update failed:",
        error
      );


      showProfileMessage(
        "Could not save changes.",
        "error"
      );


      saveProfileButton.disabled =
        false;


      saveProfileButton.textContent =
        "Save changes";


      return;
    }


    const index =
      students.findIndex(
        student =>
          student.id === id
      );


    if (
      index !== -1
    ) {

      students[index] =
        data;

    }


    populateProfileForm(
      data
    );


    renderStudents(
      getFilteredStudents()
    );


    updateSummary();


    showProfileMessage(
      "Changes saved.",
      "success"
    );


    saveProfileButton.disabled =
      false;


    saveProfileButton.textContent =
      "Save changes";

  }
);


/* ==========================================================
   SEARCH
========================================================== */

studentSearch?.addEventListener(
  "input",
  () => {

    renderStudents(
      getFilteredStudents()
    );

  }
);


function getFilteredStudents() {

  const query =
    studentSearch.value
      .trim()
      .toLowerCase();


  if (!query) {

    return students;

  }


  return students.filter(
    student => {

      const fields =
        [

          student.full_name,
          student.preferred_name,
          student.email,
          student.training_program,
          student.status

        ];


      return fields.some(
        value =>
          String(
            value || ""
          )
            .toLowerCase()
            .includes(
              query
            )
      );

    }
  );

}


/* ==========================================================
   STATUS BADGE
========================================================== */

function updateStatusBadge(status) {

  detailStudentStatusBadge.style.background =
    "";


  detailStudentStatusBadge.style.color =
    "";


  if (
    status === "Inactive"
  ) {

    detailStudentStatusBadge.style.background =
      "rgba(180, 35, 24, 0.08)";


    detailStudentStatusBadge.style.color =
      "#b42318";

  }


  if (
    status === "Complete"
  ) {

    detailStudentStatusBadge.style.background =
      "rgba(0, 113, 227, 0.09)";


    detailStudentStatusBadge.style.color =
      "var(--accent)";

  }

}


/* ==========================================================
   PROFILE MESSAGE
========================================================== */

function showProfileMessage(
  text,
  type = ""
) {

  profileFormMessage.textContent =
    text;


  profileFormMessage.classList.remove(
    "is-success",
    "is-error"
  );


  if (
    type === "success"
  ) {

    profileFormMessage.classList.add(
      "is-success"
    );

  }


  if (
    type === "error"
  ) {

    profileFormMessage.classList.add(
      "is-error"
    );

  }

}


/* ==========================================================
   NEW STUDENT
========================================================== */

newStudentButton?.addEventListener(
  "click",
  () => {

    alert(
      "Next step: we'll build the Add Student workflow so you can create the Auth account and profile without opening Supabase."
    );

  }
);


/* ==========================================================
   MANAGEMENT CARDS
========================================================== */

document
  .querySelectorAll(
    ".student-management-card"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          if (
            !selectedStudentId
          ) {

            return;

          }


          const section =
            button.dataset.section;


          console.log(
            "Open section:",
            section,
            "for student:",
            selectedStudentId
          );


          alert(
            `${section} management will be connected next.`
          );

        }
      );

    }
  );


/* ==========================================================
   LOGOUT
========================================================== */

logoutButton?.addEventListener(
  "click",
  async () => {

    logoutButton.disabled =
      true;


    logoutButton.textContent =
      "Logging out…";


    await supabaseClient.auth.signOut();


    window.location.replace(
      "/students.html"
    );

  }
);


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHtml(value) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* ==========================================================
   INITIALIZE
========================================================== */

async function initializeAdmin() {

  try {

    const user =
      await requireAdmin();


    if (!user) {

      return;

    }


    adminEmail.textContent =
      user.email ||
      "Admin";


    await loadStudents();


  } catch (error) {

    console.error(
      "Admin initialization error:",
      error
    );


  } finally {

    loadingScreen?.classList.add(
      "is-hidden"
    );

  }

}


initializeAdmin();