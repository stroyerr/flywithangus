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

  const lessonReceiptNumber =
  document.getElementById(
    "lesson-receipt-number"
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

  const profileAcsProgram =
  document.getElementById(
    "profile-acs-program"
  );

  let acsPrograms = [];

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

  async function loadAcsPrograms() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("acs_programs")
      .select(`
        id,
        code,
        name,
        version
      `)
      .eq(
        "is_active",
        true
      )
      .order(
        "name",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      "Could not load ACS programs:",
      error
    );

    return;
  }


  acsPrograms =
    data || [];


  profileAcsProgram.innerHTML =
    `
      <option value="">
        No ACS assigned
      </option>
    `;


  acsPrograms.forEach(
    program => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        program.id;


      option.textContent =
        program.name;


      profileAcsProgram.appendChild(
        option
      );

    }
  );

}


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
        acs_program_id,
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

    profileAcsProgram.value =
  student.acs_program_id ||
  "";


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

          acs_program_id:
  profileAcsProgram.value ||
  null,

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


    await loadAcsPrograms();
    await loadStudents();
    await loadRecentActivity();
    await loadAdminBillingSummary();


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


    /*
      Don't allow a training event until
      the main TSA record exists.
    */

    addTsaEventButton.disabled =
      true;


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


    currentTsaRecordId =
      null;


    addTsaEventButton.disabled =
      true;


    return;
  }


  /*
    No TSA record exists yet.
  */

  if (!data) {

    currentTsaRecordId =
      null;


    addTsaEventButton.disabled =
      true;


    return;
  }


  /*
    Existing TSA record found.
  */

  currentTsaRecordId =
    data.id;


  addTsaEventButton.disabled =
    false;


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


    /*
      We now have a valid TSA record,
      so training events can be created.
    */

    currentTsaRecordId =
      data.id;


    addTsaEventButton.disabled =
      false;


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

/* ==========================================================
   LESSONS
========================================================== */

const studentLessonsButton =
  document.getElementById(
    "student-lessons-button"
  );

const lessonDialog =
  document.getElementById(
    "lesson-dialog"
  );

const lessonDialogClose =
  document.getElementById(
    "lesson-dialog-close"
  );

const lessonDialogStudent =
  document.getElementById(
    "lesson-dialog-student"
  );

const lessonList =
  document.getElementById(
    "lesson-list"
  );

const addLessonButton =
  document.getElementById(
    "add-lesson-button"
  );

const lessonTotalFlight =
  document.getElementById(
    "lesson-total-flight"
  );

const lessonTotalGround =
  document.getElementById(
    "lesson-total-ground"
  );

const lessonTotalSim =
  document.getElementById(
    "lesson-total-sim"
  );


/* EDITOR */

const lessonEditorDialog =
  document.getElementById(
    "lesson-editor-dialog"
  );

const lessonEditorTitle =
  document.getElementById(
    "lesson-editor-title"
  );

const lessonEditorClose =
  document.getElementById(
    "lesson-editor-close"
  );

const lessonEditorCancel =
  document.getElementById(
    "lesson-editor-cancel"
  );

const lessonForm =
  document.getElementById(
    "lesson-form"
  );

const lessonDate =
  document.getElementById(
    "lesson-date"
  );

const lessonType =
  document.getElementById(
    "lesson-type"
  );

const lessonTrainingGoal =
  document.getElementById(
    "lesson-training-goal"
  );

const lessonAircraft =
  document.getElementById(
    "lesson-aircraft"
  );

const lessonTailNumber =
  document.getElementById(
    "lesson-tail-number"
  );

const lessonFlightTime =
  document.getElementById(
    "lesson-flight-time"
  );

const lessonGroundTime =
  document.getElementById(
    "lesson-ground-time"
  );

const lessonSimTime =
  document.getElementById(
    "lesson-sim-time"
  );

const lessonRoute =
  document.getElementById(
    "lesson-route"
  );

const lessonTopics =
  document.getElementById(
    "lesson-topics"
  );

const lessonStudentNotes =
  document.getElementById(
    "lesson-student-notes"
  );

const lessonPrivateNotes =
  document.getElementById(
    "lesson-private-notes"
  );

const lessonAmount =
  document.getElementById(
    "lesson-amount"
  );

const lessonBillingStatus =
  document.getElementById(
    "lesson-billing-status"
  );

  const lessonPaymentMethodField =
  document.getElementById(
    "lesson-payment-method-field"
  );

const lessonPaymentMethod =
  document.getElementById(
    "lesson-payment-method"
  );

const lessonReceiptField =
  document.getElementById(
    "lesson-receipt-field"
  );

const lessonFormMessage =
  document.getElementById(
    "lesson-form-message"
  );

const saveLessonButton =
  document.getElementById(
    "save-lesson-button"
  );


let lessonRecords = [];

let editingLessonId =
  null;


/* ==========================================================
   PAYMENT FIELD VISIBILITY
========================================================== */

function updateLessonPaymentFields() {

  const isPaid =
    lessonBillingStatus.value ===
    "paid";


  lessonPaymentMethodField.hidden =
    !isPaid;

  lessonReceiptField.hidden =
    !isPaid;


  if (!isPaid) {

    lessonPaymentMethod.value =
      "Stripe";

    lessonReceiptNumber.value =
      "";

  }

}


lessonBillingStatus
  ?.addEventListener(
    "change",
    updateLessonPaymentFields
  );


/* ==========================================================
   OPEN LESSON HISTORY
========================================================== */

studentLessonsButton
  ?.addEventListener(
    "click",
    async () => {

      if (!selectedStudentId) {
        return;
      }


      const student =
        getStudentById(
          selectedStudentId
        );


      lessonDialogStudent.textContent =
        student?.full_name ||
        student?.email ||
        "Student";


      lessonDialog.showModal();


      await loadLessons(
  selectedStudentId
);
    }
  );


lessonDialogClose
  ?.addEventListener(
    "click",
    () => {

      lessonDialog.close();

    }
  );


/* ==========================================================
   LOAD LESSONS
========================================================== */

async function loadLessons(
  studentId
) {

  lessonList.innerHTML =
    `
      <div class="student-list-empty">
        Loading lessons…
      </div>
    `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("lessons")
      .select(`
        id,
        student_id,
        lesson_date,
        lesson_type,
        training_goal,
        aircraft,
        tail_number,
        flight_time,
        ground_time,
        sim_time,
        route,
        topics,
        student_notes,
        amount_charged,
payment_method,
payment_receipt_number,
billing_status,
        created_at,
        updated_at
      `)
      .eq(
        "student_id",
        studentId
      )
      .order(
        "lesson_date",
        {
          ascending: false
        }
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Could not load lessons:",
      error
    );


    lessonList.innerHTML =
      `
        <div class="student-list-empty">
          Could not load lesson history.
        </div>
      `;

    return;
  }


  lessonRecords =
    data || [];

    /*
  Load invoice references for these lessons.
*/

if (lessonRecords.length) {

  const lessonIds =
    lessonRecords.map(
      lesson => lesson.id
    );


  const {
    data: invoiceLinks,
    error: invoiceLinksError
  } =
    await supabaseClient
      .from("invoice_items")
      .select(`
        lesson_id,
        invoice_id,
        invoices (
          invoice_number,
          status
        )
      `)
      .in(
        "lesson_id",
        lessonIds
      );


  if (invoiceLinksError) {

    console.error(
      "Could not load lesson invoices:",
      invoiceLinksError
    );

  } else {

    const invoiceMap =
      new Map(
        (invoiceLinks || []).map(
          link => [
            link.lesson_id,
            {
              id:
                link.invoice_id,

              number:
                link.invoices
                  ?.invoice_number ||
                null,

              status:
                link.invoices
                  ?.status ||
                null
            }
          ]
        )
      );


    lessonRecords =
      lessonRecords.map(
        lesson => ({
          ...lesson,

          invoice:
            invoiceMap.get(
              lesson.id
            ) || null
        })
      );

  }

}

  /*
    Load private instructor notes separately.
  */

  if (lessonRecords.length) {

    const lessonIds =
      lessonRecords.map(
        lesson => lesson.id
      );


    const {
      data: privateNotes,
      error: notesError
    } =
      await supabaseClient
        .from(
          "lesson_private_notes"
        )
        .select(
          "lesson_id, notes"
        )
        .in(
          "lesson_id",
          lessonIds
        );


    if (notesError) {

      console.error(
        "Could not load private lesson notes:",
        notesError
      );

    } else {

      const noteMap =
        new Map(
          (privateNotes || []).map(
            note => [
              note.lesson_id,
              note.notes
            ]
          )
        );


      lessonRecords =
        lessonRecords.map(
          lesson => ({
            ...lesson,

            private_notes:
              noteMap.get(
                lesson.id
              ) || ""
          })
        );

    }

  }


  renderLessons();

  updateLessonTotals();

}


/* ==========================================================
   TOTALS
========================================================== */

function updateLessonTotals() {

  const totals =
    lessonRecords.reduce(
      (result, lesson) => {

        result.flight +=
          Number(
            lesson.flight_time || 0
          );

        result.ground +=
          Number(
            lesson.ground_time || 0
          );

        result.sim +=
          Number(
            lesson.sim_time || 0
          );

        return result;

      },
      {
        flight: 0,
        ground: 0,
        sim: 0
      }
    );


  lessonTotalFlight.textContent =
    totals.flight.toFixed(1);


  lessonTotalGround.textContent =
    totals.ground.toFixed(1);


  lessonTotalSim.textContent =
    totals.sim.toFixed(1);

}


/* ==========================================================
   RENDER LESSONS
========================================================== */

