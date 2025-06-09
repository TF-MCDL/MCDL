// Faculty Planning Simulation Tool
function initFacultyPlanning() {
    const container = document.getElementById('facultyPlanning');
    
    // Generate the simulation interface
    const simulationContent = `
        <div class="row mb-4">
            <div class="col-md-3">
                <label class="form-label">Department</label>
                <select class="form-select" id="departmentSelect">
                    <option value="Business & Economics">Business & Economics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Healthcare">Healthcare</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Scenario Type</label>
                <select class="form-select" id="scenarioType">
                    <option value="hiringPlan">Hiring Plan</option>
                    <option value="courseLoad">Course Load</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Year</label>
                <select class="form-select" id="yearSelect">
                    ${generateYearOptions()}
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Adjustment (%)</label>
                <div class="d-flex align-items-center">
                    <input type="range" class="form-range" id="adjustmentSlider" min="0" max="30" value="14">
                    <span class="ms-2" id="adjustmentValue">+14%</span>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Faculty Projection Over Time</h5>
                        <canvas id="projectionChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Simulation Insights</h5>
                        
                        <div class="mb-4">
                            <h6 class="text-primary">Impact Analysis</h6>
                            <p id="impactText">Faculty size will increase by 14% over 10 years</p>
                            
                            <div class="row text-center mb-3">
                                <div class="col-6">
                                    <div class="h3" id="currentFaculty">8</div>
                                    <div class="small text-muted">Current<br>Faculty Members</div>
                                </div>
                                <div class="col-6">
                                    <div class="h3" id="requiredFaculty">10</div>
                                    <div class="small text-muted">Required<br>Faculty Members</div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <h6 class="text-primary">Implementation Timeline</h6>
                            <ul class="list-unstyled" id="timelineList">
                                <li class="mb-2">
                                    <i class="fas fa-circle text-primary"></i> 2024
                                    <br><small class="text-muted">Projected faculty: 8</small>
                                </li>
                                <li class="mb-2">
                                    <i class="fas fa-circle text-primary"></i> 2025
                                    <br><small class="text-muted">Projected faculty: 9</small>
                                </li>
                                <li class="mb-2">
                                    <i class="fas fa-circle text-primary"></i> 2026
                                    <br><small class="text-muted">Projected faculty: 9</small>
                                </li>
                            </ul>
                        </div>

                        <div class="mb-4">
                            <h6 class="text-primary">Change Summary</h6>
                            <ul class="list-unstyled">
                                <li class="mb-2">✓ Implement phased hiring plan</li>
                                <li class="mb-2">✓ Review budget implications quarterly</li>
                                <li class="mb-2">✓ Adjust resource allocation progressively</li>
                            </ul>
                        </div>

                        <div>
                            <h6 class="text-primary">Recommendations</h6>
                            <ul class="list-unstyled" id="recommendationsList">
                                <li class="mb-2">• Implement phased hiring plan</li>
                                <li class="mb-2">• Review budget implications quarterly</li>
                                <li class="mb-2">• Adjust resource allocation progressively</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = simulationContent;
    
    // Initialize the projection chart
    initializeProjectionChart();
    
    // Add event listeners
    document.getElementById('departmentSelect').addEventListener('change', updateSimulation);
    document.getElementById('scenarioType').addEventListener('change', updateSimulation);
    document.getElementById('yearSelect').addEventListener('change', updateSimulation);
    document.getElementById('adjustmentSlider').addEventListener('input', (e) => {
        document.getElementById('adjustmentValue').textContent = `+${e.target.value}%`;
        updateSimulation();
    });

    // Initial simulation update
    updateSimulation();
}

function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    let options = '';
    for (let i = 0; i <= 10; i++) {
        const year = currentYear + i;
        options += `<option value="${year}">${year}</option>`;
    }
    return options;
}

function initializeProjectionChart() {
    const ctx = document.getElementById('projectionChart').getContext('2d');
    window.projectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateYearLabels(),
            datasets: [
                {
                    label: 'Projected Faculty',
                    data: [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Required Faculty',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    ticks: {
                        stepSize: 2
                    },
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function generateYearLabels() {
    const currentYear = new Date().getFullYear();
    return Array.from({length: 10}, (_, i) => currentYear + i);
}

function updateSimulation() {
    const department = document.getElementById('departmentSelect').value;
    const scenarioType = document.getElementById('scenarioType').value;
    const selectedYear = parseInt(document.getElementById('yearSelect').value);
    const adjustment = parseInt(document.getElementById('adjustmentSlider').value);

    console.log('Updating simulation with:', { department, scenarioType, selectedYear, adjustment });

    // Update projection chart data
    const projectedData = calculateProjection(department, scenarioType, adjustment);
    
    // Ensure chart exists before updating
    if (window.projectionChart) {
        // Update datasets
        window.projectionChart.data.datasets[0].data = projectedData.projected;
        window.projectionChart.data.datasets[1].data = projectedData.required;

        // Update labels to start from selected year
        window.projectionChart.data.labels = Array.from({length: 10}, (_, i) => selectedYear + i);

        // Update y-axis scale based on the maximum value
        const maxValue = Math.max(
            ...projectedData.projected,
            ...projectedData.required
        );
        window.projectionChart.options.scales.y.max = Math.ceil(maxValue * 1.1); // Add 10% padding

        window.projectionChart.update();
    }

    // Update insights
    updateInsights(department, scenarioType, selectedYear, adjustment, projectedData);
}

function calculateProjection(department, scenarioType, adjustment) {
    const baselineFaculty = 8; // Starting faculty count
    const years = 10;
    
    const projected = Array(years).fill(0).map((_, i) => {
        const growthFactor = 1 + (adjustment / 100);
        return Math.round(baselineFaculty * Math.pow(growthFactor, i/years * (scenarioType === 'hiringPlan' ? 1 : 0.8)));
    });

    const required = Array(years).fill(0).map((_, i) => {
        return Math.round(baselineFaculty * 1.25); // 25% more than baseline
    });

    return { projected, required };
}

function updateInsights(department, scenarioType, selectedYear, adjustment, projectionData) {
    // Update impact text
    const impactText = document.getElementById('impactText');
    impactText.textContent = `Faculty size will increase by ${adjustment}% over 10 years`;

    // Update faculty numbers
    document.getElementById('currentFaculty').textContent = projectionData.projected[0];
    document.getElementById('requiredFaculty').textContent = projectionData.required[0];

    // Update timeline
    const timelineList = document.getElementById('timelineList');
    timelineList.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const year = new Date().getFullYear() + i;
        const projected = projectionData.projected[i];
        timelineList.innerHTML += `
            <li class="mb-2">
                <i class="fas fa-circle text-primary"></i> ${year}
                <br><small class="text-muted">Projected faculty: ${projected}</small>
            </li>
        `;
    }

    // Update recommendations based on scenario
    const recommendationsList = document.getElementById('recommendationsList');
    if (scenarioType === 'hiringPlan') {
        recommendationsList.innerHTML = `
            <li class="mb-2">• Implement phased hiring plan</li>
            <li class="mb-2">• Review budget implications quarterly</li>
            <li class="mb-2">• Adjust resource allocation progressively</li>
        `;
    } else {
        recommendationsList.innerHTML = `
            <li class="mb-2">• Optimize course load distribution</li>
            <li class="mb-2">• Consider part-time faculty allocation</li>
            <li class="mb-2">• Review teaching hour requirements</li>
        `;
    }
} 