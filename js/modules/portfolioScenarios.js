function initPortfolioScenarios() {
    const container = document.getElementById('scenarioComparison');
    
    // Create scenario comparison interface
    const scenarioHtml = `
        <div class="row">
            <div class="col-12 mb-4">
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-primary active" data-metric="enrollment">Enrollment</button>
                    <button type="button" class="btn btn-outline-primary" data-metric="revenue">Revenue</button>
                    <button type="button" class="btn btn-outline-primary" data-metric="cost">Cost</button>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Scenario Comparison</h5>
                        <canvas id="scenarioChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Impact Analysis</h5>
                        <div id="scenarioImpact">
                            <p class="text-muted">Select a metric to view impact analysis</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = scenarioHtml;

    // Initialize with enrollment data
    let currentChart = createScenarioChart('enrollment');

    // Add metric selection handlers
    const buttons = container.querySelectorAll('.btn-group button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Update button states
            buttons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Update chart
            const metric = e.target.getAttribute('data-metric');
            if (currentChart) {
                currentChart.destroy();
            }
            currentChart = createScenarioChart(metric);
        });
    });
}

function createScenarioChart(metric) {
    const ctx = document.getElementById('scenarioChart').getContext('2d');
    
    // Prepare data for the selected metric
    const scenarios = ['baseline', 'optimistic', 'pessimistic'];
    const datasets = scenarios.map(scenario => {
        const totalsByYear = mockData.years.map(year => {
            const yearIndex = mockData.years.indexOf(year);
            return Object.values(mockData.scenarioData[scenario]).reduce((sum, program) => {
                return sum + program[metric][yearIndex].value;
            }, 0);
        });

        return {
            label: scenario.charAt(0).toUpperCase() + scenario.slice(1),
            data: totalsByYear,
            borderColor: getScenarioColor(scenario),
            backgroundColor: getScenarioColor(scenario, 0.1),
            fill: true
        };
    });

    // Create chart
    const chart = new Chart(ctx, {
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
                    text: `Portfolio ${metric.charAt(0).toUpperCase() + metric.slice(1)} Scenarios`,
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: getMetricLabel(metric)
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

    // Update impact analysis
    updateImpactAnalysis(metric);

    return chart;
}

function updateImpactAnalysis(metric) {
    const container = document.getElementById('scenarioImpact');
    const currentYearIndex = mockData.years.length - 1;
    
    // Calculate impacts
    const baselineTotal = Object.values(mockData.scenarioData.baseline).reduce((sum, program) => {
        return sum + program[metric][currentYearIndex].value;
    }, 0);

    const optimisticTotal = Object.values(mockData.scenarioData.optimistic).reduce((sum, program) => {
        return sum + program[metric][currentYearIndex].value;
    }, 0);

    const pessimisticTotal = Object.values(mockData.scenarioData.pessimistic).reduce((sum, program) => {
        return sum + program[metric][currentYearIndex].value;
    }, 0);

    const optimisticChange = ((optimisticTotal - baselineTotal) / baselineTotal) * 100;
    const pessimisticChange = ((pessimisticTotal - baselineTotal) / baselineTotal) * 100;

    const impactHtml = `
        <div class="mb-4">
            <h6>Baseline Scenario (${mockData.years[currentYearIndex]})</h6>
            <div class="metric-card">
                <div class="metric-value">${formatMetricValue(baselineTotal, metric)}</div>
                <div class="metric-label">Total Portfolio ${metric.charAt(0).toUpperCase() + metric.slice(1)}</div>
            </div>
        </div>
        <div class="mb-4">
            <h6>Optimistic Scenario Impact</h6>
            <div class="alert alert-success">
                <strong>${optimisticChange >= 0 ? '+' : ''}${optimisticChange.toFixed(1)}%</strong>
                <div class="small">Potential upside from baseline</div>
            </div>
            <div class="metric-card bg-success bg-opacity-10">
                <div class="metric-value">${formatMetricValue(optimisticTotal, metric)}</div>
                <div class="metric-label">Projected Total</div>
            </div>
        </div>
        <div class="mb-4">
            <h6>Pessimistic Scenario Impact</h6>
            <div class="alert alert-danger">
                <strong>${pessimisticChange >= 0 ? '+' : ''}${pessimisticChange.toFixed(1)}%</strong>
                <div class="small">Potential downside from baseline</div>
            </div>
            <div class="metric-card bg-danger bg-opacity-10">
                <div class="metric-value">${formatMetricValue(pessimisticTotal, metric)}</div>
                <div class="metric-label">Projected Total</div>
            </div>
        </div>
    `;

    container.innerHTML = impactHtml;
}

function getScenarioColor(scenario, alpha = 1) {
    const colors = {
        baseline: `rgba(54, 162, 235, ${alpha})`,
        optimistic: `rgba(75, 192, 192, ${alpha})`,
        pessimistic: `rgba(255, 99, 132, ${alpha})`
    };
    return colors[scenario];
}

function getMetricLabel(metric) {
    const labels = {
        enrollment: 'Number of Students',
        revenue: 'Revenue (AED)',
        cost: 'Cost (AED)'
    };
    return labels[metric];
}

function formatMetricValue(value, metric) {
    if (metric === 'enrollment') {
        return Math.round(value).toLocaleString() + ' students';
    } else {
        return value.toLocaleString() + ' AED';
    }
} 