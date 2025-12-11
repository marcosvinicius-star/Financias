// ======================================================
// TRANSACTION MANAGER
// ======================================================

const Transactions = {

    list(filters = {}) {
        const user = Auth.current();
        if (!user) return [];

        let items = [...user.transactions];

        if (filters.type)
            items = items.filter(t => t.type === filters.type);

        if (filters.category)
            items = items.filter(t => t.category === filters.category);

        if (filters.month)
            items = items.filter(t => t.date.startsWith(filters.month));

        if (filters.search) {
            const s = filters.search.toLowerCase();
            items = items.filter(t =>
                t.description.toLowerCase().includes(s)
            );
        }

        return items;
    },

    add(data) {
        const user = Auth.current();
        if (!user) return false;

        const t = {
            id: Date.now().toString(36),
            description: data.description,
            amount: parseFloat(data.amount),
            date: data.date,
            type: data.type,
            category: data.category,
            status: "pago",
            notes: data.notes || '',
            created: new Date().toISOString()
        };

        user.transactions.unshift(t);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return true;
    },

    remove(id) {
        const user = Auth.current();
        if (!user) return false;

        user.transactions = user.transactions.filter(t => t.id !== id);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return true;
    },

    update(id, data) {
        const user = Auth.current();
        if (!user) return false;

        const index = user.transactions.findIndex(t => t.id === id);
        if (index === -1) return false;

        user.transactions[index] = {
            ...user.transactions[index],
            ...data,
            id: user.transactions[index].id, // Manter o ID original
            updated: new Date().toISOString()
        };

        Storage.saveUserData(Storage.getCurrentUser(), user);
        return true;
    },

    duplicate(id) {
        const user = Auth.current();
        if (!user) return false;

        const original = user.transactions.find(t => t.id === id);
        if (!original) return false;

        const duplicate = {
            ...original,
            id: Date.now().toString(36),
            date: new Date().toISOString().slice(0, 10),
            created: new Date().toISOString(),
            description: original.description + ' (cópia)'
        };

        user.transactions.push(duplicate);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return true;
    },

    getById(id) {
        const user = Auth.current();
        if (!user) return null;

        return user.transactions.find(t => t.id === id) || null;
    }
};
