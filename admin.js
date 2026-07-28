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
   ADD STUDENT
========================================================== */

const addStudentDialog =
  document.getElementById(
    "add-student-dialog"
  );

const addStudentForm =
  document.getElementById(
    "add-student-form"
  );

const addStudentClose =
  document.getElementById(
    "add-student-close"
  );

const addStudentCancel =
  document.getElementById(
    "add-student-cancel"
  );

const createStudentButton =
  document.getElementById(
    "create-student-button"
  );

const addStudentMessage =
  document.getElementById(
    "add-student-message"
  );

const newStudentFullName =
  document.getElementById(
    "new-student-full-name"
  );

const newStudentPreferredName =
  document.getElementById(
    "new-student-preferred-name"
  );

const newStudentEmail =
  document.getElementById(
    "new-student-email"
  );

const newStudentProgram =
  document.getElementById(
    "new-student-program"
  );

const newStudentStartDate =
  document.getElementById(
    "new-student-start-date"
  );

const newStudentStatus =
  document.getElementById(
    "new-student-status"
  );

const newStudentPassword =
  document.getElementById(
    "new-student-password"
  );

const generatePasswordButton =
  document.getElementById(
    "generate-password-button"
  );


/* OPEN */

newStudentButton?.addEventListener(
  "click",
  () => {

    addStudentForm.reset();

    addStudentMessage.textContent =
      "";

    addStudentMessage.classList.remove(
      "is-success",
      "is-error"
    );

    newStudentStatus.value =
      "Active";

    newStudentPassword.value =
      generateTemporaryPassword();

    addStudentDialog.showModal();

    newStudentFullName.focus();
  }
);


/* CLOSE */

function closeAddStudentDialog() {

  addStudentDialog.close();

}


addStudentClose?.addEventListener(
  "click",
  closeAddStudentDialog
);


addStudentCancel?.addEventListener(
  "click",
  closeAddStudentDialog
);


/* PASSWORD GENERATOR */

generatePasswordButton?.addEventListener(
  "click",
  () => {

    newStudentPassword.value =
      generateTemporaryPassword();

  }
);


function generateTemporaryPassword() {

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ" +
    "abcdefghijkmnopqrstuvwxyz" +
    "23456789" +
    "!@#$%";

  const randomValues =
    new Uint32Array(14);

  crypto.getRandomValues(
    randomValues
  );

  return Array
    .from(
      randomValues,
      value =>
        characters[
          value %
          characters.length
        ]
    )
    .join("");
}


/* CREATE */

addStudentForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    if (
      !addStudentForm.reportValidity()
    ) {
      return;
    }


    createStudentButton.disabled =
      true;

    createStudentButton.textContent =
      "Creating…";


    addStudentMessage.textContent =
      "";

    addStudentMessage.classList.remove(
      "is-success",
      "is-error"
    );


    const studentData = {

      full_name:
        newStudentFullName
          .value
          .trim(),

      preferred_name:
        newStudentPreferredName
          .value
          .trim(),

      email:
        newStudentEmail
          .value
          .trim(),

      training_program:
        newStudentProgram
          .value
          .trim(),

      start_date:
        newStudentStartDate
          .value ||
        null,

      status:
        newStudentStatus
          .value,

      temporary_password:
        newStudentPassword
          .value,

    };


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .functions
          .invoke(
            "create-student",
            {
              body:
                studentData,
            }
          );


      if (error) {

        console.error(
          "Create student function error:",
          error
        );

        throw error;
      }


      if (
        !data?.success
      ) {

        throw new Error(
          data?.error ||
          "Could not create student."
        );
      }


      addStudentMessage.textContent =
        "Student created successfully. Save their temporary password before closing this window.";

      addStudentMessage.classList.add(
        "is-success"
      );


      /*
        Refresh admin student list.
      */

      await loadStudents();


      /*
        Select the newly created student.
      */

      if (
        data.student?.id
      ) {

        selectStudent(
          data.student.id
        );

      }


    } catch (error) {

      console.error(
        error
      );

      addStudentMessage.textContent =
        error.message ||
        "Could not create student.";

      addStudentMessage.classList.add(
        "is-error"
      );


    } finally {

      createStudentButton.disabled =
        false;

      createStudentButton.textContent =
        "Create student";

    }

  }
);


/* ==========================================================
   MANAGEMENT CARDS
========================================================== */