function renderLessons() {

  lessonList.innerHTML =
    "";


  if (!lessonRecords.length) {

    lessonList.innerHTML =
      `
        <div class="student-list-empty">
          No lessons recorded yet.
        </div>
      `;

    return;
  }


  lessonRecords.forEach(
    lesson => {

      const item =
        document.createElement(
          "article"
        );


      item.className =
        "lesson-item";


      const meta =
        [];


      meta.push(
        formatLessonDate(
          lesson.lesson_date
        )
      );


      meta.push(
        formatLessonType(
          lesson.lesson_type
        )
      );


      if (lesson.aircraft) {

        let aircraftText =
          lesson.aircraft;


        if (lesson.tail_number) {

          aircraftText +=
            ` • ${lesson.tail_number}`;

        }


        meta.push(
          aircraftText
        );

      } else if (
        lesson.tail_number
      ) {

        meta.push(
          lesson.tail_number
        );

      }


      if (
        Number(
          lesson.flight_time || 0
        ) > 0
      ) {

        meta.push(
          `${Number(
            lesson.flight_time
          ).toFixed(1)} flight`
        );

      }


      if (
        Number(
          lesson.ground_time || 0
        ) > 0
      ) {

        meta.push(
          `${Number(
            lesson.ground_time
          ).toFixed(1)} ground`
        );

      }


      if (
        Number(
          lesson.sim_time || 0
        ) > 0
      ) {

        meta.push(
          `${Number(
            lesson.sim_time
          ).toFixed(1)} sim`
        );

      }


      if (lesson.route) {

        meta.push(
          lesson.route
        );

      }


      const billing =
        getLessonBillingStatus(
          lesson.billing_status
        );


      item.innerHTML =
        `
          <div class="lesson-main">

            <div class="lesson-heading">

              <strong>
                ${escapeHtml(
                  formatLessonDate(
                    lesson.lesson_date
                  )
                )}
                —
                ${escapeHtml(
                  formatLessonType(
                    lesson.lesson_type
                  )
                )}
              </strong>

              ${
                lesson.training_goal
                  ? `
                      <span class="lesson-goal">
                        ${escapeHtml(
                          lesson.training_goal
                        )}
                      </span>
                    `
                  : ""
              }

            </div>


            <div class="lesson-meta">

              ${meta
                .slice(2)
                .map(
                  value =>
                    escapeHtml(value)
                )
                .join(" • ")}

            </div>


            ${
              lesson.topics
                ? `
                    <p class="lesson-topics">
                      <strong>Covered:</strong>
                      ${escapeHtml(
                        lesson.topics
                      )}
                    </p>
                  `
                : ""
            }


            ${
              lesson.student_notes
                ? `
                    <p class="lesson-student-note">
                      <strong>Student note:</strong>
                      ${escapeHtml(
                        lesson.student_notes
                      )}
                    </p>
                  `
                : ""
            }


            ${
              lesson.private_notes
                ? `
                    <p class="lesson-private-note">
                      <strong>Private:</strong>
                      ${escapeHtml(
                        lesson.private_notes
                      )}
                    </p>
                  `
                : ""
            }

          </div>


          <div class="lesson-side">

            <span
              class="lesson-billing ${billing.className}"
            >
              ${escapeHtml(
                billing.label
              )}
            </span>


            ${
              lesson.amount_charged !== null
                ? `
                    <span class="lesson-meta">
                      $${Number(
                        lesson.amount_charged
                      ).toFixed(2)}
                    </span>
                  `
                : ""
            }

            ${
  lesson.invoice?.number
    ? `
        <button
          type="button"
          class="lesson-invoice-button"
          data-invoice-id="${lesson.invoice.id}"
        >
          Invoice:
          ${escapeHtml(
            lesson.invoice.number
          )}
        </button>
      `
    : ""
}

           

            ${
  lesson.payment_receipt_number
    ? `
        <span class="lesson-meta">
          Receipt:
          ${escapeHtml(
            lesson.payment_receipt_number
          )}
        </span>
      `
    : ""
}


            <div class="lesson-actions">
            <button
  type="button"
  class="lesson-action-button lesson-pdf-button"
>
  Lesson PDF
</button>
${
  lesson.invoice?.id
    ? `
        <button
          type="button"
          class="lesson-action-button lesson-send-pdfs-button"
        >
          Send PDFs
        </button>
      `
    : ""
}
              <button
                type="button"
                class="lesson-action-button lesson-edit-button"
              >
                Edit
              </button>


              <button
                type="button"
                class="lesson-action-button is-delete lesson-delete-button"
              >
                Delete
              </button>

            </div>

          </div>
        `;


      item
        .querySelector(
          ".lesson-edit-button"
        )
        .addEventListener(
          "click",
          () => {

            openEditLesson(
              lesson
            );

          }
        );


      item
        .querySelector(
          ".lesson-delete-button"
        )
        .addEventListener(
          "click",
          () => {

            deleteLesson(
              lesson
            );

          }
        );

        item
  .querySelector(
    ".lesson-invoice-button"
  )
  ?.addEventListener(
    "click",
    async () => {

      lessonDialog.close();

      await openBilling(
        lesson.student_id,
        lesson.invoice.id
      );

    }
  );

  item
  .querySelector(
    ".lesson-pdf-button"
  )
  ?.addEventListener(
    "click",
    () => {

      generateLessonPdf(
        lesson
      );

    }
  );
  item
  .querySelector(
    ".lesson-send-pdfs-button"
  )
  ?.addEventListener(
    "click",
    async event => {

      await sendLessonPdfs(
        lesson,
        event.currentTarget
      );

    }
  );
      lessonList.appendChild(
        item
      );

    }
  );

}


/* ==========================================================
   ADD LESSON
========================================================== */

addLessonButton
  ?.addEventListener(
    "click",
    () => {

      if (!selectedStudentId) {
        return;
      }


      editingLessonId =
        null;


      lessonForm.reset();


      lessonEditorTitle.textContent =
        "Add lesson";


      saveLessonButton.textContent =
        "Save lesson";


      lessonDate.value =
        getTodayInputValue();


      lessonType.value =
        "flight";


      lessonBillingStatus.value =
  "unpaid";


lessonPaymentMethod.value =
  "Stripe";


updateLessonPaymentFields();


      /*
        Pre-fill training toward from
        the student's current program.
      */

      const student =
        getStudentById(
          selectedStudentId
        );


      lessonTrainingGoal.value =
        student?.training_program ||
        "";


      lessonFormMessage.textContent =
        "";


      lessonFormMessage.classList.remove(
        "is-success",
        "is-error"
      );


      lessonEditorDialog.showModal();

    }
  );


/* ==========================================================
   EDIT LESSON
========================================================== */

function openEditLesson(
  lesson
) {

  editingLessonId =
    lesson.id;


  lessonForm.reset();


  lessonEditorTitle.textContent =
    "Edit lesson";


  saveLessonButton.textContent =
    "Save changes";


  lessonDate.value =
    lesson.lesson_date ||
    "";


  lessonType.value =
    lesson.lesson_type ||
    "flight";


  lessonTrainingGoal.value =
    lesson.training_goal ||
    "";


  lessonAircraft.value =
    lesson.aircraft ||
    "";


  lessonTailNumber.value =
    lesson.tail_number ||
    "";


  lessonFlightTime.value =
    lesson.flight_time ??
    "";


  lessonGroundTime.value =
    lesson.ground_time ??
    "";


  lessonSimTime.value =
    lesson.sim_time ??
    "";


  lessonRoute.value =
    lesson.route ||
    "";


  lessonTopics.value =
    lesson.topics ||
    "";


  lessonStudentNotes.value =
    lesson.student_notes ||
    "";


  lessonPrivateNotes.value =
    lesson.private_notes ||
    "";


  lessonAmount.value =
    lesson.amount_charged ??
    "";

    lessonBillingStatus.value =
  lesson.billing_status ||
  "unpaid";


lessonPaymentMethod.value =
  lesson.payment_method ||
  "Stripe";


lessonReceiptNumber.value =
  lesson.payment_receipt_number ||
  "";


updateLessonPaymentFields();


  lessonFormMessage.textContent =
    "";


  lessonFormMessage.classList.remove(
    "is-success",
    "is-error"
  );


  lessonEditorDialog.showModal();

}



/* ==========================================================
   SAVE LESSON
========================================================== */

