/*
  Fly With Angus Student Dashboard
*/

const SUPABASE_URL =
  "https://fqmnegjxnznadcqowguz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Z7WY7-rSQ76LF7f9oOEDDA_umKno_D5";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  let currentStudentProfile =
  null;

  const totalHours =
  document.getElementById(
    "total-hours"
  );

  const viewAllLessonsButton =
  document.getElementById(
    "view-all-lessons-button"
  );

  const DOCUMENT_BUCKET =
  "student-documents";


const viewDocumentsButton =
  document.getElementById(
    "view-documents-button"
  );

  const acsSummary =
  document.getElementById(
    "acs-summary"
  );

const acsDescription =
  document.getElementById(
    "acs-description"
  );

const acsPreviewPercent =
  document.getElementById(
    "acs-preview-percent"
  );

const acsPreviewDetail =
  document.getElementById(
    "acs-preview-detail"
  );

const acsPreviewFill =
  document.getElementById(
    "acs-preview-fill"
  );

const viewAcsProgressButton =
  document.getElementById(
    "view-acs-progress-button"
  );

const studentAcsDialog =
  document.getElementById(
    "student-acs-dialog"
  );

const studentAcsDialogClose =
  document.getElementById(
    "student-acs-dialog-close"
  );

const studentAcsProgramName =
  document.getElementById(
    "student-acs-program-name"
  );

const studentAcsDialogPercent =
  document.getElementById(
    "student-acs-dialog-percent"
  );

const studentAcsDialogDetail =
  document.getElementById(
    "student-acs-dialog-detail"
  );

const studentAcsDialogFill =
  document.getElementById(
    "student-acs-dialog-fill"
  );

const studentAcsAreaList =
  document.getElementById(
    "student-acs-area-list"
  );


let dashboardAcsTasks =
  [];

let dashboardAcsProgress =
  new Map();

let dashboardAcsProgram =
  null;

const studentDocumentsDialog =
  document.getElementById(
    "student-documents-dialog"
  );

const studentDocumentsClose =
  document.getElementById(
    "student-documents-close"
  );

const studentResourceList =
  document.getElementById(
    "student-resource-list"
  );

const studentMyDocumentList =
  document.getElementById(
    "student-my-document-list"
  );

const studentResourceCount =
  document.getElementById(
    "student-resource-count"
  );

const studentMyDocumentCount =
  document.getElementById(
    "student-my-document-count"
  );

const documentPreviewCount =
  document.getElementById(
    "document-preview-count"
  );

const documentPreviewText =
  document.getElementById(
    "document-preview-text"
  );

const studentDocumentMessage =
  document.getElementById(
    "student-document-message"
  );


let studentResources = [];
let studentPersonalDocuments = [];

const lessonHistoryDialog =
  document.getElementById(
    "lesson-history-dialog"
  );

const lessonHistoryClose =
  document.getElementById(
    "lesson-history-close"
  );

const lessonHistoryList =
  document.getElementById(
    "lesson-history-list"
  );


let studentLessons = [];

const lessonCount =
  document.getElementById(
    "lesson-count"
  );

const lastLessonCard =
  document.getElementById(
    "last-lesson-card"
  );


const loadingScreen =
  document.getElementById(
    "dashboard-loading"
  );

const studentName =
  document.getElementById(
    "student-name"
  );

  const studentEndorsementList =
  document.getElementById(
    "student-endorsement-list"
  );

const studentEndorsementCount =
  document.getElementById(
    "student-endorsement-count"
  );

const trainingProgram =
  document.getElementById(
    "training-program"
  );

const studentStatus =
  document.getElementById(
    "student-status"
  );

const logoutButton =
  document.getElementById(
    "logout-button"
  );


/*
  Require login
*/

async function requireAuth() {

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
      "/students"
    );

    return null;
  }


  return session.user;
}


/*
  Load student profile
*/

