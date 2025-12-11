// ======================================================
// GOALS MANAGER
// ======================================================

const Goals = {

    list() {
        const user = Auth.current();
        return user ? (user.goals || []) : [];
    },

    add(goal) {
        const user = Auth.current();
        if (!user) return false;

        if (!user.goals) user.goals = [];

        goal.id = Date.now().toString(36);
        goal.current = goal.current || 0;

        user.goals.push(goal);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return true;
    },

    remove(id) {
        const user = Auth.current();
        if (!user || !user.goals) return false;

        user.goals = user.goals.filter(g => g.id !== id);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return true;
    }
};