lessonForm
  ?.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (
        !lessonForm.reportValidity()
      ) {

        return;

      }


      if (!selectedStudentId) {
        return;
      }


      saveLessonButton.disabled =
        true;


      saveLessonButton.textContent =
        "Saving…";


      lessonFormMessage.textContent =
        "";


      lessonFormMessage.classList.remove(
        "is-success",
        "is-error"
      );


      const lessonRecord =
        {

          student_id:
            selectedStudentId,

          lesson_date:
            lessonDate.value,

          lesson_type:
            lessonType.value,

          training_goal:
            lessonTrainingGoal
              .value
              .trim() ||
            null,

          aircraft:
            lessonAircraft
              .value
              .trim() ||
            null,

          tail_number:
            lessonTailNumber
              .value
              .trim()
              .toUpperCase() ||
            null,

          flight_time:
            parseOptionalNumber(
              lessonFlightTime.value
            ),

          ground_time:
            parseOptionalNumber(
              lessonGroundTime.value
            ),

          sim_time:
            parseOptionalNumber(
              lessonSimTime.value
            ),

          route:
            lessonRoute
              .value
              .trim() ||
            null,

          topics:
            lessonTopics
              .value
              .trim() ||
            null,

          student_notes:
            lessonStudentNotes
              .value
              .trim() ||
            null,

          amount_charged:
  parseOptionalNumber(
    lessonAmount.value
  ),


billing_status:
  lessonBillingStatus.value,


payment_method:
  lessonBillingStatus.value ===
  "paid"
    ? lessonPaymentMethod.value
    : null,


payment_receipt_number:
  lessonBillingStatus.value ===
  "paid"
    ? (
        lessonReceiptNumber
          .value
          .trim() ||
        null
      )
    : null,

          updated_at:
            new Date().toISOString()

        };


      let lessonResult;


      if (editingLessonId) {

        lessonResult =
          await supabaseClient
            .from("lessons")
            .update(
              lessonRecord
            )
            .eq(
              "id",
              editingLessonId
            )
            .select()
            .single();

      } else {

        lessonResult =
          await supabaseClient
            .from("lessons")
            .insert(
              lessonRecord
            )
            .select()
            .single();

      }


      if (lessonResult.error) {

        console.error(
          "Lesson save error:",
          lessonResult.error
        );


        lessonFormMessage.textContent =
          "Could not save lesson.";


        lessonFormMessage.classList.add(
          "is-error"
        );


        saveLessonButton.disabled =
          false;


        saveLessonButton.textContent =
          editingLessonId
            ? "Save changes"
            : "Save lesson";


        return;

      }


      const savedLessonId =
        lessonResult.data.id;


      /*
        Save private notes separately.
      */

      const {
        error: privateNoteError
      } =
        await supabaseClient
          .from(
            "lesson_private_notes"
          )
          .upsert(
            {
              lesson_id:
                savedLessonId,

              notes:
                lessonPrivateNotes
                  .value
                  .trim() ||
                null,

              updated_at:
                new Date()
                  .toISOString()
            },
            {
              onConflict:
                "lesson_id"
            }
          );


      if (privateNoteError) {

        console.error(
          "Private lesson note save error:",
          privateNoteError
        );


        lessonFormMessage.textContent =
          "Lesson saved, but private notes could not be saved.";


        lessonFormMessage.classList.add(
          "is-error"
        );


        saveLessonButton.disabled =
          false;


        saveLessonButton.textContent =
          "Save changes";


        return;

      }


      editingLessonId =
        null;


      lessonEditorDialog.close();


      await loadLessons(
  selectedStudentId
);

await loadAdminBillingSummary();


      saveLessonButton.disabled =
        false;


      saveLessonButton.textContent =
        "Save lesson";

    }
  );


/* ==========================================================
   DELETE LESSON
========================================================== */

