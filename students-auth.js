/*
  Fly With Angus — Student Portal Authentication

  SETUP:
  1. Replace SUPABASE_URL with your Supabase project URL.
  2. Replace SUPABASE_PUBLISHABLE_KEY with your Supabase publishable/anon key.
  3. Create student users in Supabase Authentication.
  4. Make sure /dashboard exists.
*/

const SUPABASE_URL = "https://fqmnegjxnznadcqowguz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Z7WY7-rSQ76LF7f9oOEDDA_umKno_D5";

const form = document.getElementById("student-login-form");
const emailInput = document.getElementById("student-email");
const passwordInput = document.getElementById("student-password");
const submitButton = document.getElementById("portal-submit");
const message = document.getElementById("portal-message");
const passwordToggle = document.getElementById("portal-password-toggle");

// Check whether Supabase credentials have been added.
const configured =
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_PUBLISHABLE_KEY !== "YOUR_SUPABASE_PUBLISHABLE_KEY";

let supabaseClient = null;

if (configured && window.supabase?.createClient) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
}

// Display messages below the login form.
function showMessage(text, type = "error") {
  if (!message) return;

  message.textContent = text;
  message.classList.toggle("is-success", type === "success");
}

// Change button state while authentication is happening.
function setLoading(isLoading) {
  if (!submitButton) return;

  submitButton.disabled = isLoading;

  const label = submitButton.querySelector("span:first-child");

  if (label) {
    label.textContent = isLoading ? "Signing in…" : "Sign in";
  }
}
const forgotPasswordButton =
  document.getElementById("forgot-password-button");

forgotPasswordButton?.addEventListener("click", async () => {

  showMessage("");

  const email = emailInput.value.trim();

  if (!email) {
    showMessage(
      "Enter your email address first, then click Forgot password."
    );

    emailInput.focus();
    return;
  }

  forgotPasswordButton.disabled = true;
  forgotPasswordButton.textContent = "Sending…";

  try {

    const redirectUrl =
      `${window.location.origin}/reset-password.html`;

    const { error } =
      await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: redirectUrl,
        }
      );

    if (error) {
      console.error(error);

      showMessage(
        "Could not send the reset email. Please try again."
      );

      return;
    }

    showMessage(
      "Password reset email sent. Check your inbox.",
      "success"
    );

  } catch (error) {

    console.error(error);

    showMessage(
      "Something went wrong. Please try again."
    );

  } finally {

    forgotPasswordButton.disabled = false;
    forgotPasswordButton.textContent = "Forgot password?";

  }

});

// Show/hide password.
passwordToggle?.addEventListener("click", () => {
  const showing = passwordInput.type === "text";

  passwordInput.type = showing ? "password" : "text";

  passwordToggle.textContent = showing ? "Show" : "Hide";

  passwordToggle.setAttribute(
    "aria-pressed",
    String(!showing)
  );

  passwordToggle.setAttribute(
    "aria-label",
    showing ? "Show password" : "Hide password"
  );

  passwordInput.focus();
});

// Handle login.
form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  showMessage("");

  // Use normal HTML validation first.
  if (!form.reportValidity()) {
    return;
  }

  // Supabase hasn't been connected yet.
  if (!configured || !supabaseClient) {
    showMessage(
      "Student portal authentication has not been connected yet."
    );
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  setLoading(true);

  try {
    const { error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      showMessage("Email or password not recognised.");
      return;
    }

    showMessage(
      "Signed in. Opening your dashboard…",
      "success"
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

const ADMIN_USER_ID = "964ff2ae-85f9-4a63-bf13-1005bba5e083";

if (user?.id === ADMIN_USER_ID) {
  window.location.replace("/admin.html");
} else {
  window.location.replace("/dashboard.html");
}

  } catch (error) {
    console.error(error);

    showMessage(
      "Something went wrong signing you in. Please try again."
    );

  } finally {
    setLoading(false);
  }
});