async function loadProfile(user) {

  const {
    data: profile,
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
  acs_program_id,
  start_date,
  status
`)
      .eq(
        "id",
        user.id
      )
      .single();


  if (error) {

  console.error(
    "Profile error:",
    error
  );

  studentName.textContent =
    user.email;

  trainingProgram.textContent =
    "Student";

  studentStatus.textContent =
    "Profile unavailable";

  return;
}


currentStudentProfile =
  profile;


/*
  Use preferred name if present.
  Otherwise use first part of full name.
*/

  let displayName =
    profile.preferred_name;


  if (!displayName) {

    displayName =
      profile.full_name
        ?.trim()
        .split(/\s+/)[0];

  }


  studentName.textContent =
    displayName ||
    "Student";


  trainingProgram.textContent =
    profile.training_program ||
    "Flight Training";


  studentStatus.textContent =
    profile.status ||
    "Active";
}


/*
  Log out
*/

logoutButton?.addEventListener(
  "click",
  async () => {

    logoutButton.disabled = true;

    logoutButton.textContent =
      "Logging out…";


    await supabaseClient.auth.signOut();


    window.location.replace(
      "/students"
    );

  }
);

/* ==========================================================
   ENDORSEMENTS
========================================================== */

async function loadEndorsements(user) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("endorsements")
      .select(`
        id,
        endorsement_type,
        regulation,
        date_given,
        expires_at,
        aircraft,
        endorsement_text
      `)
      .eq(
        "student_id",
        user.id
      )
      .order(
        "date_given",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Endorsement error:",
      error
    );


    studentEndorsementList.innerHTML =
      `
        <div class="dashboard-empty-state">
          Endorsements could not be loaded.
        </div>
      `;

    return;

  }


  const endorsements =
    data || [];


  studentEndorsementCount.textContent =
    endorsements.length;


  renderStudentEndorsements(
    endorsements
  );

}

function renderStudentEndorsements(
  endorsements
) {

  studentEndorsementList.innerHTML =
    "";


  if (!endorsements.length) {

    studentEndorsementList.innerHTML =
      `
        <div class="dashboard-empty-state">
          No endorsements recorded yet.
        </div>
      `;

    return;

  }


  endorsements.forEach(
    endorsement => {

      const item =
        document.createElement(
          "article"
        );


      item.className =
        "student-endorsement-item";


      const status =
        getStudentEndorsementStatus(
          endorsement.expires_at
        );


      const metadata =
        [];


      metadata.push(
        formatStudentDate(
          endorsement.date_given
        )
      );


      if (
        endorsement.regulation
      ) {

        metadata.push(
          endorsement.regulation
        );

      }


      if (
        endorsement.aircraft
      ) {

        metadata.push(
          endorsement.aircraft
        );

      }


      if (
        endorsement.expires_at
      ) {

        metadata.push(
          `Expires ${formatStudentDate(
            endorsement.expires_at
          )}`
        );

      }


      item.innerHTML =
        `
          <div class="student-endorsement-main">

            <strong>
              ${escapeStudentHtml(
                endorsement.endorsement_type
              )}
            </strong>


            <div class="student-endorsement-meta">

              ${metadata
                .map(
                  value =>
                    escapeStudentHtml(
                      value
                    )
                )
                .join(" • ")}

            </div>


            ${
              endorsement.endorsement_text
                ? `
                    <p class="student-endorsement-text">
                      ${escapeStudentHtml(
                        endorsement.endorsement_text
                      )}
                    </p>
                  `
                : ""
            }

          </div>


          <span
            class="student-endorsement-status ${status.className}"
          >
            ${escapeStudentHtml(
              status.label
            )}
          </span>
        `;


      studentEndorsementList
        .appendChild(
          item
        );

    }
  );

}

function getStudentEndorsementStatus(
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


  const daysRemaining =
    Math.round(
      (
        expiry.getTime() -
        today.getTime()
      ) /
      86400000
    );


  if (
    daysRemaining < 0
  ) {

    return {
      label: "Expired",
      className: "is-expired"
    };

  }


  if (
    daysRemaining === 0
  ) {

    return {
      label: "Expires today",
      className: "is-expiring"
    };

  }


  if (
    daysRemaining <= 30
  ) {

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

function formatStudentDate(value) {

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


function escapeStudentHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/*
  Initialize dashboard
*/

async function initializeDashboard() {

  try {

    const user =
      await requireAuth();


    if (!user) {
      return;
    }


    /*
      Load profile and endorsements together.
    */

    await loadProfile(
  user
);


await Promise.all([
  loadEndorsements(user),
  loadStudentLessons(user),
  loadStudentDocuments(user),
  loadStudentAcs(user)
]);


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );


  } finally {

    loadingScreen?.classList.add(
      "is-hidden"
    );

  }

}

/* ==========================================================
   STUDENT LESSON DATA
========================================================== */

async function loadStudentLessons(
  user
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("lessons")
      .select(`
        id,
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
        payment_receipt_number,
        billing_status,
        created_at
      `)
      .eq(
        "student_id",
        user.id
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
      "Lesson load error:",
      error
    );


    totalHours.textContent =
      "—";


    lessonCount.textContent =
      "Training history unavailable";


    lastLessonCard.innerHTML =
      `
        <div class="empty-state">

          <span class="empty-state-icon">
            !
          </span>

          <div>

            <strong>
              Could not load lesson history
            </strong>

            <p>
              Please try again later.
            </p>

          </div>

        </div>
      `;


    return;
  }


  const lessons =
  data || [];


studentLessons =
  lessons;

  updateTrainingSummary(
    lessons
  );


  renderLastLesson(
    lessons[0] || null
  );

}


/* ==========================================================
   TRAINING SUMMARY
========================================================== */

function updateTrainingSummary(
  lessons
) {

  const totalTrainingTime =
    lessons.reduce(
      (total, lesson) => {

        return (
          total +
          Number(
            lesson.flight_time || 0
          ) +
          Number(
            lesson.ground_time || 0
          ) +
          Number(
            lesson.sim_time || 0
          )
        );

      },
      0
    );


  totalHours.textContent =
    `${totalTrainingTime.toFixed(1)} hrs`;


  if (!lessons.length) {

    lessonCount.textContent =
      "No lessons recorded yet";

    return;

  }


  lessonCount.textContent =
    lessons.length === 1
      ? "1 lesson recorded"
      : `${lessons.length} lessons recorded`;

}


/* ==========================================================
   LAST LESSON
========================================================== */

function renderLastLesson(
  lesson
) {

  if (!lastLessonCard) {
    return;
  }


  if (!lesson) {

    lastLessonCard.innerHTML =
      `
        <div class="empty-state">

          <span class="empty-state-icon">
            ✓
          </span>

          <div>

            <strong>
              No lessons recorded yet
            </strong>

            <p>
              Your lesson history and instructor
              notes will appear here.
            </p>

          </div>

        </div>
      `;

    return;
  }


  const meta =
    [];


  if (lesson.aircraft) {

    let aircraft =
      lesson.aircraft;


    if (lesson.tail_number) {

      aircraft +=
        ` • ${lesson.tail_number}`;

    }


    meta.push(
      aircraft
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
      ).toFixed(1)} hr flight`
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
      ).toFixed(1)} hr ground`
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
      ).toFixed(1)} hr sim`
    );

  }


  if (lesson.route) {

    meta.push(
      lesson.route
    );

  }


  const payment =
    getStudentLessonPaymentStatus(
      lesson.billing_status
    );


  lastLessonCard.innerHTML =
    `
      <div class="student-lesson-heading">

        <strong>
          ${escapeDashboardHtml(
            formatStudentLessonDate(
              lesson.lesson_date
            )
          )}
          —
          ${escapeDashboardHtml(
            formatStudentLessonType(
              lesson.lesson_type
            )
          )}
        </strong>

        ${
          lesson.training_goal
            ? `
                <span class="student-lesson-goal">
                  ${escapeDashboardHtml(
                    lesson.training_goal
                  )}
                </span>
              `
            : ""
        }

      </div>


      ${
        meta.length
          ? `
              <div class="student-lesson-meta">
                ${meta
                  .map(
                    value =>
                      escapeDashboardHtml(
                        value
                      )
                  )
                  .join(" • ")}
              </div>
            `
          : ""
      }


      ${
        lesson.topics
          ? `
              <p class="student-lesson-topics">
                <strong>Covered:</strong>
                ${escapeDashboardHtml(
                  lesson.topics
                )}
              </p>
            `
          : ""
      }


      ${
        lesson.student_notes
          ? `
              <p class="student-lesson-notes">
                ${escapeDashboardHtml(
                  lesson.student_notes
                )}
              </p>
            `
          : ""
      }


      ${
        lesson.amount_charged !== null ||
        lesson.payment_receipt_number ||
        lesson.billing_status
          ? `
              <div class="student-lesson-payment">

                <span
                  class="student-lesson-payment-status ${payment.className}"
                >
                  ${escapeDashboardHtml(
                    payment.label
                  )}
                </span>

                ${
                  lesson.amount_charged !== null
                    ? `
                        <span class="student-lesson-payment-detail">
                          $${Number(
                            lesson.amount_charged
                          ).toFixed(2)}
                        </span>
                      `
                    : ""
                }

                ${
                  lesson.payment_receipt_number
                    ? `
                        <span class="student-lesson-payment-detail">
                          Receipt:
                          ${escapeDashboardHtml(
                            lesson.payment_receipt_number
                          )}
                        </span>
                      `
                    : ""
                }

              </div>
            `
          : ""
      }
    `;

}

