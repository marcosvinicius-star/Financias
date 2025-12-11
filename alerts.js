// ======================================================
// ALERTS MANAGER - Alertas e Lembretes
// ======================================================

const Alerts = {
    list() {
        const user = Auth.current();
        if (!user) return [];
        return user.alerts || [];
    },

    add(alert) {
        const user = Auth.current();
        if (!user) return { success: false, message: "Não autenticado" };

        if (!user.alerts) user.alerts = [];

        const newAlert = {
            id: Date.now().toString(36),
            title: alert.title.trim(),
            message: alert.message || '',
            type: alert.type || 'info',
            condition: alert.condition || 'always',
            threshold: alert.threshold || 0,
            active: true,
            created: new Date().toISOString(),
            lastTriggered: null
        };

        user.alerts.push(newAlert);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true, data: newAlert };
    },

    remove(id) {
        const user = Auth.current();
        if (!user) return { success: false };

        user.alerts = (user.alerts || []).filter(a => a.id !== id);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true };
    },

    toggle(id) {
        const user = Auth.current();
        if (!user) return { success: false };

        const alert = user.alerts?.find(a => a.id === id);
        if (!alert) return { success: false };

        alert.active = !alert.active;
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true };
    },

    checkAlerts() {
        const user = Auth.current();
        if (!user || !user.alerts) return [];

        const triggered = [];
        const month = new Date().toISOString().slice(0, 7);
        const summary = Reports.monthSummary(month);

        user.alerts.filter(a => a.active).forEach(alert => {
            let shouldTrigger = false;

            switch(alert.condition) {
                case 'budget_exceeded':
                    shouldTrigger = summary.spent > summary.budget;
                    break;
                case 'low_balance':
                    shouldTrigger = summary.saldo < alert.threshold;
                    break;
                case 'high_expense':
                    shouldTrigger = summary.gastos > alert.threshold;
                    break;
                case 'goal_reached':
                    // Implementar lógica de metas
                    break;
            }

            if (shouldTrigger && alert.lastTriggered !== month) {
                alert.lastTriggered = month;
                triggered.push(alert);
            }
        });

        if (triggered.length > 0) {
            Storage.saveUserData(Storage.getCurrentUser(), user);
        }

        return triggered;
    }
};

