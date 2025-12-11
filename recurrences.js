// ======================================================
// RECURRENCES MANAGER - Transações Recorrentes
// ======================================================

const Recurrences = {
    list() {
        const user = Auth.current();
        if (!user) return [];
        return user.recurrences || [];
    },

    add(recurrence) {
        const user = Auth.current();
        if (!user) return { success: false, message: "Não autenticado" };

        if (!user.recurrences) user.recurrences = [];

        const newRecurrence = {
            id: Date.now().toString(36),
            ...recurrence,
            created: new Date().toISOString(),
            lastExecuted: null,
            nextExecution: this.calculateNextExecution(recurrence.frequency, recurrence.day),
            active: true
        };

        user.recurrences.push(newRecurrence);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true, data: newRecurrence };
    },

    remove(id) {
        const user = Auth.current();
        if (!user) return { success: false };

        user.recurrences = (user.recurrences || []).filter(r => r.id !== id);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true };
    },

    update(id, data) {
        const user = Auth.current();
        if (!user) return { success: false };

        const recurrence = user.recurrences?.find(r => r.id === id);
        if (!recurrence) return { success: false };

        Object.assign(recurrence, data);
        if (data.frequency || data.day) {
            recurrence.nextExecution = this.calculateNextExecution(
                recurrence.frequency, 
                recurrence.day
            );
        }

        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true };
    },

    toggle(id) {
        const user = Auth.current();
        if (!user) return { success: false };

        const recurrence = user.recurrences?.find(r => r.id === id);
        if (!recurrence) return { success: false };

        recurrence.active = !recurrence.active;
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true };
    },

    calculateNextExecution(frequency, day) {
        const now = new Date();
        const next = new Date();

        switch(frequency) {
            case 'daily':
                next.setDate(now.getDate() + 1);
                break;
            case 'weekly':
                const daysUntil = (day - now.getDay() + 7) % 7 || 7;
                next.setDate(now.getDate() + daysUntil);
                break;
            case 'monthly':
                next.setMonth(now.getMonth() + 1);
                next.setDate(day || now.getDate());
                break;
            case 'yearly':
                next.setFullYear(now.getFullYear() + 1);
                if (day) {
                    const month = Math.floor(day / 100);
                    const dayOfMonth = day % 100;
                    next.setMonth(month - 1);
                    next.setDate(dayOfMonth);
                }
                break;
        }

        return next.toISOString().slice(0, 10);
    },

    checkAndExecute() {
        const user = Auth.current();
        if (!user || !user.recurrences) return;

        const today = new Date().toISOString().slice(0, 10);
        const activeRecurrences = user.recurrences.filter(r => r.active && r.nextExecution <= today);

        activeRecurrences.forEach(recurrence => {
            // Criar transação
            Transactions.add({
                type: recurrence.type,
                category: recurrence.category,
                description: recurrence.description,
                amount: recurrence.amount,
                date: today
            });

            // Atualizar próxima execução
            recurrence.lastExecuted = today;
            recurrence.nextExecution = this.calculateNextExecution(
                recurrence.frequency,
                recurrence.day
            );
        });

        if (activeRecurrences.length > 0) {
            Storage.saveUserData(Storage.getCurrentUser(), user);
        }
    }
};

