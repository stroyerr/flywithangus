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


    await loadProfile(user);


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