async function deleteLesson(
  lesson
) {

  const confirmed =
    window.confirm(
      `Delete the ${formatLessonDate(
        lesson.lesson_date
      )} lesson?\n\nThis cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("lessons")
      .delete()
      .eq(
        "id",
        lesson.id
      );


  if (error) {

    console.error(
      "Lesson delete error:",
      error
    );


    alert(
      "Could not delete lesson."
    );


    return;

  }


  await loadLessons(
    selectedStudentId
  );

}


/* ==========================================================
   CLOSE EDITOR
========================================================== */

lessonEditorClose
  ?.addEventListener(
    "click",
    () => {

      lessonEditorDialog.close();

    }
  );


lessonEditorCancel
  ?.addEventListener(
    "click",
    () => {

      lessonEditorDialog.close();

    }
  );


/* ==========================================================
   LESSON HELPERS
========================================================== */

function parseOptionalNumber(
  value
) {

  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {

    return null;

  }


  const number =
    Number(value);


  return Number.isFinite(number)
    ? number
    : null;

}


function formatLessonDate(
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


function formatLessonType(
  value
) {

  const labels =
    {
      flight: "Flight",
      ground: "Ground",
      sim: "Simulator",
      safety_pilot: "Safety Pilot",
      other: "Other"
    };


  return labels[value] ||
    "Lesson";

}

function generateLessonPdf(
  lesson,
  shouldSave = true
) {

  if (!window.jspdf?.jsPDF) {

    alert(
      "PDF generator could not be loaded."
    );

    return null;
  }


  const {
    jsPDF
  } =
    window.jspdf;


  const doc =
    new jsPDF({
      unit: "pt",
      format: "letter"
    });


  const student =
    getStudentById(
      lesson.student_id
    );


  const studentName =
    student?.full_name ||
    student?.email ||
    "Student";


  const left =
    52;

  const right =
    doc.internal.pageSize.getWidth() -
    52;


  let y =
    62;


  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    20
  );

  doc.text(
    "Fly With Angus",
    left,
    y
  );


  doc.setFontSize(
    26
  );

  doc.text(
    "LESSON RECORD",
    right,
    y,
    {
      align: "right"
    }
  );


  y += 34;


  doc.setDrawColor(
    220
  );

  doc.line(
    left,
    y,
    right,
    y
  );


  y += 28;


  doc.setFontSize(
    9
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    "STUDENT",
    left,
    y
  );


  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    studentName,
    left + 80,
    y
  );


  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    "DATE",
    365,
    y
  );


  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    formatLessonDate(
      lesson.lesson_date
    ),
    right,
    y,
    {
      align: "right"
    }
  );


  y += 24;


  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    "LESSON TYPE",
    left,
    y
  );


  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    formatLessonType(
      lesson.lesson_type
    ),
    left + 80,
    y
  );


  if (
    lesson.training_goal
  ) {

    y += 34;

    addLessonPdfSection(
      doc,
      "TRAINING GOAL",
      lesson.training_goal,
      left,
      right,
      y
    );

    y +=
      getLessonPdfHeight(
        doc,
        lesson.training_goal,
        right - left
      );

  }


  const aircraftParts =
    [
      lesson.aircraft,
      lesson.tail_number
    ].filter(Boolean);


  if (
    aircraftParts.length
  ) {

    y += 25;

    addLessonPdfSection(
      doc,
      "AIRCRAFT",
      aircraftParts.join(
        " • "
      ),
      left,
      right,
      y
    );

    y += 30;
  }


  const timeParts =
    [];


  if (
    lesson.flight_time !== null
  ) {
    timeParts.push(
      `Flight: ${lesson.flight_time} hr`
    );
  }


  if (
    lesson.ground_time !== null
  ) {
    timeParts.push(
      `Ground: ${lesson.ground_time} hr`
    );
  }


  if (
    lesson.sim_time !== null
  ) {
    timeParts.push(
      `Simulator: ${lesson.sim_time} hr`
    );
  }


  if (
    timeParts.length
  ) {

    y += 10;

    addLessonPdfSection(
      doc,
      "TIME",
      timeParts.join(
        " • "
      ),
      left,
      right,
      y
    );

    y += 30;
  }


  if (
    lesson.route
  ) {

    y += 10;

    addLessonPdfSection(
      doc,
      "ROUTE",
      lesson.route,
      left,
      right,
      y
    );

    y +=
      getLessonPdfHeight(
        doc,
        lesson.route,
        right - left
      );

  }


  if (
    lesson.topics
  ) {

    y += 25;

    addLessonPdfSection(
      doc,
      "TOPICS / TRAINING COMPLETED",
      lesson.topics,
      left,
      right,
      y
    );

    y +=
      getLessonPdfHeight(
        doc,
        lesson.topics,
        right - left
      );

  }


  if (
    lesson.student_notes
  ) {

    y += 25;

    addLessonPdfSection(
      doc,
      "STUDENT NOTES",
      lesson.student_notes,
      left,
      right,
      y
    );

  }


  doc.setFontSize(
    8
  );

  doc.setTextColor(
    110
  );

  doc.text(
    "Fly With Angus • flywithangus.com",
    left,
    750
  );


  if (
    shouldSave
  ) {

    doc.save(
      `Lesson-${lesson.lesson_date}.pdf`
    );

  }


  return doc;
}


function addLessonPdfSection(
  doc,
  title,
  text,
  left,
  right,
  y
) {

  doc.setTextColor(
    0
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    9
  );

  doc.text(
    title,
    left,
    y
  );


  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    10
  );


  const lines =
    doc.splitTextToSize(
      String(text),
      right - left
    );


  doc.text(
    lines,
    left,
    y + 17
  );

}


function getLessonPdfHeight(
  doc,
  text,
  width
) {

  return (
    doc.splitTextToSize(
      String(text),
      width
    ).length *
    13 +
    20
  );

}


function getLessonBillingStatus(
  value
) {

  switch (value) {

    case "paid":

      return {
        label: "Paid",
        className: "is-paid"
      };


    case "waived":

      return {
        label: "Waived",
        className: ""
      };


    default:

      return {
        label: "Unpaid",
        className: "is-unpaid"
      };

  }

}

/* ==========================================================
   RECENT ACTIVITY
========================================================== */

const recentActivityTitle =
  document.getElementById(
    "recent-activity-title"
  );

const recentActivityDetail =
  document.getElementById(
    "recent-activity-detail"
  );


async function loadRecentActivity() {

  const [
    lessonResult,
    endorsementResult
  ] =
    await Promise.all([

      supabaseClient
        .from("lessons")
        .select(`
          id,
          student_id,
          lesson_date,
          lesson_type,
          training_goal,
          flight_time,
          ground_time,
          sim_time,
          created_at,
          profiles (
            full_name
          )
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(1)
        .maybeSingle(),


      supabaseClient
        .from("endorsements")
        .select(`
          id,
          student_id,
          endorsement_type,
          date_given,
          created_at,
          profiles (
            full_name
          )
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(1)
        .maybeSingle()

    ]);


  if (
    lessonResult.error
  ) {

    console.error(
      "Recent lesson activity error:",
      lessonResult.error
    );

  }


  if (
    endorsementResult.error
  ) {

    console.error(
      "Recent endorsement activity error:",
      endorsementResult.error
    );

  }


  const activities =
    [];


  if (lessonResult.data) {

    activities.push({
      type: "lesson",
      created_at:
        lessonResult.data.created_at,
      data:
        lessonResult.data
    });

  }


  if (endorsementResult.data) {

    activities.push({
      type: "endorsement",
      created_at:
        endorsementResult.data.created_at,
      data:
        endorsementResult.data
    });

  }


  if (!activities.length) {

    recentActivityTitle.textContent =
      "—";

    recentActivityDetail.textContent =
      "No activity yet";

    return;

  }


  activities.sort(
    (a, b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
  );


  const latest =
    activities[0];


  if (
    latest.type === "lesson"
  ) {

    renderRecentLessonActivity(
      latest.data
    );

    return;

  }


  renderRecentEndorsementActivity(
    latest.data
  );

}


/* ==========================================================
   RECENT LESSON
========================================================== */

function renderRecentLessonActivity(
  lesson
) {

  recentActivityTitle.textContent =
    "Lesson logged";


  const details =
    [];


  if (
    lesson.lesson_date
  ) {

    details.push(
      formatRecentActivityDate(
        lesson.lesson_date
      )
    );

  }


  const studentName =
    lesson.profiles?.full_name;


  if (studentName) {

    details.push(
      studentName
    );

  }


  const totalTime =
    Number(
      lesson.flight_time || 0
    ) +
    Number(
      lesson.ground_time || 0
    ) +
    Number(
      lesson.sim_time || 0
    );


  if (totalTime > 0) {

    details.push(
      `${totalTime.toFixed(1)} hr`
    );

  }


  recentActivityDetail.textContent =
    details.join(" • ");

}


/* ==========================================================
   RECENT ENDORSEMENT
========================================================== */

function renderRecentEndorsementActivity(
  endorsement
) {

  recentActivityTitle.textContent =
    "Endorsement issued";


  const details =
    [];


  if (
    endorsement.date_given
  ) {

    details.push(
      formatRecentActivityDate(
        endorsement.date_given
      )
    );

  }


  const studentName =
    endorsement.profiles?.full_name;


  if (studentName) {

    details.push(
      studentName
    );

  }


  if (
    endorsement.endorsement_type
  ) {

    details.push(
      endorsement.endorsement_type
    );

  }


  recentActivityDetail.textContent =
    details.join(" • ");

}


/* ==========================================================
   RECENT ACTIVITY HELPERS
========================================================== */

function formatRecentActivityDate(
  date
) {

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric"
    }
  );

}

/* ==========================================================
   DOCUMENTS
========================================================== */

const DOCUMENT_BUCKET =
  "student-documents";


const studentDocumentsButton =
  document.getElementById(
    "student-documents-button"
  );

const documentsDialog =
  document.getElementById(
    "documents-dialog"
  );

const documentsDialogClose =
  document.getElementById(
    "documents-dialog-close"
  );

const documentsStudentName =
  document.getElementById(
    "documents-student-name"
  );

const studentDocumentDropzone =
  document.getElementById(
    "student-document-dropzone"
  );

const studentDocumentInput =
  document.getElementById(
    "student-document-input"
  );

const studentDocumentList =
  document.getElementById(
    "student-document-list"
  );

const resourceDocumentDropzone =
  document.getElementById(
    "resource-document-dropzone"
  );

const resourceDocumentInput =
  document.getElementById(
    "resource-document-input"
  );

const resourceDocumentList =
  document.getElementById(
    "resource-document-list"
  );

const documentMessage =
  document.getElementById(
    "document-message"
  );


let studentDocumentRecords = [];
let resourceDocumentRecords = [];


/* ==========================================================
   OPEN DOCUMENTS
========================================================== */

studentDocumentsButton
  ?.addEventListener(
    "click",
    async () => {

      if (!selectedStudentId) {
        return;
      }


      const student =
        getStudentById(
          selectedStudentId
        );


      documentsStudentName.textContent =
        student?.full_name ||
        student?.email ||
        "Student";


      clearDocumentMessage();


      documentsDialog.showModal();


      await loadDocuments();

    }
  );


documentsDialogClose
  ?.addEventListener(
    "click",
    () => {

      documentsDialog.close();

    }
  );


/* ==========================================================
   LOAD DOCUMENTS
========================================================== */

async function loadDocuments() {

  if (!selectedStudentId) {
    return;
  }


  studentDocumentList.innerHTML =
    `
      <div class="student-list-empty">
        Loading documents…
      </div>
    `;


  resourceDocumentList.innerHTML =
    `
      <div class="student-list-empty">
        Loading resources…
      </div>
    `;


  const [
    studentResult,
    resourceResult
  ] =
    await Promise.all([

      supabaseClient
        .from("documents")
        .select(`
          id,
          student_id,
          document_type,
          title,
          file_name,
          storage_path,
          mime_type,
          file_size,
          created_at
        `)
        .eq(
          "document_type",
          "student_document"
        )
        .eq(
          "student_id",
          selectedStudentId
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        ),


      supabaseClient
        .from("documents")
        .select(`
          id,
          student_id,
          document_type,
          title,
          file_name,
          storage_path,
          mime_type,
          file_size,
          created_at
        `)
        .eq(
          "document_type",
          "student_resource"
        )
        .is(
          "student_id",
          null
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )

    ]);


  if (studentResult.error) {

    console.error(
      "Student documents load error:",
      studentResult.error
    );


    studentDocumentList.innerHTML =
      `
        <div class="student-list-empty">
          Could not load documents.
        </div>
      `;

  } else {

    studentDocumentRecords =
      studentResult.data || [];


    renderDocumentList(
      studentDocumentRecords,
      studentDocumentList
    );

  }


  if (resourceResult.error) {

    console.error(
      "Resource documents load error:",
      resourceResult.error
    );


    resourceDocumentList.innerHTML =
      `
        <div class="student-list-empty">
          Could not load resources.
        </div>
      `;

  } else {

    resourceDocumentRecords =
      resourceResult.data || [];


    renderDocumentList(
      resourceDocumentRecords,
      resourceDocumentList
    );

  }

}


/* ==========================================================
   DROPZONES
========================================================== */

setupDocumentDropzone(
  studentDocumentDropzone,
  studentDocumentInput,
  "student_document"
);


setupDocumentDropzone(
  resourceDocumentDropzone,
  resourceDocumentInput,
  "student_resource"
);


function setupDocumentDropzone(
  dropzone,
  input,
  documentType
) {

  if (
    !dropzone ||
    !input
  ) {

    return;

  }


  dropzone.addEventListener(
    "click",
    () => {

      input.click();

    }
  );


  dropzone.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        input.click();

      }

    }
  );


  input.addEventListener(
    "change",
    async () => {

      const files =
        Array.from(
          input.files || []
        );


      input.value =
        "";


      if (files.length) {

        await uploadDocuments(
          files,
          documentType
        );

      }

    }
  );


  [
    "dragenter",
    "dragover"
  ].forEach(
    eventName => {

      dropzone.addEventListener(
        eventName,
        event => {

          event.preventDefault();
          event.stopPropagation();


          dropzone.classList.add(
            "is-dragging"
          );

        }
      );

    }
  );


  [
    "dragleave",
    "drop"
  ].forEach(
    eventName => {

      dropzone.addEventListener(
        eventName,
        event => {

          event.preventDefault();
          event.stopPropagation();


          dropzone.classList.remove(
            "is-dragging"
          );

        }
      );

    }
  );


  dropzone.addEventListener(
    "drop",
    async event => {

      const files =
        Array.from(
          event.dataTransfer?.files ||
          []
        );


      if (files.length) {

        await uploadDocuments(
          files,
          documentType
        );

      }

    }
  );

}


/* ==========================================================
   UPLOAD
========================================================== */

async function uploadDocuments(
  files,
  documentType
) {

  if (!selectedStudentId) {
    return;
  }


  clearDocumentMessage();


  const destinationLabel =
    documentType ===
      "student_resource"
      ? "resource"
      : "document";


  for (let index = 0;
       index < files.length;
       index++) {

    const file =
      files[index];


    documentMessage.textContent =
      `Uploading ${index + 1} of ${files.length}: ${file.name}`;


    const safeName =
      sanitizeDocumentFileName(
        file.name
      );


    const uniqueId =
      crypto.randomUUID();


    const storagePath =
      documentType ===
        "student_resource"

        ? `resources/${uniqueId}-${safeName}`

        : `students/${selectedStudentId}/${uniqueId}-${safeName}`;


    const uploadOptions =
      {
        cacheControl:
          "3600",

        upsert:
          false
      };


    if (file.type) {

      uploadOptions.contentType =
        file.type;

    }


    const {
      error: uploadError
    } =
      await supabaseClient
        .storage
        .from(
          DOCUMENT_BUCKET
        )
        .upload(
          storagePath,
          file,
          uploadOptions
        );


    if (uploadError) {

      console.error(
        "Document upload error:",
        uploadError
      );


      setDocumentError(
        `Could not upload ${file.name}.`
      );


      continue;
    }


    const metadata =
      {

        student_id:
          documentType ===
            "student_document"
            ? selectedStudentId
            : null,

        document_type:
          documentType,

        title:
          file.name,

        file_name:
          file.name,

        storage_path:
          storagePath,

        mime_type:
          file.type ||
          null,

        file_size:
          file.size

      };


    const {
      error: metadataError
    } =
      await supabaseClient
        .from("documents")
        .insert(
          metadata
        );


    if (metadataError) {

      console.error(
        "Document metadata error:",
        metadataError
      );


      /*
        Roll back the uploaded object so
        Storage and the documents table
        don't get out of sync.
      */

      await supabaseClient
        .storage
        .from(
          DOCUMENT_BUCKET
        )
        .remove([
          storagePath
        ]);


      setDocumentError(
        `Could not record ${file.name}.`
      );


      continue;
    }

  }


  if (
    !documentMessage.classList
      .contains("is-error")
  ) {

    documentMessage.textContent =
      files.length === 1
        ? `${destinationLabel} uploaded.`
        : `${files.length} files uploaded.`;


    documentMessage.classList.add(
      "is-success"
    );

  }


  await loadDocuments();

}


/* ==========================================================
   RENDER
========================================================== */

function renderDocumentList(
  records,
  container
) {

  container.innerHTML =
    "";


  if (!records.length) {

    container.innerHTML =
      `
        <div class="student-list-empty">
          No files uploaded yet.
        </div>
      `;


    return;
  }


  records.forEach(
    record => {

      const item =
        document.createElement(
          "article"
        );


      item.className =
        "document-item";


      item.innerHTML =
        `
          <div class="document-item-icon">
            ${getDocumentIcon(
              record.mime_type
            )}
          </div>


          <div class="document-item-main">

            <strong>
              ${escapeHtml(
                record.title ||
                record.file_name
              )}
            </strong>

            <span>
              ${escapeHtml(
                formatDocumentMeta(
                  record
                )
              )}
            </span>

          </div>


          <div class="document-item-actions">

            <button
              type="button"
              class="document-action-button document-open-button"
            >
              Open
            </button>


            <button
              type="button"
              class="document-action-button document-download-button"
            >
              Download
            </button>


            <button
              type="button"
              class="document-action-button is-delete document-delete-button"
            >
              Delete
            </button>

          </div>
        `;


      item
        .querySelector(
          ".document-open-button"
        )
        .addEventListener(
          "click",
          () => {

            openDocument(
              record
            );

          }
        );


      item
        .querySelector(
          ".document-download-button"
        )
        .addEventListener(
          "click",
          () => {

            downloadDocument(
              record
            );

          }
        );


      item
        .querySelector(
          ".document-delete-button"
        )
        .addEventListener(
          "click",
          () => {

            deleteDocument(
              record
            );

          }
        );


      container.appendChild(
        item
      );

    }
  );

}


/* ==========================================================
   OPEN
========================================================== */

async function openDocument(
  record
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .storage
      .from(
        DOCUMENT_BUCKET
      )
      .createSignedUrl(
        record.storage_path,
        300
      );


  if (
    error ||
    !data?.signedUrl
  ) {

    console.error(
      "Document open error:",
      error
    );


    setDocumentError(
      "Could not open the document."
    );


    return;
  }


  const link =
    document.createElement(
      "a"
    );


  link.href =
    data.signedUrl;


  link.target =
    "_blank";


  link.rel =
    "noopener noreferrer";


  link.click();

}


/* ==========================================================
   DOWNLOAD
========================================================== */

async function downloadDocument(
  record
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .storage
      .from(
        DOCUMENT_BUCKET
      )
      .download(
        record.storage_path
      );


  if (
    error ||
    !data
  ) {

    console.error(
      "Document download error:",
      error
    );


    setDocumentError(
      "Could not download the document."
    );


    return;
  }


  const url =
    URL.createObjectURL(
      data
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    record.file_name ||
    "document";


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );

}


/* ==========================================================
   DELETE
========================================================== */

async function deleteDocument(
  record
) {

  const confirmed =
    window.confirm(
      `Delete "${record.file_name}"?\n\nThis cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  clearDocumentMessage();


  const {
    error: storageError
  } =
    await supabaseClient
      .storage
      .from(
        DOCUMENT_BUCKET
      )
      .remove([
        record.storage_path
      ]);


  if (storageError) {

    console.error(
      "Document Storage delete error:",
      storageError
    );


    setDocumentError(
      "Could not delete the file."
    );


    return;
  }


  const {
    error: databaseError
  } =
    await supabaseClient
      .from("documents")
      .delete()
      .eq(
        "id",
        record.id
      );


  if (databaseError) {

    console.error(
      "Document database delete error:",
      databaseError
    );


    setDocumentError(
      "File removed from Storage, but the document record could not be deleted."
    );


    return;
  }


  documentMessage.textContent =
    "Document deleted.";


  documentMessage.classList.add(
    "is-success"
  );


  await loadDocuments();

}


/* ==========================================================
   HELPERS
========================================================== */

function sanitizeDocumentFileName(
  fileName
) {

  return fileName
    .normalize("NFKD")
    .replace(
      /[^\w.\-]+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^[-.]+|[-.]+$/g,
      ""
    ) ||
    "document";

}


function formatDocumentMeta(
  record
) {

  const values =
    [];


  if (record.file_size !== null) {

    values.push(
      formatDocumentSize(
        Number(
          record.file_size
        )
      )
    );

  }


  if (record.created_at) {

    values.push(
      new Date(
        record.created_at
      ).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      )
    );

  }


  return values.join(
    " • "
  );

}


function formatDocumentSize(
  bytes
) {

  if (!Number.isFinite(bytes)) {
    return "";
  }


  if (bytes < 1024) {

    return `${bytes} B`;

  }


  if (
    bytes <
    1024 * 1024
  ) {

    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;

  }


  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;

}


function getDocumentIcon(
  mimeType
) {

  if (
    mimeType ===
    "application/pdf"
  ) {

    return "PDF";

  }


  if (
    mimeType?.startsWith(
      "image/"
    )
  ) {

    return "IMG";

  }


  return "DOC";

}


function clearDocumentMessage() {

  documentMessage.textContent =
    "";


  documentMessage.classList.remove(
    "is-success",
    "is-error"
  );

}


function setDocumentError(
  message
) {

  documentMessage.textContent =
    message;


  documentMessage.classList.remove(
    "is-success"
  );


  documentMessage.classList.add(
    "is-error"
  );

}

/* ==========================================================
   ACS PROGRESS
========================================================== */

const ACS_PROGRAM_CODE =
  "PPL_ASEL";


const studentAcsButton =
  document.getElementById(
    "student-acs-button"
  );

const acsDialog =
  document.getElementById(
    "acs-dialog"
  );

const acsDialogClose =
  document.getElementById(
    "acs-dialog-close"
  );

const acsStudentName =
  document.getElementById(
    "acs-student-name"
  );

const acsAreaList =
  document.getElementById(
    "acs-area-list"
  );

const acsOverallPercent =
  document.getElementById(
    "acs-overall-percent"
  );

const acsOverallDetail =
  document.getElementById(
    "acs-overall-detail"
  );

const acsProgressFill =
  document.getElementById(
    "acs-progress-fill"
  );

const acsMessage =
  document.getElementById(
    "acs-message"
  );


let currentAcsProgram =
  null;

let currentAcsTasks =
  [];

let currentAcsProgress =
  new Map();


/* ==========================================================
   OPEN / CLOSE
========================================================== */

studentAcsButton
  ?.addEventListener(
    "click",
    async () => {

      if (!selectedStudentId) {
        return;
      }


      const student =
        getStudentById(
          selectedStudentId
        );


      acsStudentName.textContent =
        student?.full_name ||
        student?.email ||
        "Student";


      clearAcsMessage();


      acsDialog.showModal();


      await loadAcsProgress();

    }
  );


acsDialogClose
  ?.addEventListener(
    "click",
    () => {

      acsDialog.close();

    }
  );


/* ==========================================================
   LOAD ACS
========================================================== */

async function loadAcsProgress() {

  if (!selectedStudentId) {
    return;
  }


  const student =
    getStudentById(
      selectedStudentId
    );


  if (!student?.acs_program_id) {

    currentAcsProgram =
      null;

    currentAcsTasks =
      [];

    currentAcsProgress =
      new Map();


    acsAreaList.innerHTML =
      `
        <div class="student-list-empty">
          No ACS course has been assigned to this student.
        </div>
      `;


    acsOverallPercent.textContent =
      "—";


    acsOverallDetail.textContent =
      "Select an ACS course in the student's profile.";


    acsProgressFill.style.width =
      "0%";


    return;
  }


  acsAreaList.innerHTML =
    `
      <div class="student-list-empty">
        Loading ACS…
      </div>
    `;


  const {
    data: program,
    error: programError
  } =
    await supabaseClient
      .from("acs_programs")
      .select(`
        id,
        code,
        name,
        version
      `)
      .eq(
        "id",
        student.acs_program_id
      )
      .single();


  if (
    programError ||
    !program
  ) {

    console.error(
      "ACS program load error:",
      programError
    );


    acsAreaList.innerHTML =
      `
        <div class="student-list-empty">
          Could not load ACS program.
        </div>
      `;


    return;
  }


  currentAcsProgram =
    program;


  const [
    taskResult,
    progressResult
  ] =
    await Promise.all([

      supabaseClient
        .from("acs_tasks")
        .select(`
          id,
          program_id,
          area_code,
          area_name,
          task_code,
          task_name,
          area_sort,
          task_sort
        `)
        .eq(
          "program_id",
          program.id
        )
        .order(
          "area_sort",
          {
            ascending: true
          }
        )
        .order(
          "task_sort",
          {
            ascending: true
          }
        ),


      supabaseClient
        .from("student_acs_progress")
        .select(`
          id,
          student_id,
          task_id,
          status,
          last_assessed,
          updated_at
        `)
        .eq(
          "student_id",
          selectedStudentId
        )

    ]);


  if (
    taskResult.error ||
    progressResult.error
  ) {

    console.error(
      "ACS load error:",
      taskResult.error ||
      progressResult.error
    );


    acsAreaList.innerHTML =
      `
        <div class="student-list-empty">
          Could not load ACS progress.
        </div>
      `;


    return;
  }


  currentAcsTasks =
    taskResult.data || [];


  currentAcsProgress =
    new Map(
      (progressResult.data || [])
        .map(
          progress => [
            progress.task_id,
            progress
          ]
        )
    );


  renderAcsProgress();

}


/* ==========================================================
   RENDER
========================================================== */

function renderAcsProgress(
  openAreaCodes = null
) {

  acsAreaList.innerHTML =
    "";


  if (!currentAcsTasks.length) {

    acsAreaList.innerHTML =
      `
        <div class="student-list-empty">
          No ACS tasks found.
        </div>
      `;


    updateAcsSummary();

    return;

  }


  const areas =
    new Map();


  currentAcsTasks.forEach(
    task => {

      const key =
        task.area_code;


      if (!areas.has(key)) {

        areas.set(
          key,
          {
            area_code:
              task.area_code,

            area_name:
              task.area_name,

            tasks:
              []
          }
        );

      }


      areas
        .get(key)
        .tasks
        .push(task);

    }
  );


  let firstArea =
    true;


  areas.forEach(
    area => {

      const areaElement =
        createAcsAreaElement(
          area
        );


      const shouldOpen =
        openAreaCodes
          ? openAreaCodes.has(
              area.area_code
            )
          : firstArea;


      if (shouldOpen) {

        areaElement.classList.add(
          "is-open"
        );

      }


      firstArea =
        false;


      acsAreaList.appendChild(
        areaElement
      );

    }
  );


  updateAcsSummary();

}



/* ==========================================================
   CREATE AREA
========================================================== */

function createAcsAreaElement(
  area
) {

  const element =
    document.createElement(
      "section"
    );


  element.className =
    "acs-area";

    element.dataset.areaCode =
  area.area_code;


  const proficientCount =
    area.tasks.filter(
      task =>
        getAcsTaskStatus(
          task.id
        ) ===
        "proficient"
    ).length;


  element.innerHTML =
    `
      <div
        class="acs-area-header"
        role="button"
        tabindex="0"
      >

        <div class="acs-area-heading">

          <span>
            Area ${escapeHtml(
              area.area_code
            )}
          </span>

          <strong>
            ${escapeHtml(
              area.area_name
            )}
          </strong>

        </div>


        <div class="acs-area-summary">

          <span>
            ${proficientCount}
            /
            ${area.tasks.length}
            proficient
          </span>

          <span
            class="acs-area-arrow"
            aria-hidden="true"
          >
            →
          </span>

        </div>

      </div>


      <div class="acs-task-list">
      </div>
    `;


  const header =
    element.querySelector(
      ".acs-area-header"
    );


  const taskList =
    element.querySelector(
      ".acs-task-list"
    );


  header.addEventListener(
    "click",
    () => {

      element.classList.toggle(
        "is-open"
      );

    }
  );


  header.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();


        element.classList.toggle(
          "is-open"
        );

      }

    }
  );


  area.tasks.forEach(
    task => {

      taskList.appendChild(
        createAcsTaskElement(
          task
        )
      );

    }
  );


  return element;

}


