function initWorkloadGap() {
    const ctx = document.getElementById('workloadGapChart').getContext('2d');
    
    // Prepare trend data
    const datasets = mockData.programs.map(program => {
        const gaps = mockData.years.map((year, index) => {
            const current = mockData.facultyData.currentFTE[program.id][index].value;
            const required = mockData.facultyData.requiredFTE[program.id][index].value;
            return required - current;
        });
        
        return {
            label: program.name,
            data: gaps,
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.4
        };
    });

    // Create the chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: mockData.years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Faculty Workload Gap Trends (2015-2025)',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const gap = context.parsed.y;
                            return `${context.dataset.label}: ${Math.abs(gap.toFixed(1))} ${gap > 0 ? 'FTEs needed' : 'FTEs surplus'}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'FTE Gap (Positive = Shortage, Negative = Surplus)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            }
        }
    });

    // Add detailed analysis
    const container = document.getElementById('workloadGap');
    
    // Calculate current year stats
    const currentYearIndex = mockData.years.length - 1;
    const programStats = mockData.programs.map(program => {
        const current = mockData.facultyData.currentFTE[program.id][currentYearIndex].value;
        const required = mockData.facultyData.requiredFTE[program.id][currentYearIndex].value;
        const gap = required - current;
        const status = gap > 0 ? 'shortage' : (gap < 0 ? 'surplus' : 'balanced');
        const severity = Math.abs(gap) > 3 ? 'high' : (Math.abs(gap) > 1 ? 'medium' : 'low');
        
        return {
            program: program.name,
            gap: gap.toFixed(1),
            status,
            severity
        };
    });

    // Sort programs by gap severity
    programStats.sort((a, b) => Math.abs(parseFloat(b.gap)) - Math.abs(parseFloat(a.gap)));

    const analysisHtml = `
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Workload Analysis (${mockData.years[currentYearIndex]})</h5>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Program</th>
                                        <th>Gap (FTEs)</th>
                                        <th>Status</th>
                                        <th>Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${programStats.map(stat => `
                                        <tr>
                                            <td>${stat.program}</td>
                                            <td class="text-${stat.status === 'shortage' ? 'danger' : (stat.status === 'surplus' ? 'warning' : 'success')}">
                                                ${stat.gap}
                                            </td>
                                            <td>${stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}</td>
                                            <td>
                                                <span class="badge bg-${stat.severity === 'high' ? 'danger' : (stat.severity === 'medium' ? 'warning' : 'success')}">
                                                    ${stat.severity.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', analysisHtml);
}

// Helper function to generate random colors for chart lines
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
} 