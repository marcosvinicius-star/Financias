// ======================================================
// APP INITIALIZATION
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const app = document.getElementById("app-wrapper");
    const loginWrapper = document.getElementById("login-wrapper");

    // Verificar se já está logado
    if (Auth.current()) {
        if (loginWrapper) {
            loginWrapper.style.display = "none";
            loginWrapper.setAttribute("aria-hidden", "true");
        }
        if (app) {
            app.style.display = "flex";
            app.setAttribute("aria-hidden", "false");
        }
        UI.loadUser();
        
        // Verificar e executar recorrências diariamente
        Recurrences.checkAndExecute();
        
        // Verificar alertas
        const triggeredAlerts = Alerts.checkAlerts();
        if (triggeredAlerts.length > 0) {
            triggeredAlerts.forEach(alert => {
                UI.showToast('info', alert.title + (alert.message ? ': ' + alert.message : ''));
            });
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const userInput = document.getElementById("login-name");
            const passInput = document.getElementById("login-pass");

            if (!userInput || !passInput) return;

            const user = userInput.value.trim();
            const pass = passInput.value.trim();

            if (!user || !pass) {
                UI.showToast('error', 'Preencha usuário e senha');
                return;
            }

            let result = Auth.login(user, pass);

            if (!result.success) {
                const reg = Auth.register(user, pass);
                if (!reg.success) {
                    UI.showToast('error', reg.message);
                    return;
                }

                UI.showToast('success', 'Conta criada! Bem-vindo ao FinanceFlow.');
                // Login automático após registro
                Auth.login(user, pass);
            }

            if (loginWrapper) {
                loginWrapper.style.display = "none";
                loginWrapper.setAttribute("aria-hidden", "true");
            }
            if (app) {
                app.style.display = "flex";
                app.setAttribute("aria-hidden", "false");
            }

            UI.loadUser();
        });
    }

    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            Auth.logout();
            location.reload();
        };
    }
});
