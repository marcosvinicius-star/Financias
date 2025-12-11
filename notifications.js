// ======================================================
// NOTIFICATIONS MANAGER
// ======================================================

const Notifications = {

    list() {
        const user = Auth.current();
        return user.notifications;
    },

    push(type, msg) {
        const user = Auth.current();

        const n = {
            id: Date.now().toString(36),
            type,
            message: msg,
            date: new Date().toISOString(),
            read: false
        };

        user.notifications.unshift(n);
        Storage.saveUserData(Storage.getCurrentUser(), user);
    }
};