/* ==========================================================
   CREATE TASK
========================================================== */

function createAcsTaskElement(
  task
) {

  const status =
    getAcsTaskStatus(
      task.id
    );


  const progress =
    currentAcsProgress.get(
      task.id
    );


  const element =
    document.createElement(
      "div"
    );


  element.className =
    "acs-task";


  element.innerHTML =
    `
      <div class="acs-task-main">

        <span class="acs-task-code">
          ${escapeHtml(
            task.task_code
          )}
        </span>


        <div class="acs-task-copy">

          <strong>
            ${escapeHtml(
              task.task_name
            )}
          </strong>

          <span>
            ${
              progress?.last_assessed
                ? `Last assessed ${escapeHtml(
                    formatAcsDate(
                      progress.last_assessed
                    )
                  )}`
                : "Not yet assessed"
            }
          </span>

        </div>

      </div>


      <select
        class="acs-status-select"
        aria-label="ACS proficiency status"
      >

        <option
          value="not_started"
          ${
            status ===
            "not_started"
              ? "selected"
              : ""
          }
        >
          Not Started
        </option>

        <option
          value="introduced"
          ${
            status ===
            "introduced"
              ? "selected"
              : ""
          }
        >
          Introduced
        </option>

        <option
          value="developing"
          ${
            status ===
            "developing"
              ? "selected"
              : ""
          }
        >
          Developing
        </option>

        <option
          value="proficient"
          ${
            status ===
            "proficient"
              ? "selected"
              : ""
          }
        >
          Proficient
        </option>

      </select>
    `;


  const select =
    element.querySelector(
      ".acs-status-select"
    );


  select.addEventListener(
    "change",
    async () => {

      await saveAcsTaskStatus(
        task,
        select
      );

    }
  );


  return element;

}


