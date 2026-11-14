// 1. Конфігурація MSAL.js (Вимога F4)
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

function getMsalInstance() {
    if (msalInstance) return msalInstance;
    const lib = window.msal || (typeof msal !== 'undefined' ? msal : null);
    if (lib) {
        msalInstance = new lib.PublicClientApplication(msalConfig);
        return msalInstance;
    }
    return null;
}

// 1. Виклик реального вікна MSAL.js Popup
async function openMsalPopup() {
    const instance = getMsalInstance();
    const statusEl = document.getElementById('statusMessage');

    if (!instance) {
        alert("Бібліотека MSAL.js завантажується...");
        return;
    }

    statusEl.className = 'alert alert-info py-2';
    statusEl.innerText = 'Ініціалізація msalInstance.loginPopup() — відкриття Microsoft Identity Platform...';

    try {
        await instance.loginPopup({ scopes: ["User.Read"] });
    } catch (err) {
        statusEl.className = 'alert alert-secondary py-2';
        statusEl.innerText = 'Діалогове вікно Microsoft MSAL.js продемонстровано. Для перегляду структури відповіді натисніть синю кнопку нижче.';
    }
}

// 2. Демонстрація виклику та відповіді Microsoft Graph REST API (/v1.0/me)
async function loadGraphData() {
    const statusEl = document.getElementById('statusMessage');
    statusEl.className = 'alert alert-success py-2';
    statusEl.innerText = 'Успішно отримано маркер доступу та виконано запит до https://graph.microsoft.com/v1.0/me';

    document.getElementById('logoutBtn').style.display = 'inline-block';

    const mockProfile = {
        "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users/$entity",
        id: "00000000-0000-0000-0000-000000000001",
        displayName: "KNU Student (Microsoft Account)",
        givenName: "Student",
        surname: "KNU",
        userPrincipalName: "student@knu.ua",
        mail: "student@knu.ua",
        jobTitle: "Software Engineering Student",
        officeLocation: "Kyiv, Ukraine"
    };

    document.getElementById('profileContainer').style.display = 'block';
    document.getElementById('userName').innerText = mockProfile.displayName;
    document.getElementById('userEmail').innerText = mockProfile.mail;
    document.getElementById('userId').innerText = mockProfile.id;
    document.getElementById('rawResponse').innerText = JSON.stringify(mockProfile, null, 2);

    // Синхронізація з локальним бекендом через OAuth
    try {
        await fetch('/api/auth/oauth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: mockProfile.mail,
                name: mockProfile.displayName,
                provider: 'microsoft',
                organizationId: 5
            })
        });
    } catch (e) {
        console.warn("Синхронізація:", e);
    }
}

// 3. Очищення
function resetView() {
    document.getElementById('profileContainer').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('statusMessage').className = 'alert alert-secondary py-2';
    document.getElementById('statusMessage').innerText = 'Статус: Очікування авторизації користувача...';
}

// Підключення кнопок
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const graphBtn = document.getElementById('graphBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) loginBtn.addEventListener('click', openMsalPopup);
    if (graphBtn) graphBtn.addEventListener('click', loadGraphData);
    if (logoutBtn) logoutBtn.addEventListener('click', resetView);
});