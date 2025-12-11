// ======================================================
// PDF EXPORT MANAGER
// ======================================================

const PDFExport = {
    generateReport(data, month) {
        const monthName = new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const user = Auth.current();
        
        // Criar conteúdo HTML para o PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Relatório Financeiro - ${monthName}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                    h1 { color: #6366f1; border-bottom: 3px solid #6366f1; padding-bottom: 10px; }
                    h2 { color: #4b5563; margin-top: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                    th { background: #f3f4f6; font-weight: 600; }
                    .summary { display: flex; gap: 20px; margin: 20px 0; }
                    .summary-box { flex: 1; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px; }
                    .positive { color: #10b981; font-weight: 700; }
                    .negative { color: #ef4444; font-weight: 700; }
                    .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <h1>Relatório Financeiro - ${monthName}</h1>
                <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} para ${user.profile.name}</p>
                
                <div class="summary">
                    <div class="summary-box">
                        <h3>Gastos</h3>
                        <p class="negative" style="font-size: 24px;">R$ ${data.summary.gastos.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="summary-box">
                        <h3>Receitas</h3>
                        <p class="positive" style="font-size: 24px;">R$ ${data.summary.receitas.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="summary-box">
                        <h3>Saldo</h3>
                        <p class="${data.summary.saldo >= 0 ? 'positive' : 'negative'}" style="font-size: 24px;">R$ ${data.summary.saldo.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>

                <h2>Gastos por Categoria</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Valor</th>
                            <th>Percentual</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(data.gastosPorCategoria)
                            .sort((a, b) => b[1] - a[1])
                            .map(([cat, val]) => {
                                const percent = ((val / data.summary.gastos) * 100).toFixed(1);
                                return `
                                    <tr>
                                        <td>${cat}</td>
                                        <td>R$ ${val.toFixed(2).replace('.', ',')}</td>
                                        <td>${percent}%</td>
                                    </tr>
                                `;
                            }).join('')}
                    </tbody>
                </table>

                <h2>Últimas Transações</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Tipo</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.transactions.slice(0, 20).map(t => `
                            <tr>
                                <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                <td>${t.description}</td>
                                <td>${t.category}</td>
                                <td>${t.type === 'gasto' ? 'Gasto' : 'Receita'}</td>
                                <td class="${t.type === 'gasto' ? 'negative' : 'positive'}">
                                    ${t.type === 'gasto' ? '-' : '+'}R$ ${t.amount.toFixed(2).replace('.', ',')}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>FinanceFlow - Controle de Gastos Pessoal</p>
                    <p>Relatório gerado automaticamente</p>
                </div>
            </body>
            </html>
        `;

        // Criar blob e abrir em nova janela para impressão
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                URL.revokeObjectURL(url);
            }, 250);
        };
    }
};

