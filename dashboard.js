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
      loadEndorsements(user)
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


initializeDashboard();