document
  .querySelectorAll(
    ".student-management-card[data-section]"
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

/* ==========================================================
   ENDORSEMENTS
========================================================== */

const studentEndorsementsButton =
  document.getElementById(
    "student-endorsements-button"
  );

const allEndorsementsButton =
  document.getElementById(
    "all-endorsements-button"
  );

const endorsementDialog =
  document.getElementById(
    "endorsement-dialog"
  );

const endorsementDialogClose =
  document.getElementById(
    "endorsement-dialog-close"
  );

const endorsementDialogTitle =
  document.getElementById(
    "endorsement-dialog-title"
  );

const endorsementDialogSubtitle =
  document.getElementById(
    "endorsement-dialog-subtitle"
  );

const endorsementSearch =
  document.getElementById(
    "endorsement-search"
  );

const endorsementList =
  document.getElementById(
    "endorsement-list"
  );

const addEndorsementButton =
  document.getElementById(
    "add-endorsement-button"
  );

const addEndorsementDialog =
  document.getElementById(
    "add-endorsement-dialog"
  );

const addEndorsementClose =
  document.getElementById(
    "add-endorsement-close"
  );

const addEndorsementCancel =
  document.getElementById(
    "add-endorsement-cancel"
  );

const addEndorsementForm =
  document.getElementById(
    "add-endorsement-form"
  );

const endorsementStudent =
  document.getElementById(
    "endorsement-student"
  );

const endorsementType =
  document.getElementById(
    "endorsement-type"
  );

const endorsementRegulation =
  document.getElementById(
    "endorsement-regulation"
  );

const endorsementDate =
  document.getElementById(
    "endorsement-date"
  );

const endorsementExpiry =
  document.getElementById(
    "endorsement-expiry"
  );

const endorsementAircraft =
  document.getElementById(
    "endorsement-aircraft"
  );

const endorsementText =
  document.getElementById(
    "endorsement-text"
  );

const endorsementNotes =
  document.getElementById(
    "endorsement-notes"
  );

const endorsementFormMessage =
  document.getElementById(
    "endorsement-form-message"
  );

const saveEndorsementButton =
  document.getElementById(
    "save-endorsement-button"
  );


let endorsementRecords = [];

let editingEndorsementId =
  null;

let endorsementViewStudentId =
  null;


/* ==========================================================
   HELPERS
========================================================== */

function getStudentById(id) {

  return students.find(
    student =>
      student.id === id
  );

}


function getStudentName(id) {

  const student =
    getStudentById(id);

  return (
    student?.full_name ||
    student?.email ||
    "Student"
  );

}


function formatEndorsementDate(value) {

  if (!value) {
    return "—";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );

}


function getTodayInputValue() {

  const now =
    new Date();

  const local =
    new Date(
      now.getTime() -
      now.getTimezoneOffset() * 60000
    );

  return local
    .toISOString()
    .slice(0, 10);

}


function getEndorsementStatus(
  expiresAt
) {

  if (!expiresAt) {

    return {
      label: "Recorded",
      className: "no-expiry"
    };

  }


  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const expiry =
    new Date(
      `${expiresAt}T00:00:00`
    );


  const difference =
    expiry.getTime() -
    today.getTime();


  const daysRemaining =
    Math.round(
      difference /
      86400000
    );


  if (daysRemaining < 0) {

    return {
      label: "Expired",
      className: "is-expired"
    };

  }


  if (daysRemaining === 0) {

    return {
      label: "Expires today",
      className: "is-expiring"
    };

  }


  if (daysRemaining <= 30) {

    return {
      label:
        `Expires in ${daysRemaining}d`,

      className:
        "is-expiring"
    };

  }


  return {
    label: "Active",
    className: ""
  };

}


/* ==========================================================
   LOAD ENDORSEMENTS
========================================================== */

async function loadEndorsements(
  studentId = null
) {

  endorsementList.innerHTML =
    `
      <div class="student-list-empty">
        Loading endorsements…
      </div>
    `;


  let query =
    supabaseClient
      .from("endorsements")
      .select(`
        id,
        student_id,
        endorsement_type,
        regulation,
        date_given,
        expires_at,
        aircraft,
        endorsement_text,
        notes,
        created_at
      `)
      .order(
        "date_given",
        {
          ascending: false
        }
      );


  if (studentId) {

    query =
      query.eq(
        "student_id",
        studentId
      );

  }


  const {
    data,
    error
  } =
    await query;


  if (error) {

    console.error(
      "Could not load endorsements:",
      error
    );


    endorsementList.innerHTML =
      `
        <div class="student-list-empty">
          Could not load endorsements.
        </div>
      `;

    return;

  }


  endorsementRecords =
    data || [];


  renderEndorsements(
    endorsementRecords
  );

}


/* ==========================================================
   RENDER
========================================================== */

function renderEndorsements(records) {

  endorsementList.innerHTML = "";


  if (!records.length) {

    endorsementList.innerHTML =
      `
        <div class="student-list-empty">
          No endorsements recorded.
        </div>
      `;

    return;

  }


  records.forEach(
    endorsement => {

      const item =
        document.createElement(
          "article"
        );


      item.className =
        "endorsement-item";


      const status =
        getEndorsementStatus(
          endorsement.expires_at
        );


      const studentName =
        endorsementViewStudentId
          ? ""
          : `
              <span class="endorsement-student-name">
                ${escapeHtml(
                  getStudentName(
                    endorsement.student_id
                  )
                )}
              </span>
            `;


      const metaParts =
        [];


      metaParts.push(
        formatEndorsementDate(
          endorsement.date_given
        )
      );


      if (
        endorsement.regulation
      ) {

        metaParts.push(
          endorsement.regulation
        );

      }


      if (
        endorsement.aircraft
      ) {

        metaParts.push(
          endorsement.aircraft
        );

      }


      if (
        endorsement.expires_at
      ) {

        metaParts.push(
          `Expires ${formatEndorsementDate(
            endorsement.expires_at
          )}`
        );

      }


      item.innerHTML =
        `
          <div class="endorsement-item-main">

            <div class="endorsement-item-heading">

              <strong>
                ${escapeHtml(
                  endorsement.endorsement_type
                )}
              </strong>

              ${studentName}

            </div>


            <div class="endorsement-meta">

              ${metaParts
                .map(
                  part =>
                    escapeHtml(part)
                )
                .join(" • ")}

            </div>


            ${
              endorsement.notes
                ? `
                    <p class="endorsement-notes">
                      ${escapeHtml(
                        endorsement.notes
                      )}
                    </p>
                  `
                : ""
            }


            <div class="endorsement-item-actions">

              <button
                type="button"
                class="endorsement-action-button endorsement-edit-button"
              >
                Edit
              </button>

              <button
                type="button"
                class="endorsement-action-button is-delete endorsement-delete-button"
              >
                Delete
              </button>

            </div>

          </div>


          <span
            class="endorsement-status ${status.className}"
          >
            ${escapeHtml(
              status.label
            )}
          </span>
        `;


      const editButton =
        item.querySelector(
          ".endorsement-edit-button"
        );


      const deleteButton =
        item.querySelector(
          ".endorsement-delete-button"
        );


      editButton.addEventListener(
        "click",
        () => {

          openEditEndorsement(
            endorsement
          );

        }
      );


      deleteButton.addEventListener(
        "click",
        () => {

          deleteEndorsement(
            endorsement
          );

        }
      );


      endorsementList.appendChild(
        item
      );

    }
  );

}


/* ==========================================================
   OPEN STUDENT ENDORSEMENTS
========================================================== */

studentEndorsementsButton
  ?.addEventListener(
    "click",
    async () => {

      if (
        !selectedStudentId
      ) {

        return;

      }


      endorsementViewStudentId =
        selectedStudentId;


      const student =
        getStudentById(
          selectedStudentId
        );


      endorsementDialogTitle.textContent =
        "Endorsements";


      endorsementDialogSubtitle.textContent =
        student?.full_name ||
        student?.email ||
        "Student";


      endorsementSearch.value =
        "";


      endorsementDialog.showModal();


      await loadEndorsements(
        selectedStudentId
      );

    }
  );


/* ==========================================================
   OPEN MASTER REGISTER
========================================================== */

allEndorsementsButton
  ?.addEventListener(
    "click",
    async () => {

      endorsementViewStudentId =
        null;


      endorsementDialogTitle.textContent =
        "All endorsements";


      endorsementDialogSubtitle.textContent =
        "Complete instructor endorsement register.";


      endorsementSearch.value =
        "";


      endorsementDialog.showModal();


      await loadEndorsements();

    }
  );


endorsementDialogClose
  ?.addEventListener(
    "click",
    () => {

      endorsementDialog.close();

    }
  );

/* ==========================================================
   EDIT ENDORSEMENT
========================================================== */

function openEditEndorsement(
  endorsement
) {

  editingEndorsementId =
    endorsement.id;


  addEndorsementForm.reset();


  endorsementFormMessage.textContent =
    "";


  endorsementFormMessage
    .classList
    .remove(
      "is-success",
      "is-error"
    );


  /*
    Populate student list
  */

  endorsementStudent.innerHTML =
    "";


  students.forEach(
    student => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        student.id;


      option.textContent =
        student.full_name ||
        student.email ||
        "Student";


      endorsementStudent
        .appendChild(
          option
        );

    }
  );


  /*
    Fill existing endorsement
  */

  endorsementStudent.value =
    endorsement.student_id;


  endorsementType.value =
    endorsement.endorsement_type ||
    "";


  endorsementRegulation.value =
    endorsement.regulation ||
    "";


  endorsementDate.value =
    endorsement.date_given ||
    "";


  endorsementExpiry.value =
    endorsement.expires_at ||
    "";


  endorsementAircraft.value =
    endorsement.aircraft ||
    "";


  endorsementText.value =
    endorsement.endorsement_text ||
    "";


  endorsementNotes.value =
    endorsement.notes ||
    "";


  saveEndorsementButton.textContent =
    "Save changes";


  addEndorsementDialog.showModal();


  endorsementType.focus();

}

