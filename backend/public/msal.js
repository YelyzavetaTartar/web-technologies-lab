// 1. Конфігурація MSAL.js
const msalConfig = {
    auth: {
        clientId: "0813e1d1-ad72-46a9-8665-399bba48c201",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin + "/msal"
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};

let msalInstance = null;
let accessToken = null;

// Безпечне отримання об'єкта msal
function getMsalInstance() {
    if (msalInstance) return msalInstance;
    const lib = window.msal || (typeof msal !== 'undefined' ? msal : null);
    if (lib) {
        msalInstance = new lib.PublicClientApplication(msalConfig);
        return msalInstance;
    }
    return null;
}

// 2. Вхід через Popup вікно Microsoft
async function signIn() {
    const instance = getMsalInstance();
    if (!instance) {
        alert("Помилка: бібліотека MSAL ще не завантажилася. Якщо у вас увімкнено AdBlock — вимкніть його для цього сайту.");
        return;
    }

    try {
        const loginResponse = await instance.loginPopup({
            scopes: ["User.Read"]
        });

        document.getElementById('statusMessage').className = 'alert alert-success py-2';
        document.getElementById('statusMessage').innerText = `Успішно авторизовано: ${loginResponse.account.username}`;

        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-block';
        document.getElementById('graphBtn').disabled = false;

        await callMicrosoftGraph();
    } catch (error) {
        console.error(error);
        document.getElementById('statusMessage').className = 'alert alert-danger py-2';
        document.getElementById('statusMessage').innerText = `Помилка входу: ${error.message}`;
    }
}

// 3. Запит до Microsoft Graph API
async function callMicrosoftGraph() {
    const instance = getMsalInstance();
    if (!instance) return;

    try {
        const accounts = instance.getAllAccounts();
        const tokenResponse = await instance.acquireTokenSilent({
            scopes: ["User.Read"],
            account: accounts[0]
        });

        accessToken = tokenResponse.accessToken;

        const graphResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const profileData = await graphResponse.json();

        document.getElementById('profileContainer').style.display = 'block';
        document.getElementById('userName').innerText = profileData.displayName || "Microsoft User";
        document.getElementById('userEmail').innerText = profileData.mail || profileData.userPrincipalName;
        document.getElementById('userId').innerText = profileData.id;
        document.getElementById('rawResponse').innerText = JSON.stringify(profileData, null, 2);

        // Синхронізуємо з нашим бекендом
        await fetch('/api/auth/oauth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: profileData.mail || profileData.userPrincipalName,
                name: profileData.displayName,
                provider: 'microsoft',
                organizationId: 5
            })
        });

    } catch (error) {
        console.error(error);
        document.getElementById('statusMessage').className = 'alert alert-warning py-2';
        document.getElementById('statusMessage').innerText = `Помилка запиту до Graph: ${error.message}`;
    }
}

// 4. Вихід
function signOut() {
    const instance = getMsalInstance();
    if (instance) instance.logoutPopup();
    window.location.reload();
}

// Підключення кнопок
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const graphBtn = document.getElementById('graphBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) loginBtn.addEventListener('click', signIn);
    if (graphBtn) graphBtn.addEventListener('click', callMicrosoftGraph);
    if (logoutBtn) logoutBtn.addEventListener('click', signOut);
});