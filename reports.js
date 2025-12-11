// ======================================================
// REPORTS MANAGER
// ======================================================

const Reports = {

    monthSummary(month) {
        const list = Transactions.list({ month });

        const gastos = list
            .filter(t => t.type === "gasto")
            .reduce((a, b) => a + b.amount, 0);

        const receitas = list
            .filter(t => t.type === "receita")
            .reduce((a, b) => a + b.amount, 0);

        return {
            gastos,
            receitas,
            saldo: receitas - gastos
        };
    }
};
