function initEmployability() {
    const container = document.getElementById('employability');
    
    // Create the employability dashboard interface
    const dashboardHtml = `
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Employment Rate Trends</h5>
                        <canvas id="employmentTrendChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Latest Employment Statistics</h5>
                        <div id="employmentStats"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Average Starting Salary</h5>
                        <canvas id="salaryChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Employer Satisfaction</h5>
                        <canvas id="satisfactionChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = dashboardHtml;

    // Initialize all charts
    createEmploymentTrendChart();
    createSalaryChart();
    createSatisfactionChart();
    updateEmploymentStats();
}

function createEmploymentTrendChart() {
    const ctx = document.getElementById('employmentTrendChart').getContext('2d');
    
    const datasets = mockData.programs.map(program => ({
        label: program.name,
        data: mockData.employmentData[program.id].map(d => d.employedWithin6Months),
        borderColor: getRandomColor(),
        fill: false
    }));

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
                    text: 'Employment Rate Within 6 Months of Graduation',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Employment Rate (%)'
                    }
                }
            }
        }
    });
}

function createSalaryChart() {
    const ctx = document.getElementById('salaryChart').getContext('2d');
    
    const currentYearData = mockData.programs.map(program => ({
        program: program.name,
        salary: mockData.employmentData[program.id][mockData.employmentData[program.id].length - 1].averageSalary
    }));

    currentYearData.sort((a, b) => b.salary - a.salary);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: currentYearData.map(d => d.program),
            datasets: [{
                label: 'Average Starting Salary',
                data: currentYearData.map(d => d.salary),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Average Starting Salary by Program',
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
                        text: 'Salary (AED)'
                    }
                }
            }
        }
    });
}

function createSatisfactionChart() {
    const ctx = document.getElementById('satisfactionChart').getContext('2d');
    
    const currentYearData = mockData.programs.map(program => ({
        program: program.name,
        satisfaction: mockData.employmentData[program.id][mockData.employmentData[program.id].length - 1].employerSatisfaction
    }));

    currentYearData.sort((a, b) => b.satisfaction - a.satisfaction);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: currentYearData.map(d => d.program),
            datasets: [{
                label: 'Employer Satisfaction',
                data: currentYearData.map(d => d.satisfaction),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Employer Satisfaction Rating (1-5)',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Satisfaction Rating'
                    }
                }
            }
        }
    });
}

function updateEmploymentStats() {
    const container = document.getElementById('employmentStats');
    const currentYearIndex = mockData.employmentData[mockData.programs[0].id].length - 1;
    
    // Calculate overall statistics
    const stats = {
        averageEmploymentRate: 0,
        averageSalary: 0,
        averageSatisfaction: 0,
        highestEmploymentRate: {
            program: '',
            rate: 0
        },
        highestSalary: {
            program: '',
            salary: 0
        }
    };

    mockData.programs.forEach(program => {
        const currentStats = mockData.employmentData[program.id][currentYearIndex];
        stats.averageEmploymentRate += currentStats.employedWithin6Months;
        stats.averageSalary += currentStats.averageSalary;
        stats.averageSatisfaction += currentStats.employerSatisfaction;

        if (currentStats.employedWithin6Months > stats.highestEmploymentRate.rate) {
            stats.highestEmploymentRate = {
                program: program.name,
                rate: currentStats.employedWithin6Months
            };
        }

        if (currentStats.averageSalary > stats.highestSalary.salary) {
            stats.highestSalary = {
                program: program.name,
                salary: currentStats.averageSalary
            };
        }
    });

    const numPrograms = mockData.programs.length;
    stats.averageEmploymentRate /= numPrograms;
    stats.averageSalary /= numPrograms;
    stats.averageSatisfaction /= numPrograms;

    const statsHtml = `
        <div class="mb-4">
            <h6>Overall Employment Rate</h6>
            <div class="metric-card">
                <div class="metric-value">${stats.averageEmploymentRate.toFixed(1)}%</div>
                <div class="metric-label">Average across all programs</div>
            </div>
        </div>
        <div class="mb-4">
            <h6>Average Starting Salary</h6>
            <div class="metric-card">
                <div class="metric-value">${stats.averageSalary.toLocaleString()} AED</div>
                <div class="metric-label">Average across all programs</div>
            </div>
        </div>
        <div class="mb-4">
            <h6>Top Performing Program</h6>
            <div class="metric-card">
                <div class="metric-value">${stats.highestEmploymentRate.program}</div>
                <div class="metric-label">${stats.highestEmploymentRate.rate.toFixed(1)}% Employment Rate</div>
            </div>
        </div>
        <div class="mb-4">
            <h6>Highest Paying Program</h6>
            <div class="metric-card">
                <div class="metric-value">${stats.highestSalary.program}</div>
                <div class="metric-label">${stats.highestSalary.salary.toLocaleString()} AED Average Salary</div>
            </div>
        </div>
    `;

    container.innerHTML = statsHtml;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
} 