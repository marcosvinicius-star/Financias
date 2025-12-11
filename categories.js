// ======================================================
// CATEGORY MANAGER
// ======================================================

const Categories = {

    list(type) {
        const user = Auth.current();
        return user ? user.categories[type] : [];
    },

    add(type, name) {
        const user = Auth.current();
        if (!user) return false;

        if (!user.categories[type].includes(name)) {
            user.categories[type].push(name);
            Storage.saveUserData(Storage.getCurrentUser(), user);
            return true;
        }

        return false;
    }
};
