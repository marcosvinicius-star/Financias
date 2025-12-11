// ======================================================
// STORAGE MANAGER (LocalStorage)
// ======================================================

const Storage = {
    USERS_KEY: "financeflow_users",
    CURRENT_KEY: "financeflow_current_user",

    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.USERS_KEY)) || {};
        } catch {
            return {};
        }
    },

    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },

    getCurrentUser() {
        return localStorage.getItem(this.CURRENT_KEY);
    },

    setCurrentUser(username) {
        localStorage.setItem(this.CURRENT_KEY, username);
    },

    clearCurrentUser() {
        localStorage.removeItem(this.CURRENT_KEY);
    },

    getUserData(username) {
        const users = this.getUsers();
        return users[username] || null;
    },

    saveUserData(username, data) {
        const users = this.getUsers();
        users[username] = data;
        this.saveUsers(users);
    }
};
