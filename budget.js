// ======================================================
// BUDGET MANAGER
// ======================================================

const Budget = {

    getMonthly() {
        const user = Auth.current();
        return user && user.settings ? (user.settings.monthlyBudget || 0) : 0;
    },

    setMonthly(value) {
        const user = Auth.current();
        if (!user) return false;
        
        if (!user.settings) user.settings = {};
        user.settings.monthlyBudget = parseFloat(value);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return true;
    },

    summary(month) {
        const list = Transactions.list({ month });

        const spent = list
            .filter(t => t.type === "gasto")
            .reduce((a, b) => a + b.amount, 0);

        const budget = this.getMonthly();

        return {
            budget,
            spent,
            remaining: budget - spent,
            percent: (spent / budget) * 100
        };
    }
};
