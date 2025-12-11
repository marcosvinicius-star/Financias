// ======================================================
// TAGS MANAGER - Sistema de Etiquetas
// ======================================================

const Tags = {
    list() {
        const user = Auth.current();
        if (!user) return [];
        return user.tags || [];
    },

    add(name, color = null) {
        const user = Auth.current();
        if (!user) return { success: false, message: "Não autenticado" };

        if (!user.tags) user.tags = [];

        // Verificar se já existe
        if (user.tags.find(t => t.name.toLowerCase() === name.toLowerCase())) {
            return { success: false, message: "Tag já existe" };
        }

        const colors = [
            '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
            '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'
        ];

        const newTag = {
            id: Date.now().toString(36),
            name: name.trim(),
            color: color || colors[user.tags.length % colors.length],
            created: new Date().toISOString()
        };

        user.tags.push(newTag);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true, data: newTag };
    },

    remove(id) {
        const user = Auth.current();
        if (!user) return { success: false };

        user.tags = (user.tags || []).filter(t => t.id !== id);
        
        // Remover tags das transações
        user.transactions?.forEach(t => {
            if (t.tags) {
                t.tags = t.tags.filter(tagId => tagId !== id);
            }
        });

        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true };
    }
};