/* ==========================================================
   SAVE TASK STATUS
========================================================== */

async function saveAcsTaskStatus(
  task,
  select
) {

  if (!selectedStudentId) {
    return;
  }


  clearAcsMessage();


  const newStatus =
    select.value;


  const previousStatus =
    getAcsTaskStatus(
      task.id
    );


  select.disabled =
    true;


  select.classList.add(
    "is-saving"
  );


  try {

    /*
      Not Started is represented by no row.
      Keeps the progress table sparse.
    */

    if (
      newStatus ===
      "not_started"
    ) {

      const {
        error
      } =
        await supabaseClient
          .from(
            "student_acs_progress"
          )
          .delete()
          .eq(
            "student_id",
            selectedStudentId
          )
          .eq(
            "task_id",
            task.id
          );


      if (error) {
        throw error;
      }


      currentAcsProgress.delete(
        task.id
      );

    } else {

      const {
        data: {
          user
        }
      } =
        await supabaseClient
          .auth
          .getUser();


      const today =
        new Date()
          .toISOString()
          .slice(
            0,
            10
          );


      const {
        data,
        error
      } =
        await supabaseClient
          .from(
            "student_acs_progress"
          )
          .upsert(
            {
              student_id:
                selectedStudentId,

              task_id:
                task.id,

              status:
                newStatus,

              last_assessed:
                today,

              updated_by:
                user?.id ||
                null,

              updated_at:
                new Date()
                  .toISOString()
            },
            {
              onConflict:
                "student_id,task_id"
            }
          )
          .select(`
            id,
            student_id,
            task_id,
            status,
            last_assessed,
            updated_at
          `)
          .single();


      if (error) {
        throw error;
      }


      currentAcsProgress.set(
        task.id,
        data
      );

    }


    const openAreaCodes =
  new Set(
    Array.from(
      acsAreaList.querySelectorAll(
        ".acs-area.is-open"
      )
    ).map(
      area =>
        area.dataset.areaCode
    )
  );


renderAcsProgress(
  openAreaCodes
);


    acsMessage.textContent =
      `${task.task_name} updated.`;


    acsMessage.classList.add(
      "is-success"
    );

  } catch (error) {

    console.error(
      "ACS save error:",
      error
    );


    select.value =
      previousStatus;


    acsMessage.textContent =
      "Could not update ACS progress.";


    acsMessage.classList.add(
      "is-error"
    );

  } finally {

    select.disabled =
      false;


    select.classList.remove(
      "is-saving"
    );

  }

}


/* ==========================================================
   SUMMARY
========================================================== */

function updateAcsSummary() {

  const total =
    currentAcsTasks.length;


  const proficient =
    currentAcsTasks.filter(
      task =>
        getAcsTaskStatus(
          task.id
        ) ===
        "proficient"
    ).length;


  const percent =
    total
      ? Math.round(
          proficient /
          total *
          100
        )
      : 0;


  acsOverallPercent.textContent =
    `${percent}%`;


  acsOverallDetail.textContent =
    `${proficient} of ${total} tasks proficient`;


  acsProgressFill.style.width =
    `${percent}%`;

}


/* ==========================================================
   HELPERS
========================================================== */

function updateLessonPaymentFields() {

  const isPaid =
    lessonBillingStatus.value ===
    "paid";


  lessonPaymentMethodField.hidden =
    !isPaid;

  lessonReceiptField.hidden =
    !isPaid;


  if (!isPaid) {

    lessonPaymentMethod.value =
      "Stripe";

    lessonReceiptNumber.value =
      "";

  }

}

function getAcsTaskStatus(
  taskId
) {

  return (
    currentAcsProgress
      .get(taskId)
      ?.status ||
    "not_started"
  );

}


function formatAcsDate(
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


function clearAcsMessage() {

  acsMessage.textContent =
    "";


  acsMessage.classList.remove(
    "is-success",
    "is-error"
  );

}

/* ==========================================================
   BILLING
========================================================== */

const adminBillingSummaryButton =
  document.getElementById(
    "admin-billing-summary-button"
  );

const adminOutstandingBalance =
  document.getElementById(
    "admin-outstanding-balance"
  );

const adminBillingSummaryDetail =
  document.getElementById(
    "admin-billing-summary-detail"
  );


const studentBillingButton =
  document.getElementById(
    "student-billing-button"
  );


const billingDialog =
  document.getElementById(
    "billing-dialog"
  );

const billingDialogClose =
  document.getElementById(
    "billing-dialog-close"
  );

const billingDialogSubtitle =
  document.getElementById(
    "billing-dialog-subtitle"
  );


const billingStudentFilter =
  document.getElementById(
    "billing-student-filter"
  );

const billingStatusFilter =
  document.getElementById(
    "billing-status-filter"
  );


const billingBalance =
  document.getElementById(
    "billing-balance"
  );

const billingTotalInvoiced =
  document.getElementById(
    "billing-total-invoiced"
  );

const billingTotalPaid =
  document.getElementById(
    "billing-total-paid"
  );

const billingInvoiceList =
  document.getElementById(
    "billing-invoice-list"
  );


let billingInvoices = [];

let billingFocusInvoiceId =
  null;


/* ==========================================================
   MONEY
========================================================== */

function formatMoney(
  value
) {

  return Number(
    value || 0
  ).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD"
    }
  );

}


/* ==========================================================
   INVOICE TOTALS
========================================================== */

function getInvoiceTotal(
  invoice
) {

  return (
    invoice.invoice_items || []
  ).reduce(
    (total, item) => {

      return (
        total +
        (
          Number(
            item.quantity || 0
          ) *
          Number(
            item.unit_amount || 0
          )
        )
      );

    },
    0
  );

}


function getInvoicePaid(
  invoice
) {

  return (
    invoice.payments || []
  ).reduce(
    (total, payment) =>
      total +
      Number(
        payment.amount || 0
      ),
    0
  );

}


