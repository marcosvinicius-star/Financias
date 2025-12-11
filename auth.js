// ======================================================
// AUTH MANAGER
// ======================================================

const Auth = {
    register(username, password) {
        const users = Storage.getUsers();

        if (users[username]) {
            return { success: false, message: "Usuário já existe" };
        }

        users[username] = {
            password,
            profile: {
                name: username,
                email: "",
                created: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            },
            transactions: [],
            categories: {
                gastos: ["Alimentação", "Transporte", "Moradia", "Saúde"],
                receitas: ["Salário", "Freelance", "Investimentos"]
            },
            goals: [],
            budgets: [],
            notifications: [],
            recurrences: [],
            tags: [],
            accounts: [{ id: 'default', name: 'Conta Principal', balance: 0, type: 'checking', color: '#3b82f6' }],
            alerts: [],
            savedFilters: [],
            settings: {
                currency: "BRL",
                theme: "light",
                dateFormat: "DD/MM/YYYY",
                language: "pt-BR",
                monthlyBudget: 2000,
                savingsGoal: 500
            }
        };

        Storage.saveUsers(users);
        return { success: true };
    },

    login(username, password) {
        const users = Storage.getUsers();

        if (!users[username]) {
            return { success: false, message: "Usuário não existe" };
        }

        if (users[username].password !== password) {
            return { success: false, message: "Senha incorreta" };
        }

        users[username].profile.lastLogin = new Date().toISOString();
        Storage.saveUsers(users);
        Storage.setCurrentUser(username);

        return { success: true, user: users[username] };
    },

    logout() {
        Storage.clearCurrentUser();
    },

    current() {
        const username = Storage.getCurrentUser();
        return username ? Storage.getUserData(username) : null;
    }
};
