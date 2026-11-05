const credentialsCount = document.querySelector("#credentialsCount");
const credentialsTableBody = document.querySelector("#credentialsTableBody");
const credentialRowTemplate = document.querySelector("#credentialRowTemplate");
const credentialsStatus = document.querySelector("#credentialsStatus");
const credentialsForm = document.querySelector("#credentialsForm");
const clearCredentialButton = document.querySelector("#clearCredentialButton");
const reloadCredentialsButton = document.querySelector("#reloadCredentialsButton");
const providerConnections = document.querySelector("#providerConnections");

let allCredentials = [];

const PROVIDERS = [
  {
    name: "Survey Merchandiser",
    url: "https://survey.com/",
    appUrl: "intent://open/#Intent;package=iSurvey.Android;end",
    help: "Open the official Survey Merchandiser site or app.",
  },
  {
    name: "Clickworker",
    url: "https://workplace.clickworker.com/",
    appUrl: "intent://open/#Intent;package=com.clickworker.clickworkerapp;end",
    help: "Open the official Clickworker Workplace sign-in.",
  },
  {
    name: "Field Nation",
    url: "https://fieldnation.com/",
    appUrl: "intent://open/#Intent;package=com.fieldnation.android;end",
    help: "Open the official Field Nation platform.",
  },
  {
    name: "Field Agent",
    url: "https://app.fieldagent.net/",
    appUrl: "intent://open/#Intent;package=net.fieldagent;end",
    help: "Open the official Field Agent site or app.",
  },
];

function setStatus(text) {
  if (credentialsStatus) credentialsStatus.textContent = text;
}

function updateCount() {
  if (credentialsCount) credentialsCount.textContent = String(allCredentials.length);
}

function clearForm() {
  if (!credentialsForm) return;
  credentialsForm.id.value = "";
  credentialsForm.app_name.value = "";
  credentialsForm.login_url.value = "";
  credentialsForm.username.value = "";
  credentialsForm.notes.value = "";
}

function renderProviderConnections() {
  if (!providerConnections) return;
  providerConnections.innerHTML = "";
  PROVIDERS.forEach((provider) => {
    const card = document.createElement("div");
    card.className = "callout provider-card";

    const title = document.createElement("strong");
    title.textContent = provider.name;
    const help = document.createElement("span");
    help.textContent = provider.help;

    const actions = document.createElement("div");
    actions.className = "actions";

    const openButton = document.createElement("a");
    openButton.className = "secondary-link";
    openButton.href = provider.url;
    openButton.target = "_blank";
    openButton.rel = "noopener noreferrer";
    openButton.textContent = "Open official sign-in";

    const appButton = document.createElement("a");
    appButton.className = "secondary-link";
    appButton.href = provider.appUrl;
    appButton.textContent = "Open phone app";

    const setupButton = document.createElement("button");
    setupButton.type = "button";
    setupButton.className = "secondary tiny";
    setupButton.textContent = "Add connection";
    setupButton.addEventListener("click", () => {
      credentialsForm.app_name.value = provider.name;
      credentialsForm.login_url.value = provider.url;
      credentialsForm.username.focus();
      setStatus(`${provider.name} selected. Sign in at the official site, then save only the local metadata you want to keep.`);
      credentialsForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    actions.append(appButton, openButton, setupButton);
    card.append(title, help, actions);
    providerConnections.appendChild(card);
  });
}

function fillForm(credential) {
  if (!credentialsForm || !credential) return;
  credentialsForm.id.value = credential.id || "";
  credentialsForm.app_name.value = credential.app_name || "";
  credentialsForm.login_url.value = credential.login_url || "";
  credentialsForm.username.value = credential.username || "";
  credentialsForm.notes.value = credential.notes || "";
}

function render() {
  if (!credentialsTableBody || !credentialRowTemplate) return;
  credentialsTableBody.innerHTML = "";
  allCredentials.forEach((credential) => {
    const row = credentialRowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".cred-app").textContent = credential.app_name || "—";
    row.querySelector(".cred-url").textContent = credential.login_url || "—";
    row.querySelector(".cred-user").textContent = credential.username || "—";
    row.querySelector(".cred-notes").textContent = credential.notes || "—";
    row.querySelector(".cred-status").textContent = credential.has_password ? "Encrypted locally" : "No password";

    const actions = row.querySelector(".cred-actions");
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary tiny";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      fillForm(credential);
      setStatus(`Editing ${credential.app_name || "credential"}. Enter a new password only if you want to change it.`);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger tiny";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async () => {
      if (!confirm(`Delete ${credential.app_name || "this credential"}?`)) return;
      await saveCredential({ action: "delete", id: credential.id });
    });

    actions.append(editButton, deleteButton);
    credentialsTableBody.appendChild(row);
  });
  updateCount();
}

async function loadCredentials() {
  setStatus("Loading");
  const response = await fetch("/api/credentials", { credentials: "include" });
  if (response.status === 401) {
    window.location.href = "/login";
    return;
  }
  const payload = await response.json();
  allCredentials = payload.credentials || [];
  setStatus(allCredentials.length ? `${allCredentials.length} saved login(s)` : "No saved logins");
  render();
}

async function saveCredential(extra = {}) {
  setStatus("Saving");
  const response = await fetch("/api/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      action: extra.action || "upsert",
      id: extra.id || credentialsForm.id.value.trim(),
      app_name: credentialsForm.app_name.value.trim(),
      login_url: credentialsForm.login_url.value.trim(),
      username: credentialsForm.username.value.trim(),
      password: "",
      notes: credentialsForm.notes.value.trim(),
    }),
  });
  if (response.status === 401) {
    window.location.href = "/login";
    return;
  }
  const payload = await response.json();
  allCredentials = payload.credentials || allCredentials;
  setStatus(allCredentials.length ? `${allCredentials.length} saved login(s)` : "No saved logins");
  render();
  clearForm();
}

if (credentialsForm) {
  credentialsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveCredential();
  });
}

clearCredentialButton?.addEventListener("click", clearForm);
reloadCredentialsButton?.addEventListener("click", loadCredentials);

renderProviderConnections();
loadCredentials();
