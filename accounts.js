// ======================================================
// ACCOUNTS MANAGER - Múltiplas Contas/Carteiras
// ======================================================

const Accounts = {
    list() {
        const user = Auth.current();
        if (!user) return [];
        return user.accounts || [{ id: 'default', name: 'Conta Principal', balance: 0 }];
    },

    add(account) {
        const user = Auth.current();
        if (!user) return { success: false, message: "Não autenticado" };

        if (!user.accounts) user.accounts = [{ id: 'default', name: 'Conta Principal', balance: 0 }];

        const newAccount = {
            id: Date.now().toString(36),
            name: account.name.trim(),
            balance: account.balance || 0,
            type: account.type || 'checking',
            color: account.color || '#3b82f6',
            created: new Date().toISOString()
        };

        user.accounts.push(newAccount);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true, data: newAccount };
    },

    remove(id) {
        const user = Auth.current();
        if (!user) return { success: false, message: "Não pode remover conta padrão" };

        if (id === 'default') {
            return { success: false, message: "Não pode remover conta padrão" };
        }

        // Mover transações para conta padrão
        user.transactions?.forEach(t => {
            if (t.accountId === id) {
                t.accountId = 'default';
            }
        });

        user.accounts = user.accounts.filter(a => a.id !== id);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true };
    },

    update(id, data) {
        const user = Auth.current();
        if (!user) return { success: false };

        const account = user.accounts?.find(a => a.id === id);
        if (!account) return { success: false };

        Object.assign(account, data);
        Storage.saveUserData(Storage.getCurrentUser(), user);
        return { success: true };
    },

    getBalance(id) {
        const user = Auth.current();
        if (!user) return 0;

        const account = user.accounts?.find(a => a.id === id);
        if (!account) return 0;

        const transactions = (user.transactions || []).filter(t => t.accountId === id);
        const income = transactions
            .filter(t => t.type === 'receita')
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
            .filter(t => t.type === 'gasto')
            .reduce((sum, t) => sum + t.amount, 0);

        return account.balance + income - expenses;
    }
};

