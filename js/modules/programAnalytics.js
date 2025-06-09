function initProgramAnalytics() {
    const container = document.getElementById('programAnalytics');
    
    // Create the analytics dashboard interface
    const dashboardHtml = `
        <div class="row">
            <div class="col-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Program Selection</h5>
                        <div class="list-group">
                            ${mockData.programs.map((program, index) => `
                                <button type="button" 
                                        class="list-group-item list-group-item-action ${index === 0 ? 'active' : ''}"
                                        data-program="${program.id}">
                                    ${program.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-9">
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Key Metrics</h5>
                                <div id="metricsOverview" class="row"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Financial Performance</h5>
                                <canvas id="financialChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Enrollment Trends</h5>
                                <canvas id="enrollmentChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Performance Indicators</h5>
                                <canvas id="performanceChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = dashboardHtml;

    // Initialize charts with first program
    let currentProgram = mockData.programs[0].id;
    let financialChart, enrollmentChart, performanceChart;

    // Initialize all visualizations
    updateDashboard(currentProgram);

    // Add program selection handlers
    const programButtons = container.querySelectorAll('.list-group-item');
    programButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Update button states
            programButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Update visualizations
            currentProgram = e.target.getAttribute('data-program');
            updateDashboard(currentProgram);
        });
    });

    function updateDashboard(programId) {
        updateMetricsOverview(programId);
        updateFinancialChart(programId);
        updateEnrollmentChart(programId);
        updatePerformanceChart(programId);
    }

    function updateMetricsOverview(programId) {
        const currentYearIndex = mockData.enrollmentData[programId].length - 1;
        const previousYearIndex = currentYearIndex - 1;
        
        const metrics = [
            {
                label: 'Current Enrollment',
                value: mockData.enrollmentData[programId][currentYearIndex].value,
                change: calculateChange(
                    mockData.enrollmentData[programId][currentYearIndex].value,
                    mockData.enrollmentData[programId][previousYearIndex].value
                )
            },
            {
                label: 'Revenue (AED)',
                value: mockData.revenueData[programId][currentYearIndex].value,
                change: calculateChange(
                    mockData.revenueData[programId][currentYearIndex].value,
                    mockData.revenueData[programId][previousYearIndex].value
                )
            },
            {
                label: 'Cost (AED)',
                value: mockData.costData[programId][currentYearIndex].value,
                change: calculateChange(
                    mockData.costData[programId][currentYearIndex].value,
                    mockData.costData[programId][previousYearIndex].value
                )
            },
            {
                label: 'Employment Rate',
                value: mockData.employmentData[programId][currentYearIndex].employedWithin6Months,
                change: calculateChange(
                    mockData.employmentData[programId][currentYearIndex].employedWithin6Months,
                    mockData.employmentData[programId][previousYearIndex].employedWithin6Months
                )
            }
        ];

        const metricsHtml = metrics.map(metric => `
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="metric-card">
                    <div class="metric-value">
                        ${formatValue(metric.value, metric.label)}
                    </div>
                    <div class="metric-label">
                        ${metric.label}
                        <span class="badge ${metric.change >= 0 ? 'bg-success' : 'bg-danger'} ms-2">
                            ${metric.change >= 0 ? '+' : ''}${metric.change.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('metricsOverview').innerHTML = metricsHtml;
    }

    function updateFinancialChart(programId) {
        const ctx = document.getElementById('financialChart').getContext('2d');
        
        if (financialChart) {
            financialChart.destroy();
        }

        financialChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: mockData.years,
                datasets: [
                    {
                        label: 'Revenue',
                        data: mockData.revenueData[programId].map(d => d.value),
                        backgroundColor: 'rgba(75, 192, 192, 0.8)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Cost',
                        data: mockData.costData[programId].map(d => d.value),
                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (AED)'
                        }
                    }
                }
            }
        });
    }

    function updateEnrollmentChart(programId) {
        const ctx = document.getElementById('enrollmentChart').getContext('2d');
        
        if (enrollmentChart) {
            enrollmentChart.destroy();
        }

        enrollmentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mockData.years,
                datasets: [{
                    label: 'Enrollment',
                    data: mockData.enrollmentData[programId].map(d => d.value),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Students'
                        }
                    }
                }
            }
        });
    }

    function updatePerformanceChart(programId) {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        if (performanceChart) {
            performanceChart.destroy();
        }

        const kpiMetrics = mockData.kpiData[programId].map(d => ({
            year: d.year,
            studentSatisfaction: d.studentSatisfaction * 20, // Convert to percentage
            retentionRate: d.retentionRate,
            graduationRate: d.graduationRate,
            employmentRate: d.employmentRate
        }));

        performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mockData.years,
                datasets: [
                    {
                        label: 'Student Satisfaction',
                        data: kpiMetrics.map(d => d.studentSatisfaction),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: false
                    },
                    {
                        label: 'Retention Rate',
                        data: kpiMetrics.map(d => d.retentionRate),
                        borderColor: 'rgba(255, 159, 64, 1)',
                        fill: false
                    },
                    {
                        label: 'Graduation Rate',
                        data: kpiMetrics.map(d => d.graduationRate),
                        borderColor: 'rgba(153, 102, 255, 1)',
                        fill: false
                    },
                    {
                        label: 'Employment Rate',
                        data: kpiMetrics.map(d => d.employmentRate),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Percentage'
                        }
                    }
                }
            }
        });
    }
}

function calculateChange(current, previous) {
    return ((current - previous) / previous) * 100;
}

function formatValue(value, label) {
    if (label.includes('Rate')) {
        return value.toFixed(1) + '%';
    } else if (label.includes('AED')) {
        return value.toLocaleString() + ' AED';
    } else {
        return Math.round(value).toLocaleString();
    }
} 