// ======================================================
// CHARTS MANAGER - GRÁFICOS AVANÇADOS
// ======================================================

let charts = {};

const Charts = {

    update(month) {
        this.updateMainChart(month);
        this.updateCategoriasChart(month);
        this.updateEvolucaoChart();
    },

    updateMainChart(month) {
        const ctx = document.getElementById("chart-gastos");
        if (!ctx) return;

        const list = Transactions.list({ month });

        const totalGasto = list
            .filter(t => t.type === "gasto")
            .reduce((a, b) => a + b.amount, 0);

        const totalReceita = list
            .filter(t => t.type === "receita")
            .reduce((a, b) => a + b.amount, 0);

        if (charts.main) charts.main.destroy();

        if (totalGasto === 0 && totalReceita === 0) {
            return;
        }

        charts.main = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Gastos", "Receitas"],
                datasets: [{
                    data: [totalGasto, totalReceita],
                    backgroundColor: ["#ef4444", "#10b981"],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: { size: 14, weight: '600', family: 'Space Grotesk' },
                            color: '#b8b8d4'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        padding: 12,
                        titleFont: { size: 14, weight: '600', family: 'Space Grotesk' },
                        bodyFont: { size: 13, family: 'DM Mono' },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    updateCategoriasChart(month) {
        const ctx = document.getElementById("chart-categorias");
        if (!ctx) return;

        const list = Transactions.list({ month });
        const gastosPorCategoria = {};

        list.filter(t => t.type === "gasto").forEach(t => {
            gastosPorCategoria[t.category] = (gastosPorCategoria[t.category] || 0) + t.amount;
        });

        const categorias = Object.keys(gastosPorCategoria).sort((a, b) => gastosPorCategoria[b] - gastosPorCategoria[a]).slice(0, 6);
        const valores = categorias.map(c => gastosPorCategoria[c]);

        if (charts.categorias) charts.categorias.destroy();

        if (categorias.length === 0) {
            return;
        }

        const colors = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#1e3a8a'].map(c => 
            c === '#ef4444' ? '#ef4444' : c
        );

        charts.categorias = new Chart(ctx, {
            type: "bar",
            data: {
                labels: categorias,
                datasets: [{
                    label: 'Gastos',
                    data: valores,
                    backgroundColor: [
                        '#3b82f6',
                        '#2563eb',
                        '#1d4ed8',
                        '#1e40af',
                        '#0ea5e9',
                        '#06b6d4'
                    ],
                    borderRadius: 12,
                    borderSkipped: false,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        padding: 12,
                        titleFont: { size: 14, weight: '600', family: 'Space Grotesk' },
                        bodyFont: { size: 13, family: 'DM Mono' },
                        callbacks: {
                            label: function(context) {
                                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#b8b8d4',
                            font: { family: 'DM Mono', size: 12 },
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        },
                        grid: { color: 'rgba(0, 217, 255, 0.1)' }
                    },
                    x: {
                        ticks: {
                            color: '#b8b8d4',
                            font: { family: 'Space Grotesk', size: 12 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    },

    updateEvolucaoChart() {
        const ctx = document.getElementById("chart-evolucao");
        if (!ctx) return;

        // Últimos 6 meses
        const meses = [];
        const gastosData = [];
        const receitasData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.toISOString().slice(0, 7);
            const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
            meses.push(monthName);

            const list = Transactions.list({ month });
            gastosData.push(list.filter(t => t.type === "gasto").reduce((a, b) => a + b.amount, 0));
            receitasData.push(list.filter(t => t.type === "receita").reduce((a, b) => a + b.amount, 0));
        }

        if (charts.evolucao) charts.evolucao.destroy();

        charts.evolucao = new Chart(ctx, {
            type: "line",
            data: {
                labels: meses,
                datasets: [{
                    label: 'Gastos',
                    data: gastosData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    tension: 0.5,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#0f0f23',
                    pointBorderWidth: 2
                }, {
                    label: 'Receitas',
                    data: receitasData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    tension: 0.5,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#0f172a',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { 
                            font: { size: 13, weight: '600', family: 'Space Grotesk' }, 
                            padding: 15,
                            color: '#b8b8d4'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        padding: 12,
                        titleFont: { size: 14, weight: '600', family: 'Space Grotesk' },
                        bodyFont: { size: 13, family: 'DM Mono' },
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#b8b8d4',
                            font: { family: 'DM Mono', size: 12 },
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        },
                        grid: { color: 'rgba(59, 130, 246, 0.15)' }
                    },
                    x: {
                        ticks: {
                            color: '#b8b8d4',
                            font: { family: 'Space Grotesk', size: 12 }
                        },
                        grid: { display: false }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
};