/* ==========================================================
   ALL LESSONS DIALOG
========================================================== */

viewAllLessonsButton
  ?.addEventListener(
    "click",
    () => {

      renderLessonHistory();

      lessonHistoryDialog.showModal();

    }
  );


lessonHistoryClose
  ?.addEventListener(
    "click",
    () => {

      lessonHistoryDialog.close();

    }
  );


lessonHistoryDialog
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        lessonHistoryDialog
      ) {

        lessonHistoryDialog.close();

      }

    }
  );


function renderLessonHistory() {

  lessonHistoryList.innerHTML =
    "";


  if (!studentLessons.length) {

    lessonHistoryList.innerHTML =
      `
        <div class="dashboard-empty-state">
          No lessons recorded yet.
        </div>
      `;

    return;
  }


  studentLessons.forEach(
    lesson => {

      const item =
        document.createElement(
          "article"
        );


      item.className =
        "lesson-history-item";


      const meta =
        [];


      if (lesson.aircraft) {

        let aircraft =
          lesson.aircraft;


        if (lesson.tail_number) {

          aircraft +=
            ` • ${lesson.tail_number}`;

        }


        meta.push(
          aircraft
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
          ).toFixed(1)} hr flight`
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
          ).toFixed(1)} hr ground`
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
          ).toFixed(1)} hr sim`
        );

      }


      if (lesson.route) {

        meta.push(
          lesson.route
        );

      }


      const payment =
        getStudentLessonPaymentStatus(
          lesson.billing_status
        );


      item.innerHTML =
        `
          <div class="student-lesson-heading">

            <strong>
              ${escapeDashboardHtml(
                formatStudentLessonDate(
                  lesson.lesson_date
                )
              )}
              —
              ${escapeDashboardHtml(
                formatStudentLessonType(
                  lesson.lesson_type
                )
              )}
            </strong>

            ${
              lesson.training_goal
                ? `
                    <span class="student-lesson-goal">
                      ${escapeDashboardHtml(
                        lesson.training_goal
                      )}
                    </span>
                  `
                : ""
            }

          </div>


          ${
            meta.length
              ? `
                  <div class="student-lesson-meta">
                    ${meta
                      .map(
                        value =>
                          escapeDashboardHtml(
                            value
                          )
                      )
                      .join(" • ")}
                  </div>
                `
              : ""
          }


          ${
            lesson.topics
              ? `
                  <p class="student-lesson-topics">
                    <strong>Covered:</strong>
                    ${escapeDashboardHtml(
                      lesson.topics
                    )}
                  </p>
                `
              : ""
          }


          ${
            lesson.student_notes
              ? `
                  <p class="student-lesson-notes">
                    ${escapeDashboardHtml(
                      lesson.student_notes
                    )}
                  </p>
                `
              : ""
          }


          <div class="student-lesson-payment">

            <span
              class="student-lesson-payment-status ${payment.className}"
            >
              ${escapeDashboardHtml(
                payment.label
              )}
            </span>


            ${
              lesson.amount_charged !== null
                ? `
                    <span class="student-lesson-payment-detail">
                      $${Number(
                        lesson.amount_charged
                      ).toFixed(2)}
                    </span>
                  `
                : ""
            }


            ${
              lesson.payment_receipt_number
                ? `
                    <span class="student-lesson-payment-detail">
                      Receipt:
                      ${escapeDashboardHtml(
                        lesson.payment_receipt_number
                      )}
                    </span>
                  `
                : ""
            }

          </div>
        `;


      lessonHistoryList.appendChild(
        item
      );

    }
  );

}
  


/* ==========================================================
   HELPERS
========================================================== */

function formatStudentLessonDate(
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

function cleanLessonText(value) {

  return String(value ?? "")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length)
    .join("\n");

}

function formatStudentLessonType(
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


function getStudentLessonPaymentStatus(
  status
) {

  switch (status) {

    case "paid":

      return {
        label: "Paid",
        className: "is-paid"
      };


    case "invoiced":

      return {
        label: "Invoiced",
        className: "is-invoiced"
      };


    case "waived":

      return {
        label: "Waived",
        className: ""
      };


    default:

      return {
        label: "Unbilled",
        className: "is-unbilled"
      };

  }

}


function escapeDashboardHtml(
  value
) {

  return String(
    value ?? ""
  )
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
   STUDENT DOCUMENTS
========================================================== */

async function loadStudentDocuments(
  user
) {

  const [
    resourceResult,
    personalResult
  ] =
    await Promise.all([

      supabaseClient
        .from("documents")
        .select(`
          id,
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
          "student_document"
        )
        .eq(
          "student_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )

    ]);


  if (
    resourceResult.error ||
    personalResult.error
  ) {

    console.error(
      "Document load error:",
      resourceResult.error ||
      personalResult.error
    );


    documentPreviewCount.textContent =
      "—";


    documentPreviewText.textContent =
      "Documents unavailable";


    return;

  }


  studentResources =
    resourceResult.data || [];


  studentPersonalDocuments =
    personalResult.data || [];


  updateStudentDocumentPreview();

}