function getInvoiceBalance(
  invoice
) {

  if (
    invoice.status === "void"
  ) {

    return 0;

  }


  return Math.max(
    getInvoiceTotal(invoice) -
    getInvoicePaid(invoice),
    0
  );

}


/* ==========================================================
   STUDENT FILTER
========================================================== */

function populateBillingStudentFilter() {

  const selectedValue =
    billingStudentFilter.value;


  billingStudentFilter.innerHTML =
    "";


  billingStudentFilter.add(
    new Option(
      "All students",
      ""
    )
  );


  students.forEach(
    student => {

      billingStudentFilter.add(
        new Option(
          student.full_name ||
          student.email ||
          "Student",

          student.id
        )
      );

    }
  );


  billingStudentFilter.value =
    selectedValue;

}


/* ==========================================================
   OPEN BILLING
========================================================== */

async function openBilling(
  studentId = "",
  invoiceId = null
) {

  billingFocusInvoiceId =
    invoiceId;


  populateBillingStudentFilter();


  billingStudentFilter.value =
    studentId || "";


  billingStatusFilter.value =
    "";


  if (studentId) {

    const student =
      getStudentById(
        studentId
      );


    billingDialogSubtitle.textContent =
      `Billing history for ${
        student?.full_name ||
        student?.email ||
        "student"
      }.`;

  } else {

    billingDialogSubtitle.textContent =
      "Invoices, payments and outstanding balances for all students.";

  }


  billingDialog.showModal();


  await loadBilling();

}


/* TOP SUMMARY */

adminBillingSummaryButton
  ?.addEventListener(
    "click",
    () => {

      openBilling();

    }
  );


/* STUDENT BUTTON */

studentBillingButton
  ?.addEventListener(
    "click",
    () => {

      if (!selectedStudentId) {
        return;
      }


      openBilling(
        selectedStudentId
      );

    }
  );


billingDialogClose
  ?.addEventListener(
    "click",
    () => {

      billingDialog.close();

    }
  );


billingStudentFilter
  ?.addEventListener(
    "change",
    () => {

      billingFocusInvoiceId =
        null;

      renderBilling();

    }
  );


billingStatusFilter
  ?.addEventListener(
    "change",
    () => {

      billingFocusInvoiceId =
        null;

      renderBilling();

    }
  );


/* ==========================================================
   LOAD ALL BILLING
========================================================== */

async function loadBilling() {

  billingInvoiceList.innerHTML =
    `
      <div class="student-list-empty">
        Loading invoices…
      </div>
    `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("invoices")
      .select(`
        id,
        student_id,
        invoice_number,
        issue_date,
        due_date,
        status,
        notes,
        created_at,

        profiles (
          full_name,
          email
        ),

        invoice_items (
          id,
          lesson_id,
          description,
          quantity,
          unit_amount
        ),

        payments (
          id,
          amount,
          payment_date,
          payment_method,
          reference_number
        )
      `)
      .order(
        "issue_date",
        {
          ascending: false
        }
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Could not load billing:",
      error
    );


    billingInvoiceList.innerHTML =
      `
        <div class="student-list-empty">
          Could not load billing.
        </div>
      `;


    return;
  }


  billingInvoices =
    data || [];


  renderBilling();

}


/* ==========================================================
   RENDER BILLING
========================================================== */

function renderBilling() {

  const studentId =
    billingStudentFilter.value;

  const statusFilter =
    billingStatusFilter.value;


  let invoices =
    [...billingInvoices];


  if (studentId) {

    invoices =
      invoices.filter(
        invoice =>
          invoice.student_id ===
          studentId
      );

  }


  if (statusFilter) {

    invoices =
      invoices.filter(
        invoice => {

          const balance =
            getInvoiceBalance(
              invoice
            );


          if (
            statusFilter === "void"
          ) {

            return (
              invoice.status ===
              "void"
            );

          }


          if (
            statusFilter === "paid"
          ) {

            return (
              invoice.status !==
                "void" &&
              balance <= 0
            );

          }


          if (
            statusFilter === "open"
          ) {

            return (
              invoice.status !==
                "void" &&
              balance > 0
            );

          }


          return true;

        }
      );

  }


  const activeInvoices =
    invoices.filter(
      invoice =>
        invoice.status !==
        "void"
    );


  const totalInvoiced =
    activeInvoices.reduce(
      (total, invoice) =>
        total +
        getInvoiceTotal(
          invoice
        ),
      0
    );


  const totalPaid =
    activeInvoices.reduce(
      (total, invoice) =>
        total +
        getInvoicePaid(
          invoice
        ),
      0
    );


  const outstanding =
    activeInvoices.reduce(
      (total, invoice) =>
        total +
        getInvoiceBalance(
          invoice
        ),
      0
    );


  billingTotalInvoiced.textContent =
    formatMoney(
      totalInvoiced
    );


  billingTotalPaid.textContent =
    formatMoney(
      totalPaid
    );


  billingBalance.textContent =
    formatMoney(
      outstanding
    );


  billingInvoiceList.innerHTML =
    "";


  if (!invoices.length) {

    billingInvoiceList.innerHTML =
      `
        <div class="student-list-empty">
          No invoices found.
        </div>
      `;

    return;

  }


  invoices.forEach(
    invoice => {

      const total =
        getInvoiceTotal(
          invoice
        );

      const paid =
        getInvoicePaid(
          invoice
        );

      const balance =
        getInvoiceBalance(
          invoice
        );


      let statusLabel =
        "Outstanding";

      let statusClass =
        "is-open";


      if (
        invoice.status === "void"
      ) {

        statusLabel =
          "Void";

        statusClass =
          "is-void";

      } else if (
        balance <= 0
      ) {

        statusLabel =
          "Paid";

        statusClass =
          "is-paid";

      }


      const studentName =
        invoice.profiles
          ?.full_name ||
        invoice.profiles
          ?.email ||
        "Student";


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "billing-invoice-card";


      card.dataset.billingInvoiceId =
        invoice.id;


      card.innerHTML =
      
        `
          <div class="billing-invoice-header">

            <div class="billing-invoice-title">

              <strong>
                ${escapeHtml(
                  invoice.invoice_number
                )}
              </strong>

              <span>
                ${escapeHtml(
                  studentName
                )}
                •
                ${escapeHtml(
                  formatBillingDate(
                    invoice.issue_date
                  )
                )}
              </span>

              <span
                class="
                  billing-status
                  ${statusClass}
                "
              >
                ${statusLabel}
              </span>

            </div>


            <div class="billing-invoice-money">

              <strong>
                ${formatMoney(total)}
              </strong>

              <span>
                Paid
                ${formatMoney(paid)}
                •
                Balance
                ${formatMoney(balance)}
              </span>

            </div>

          </div>


          <div class="billing-invoice-items">

            ${
              (
                invoice.invoice_items ||
                []
              )
                .map(
                  item => `
                    <div
                      class="billing-invoice-item"
                    >

                      <span>
                        ${escapeHtml(
                          item.description
                        )}
                      </span>

                      <strong>
                        ${formatMoney(
                          Number(
                            item.quantity
                          ) *
                          Number(
                            item.unit_amount
                          )
                        )}
                      </strong>

                    </div>
                  `
                )
                .join("")
            }

          </div>


          ${
  (
    invoice.payments ||
    []
  ).length
    ? `
        <div class="billing-payment-info">

          ${
            invoice.payments
              .map(
                payment => `
                  <span>
                    ${escapeHtml(
                      payment.payment_method ||
                      "Payment"
                    )}

                    ${
                      payment.reference_number
                        ? ` • ${escapeHtml(
                            payment.reference_number
                          )}`
                        : ""
                    }

                    • ${formatMoney(
                      payment.amount
                    )}
                  </span>
                `
              )
              .join("")
          }

        </div>
      `
    : ""
}


<div class="billing-invoice-actions">

  <button
    type="button"
    class="admin-secondary-button billing-pdf-button"
  >
    Download PDF
  </button>

</div>
`;


card
  .querySelector(
    ".billing-pdf-button"
  )
  ?.addEventListener(
    "click",
    () => {

      generateInvoicePdf(
        invoice
      );

    }
  );


billingInvoiceList.appendChild(
  card
);




    }
  );


  /*
    If billing was opened from a lesson invoice link,
    jump straight to that invoice.
  */

  if (billingFocusInvoiceId) {

    const target =
      billingInvoiceList
        .querySelector(
          `[data-billing-invoice-id="${billingFocusInvoiceId}"]`
        );


    if (target) {

      target.classList.add(
        "is-highlighted"
      );


      setTimeout(
        () => {

          target.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

        },
        100
      );

    }

  }

}

/* ==========================================================
   INVOICE PDF
========================================================== */