/* ==========================================================
   DELETE ENDORSEMENT
========================================================== */

async function deleteEndorsement(
  endorsement
) {

  const studentName =
    getStudentName(
      endorsement.student_id
    );


  const confirmed =
    window.confirm(
      `Delete "${endorsement.endorsement_type}" for ${studentName}?\n\nThis cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("endorsements")
      .delete()
      .eq(
        "id",
        endorsement.id
      );


  if (error) {

    console.error(
      "Could not delete endorsement:",
      error
    );


    alert(
      "Could not delete the endorsement."
    );

    return;

  }


  await loadEndorsements(
    endorsementViewStudentId
  );

}

/* ==========================================================
   OPEN ADD ENDORSEMENT
========================================================== */

addEndorsementButton
  ?.addEventListener(
    "click",
    () => {

      addEndorsementForm.reset();

      editingEndorsementId =
  null;

saveEndorsementButton.textContent =
  "Save endorsement";


      endorsementFormMessage.textContent =
        "";


      endorsementStudent.innerHTML =
        "";


      students.forEach(
        student => {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            student.id;


          option.textContent =
            student.full_name ||
            student.email ||
            "Student";


          endorsementStudent.appendChild(
            option
          );

        }
      );


      if (
        endorsementViewStudentId
      ) {

        endorsementStudent.value =
          endorsementViewStudentId;

      } else if (
        selectedStudentId
      ) {

        endorsementStudent.value =
          selectedStudentId;

      }


      endorsementDate.value =
        getTodayInputValue();


      addEndorsementDialog.showModal();


      endorsementType.focus();

    }
  );


/* ==========================================================
   CLOSE ADD ENDORSEMENT
========================================================== */

addEndorsementClose
  ?.addEventListener(
    "click",
    () => {

      addEndorsementDialog.close();

    }
  );


addEndorsementCancel
  ?.addEventListener(
    "click",
    () => {

      addEndorsementDialog.close();

    }
  );


/* ==========================================================
   SAVE ENDORSEMENT
========================================================== */

addEndorsementForm
  ?.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (
        !addEndorsementForm
          .reportValidity()
      ) {

        return;

      }


      saveEndorsementButton.disabled =
        true;


      saveEndorsementButton.textContent =
        "Saving…";


      endorsementFormMessage.textContent =
        "";


      endorsementFormMessage
        .classList
        .remove(
          "is-success",
          "is-error"
        );


      const record =
        {

          student_id:
            endorsementStudent.value,

          endorsement_type:
            endorsementType
              .value
              .trim(),

          regulation:
            endorsementRegulation
              .value
              .trim() ||
            null,

          date_given:
            endorsementDate.value,

          expires_at:
            endorsementExpiry.value ||
            null,

          aircraft:
            endorsementAircraft
              .value
              .trim() ||
            null,

          endorsement_text:
            endorsementText
              .value
              .trim() ||
            null,

          notes:
            endorsementNotes
              .value
              .trim() ||
            null

        };


      let saveResult;


if (
  editingEndorsementId
) {

  saveResult =
    await supabaseClient
      .from("endorsements")
      .update({
        ...record,

        updated_at:
          new Date().toISOString()
      })
      .eq(
        "id",
        editingEndorsementId
      );

} else {

  saveResult =
    await supabaseClient
      .from("endorsements")
      .insert(
        record
      );

}


const {
  error
} =
  saveResult;


      if (error) {

        console.error(
          "Could not save endorsement:",
          error
        );


        endorsementFormMessage.textContent =
          "Could not save endorsement.";


        endorsementFormMessage
          .classList
          .add(
            "is-error"
          );


        saveEndorsementButton.disabled =
          false;


        saveEndorsementButton.textContent =
          "Save endorsement";


        return;

      }


      addEndorsementDialog.close();

      editingEndorsementId =
  null;


      await loadEndorsements(
        endorsementViewStudentId
      );


      saveEndorsementButton.disabled =
        false;


      saveEndorsementButton.textContent =
        "Save endorsement";

    }
  );


/* ==========================================================
   ENDORSEMENT SEARCH
========================================================== */

endorsementSearch
  ?.addEventListener(
    "input",
    () => {

      const search =
        endorsementSearch
          .value
          .trim()
          .toLowerCase();


      if (!search) {

        renderEndorsements(
          endorsementRecords
        );

        return;

      }


      const filtered =
        endorsementRecords.filter(
          endorsement => {

            const studentName =
              getStudentName(
                endorsement.student_id
              );


            const values =
              [
                studentName,
                endorsement.endorsement_type,
                endorsement.regulation,
                endorsement.aircraft,
                endorsement.notes,
                endorsement.endorsement_text
              ];


            return values.some(
              value =>
                String(
                  value || ""
                )
                  .toLowerCase()
                  .includes(search)
            );

          }
        );


      renderEndorsements(
        filtered
      );

    }
  );

  /* ==========================================================
   TSA / COMPLIANCE
========================================================== */

const studentTsaButton =
  document.getElementById(
    "student-tsa-button"
  );

const tsaDialog =
  document.getElementById(
    "tsa-dialog"
  );

const tsaDialogClose =
  document.getElementById(
    "tsa-dialog-close"
  );

const tsaDialogCancel =
  document.getElementById(
    "tsa-dialog-cancel"
  );

const tsaStudentName =
  document.getElementById(
    "tsa-student-name"
  );

const tsaRecordForm =
  document.getElementById(
    "tsa-record-form"
  );

const tsaStudentCategory =
  document.getElementById(
    "tsa-student-category"
  );

const tsaComplianceStatus =
  document.getElementById(
    "tsa-compliance-status"
  );

const tsaVerificationDate =
  document.getElementById(
    "tsa-verification-date"
  );

const tsaVerificationMethod =
  document.getElementById(
    "tsa-verification-method"
  );

const tsaDocumentType =
  document.getElementById(
    "tsa-document-type"
  );

const tsaDocumentReference =
  document.getElementById(
    "tsa-document-reference"
  );

const tsaRecordMethod =
  document.getElementById(
    "tsa-record-method"
  );

const tsaFtspReference =
  document.getElementById(
    "tsa-ftsp-reference"
  );

const tsaExpiryDate =
  document.getElementById(
    "tsa-expiry-date"
  );

const tsaProviderSelectedDate =
  document.getElementById(
    "tsa-provider-selected-date"
  );

const tsaNotes =
  document.getElementById(
    "tsa-notes"
  );

const tsaSaveButton =
  document.getElementById(
    "tsa-save-button"
  );

const tsaFormMessage =
  document.getElementById(
    "tsa-form-message"
  );


let currentTsaRecordId =
  null;


/* ==========================================================
   OPEN TSA
========================================================== */

studentTsaButton?.addEventListener(
  "click",
  async () => {

    if (!selectedStudentId) {
      return;
    }


    const student =
      students.find(
        student =>
          student.id === selectedStudentId
      );


    tsaStudentName.textContent =
      student?.full_name ||
      student?.email ||
      "Student";


    tsaRecordForm.reset();

    currentTsaRecordId =
      null;


    tsaStudentCategory.value =
      "pending";

    tsaComplianceStatus.value =
      "pending";


    tsaFormMessage.textContent =
      "";

    tsaFormMessage.classList.remove(
      "is-success",
      "is-error"
    );


    tsaDialog.showModal();


    await loadTsaRecord(
      selectedStudentId
    );

    await loadTsaEvents(
  selectedStudentId
);

  }
);


/* ==========================================================
   LOAD TSA RECORD
========================================================== */

async function loadTsaRecord(
  studentId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("tsa_records")
      .select(`
        id,
        student_id,
        student_category,
        compliance_status,
        verification_date,
        verification_method,
        document_type,
        document_reference,
        record_method,
        ftsp_reference,
        determination_expires_at,
        provider_selected_date,
        notes
      `)
      .eq(
        "student_id",
        studentId
      )
      .maybeSingle();


  if (error) {

    console.error(
      "TSA record load error:",
      error
    );


    tsaFormMessage.textContent =
      "Could not load TSA record.";

    tsaFormMessage.classList.add(
      "is-error"
    );

    return;

  }


  if (!data) {

    currentTsaRecordId =
      null;

      addTsaEventButton.disabled =
  false;

    return;

  }


  currentTsaRecordId =
    data.id;


  tsaStudentCategory.value =
    data.student_category ||
    "pending";


  tsaComplianceStatus.value =
    data.compliance_status ||
    "pending";


  tsaVerificationDate.value =
    data.verification_date ||
    "";


  tsaVerificationMethod.value =
    data.verification_method ||
    "";


  tsaDocumentType.value =
    data.document_type ||
    "";


  tsaDocumentReference.value =
    data.document_reference ||
    "";


  tsaRecordMethod.value =
    data.record_method ||
    "";


  tsaFtspReference.value =
    data.ftsp_reference ||
    "";


  tsaExpiryDate.value =
    data.determination_expires_at ||
    "";


  tsaProviderSelectedDate.value =
    data.provider_selected_date ||
    "";


  tsaNotes.value =
    data.notes ||
    "";

}


/* ==========================================================
   SAVE TSA RECORD
========================================================== */

tsaRecordForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    if (!selectedStudentId) {
      return;
    }


    if (
      !tsaRecordForm.reportValidity()
    ) {
      return;
    }


    tsaSaveButton.disabled =
      true;

    tsaSaveButton.textContent =
      "Saving…";


    tsaFormMessage.textContent =
      "";

    tsaFormMessage.classList.remove(
      "is-success",
      "is-error"
    );


    const record =
      {

        student_id:
          selectedStudentId,

        student_category:
          tsaStudentCategory.value,

        compliance_status:
          tsaComplianceStatus.value,

        verification_date:
          tsaVerificationDate.value ||
          null,

        verification_method:
          tsaVerificationMethod
            .value
            .trim() ||
          null,

        document_type:
          tsaDocumentType
            .value
            .trim() ||
          null,

        document_reference:
          tsaDocumentReference
            .value
            .trim() ||
          null,

        record_method:
          tsaRecordMethod
            .value
            .trim() ||
          null,

        ftsp_reference:
          tsaFtspReference
            .value
            .trim() ||
          null,

        determination_expires_at:
          tsaExpiryDate.value ||
          null,

        provider_selected_date:
          tsaProviderSelectedDate.value ||
          null,

        notes:
          tsaNotes
            .value
            .trim() ||
          null,

        updated_at:
          new Date().toISOString()

      };


    const {
      data,
      error
    } =
      await supabaseClient
        .from("tsa_records")
        .upsert(
          record,
          {
            onConflict:
              "student_id"
          }
        )
        .select()
        .single();


    if (error) {

      console.error(
        "TSA save error:",
        error
      );


      tsaFormMessage.textContent =
        "Could not save TSA record.";

      tsaFormMessage.classList.add(
        "is-error"
      );


      tsaSaveButton.disabled =
        false;

      tsaSaveButton.textContent =
        "Save TSA record";

      return;

    }


    currentTsaRecordId =
      data.id;


    tsaFormMessage.textContent =
      "TSA record saved.";

    tsaFormMessage.classList.add(
      "is-success"
    );


    tsaSaveButton.disabled =
      false;

    tsaSaveButton.textContent =
      "Save TSA record";

  }
);


/* ==========================================================
   CLOSE TSA
========================================================== */

tsaDialogClose?.addEventListener(
  "click",
  () => {

    tsaDialog.close();

  }
);


tsaDialogCancel?.addEventListener(
  "click",
  () => {

    tsaDialog.close();

  }
);

/* ==========================================================
   TSA TRAINING EVENTS
========================================================== */

const tsaEventList =
  document.getElementById(
    "tsa-event-list"
  );

const addTsaEventButton =
  document.getElementById(
    "add-tsa-event-button"
  );

const tsaEventDialog =
  document.getElementById(
    "tsa-event-dialog"
  );

const tsaEventDialogTitle =
  document.getElementById(
    "tsa-event-dialog-title"
  );

const tsaEventDialogClose =
  document.getElementById(
    "tsa-event-dialog-close"
  );

const tsaEventCancel =
  document.getElementById(
    "tsa-event-cancel"
  );

const tsaEventForm =
  document.getElementById(
    "tsa-event-form"
  );

const tsaEventTrainingType =
  document.getElementById(
    "tsa-event-training-type"
  );

const tsaEventReference =
  document.getElementById(
    "tsa-event-reference"
  );

const tsaEventProposedStart =
  document.getElementById(
    "tsa-event-proposed-start"
  );

const tsaEventProposedEnd =
  document.getElementById(
    "tsa-event-proposed-end"
  );

const tsaEventNotificationDate =
  document.getElementById(
    "tsa-event-notification-date"
  );

const tsaEventArrivalDate =
  document.getElementById(
    "tsa-event-arrival-date"
  );

const tsaEventPhotoDate =
  document.getElementById(
    "tsa-event-photo-date"
  );

const tsaEventLocation =
  document.getElementById(
    "tsa-event-location"
  );

const tsaEventActualStart =
  document.getElementById(
    "tsa-event-actual-start"
  );

const tsaEventActualEnd =
  document.getElementById(
    "tsa-event-actual-end"
  );

const tsaEventStatus =
  document.getElementById(
    "tsa-event-status"
  );

const tsaEventCompletionNotification =
  document.getElementById(
    "tsa-event-completion-notification"
  );

const tsaEventNotCompletedReason =
  document.getElementById(
    "tsa-event-not-completed-reason"
  );

const tsaEventNotes =
  document.getElementById(
    "tsa-event-notes"
  );

const tsaEventMessage =
  document.getElementById(
    "tsa-event-message"
  );

const tsaEventSave =
  document.getElementById(
    "tsa-event-save"
  );


let tsaEvents = [];

let editingTsaEventId =
  null;


/* ==========================================================
   LOAD EVENTS
========================================================== */

async function loadTsaEvents(
  studentId
) {

  tsaEventList.innerHTML =
    `
      <div class="student-list-empty">
        Loading training events…
      </div>
    `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("tsa_training_events")
      .select(`
        id,
        student_id,
        tsa_record_id,
        training_type,
        ftsp_event_reference,
        proposed_start_date,
        proposed_end_date,
        notification_date,
        arrival_date,
        photo_uploaded_date,
        actual_start_date,
        actual_end_date,
        training_location,
        completion_status,
        completion_notification_date,
        not_completed_reason,
        notes,
        created_at
      `)
      .eq(
        "student_id",
        studentId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "TSA event load error:",
      error
    );


    tsaEventList.innerHTML =
      `
        <div class="student-list-empty">
          Could not load training events.
        </div>
      `;

    return;
  }


  tsaEvents =
    data || [];


  renderTsaEvents();

}


/* ==========================================================
   RENDER EVENTS
========================================================== */

function renderTsaEvents() {

  tsaEventList.innerHTML =
    "";


  if (!tsaEvents.length) {

    tsaEventList.innerHTML =
      `
        <div class="student-list-empty">
          No training events recorded.
        </div>
      `;

    return;
  }


  tsaEvents.forEach(
    event => {

      const item =
        document.createElement(
          "article"
        );


      item.className =
        "tsa-event-item";


      const status =
        getTsaEventStatus(
          event.completion_status
        );


      const meta =
        [];


      if (
        event.ftsp_event_reference
      ) {

        meta.push(
          `FTSP ${event.ftsp_event_reference}`
        );

      }


      if (
        event.proposed_start_date
      ) {

        meta.push(
          `Proposed ${formatTsaDate(
            event.proposed_start_date
          )}`
        );

      }


      if (
        event.actual_start_date
      ) {

        meta.push(
          `Started ${formatTsaDate(
            event.actual_start_date
          )}`
        );

      }


      if (
        event.actual_end_date
      ) {

        meta.push(
          `Ended ${formatTsaDate(
            event.actual_end_date
          )}`
        );

      }


      if (
        event.training_location
      ) {

        meta.push(
          event.training_location
        );

      }


      item.innerHTML =
        `
          <div class="tsa-event-main">

            <strong>
              ${escapeHtml(
                event.training_type
              )}
            </strong>


            <div class="tsa-event-meta">

              ${meta
                .map(
                  value =>
                    escapeHtml(value)
                )
                .join(" • ")}

            </div>


            ${
              event.not_completed_reason
                ? `
                    <p class="tsa-event-notes">
                      <strong>Not completed:</strong>
                      ${escapeHtml(
                        event.not_completed_reason
                      )}
                    </p>
                  `
                : ""
            }


            ${
              event.notes
                ? `
                    <p class="tsa-event-notes">
                      ${escapeHtml(
                        event.notes
                      )}
                    </p>
                  `
                : ""
            }

          </div>


          <div class="tsa-event-side">

            <span
              class="tsa-event-status ${status.className}"
            >
              ${status.label}
            </span>


            <div class="tsa-event-actions">

              <button
                type="button"
                class="tsa-event-action tsa-event-edit"
              >
                Edit
              </button>


              <button
                type="button"
                class="tsa-event-action is-delete tsa-event-delete"
              >
                Delete
              </button>

            </div>

          </div>
        `;


      item
        .querySelector(
          ".tsa-event-edit"
        )
        .addEventListener(
          "click",
          () => {

            openEditTsaEvent(
              event
            );

          }
        );


      item
        .querySelector(
          ".tsa-event-delete"
        )
        .addEventListener(
          "click",
          () => {

            deleteTsaEvent(
              event
            );

          }
        );


      tsaEventList.appendChild(
        item
      );

    }
  );

}


/* ==========================================================
   STATUS
========================================================== */

function getTsaEventStatus(
  status
) {

  switch (status) {

    case "in_progress":

      return {
        label: "In progress",
        className: "is-active"
      };


    case "completed":

      return {
        label: "Completed",
        className: "is-complete"
      };


    case "not_completed":

      return {
        label: "Not completed",
        className: "is-warning"
      };


    case "cancelled":

      return {
        label: "Cancelled",
        className: "is-warning"
      };


    default:

      return {
        label: "Planned",
        className: ""
      };

  }

}


/* ==========================================================
   OPEN ADD EVENT
========================================================== */

addTsaEventButton?.addEventListener(
  "click",
  () => {

    if (!selectedStudentId) {
      return;
    }


    if (!currentTsaRecordId) {

      alert(
        "Save the student's TSA record before adding a training event."
      );

      return;

    }


    editingTsaEventId =
      null;


    tsaEventForm.reset();


    tsaEventDialogTitle.textContent =
      "Add training event";


    tsaEventStatus.value =
      "planned";


    tsaEventMessage.textContent =
      "";


    tsaEventDialog.showModal();


    tsaEventTrainingType.focus();

  }
);


/* ==========================================================
   EDIT EVENT
========================================================== */

function openEditTsaEvent(
  event
) {

  editingTsaEventId =
    event.id;


  tsaEventForm.reset();


  tsaEventDialogTitle.textContent =
    "Edit training event";


  tsaEventTrainingType.value =
    event.training_type ||
    "";


  tsaEventReference.value =
    event.ftsp_event_reference ||
    "";


  tsaEventProposedStart.value =
    event.proposed_start_date ||
    "";


  tsaEventProposedEnd.value =
    event.proposed_end_date ||
    "";


  tsaEventNotificationDate.value =
    event.notification_date ||
    "";


  tsaEventArrivalDate.value =
    event.arrival_date ||
    "";


  tsaEventPhotoDate.value =
    event.photo_uploaded_date ||
    "";


  tsaEventLocation.value =
    event.training_location ||
    "";


  tsaEventActualStart.value =
    event.actual_start_date ||
    "";


  tsaEventActualEnd.value =
    event.actual_end_date ||
    "";


  tsaEventStatus.value =
    event.completion_status ||
    "planned";


  tsaEventCompletionNotification.value =
    event.completion_notification_date ||
    "";


  tsaEventNotCompletedReason.value =
    event.not_completed_reason ||
    "";


  tsaEventNotes.value =
    event.notes ||
    "";


  tsaEventMessage.textContent =
    "";


  tsaEventDialog.showModal();

}


/* ==========================================================
   SAVE EVENT
========================================================== */

tsaEventForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    if (
      !tsaEventForm.reportValidity()
    ) {

      return;

    }


    if (
      !selectedStudentId ||
      !currentTsaRecordId
    ) {

      return;

    }


    tsaEventSave.disabled =
      true;


    tsaEventSave.textContent =
      "Saving…";


    const record =
      {

        student_id:
          selectedStudentId,

        tsa_record_id:
          currentTsaRecordId,

        training_type:
          tsaEventTrainingType
            .value
            .trim(),

        ftsp_event_reference:
          tsaEventReference
            .value
            .trim() ||
          null,

        proposed_start_date:
          tsaEventProposedStart.value ||
          null,

        proposed_end_date:
          tsaEventProposedEnd.value ||
          null,

        notification_date:
          tsaEventNotificationDate.value ||
          null,

        arrival_date:
          tsaEventArrivalDate.value ||
          null,

        photo_uploaded_date:
          tsaEventPhotoDate.value ||
          null,

        actual_start_date:
          tsaEventActualStart.value ||
          null,

        actual_end_date:
          tsaEventActualEnd.value ||
          null,

        training_location:
          tsaEventLocation
            .value
            .trim() ||
          null,

        completion_status:
          tsaEventStatus.value,

        completion_notification_date:
          tsaEventCompletionNotification.value ||
          null,

        not_completed_reason:
          tsaEventNotCompletedReason
            .value
            .trim() ||
          null,

        notes:
          tsaEventNotes
            .value
            .trim() ||
          null,

        updated_at:
          new Date().toISOString()

      };


    let result;


    if (
      editingTsaEventId
    ) {

      result =
        await supabaseClient
          .from(
            "tsa_training_events"
          )
          .update(
            record
          )
          .eq(
            "id",
            editingTsaEventId
          );

    } else {

      result =
        await supabaseClient
          .from(
            "tsa_training_events"
          )
          .insert(
            record
          );

    }


    if (result.error) {

      console.error(
        "TSA event save error:",
        result.error
      );


      tsaEventMessage.textContent =
        "Could not save training event.";


      tsaEventMessage
        .classList
        .add(
          "is-error"
        );


      tsaEventSave.disabled =
        false;


      tsaEventSave.textContent =
        "Save event";


      return;

    }


    editingTsaEventId =
      null;


    tsaEventDialog.close();


    await loadTsaEvents(
      selectedStudentId
    );


    tsaEventSave.disabled =
      false;


    tsaEventSave.textContent =
      "Save event";

  }
);


/* ==========================================================
   DELETE EVENT
========================================================== */

async function deleteTsaEvent(
  event
) {

  const confirmed =
    window.confirm(
      `Delete "${event.training_type}" training event?\n\nThis cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from(
        "tsa_training_events"
      )
      .delete()
      .eq(
        "id",
        event.id
      );


  if (error) {

    console.error(
      "TSA event delete error:",
      error
    );


    alert(
      "Could not delete training event."
    );


    return;

  }


  await loadTsaEvents(
    selectedStudentId
  );

}


/* ==========================================================
   CLOSE EVENT DIALOG
========================================================== */

tsaEventDialogClose
  ?.addEventListener(
    "click",
    () => {

      tsaEventDialog.close();

    }
  );


tsaEventCancel
  ?.addEventListener(
    "click",
    () => {

      tsaEventDialog.close();

    }
  );


function formatTsaDate(
  value
) {

  if (!value) {
    return "—";
  }


  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );

}


initializeAdmin();