/* ==========================================================
   SIDEBAR PREVIEW
========================================================== */

function updateStudentDocumentPreview() {

  const total =
    studentResources.length +
    studentPersonalDocuments.length;


  documentPreviewCount.textContent =
    total === 1
      ? "1 file"
      : `${total} files`;


  if (!total) {

    documentPreviewText.textContent =
      "No documents shared yet.";

    return;

  }


  const parts =
    [];


  if (studentResources.length) {

    parts.push(
      `${studentResources.length} resource${
        studentResources.length === 1
          ? ""
          : "s"
      }`
    );

  }


  if (
    studentPersonalDocuments.length
  ) {

    parts.push(
      `${studentPersonalDocuments.length} personal`
    );

  }


  documentPreviewText.textContent =
    parts.join(" • ");

}


/* ==========================================================
   OPEN / CLOSE
========================================================== */

viewDocumentsButton
  ?.addEventListener(
    "click",
    () => {

      renderStudentDocuments();


      studentDocumentsDialog
        .showModal();

    }
  );


studentDocumentsClose
  ?.addEventListener(
    "click",
    () => {

      studentDocumentsDialog.close();

    }
  );


studentDocumentsDialog
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        studentDocumentsDialog
      ) {

        studentDocumentsDialog.close();

      }

    }
  );