function generateInvoicePdf(
  invoice,
  shouldSave = true
) {

  if (
    !window.jspdf?.jsPDF
  ) {

    console.error(
      "jsPDF is not loaded."
    );

    alert(
      "PDF generator could not be loaded."
    );

    return;
  }


  const {
    jsPDF
  } =
    window.jspdf;


  const doc =
    new jsPDF({
      unit: "pt",
      format: "letter"
    });


  const pageWidth =
    doc.internal.pageSize.getWidth();

  const left =
    52;

  const right =
    pageWidth - 52;


  const studentName =
    invoice.profiles
      ?.full_name ||
    "Student";

  const studentEmail =
    invoice.profiles
      ?.email ||
    "";


  const total =
    getInvoiceTotal(
      invoice
    );

  const paid =
    getInvoicePaid(
      invoice
    );

  const balance =
    getInvoiceBalance(
      invoice
    );


  let status =
    "OUTSTANDING";


  if (
    invoice.status === "void"
  ) {

    status =
      "VOID";

  } else if (
    balance <= 0
  ) {

    status =
      "PAID";

  }


  /* ========================================================
     HEADER
  ======================================================== */

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    20
  );

  doc.text(
    "Fly With Angus",
    left,
    62
  );


  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    9
  );

  doc.text(
    "angus@flywithangus.com",
    left,
    79
  );

  doc.text(
    "flywithangus.com",
    left,
    93
  );


  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    26
  );

  doc.text(
    "INVOICE",
    right,
    62,
    {
      align: "right"
    }
  );


  doc.setFontSize(
    11
  );

  doc.text(
    invoice.invoice_number,
    right,
    82,
    {
      align: "right"
    }
  );


  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    9
  );

  doc.text(
    `Status: ${status}`,
    right,
    98,
    {
      align: "right"
    }
  );


  /* DIVIDER */

  doc.setDrawColor(
    220
  );

  doc.line(
    left,
    118,
    right,
    118
  );


  /* ========================================================
     BILL TO / INVOICE INFO
  ======================================================== */

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    9
  );

  doc.text(
    "BILL TO",
    left,
    145
  );


  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    11
  );

  doc.text(
    studentName,
    left,
    164
  );


  if (studentEmail) {

    doc.setFontSize(
      9
    );

    doc.text(
      studentEmail,
      left,
      180
    );

  }


  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    9
  );

  doc.text(
    "ISSUE DATE",
    385,
    145
  );


  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    formatBillingDate(
      invoice.issue_date
    ),
    right,
    145,
    {
      align: "right"
    }
  );


  if (invoice.due_date) {

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "DUE DATE",
      385,
      163
    );


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      formatBillingDate(
        invoice.due_date
      ),
      right,
      163,
      {
        align: "right"
      }
    );

  }


  /* ========================================================
     ITEMS
  ======================================================== */

  let y =
    225;


  doc.setFillColor(
    245,
    246,
    248
  );

  doc.rect(
    left,
    y - 16,
    right - left,
    26,
    "F"
  );


  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    9
  );

  doc.text(
    "DESCRIPTION",
    left + 8,
    y
  );

  doc.text(
    "AMOUNT",
    right - 8,
    y,
    {
      align: "right"
    }
  );


  y += 34;


  (
    invoice.invoice_items ||
    []
  ).forEach(
    item => {

      const amount =
        Number(
          item.quantity || 0
        ) *
        Number(
          item.unit_amount || 0
        );


      const descriptionLines =
        doc.splitTextToSize(
          item.description ||
          "Flight training",
          390
        );


      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(
        10
      );

      doc.text(
        descriptionLines,
        left + 8,
        y
      );


      doc.text(
        formatMoney(
          amount
        ),
        right - 8,
        y,
        {
          align: "right"
        }
      );


      const lineHeight =
        Math.max(
          descriptionLines.length *
            13,
          20
        );


      y +=
        lineHeight;


      doc.setDrawColor(
        235
      );

      doc.line(
        left,
        y - 7,
        right,
        y - 7
      );

    }
  );


  /* ========================================================
     TOTALS
  ======================================================== */

  y +=
    20;


  const labelX =
    390;


  doc.setFontSize(
    10
  );


  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    "Total",
    labelX,
    y
  );

  doc.text(
    formatMoney(total),
    right,
    y,
    {
      align: "right"
    }
  );


  y +=
    20;


  doc.text(
    "Paid",
    labelX,
    y
  );

  doc.text(
    formatMoney(paid),
    right,
    y,
    {
      align: "right"
    }
  );


  y +=
    24;


  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    12
  );

  doc.text(
    "Balance",
    labelX,
    y
  );

  doc.text(
    formatMoney(balance),
    right,
    y,
    {
      align: "right"
    }
  );


  /* ========================================================
     PAYMENTS
  ======================================================== */

  const payments =
    invoice.payments ||
    [];


  if (
    payments.length
  ) {

    y +=
      42;


    doc.setDrawColor(
      220
    );

    doc.line(
      left,
      y - 18,
      right,
      y - 18
    );


    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(
      9
    );

    doc.text(
      "PAYMENT DETAILS",
      left,
      y
    );


    y +=
      20;


    doc.setFont(
      "helvetica",
      "normal"
    );


    payments.forEach(
      payment => {

        const parts =
          [];


        if (
          payment.payment_date
        ) {

          parts.push(
            formatBillingDate(
              payment.payment_date
            )
          );

        }


        if (
          payment.payment_method
        ) {

          parts.push(
            payment.payment_method
          );

        }


        if (
          payment.reference_number
        ) {

          parts.push(
            `Ref: ${
              payment.reference_number
            }`
          );

        }


        parts.push(
          formatMoney(
            payment.amount
          )
        );


        const paymentLine =
          parts.join(
            " | "
          );


        const paymentLines =
          doc.splitTextToSize(
            paymentLine,
            right - left
          );


        doc.text(
          paymentLines,
          left,
          y
        );


        y +=
          paymentLines.length *
          13 +
          5;

      }
    );

  }


  /* ========================================================
     NOTES
  ======================================================== */

  if (
    invoice.notes
  ) {

    y +=
      25;


    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(
      9
    );

    doc.text(
      "NOTES",
      left,
      y
    );


    y +=
      17;


    doc.setFont(
      "helvetica",
      "normal"
    );

    const noteLines =
      doc.splitTextToSize(
        invoice.notes,
        right - left
      );


    doc.text(
      noteLines,
      left,
      y
    );

  }


  /* ========================================================
     FOOTER
  ======================================================== */

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    8
  );

  doc.setTextColor(
    110
  );


  doc.text(
    `Invoice ${invoice.invoice_number}`,
    left,
    750
  );


  doc.text(
    "Thank you.",
    right,
    750,
    {
      align: "right"
    }
  );


  /* ========================================================
     DOWNLOAD
  ======================================================== */

  if (shouldSave) {

  doc.save(
    `${invoice.invoice_number}.pdf`
  );

}


return doc;

}

/* ==========================================================
   EMAIL LESSON + INVOICE PDFS
========================================================== */

async function loadInvoiceForPdf(
  invoiceId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("invoices")
      .select(`
        id,
        student_id,
        invoice_number,
        issue_date,
        due_date,
        status,
        notes,
        created_at,

        profiles (
          full_name,
          email
        ),

        invoice_items (
          id,
          lesson_id,
          description,
          quantity,
          unit_amount
        ),

        payments (
          id,
          amount,
          payment_date,
          payment_method,
          reference_number
        )
      `)
      .eq(
        "id",
        invoiceId
      )
      .single();


  if (error) {

    throw error;

  }


  return data;
}


function pdfDocToBase64(
  doc
) {

  const dataUri =
    doc.output(
      "datauristring"
    );


  return dataUri.split(
    ","
  )[1];

}


async function sendLessonPdfs(
  lesson,
  button
) {

  const student =
    getStudentById(
      lesson.student_id
    );


  if (
    !lesson.invoice?.id
  ) {

    alert(
      "This lesson does not have an invoice."
    );

    return;
  }


  if (
    !student?.email
  ) {

    alert(
      "This student does not have an email address."
    );

    return;
  }


  const confirmed =
    window.confirm(
      `Email the lesson PDF and ${lesson.invoice.number} to ${student.email}?`
    );


  if (!confirmed) {

    return;

  }


  const originalText =
    button.textContent;


  button.disabled =
    true;

  button.textContent =
    "Sending…";


  try {

    const invoice =
      await loadInvoiceForPdf(
        lesson.invoice.id
      );


    const lessonDoc =
      generateLessonPdf(
        lesson,
        false
      );


    const invoiceDoc =
      generateInvoicePdf(
        invoice,
        false
      );


    if (
      !lessonDoc ||
      !invoiceDoc
    ) {

      throw new Error(
        "Could not generate PDFs."
      );

    }


    const {
      data,
      error
    } =
      await supabaseClient
        .functions
        .invoke(
          "send-lesson-pdfs",
          {
            body: {

              lesson_id:
                lesson.id,

              invoice_id:
                invoice.id,

              lesson_pdf_base64:
                pdfDocToBase64(
                  lessonDoc
                ),

              invoice_pdf_base64:
                pdfDocToBase64(
                  invoiceDoc
                )

            }
          }
        );


    if (error) {

      throw error;

    }


    if (
      !data?.success
    ) {

      throw new Error(
        data?.error ||
        "Email could not be sent."
      );

    }


    button.textContent =
      "Sent ✓";


    setTimeout(
      () => {

        button.disabled =
          false;

        button.textContent =
          originalText;

      },
      1800
    );


  } catch (error) {

    console.error(
      "Could not email lesson PDFs:",
      error
    );


    button.disabled =
      false;

    button.textContent =
      originalText;


    alert(
      "Could not email the PDFs."
    );

  }

}

/* ==========================================================
   ADMIN BILLING SUMMARY
========================================================== */

async function loadAdminBillingSummary() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("invoices")
      .select(`
        status,

        invoice_items (
          quantity,
          unit_amount
        ),

        payments (
          amount
        )
      `);


  if (error) {

    console.error(
      "Could not load billing summary:",
      error
    );

    return;

  }


  const invoices =
    data || [];


  const outstanding =
    invoices.reduce(
      (total, invoice) => {

        if (
          invoice.status ===
          "void"
        ) {

          return total;

        }


        return (
          total +
          getInvoiceBalance(
            invoice
          )
        );

      },
      0
    );


  adminOutstandingBalance.textContent =
    formatMoney(
      outstanding
    );


  adminBillingSummaryDetail.textContent =
    outstanding > 0
      ? "Open billing →"
      : "All accounts current • Open billing →";

}


/* ==========================================================
   DATE
========================================================== */

function formatBillingDate(
  date
) {

  if (!date) {
    return "";
  }


  return new Date(
    `${date}T00:00:00`
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