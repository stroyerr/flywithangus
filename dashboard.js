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

  const studentLessonList =
  document.getElementById(
    "student-lesson-list"
  );

const studentLessonCount =
  document.getElementById(
    "student-lesson-count"
  );

const studentTotalFlight =
  document.getElementById(
    "student-total-flight"
  );

const studentTotalGround =
  document.getElementById(
    "student-total-ground"
  );

const studentTotalSim =
  document.getElementById(
    "student-total-sim"
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

    await Promise.all([
  loadProfile(user),
  loadEndorsements(user),
  loadStudentLessons(user)
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
   STUDENT LESSON HISTORY
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
        billing_status
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
      );


  if (error) {

    console.error(
      "Lesson load error:",
      error
    );


    studentLessonList.innerHTML =
      `
        <div class="dashboard-empty-state">
          Lesson history could not be loaded.
        </div>
      `;


    return;
  }


  const lessons =
    data || [];


  studentLessonCount.textContent =
    lessons.length;


  updateStudentLessonTotals(
    lessons
  );


  renderStudentLessons(
    lessons
  );

}


/* ==========================================================
   TOTALS
========================================================== */

function updateStudentLessonTotals(
  lessons
) {

  const totals =
    lessons.reduce(
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


  studentTotalFlight.textContent =
    totals.flight.toFixed(1);


  studentTotalGround.textContent =
    totals.ground.toFixed(1);


  studentTotalSim.textContent =
    totals.sim.toFixed(1);

}


/* ==========================================================
   RENDER
========================================================== */

function renderStudentLessons(
  lessons
) {

  studentLessonList.innerHTML =
    "";


  if (!lessons.length) {

    studentLessonList.innerHTML =
      `
        <div class="dashboard-empty-state">
          No lessons recorded yet.
        </div>
      `;


    return;
  }


  lessons.forEach(
    lesson => {

      const item =
        document.createElement(
          "article"
        );


      item.className =
        "student-lesson-item";


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


          ${
            lesson.amount_charged !== null ||
            lesson.payment_receipt_number ||
            lesson.billing_status
              ? `
                  <div class="student-lesson-payment">

                    <span
                      class="student-lesson-payment-status ${payment.className}"
                    >
                      ${payment.label}
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


      studentLessonList.appendChild(
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

initializeDashboard();