/* ==========================================================
   RENDER
========================================================== */

function renderStudentDocuments() {

  studentResourceCount.textContent =
    studentResources.length;


  studentMyDocumentCount.textContent =
    studentPersonalDocuments.length;


  renderStudentDocumentList(
    studentResources,
    studentResourceList,
    "No student resources available yet."
  );


  renderStudentDocumentList(
    studentPersonalDocuments,
    studentMyDocumentList,
    "No personal documents have been shared yet."
  );

}


function renderStudentDocumentList(
  records,
  container,
  emptyText
) {

  container.innerHTML =
    "";


  if (!records.length) {

    container.innerHTML =
      `
        <div class="dashboard-empty-state">
          ${escapeDashboardHtml(
            emptyText
          )}
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
        "student-document-item";


      item.innerHTML =
        `
          <div class="student-document-icon">
            ${getStudentDocumentIcon(
              record.mime_type
            )}
          </div>


          <div class="student-document-main">

            <strong>
              ${escapeDashboardHtml(
                record.title ||
                record.file_name
              )}
            </strong>

            <span>
              ${escapeDashboardHtml(
                formatStudentDocumentMeta(
                  record
                )
              )}
            </span>

          </div>


          <div class="student-document-actions">

            <button
              type="button"
              class="
                student-document-button
                student-document-open
              "
            >
              Open
            </button>


            <button
              type="button"
              class="
                student-document-button
                student-document-download
              "
            >
              Download
            </button>

          </div>
        `;


      item
        .querySelector(
          ".student-document-open"
        )
        .addEventListener(
          "click",
          () => {

            openStudentDocument(
              record
            );

          }
        );


      item
        .querySelector(
          ".student-document-download"
        )
        .addEventListener(
          "click",
          () => {

            downloadStudentDocument(
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
   OPEN DOCUMENT
========================================================== */

async function openStudentDocument(
  record
) {

  clearStudentDocumentMessage();


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


    setStudentDocumentError(
      "Could not open this document."
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

async function downloadStudentDocument(
  record
) {

  clearStudentDocumentMessage();


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


    setStudentDocumentError(
      "Could not download this document."
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
   DOCUMENT HELPERS
========================================================== */

function getStudentDocumentIcon(
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


function formatStudentDocumentMeta(
  record
) {

  const values =
    [];


  if (
    record.file_size !== null &&
    record.file_size !== undefined
  ) {

    values.push(
      formatStudentDocumentSize(
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


function formatStudentDocumentSize(
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


function clearStudentDocumentMessage() {

  studentDocumentMessage.textContent =
    "";

}


function setStudentDocumentError(
  message
) {

  studentDocumentMessage.textContent =
    message;

}

/* ==========================================================
   STUDENT ACS
========================================================== */


async function loadStudentAcs(
  user
) {

  if (
    !currentStudentProfile
      ?.acs_program_id
  ) {

    dashboardAcsProgram =
      null;

    dashboardAcsTasks =
      [];

    dashboardAcsProgress =
      new Map();


    acsSummary.textContent =
      "—";


    acsDescription.textContent =
      "No ACS course assigned";


    acsPreviewPercent.textContent =
      "—";


    acsPreviewDetail.textContent =
      "Your instructor has not assigned an ACS course.";


    acsPreviewFill.style.width =
      "0%";


    return;
  }


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
        currentStudentProfile
          .acs_program_id
      )
      .single();

      if (
  programError ||
  !program
) {

  console.error(
    "ACS program error:",
    programError
  );


  dashboardAcsProgram =
    null;

  dashboardAcsTasks =
    [];

  dashboardAcsProgress =
    new Map();


  acsSummary.textContent =
    "—";

  acsDescription.textContent =
    "ACS course unavailable";

  acsPreviewPercent.textContent =
    "—";

  acsPreviewDetail.textContent =
    "The assigned ACS course could not be loaded.";

  acsPreviewFill.style.width =
    "0%";


  return;
}

  dashboardAcsProgram =
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
        .from(
          "student_acs_progress"
        )
        .select(`
          task_id,
          status,
          last_assessed
        `)
        .eq(
          "student_id",
          user.id
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


    acsSummary.textContent =
      "—";


    acsDescription.textContent =
      "Progress unavailable";


    return;
  }


  dashboardAcsTasks =
    taskResult.data || [];


  dashboardAcsProgress =
    new Map(
      (progressResult.data || [])
        .map(
          progress => [
            progress.task_id,
            progress
          ]
        )
    );


  updateDashboardAcsSummary();

}


/* ==========================================================
   SUMMARY + PREVIEW
========================================================== */

function updateDashboardAcsSummary() {

  const total =
    dashboardAcsTasks.length;


  const proficient =
    dashboardAcsTasks.filter(
      task =>
        getDashboardAcsStatus(
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


  acsSummary.textContent =
    `${percent}%`;


  acsDescription.textContent =
    `${proficient} of ${total} tasks proficient`;


  acsPreviewPercent.textContent =
    `${percent}%`;


  acsPreviewDetail.textContent =
    `${proficient} of ${total} tasks proficient`;


  acsPreviewFill.style.width =
    `${percent}%`;


  updateDashboardAcsAreaPreview(
    "IV",
    "acs-preview-area-iv",
    "acs-preview-area-iv-fill"
  );


  updateDashboardAcsAreaPreview(
    "VI",
    "acs-preview-area-vi",
    "acs-preview-area-vi-fill"
  );


  updateDashboardAcsAreaPreview(
    "IX",
    "acs-preview-area-ix",
    "acs-preview-area-ix-fill"
  );

}


function updateDashboardAcsAreaPreview(
  areaCode,
  labelId,
  fillId
) {

  const tasks =
    dashboardAcsTasks.filter(
      task =>
        task.area_code ===
        areaCode
    );


  const proficient =
    tasks.filter(
      task =>
        getDashboardAcsStatus(
          task.id
        ) ===
        "proficient"
    ).length;


  const percent =
    tasks.length
      ? Math.round(
          proficient /
          tasks.length *
          100
        )
      : 0;


  const label =
    document.getElementById(
      labelId
    );


  const fill =
    document.getElementById(
      fillId
    );


  if (label) {

    label.textContent =
      `${percent}%`;

  }


  if (fill) {

    fill.style.width =
      `${percent}%`;

  }

}


/* ==========================================================
   OPEN FULL PROGRESS
========================================================== */

viewAcsProgressButton
  ?.addEventListener(
    "click",
    () => {

      renderStudentAcsProgress();


      studentAcsDialog.showModal();

    }
  );


studentAcsDialogClose
  ?.addEventListener(
    "click",
    () => {

      studentAcsDialog.close();

    }
  );


studentAcsDialog
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        studentAcsDialog
      ) {

        studentAcsDialog.close();

      }

    }
  );


/* ==========================================================
   FULL PROGRESS RENDER
========================================================== */

function renderStudentAcsProgress() {

  studentAcsAreaList.innerHTML =
    "";


  if (!dashboardAcsTasks.length) {

    studentAcsAreaList.innerHTML =
      `
        <div class="dashboard-empty-state">
          No ACS progress available yet.
        </div>
      `;


    return;
  }


  studentAcsProgramName.textContent =
    dashboardAcsProgram?.name ||
    "ACS Progress";


  const total =
    dashboardAcsTasks.length;


  const proficient =
    dashboardAcsTasks.filter(
      task =>
        getDashboardAcsStatus(
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


  studentAcsDialogPercent.textContent =
    `${percent}%`;


  studentAcsDialogDetail.textContent =
    `${proficient} of ${total} tasks proficient`;


  studentAcsDialogFill.style.width =
    `${percent}%`;


  const areas =
    new Map();


  dashboardAcsTasks.forEach(
    task => {

      if (
        !areas.has(
          task.area_code
        )
      ) {

        areas.set(
          task.area_code,
          {
            code:
              task.area_code,

            name:
              task.area_name,

            tasks:
              []
          }
        );

      }


      areas
        .get(
          task.area_code
        )
        .tasks
        .push(task);

    }
  );


  let firstArea =
    true;


  areas.forEach(
    area => {

      const areaElement =
        createStudentAcsArea(
          area
        );


      if (firstArea) {

        areaElement.classList.add(
          "is-open"
        );


        firstArea =
          false;

      }


      studentAcsAreaList.appendChild(
        areaElement
      );

    }
  );

}


/* ==========================================================
   AREA
========================================================== */

function createStudentAcsArea(
  area
) {

  const element =
    document.createElement(
      "section"
    );


  element.className =
    "student-acs-area";


  const proficient =
    area.tasks.filter(
      task =>
        getDashboardAcsStatus(
          task.id
        ) ===
        "proficient"
    ).length;


  element.innerHTML =
    `
      <div
        class="student-acs-area-header"
        role="button"
        tabindex="0"
      >

        <div class="student-acs-area-heading">

          <span>
            Area ${escapeDashboardHtml(
              area.code
            )}
          </span>

          <strong>
            ${escapeDashboardHtml(
              area.name
            )}
          </strong>

        </div>


        <div class="student-acs-area-summary">

          <span>
            ${proficient}
            /
            ${area.tasks.length}
            proficient
          </span>

          <span
            class="student-acs-area-arrow"
            aria-hidden="true"
          >
            →
          </span>

        </div>

      </div>


      <div class="student-acs-task-list">
      </div>
    `;


  const header =
    element.querySelector(
      ".student-acs-area-header"
    );


  const taskList =
    element.querySelector(
      ".student-acs-task-list"
    );


  const toggle =
    () => {

      element.classList.toggle(
        "is-open"
      );

    };


  header.addEventListener(
    "click",
    toggle
  );


  header.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();


        toggle();

      }

    }
  );


  area.tasks.forEach(
    task => {

      taskList.appendChild(
        createStudentAcsTask(
          task
        )
      );

    }
  );


  return element;

}


/* ==========================================================
   TASK
========================================================== */

function createStudentAcsTask(
  task
) {

  const progress =
    dashboardAcsProgress.get(
      task.id
    );


  const status =
    progress?.status ||
    "not_started";


  const statusInfo =
    getDashboardAcsStatusInfo(
      status
    );


  const element =
    document.createElement(
      "div"
    );


  element.className =
    "student-acs-task";


  element.innerHTML =
    `
      <div class="student-acs-task-main">

        <span class="student-acs-task-code">
          ${escapeDashboardHtml(
            task.task_code
          )}
        </span>


        <div class="student-acs-task-copy">

          <strong>
            ${escapeDashboardHtml(
              task.task_name
            )}
          </strong>

          <span>
            ${
              progress?.last_assessed
                ? `Last assessed ${escapeDashboardHtml(
                    formatStudentDate(
                      progress.last_assessed
                    )
                  )}`
                : "Not yet assessed"
            }
          </span>

        </div>

      </div>


      <span
        class="
          student-acs-status
          ${statusInfo.className}
        "
      >
        ${statusInfo.label}
      </span>
    `;


  return element;

}


/* ==========================================================
   HELPERS
========================================================== */

function getDashboardAcsStatus(
  taskId
) {

  return (
    dashboardAcsProgress
      .get(taskId)
      ?.status ||
    "not_started"
  );

}


function getDashboardAcsStatusInfo(
  status
) {

  switch (status) {

    case "introduced":

      return {
        label:
          "Introduced",

        className:
          "is-introduced"
      };


    case "developing":

      return {
        label:
          "Developing",

        className:
          "is-developing"
      };


    case "proficient":

      return {
        label:
          "Proficient",

        className:
          "is-proficient"
      };


    default:

      return {
        label:
          "Not Started",

        className:
          "is-not-started"
      };

  }

}

initializeDashboard();