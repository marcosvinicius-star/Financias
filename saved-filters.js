// ======================================================
// SAVED FILTERS MANAGER - Filtros Salvos
// ======================================================

const SavedFilters = {
    list() {
        const user = Auth.current();
        if (!user) return [];
        return user.savedFilters || [];
    },

    add(filter) {
        const user = Auth.current();
        if (!user) return { success: false, message: "Não autenticado" };

        if (!user.savedFilters) user.savedFilters = [];

        const newFilter = {
            id: Date.now().toString(36),
            name: filter.name.trim(),
            filters: filter.filters,
            created: new Date().toISOString()
        };

        user.savedFilters.push(newFilter);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true, data: newFilter };
    },

    remove(id) {
        const user = Auth.current();
        if (!user) return { success: false };

        user.savedFilters = (user.savedFilters || []).filter(f => f.id !== id);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true };
    },

    apply(id) {
        const user = Auth.current();
        if (!user) return null;

        const filter = user.savedFilters?.find(f => f.id === id);
        return filter ? filter.filters : null;
    }
};

