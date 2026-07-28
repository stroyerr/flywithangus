const SUPABASE_URL =
  "https://fqmnegjxnznadcqowguz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "YOUR_ACTUAL_PUBLISHABLE_KEY";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


const form =
  document.getElementById("reset-password-form");

const newPassword =
  document.getElementById("new-password");

const confirmPassword =
  document.getElementById("confirm-password");

const submitButton =
  document.getElementById("reset-password-submit");

const message =
  document.getElementById("reset-message");


let recoveryReady = false;


/* ==========================================================
   MESSAGES
========================================================== */

function showMessage(text, type = "error") {

  message.textContent = text;

  message.classList.toggle(
    "is-success",
    type === "success"
  );

}


/* ==========================================================
   AUTH / RECOVERY
========================================================== */

/*
  Listen for Supabase processing the recovery link.
*/

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    console.log(
      "Auth event:",
      event
    );

    if (
      event === "PASSWORD_RECOVERY" ||
      (event === "INITIAL_SESSION" && session)
    ) {

      recoveryReady = true;

      submitButton.disabled = false;

    }

  }
);


/*
  Also support recovery links using ?code=...
*/

async function initializeRecovery() {

  submitButton.disabled = true;

  const params =
    new URLSearchParams(
      window.location.search
    );

  const code =
    params.get("code");


  if (code) {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .exchangeCodeForSession(code);


    if (error) {

      console.error(
        "Code exchange error:",
        error
      );

      showMessage(
        "This password reset link could not be verified. Request a new reset email."
      );

      return;
    }


    if (data.session) {

      recoveryReady = true;

      submitButton.disabled = false;


      /*
        Remove the auth code from the address bar.
      */

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

    }

    return;
  }


  /*
    For the normal recovery flow, Supabase may already
    have created the temporary session from the URL.
  */

  const {
    data: { session }
  } =
    await supabaseClient.auth.getSession();


  if (session) {

    recoveryReady = true;

    submitButton.disabled = false;

  } else {

    /*
      Give Supabase a moment to process the URL and fire
      PASSWORD_RECOVERY.
    */

    setTimeout(
      () => {

        if (!recoveryReady) {

          showMessage(
            "Waiting for password reset authorization…"
          );

        }

      },
      1000
    );

  }

}


/* ==========================================================
   UPDATE PASSWORD
========================================================== */

form.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    showMessage("");


    if (!form.reportValidity()) {
      return;
    }


    if (
      newPassword.value !==
      confirmPassword.value
    ) {

      showMessage(
        "Passwords do not match."
      );

      confirmPassword.focus();

      return;
    }


    if (!recoveryReady) {

      showMessage(
        "This reset session is not ready. Please request a new password reset email."
      );

      return;
    }


    submitButton.disabled = true;

    submitButton.textContent =
      "Updating…";


    try {

      const { error } =
        await supabaseClient.auth
          .updateUser({
            password:
              newPassword.value
          });


      if (error) {

        console.error(
          "Password update error:",
          error
        );

        showMessage(
          error.message ||
          "Could not update your password."
        );

        return;
      }


      showMessage(
        "Password updated successfully. Redirecting…",
        "success"
      );


      setTimeout(
        async () => {

          await supabaseClient.auth.signOut();

          window.location.replace(
            "/students.html"
          );

        },
        1200
      );


    } catch (error) {

      console.error(error);

      showMessage(
        "Something went wrong. Please try again."
      );


    } finally {

      submitButton.disabled = false;

      submitButton.textContent =
        "Update password";

    }

  }
);


initializeRecovery();