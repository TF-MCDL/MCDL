// Define base program data
const basePrograms = [
    { id: 'CS', name: 'Computer Science', degreeLevel: 'bachelors', performance: 'high' },
    { id: 'BUS', name: 'Business Administration', degreeLevel: 'bachelors', performance: 'high' },
    { id: 'ENG', name: 'Engineering', degreeLevel: 'bachelors', performance: 'high' },
    { id: 'MED', name: 'Medical Sciences', degreeLevel: 'bachelors', performance: 'high' },
    { id: 'ARTS', name: 'Liberal Arts', degreeLevel: 'bachelors', performance: 'low' },
    { id: 'MBA', name: 'Master of Business Administration', degreeLevel: 'masters', performance: 'high' },
    { id: 'MSCS', name: 'Master of Computer Science', degreeLevel: 'masters', performance: 'high' },
    { id: 'MENG', name: 'Master of Engineering', degreeLevel: 'masters', performance: 'medium' },
    { id: 'PHD-CS', name: 'PhD in Computer Science', degreeLevel: 'phd', performance: 'high' },
    { id: 'PHD-ENG', name: 'PhD in Engineering', degreeLevel: 'phd', performance: 'medium' },
    { id: 'PHD-BUS', name: 'PhD in Business', degreeLevel: 'phd', performance: 'medium' },
    { id: 'ARCH', name: 'Architecture', degreeLevel: 'bachelors', performance: 'medium' },
    { id: 'PSYCH', name: 'Psychology', degreeLevel: 'bachelors', performance: 'low' },
    { id: 'ECON', name: 'Economics', degreeLevel: 'bachelors', performance: 'medium' },
    { id: 'MATHS', name: 'Mathematics', degreeLevel: 'bachelors', performance: 'low' }
];

let bubbleChart = null;

function initViabilityMatrix() {
    const container = document.getElementById('viabilityGrid');
    
    // Create filter container
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container mb-4';
    filterContainer.innerHTML = `
        <div class="filter-row">
            <div class="filter-group">
                <label for="departmentFilter">Department</label>
                <select id="departmentFilter" class="form-select">
                    <option value="all">All Departments</option>
                    ${basePrograms.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label for="degreeFilter">Degree Level</label>
                <select id="degreeFilter" class="form-select">
                    <option value="all">All Levels</option>
                    <option value="bachelors">Bachelor's</option>
                    <option value="masters">Master's</option>
                    <option value="phd">PhD</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="timeFilter">Time Period</label>
                <select id="timeFilter" class="form-select">
                    <option value="current">Current Year</option>
                    <option value="3year">3 Year Trend</option>
                    <option value="5year">5 Year Trend</option>
                </select>
            </div>
        </div>
    `;

    // Create main content structure
    const mainContent = document.createElement('div');
    mainContent.innerHTML = `
        <div class="row">
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Program Viability Overview</h5>
                        <p class="text-muted mb-4">Click on any bubble to view detailed program metrics. Bubble size represents cost efficiency.</p>
                        <canvas id="viabilityBubbleChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Program Details Modal -->
        <div class="modal fade" id="programDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Program Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="programDetailsContent"></div>
                </div>
            </div>
        </div>
    `;

    // Append elements to container
    container.appendChild(filterContainer);
    container.appendChild(mainContent);

    // Initialize the bubble chart
    initializeBubbleChart();

    // Add event listeners to filters
    ['departmentFilter', 'degreeFilter', 'timeFilter'].forEach(filterId => {
        document.getElementById(filterId).addEventListener('change', updateVisualization);
    });

    // Initial update
    updateVisualization();
}

function initializeBubbleChart() {
    const ctx = document.getElementById('viabilityBubbleChart').getContext('2d');
    const programData = calculateViabilityMetrics({
        department: 'all',
        degreeLevel: 'all',
        timePeriod: 'current'
    });

    // Create the bubble chart
    bubbleChart = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                data: programData.map(program => ({
                    x: program.enrollment,
                    y: program.employabilityScore,
                    r: program.costEfficiency / 10, // Scale down for better visualization
                    program: program // Store full program data for click handling
                })),
                backgroundColor: programData.map(program => {
                    switch (program.status) {
                        case 'viable': return 'rgba(40, 167, 69, 0.7)';
                        case 'watch': return 'rgba(255, 193, 7, 0.7)';
                        case 'at-risk': return 'rgba(220, 53, 69, 0.7)';
                        default: return 'rgba(108, 117, 125, 0.7)';
                    }
                }),
                borderColor: programData.map(program => {
                    switch (program.status) {
                        case 'viable': return '#28a745';
                        case 'watch': return '#ffc107';
                        case 'at-risk': return '#dc3545';
                        default: return '#6c757d';
                    }
                }),
                borderWidth: 1,
                hoverBorderWidth: 2,
                hoverRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Enrollment'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Employability Score'
                    },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const program = context.raw.program;
                            return [
                                `Program: ${program.name}`,
                                `Enrollment: ${program.enrollment}`,
                                `Employability: ${program.employabilityScore.toFixed(1)}%`,
                                `Cost Efficiency: ${program.costEfficiency.toFixed(1)}%`,
                                `Status: ${program.status.charAt(0).toUpperCase() + program.status.slice(1)}`
                            ];
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const program = elements[0].element.$context.raw.program;
                    showProgramDetails(program);
                }
            }
        }
    });
}

function updateVisualization() {
    const filters = {
        department: document.getElementById('departmentFilter').value,
        degreeLevel: document.getElementById('degreeFilter').value,
        timePeriod: document.getElementById('timeFilter').value
    };

    const programData = calculateViabilityMetrics(filters);

    // Update the bubble chart data
    bubbleChart.data.datasets[0].data = programData.map(program => ({
        x: program.enrollment,
        y: program.employabilityScore,
        r: program.costEfficiency / 10,
        program: program
    }));

    // Update colors based on status
    bubbleChart.data.datasets[0].backgroundColor = programData.map(program => {
        switch (program.status) {
            case 'viable': return 'rgba(40, 167, 69, 0.7)';
            case 'watch': return 'rgba(255, 193, 7, 0.7)';
            case 'at-risk': return 'rgba(220, 53, 69, 0.7)';
            default: return 'rgba(108, 117, 125, 0.7)';
        }
    });

    bubbleChart.data.datasets[0].borderColor = programData.map(program => {
        switch (program.status) {
            case 'viable': return '#28a745';
            case 'watch': return '#ffc107';
            case 'at-risk': return '#dc3545';
            default: return '#6c757d';
        }
    });

    bubbleChart.update();
}

function calculateViabilityMetrics(filters) {
    const metrics = basePrograms
        .filter(program => {
            if (filters.department !== 'all' && program.id !== filters.department) return false;
            if (filters.degreeLevel !== 'all' && program.degreeLevel !== filters.degreeLevel) return false;
            return true;
        })
        .map(program => {
            // Generate realistic data based on program type and degree level
            const baseEnrollment = getBaseEnrollment(program.degreeLevel, program.performance);
            const baseEmployability = getBaseEmployability(program.id, program.performance);
            const baseCostEfficiency = getBaseCostEfficiency(program.id, program.degreeLevel, program.performance);

            // Add some random variation
            const enrollment = baseEnrollment * (0.8 + Math.random() * 0.4); // ±20% variation
            const employabilityScore = baseEmployability * (0.9 + Math.random() * 0.2); // ±10% variation
            const costEfficiency = baseCostEfficiency * (0.85 + Math.random() * 0.3); // ±15% variation

            // Calculate derived metrics
            const revenue = enrollment * getTuitionFee(program.degreeLevel);
            const cost = revenue * (1 - costEfficiency / 100);
            const employmentRate = employabilityScore * 0.9;
            const avgSalary = getAverageSalary(program.id, program.degreeLevel);
            const employerSatisfaction = 3 + (Math.random() * 2); // 3-5 range

            // Determine viability status based on multiple factors
            let status;
            if (enrollment >= baseEnrollment * 0.8 && employabilityScore >= 80 && costEfficiency >= 70) {
                status = 'viable';
            } else if (enrollment >= baseEnrollment * 0.5 && employabilityScore >= 60 && costEfficiency >= 50) {
                status = 'watch';
            } else {
                status = 'at-risk';
            }

            return {
                id: program.id,
                name: program.name,
                degreeLevel: program.degreeLevel,
                enrollment: Math.round(enrollment),
                employabilityScore,
                costEfficiency,
                status,
                metrics: {
                    revenue: Math.round(revenue),
                    cost: Math.round(cost),
                    employedWithin6Months: Math.round(employmentRate),
                    averageSalary: Math.round(avgSalary),
                    employerSatisfaction: Number(employerSatisfaction.toFixed(1))
                }
            };
        });

    return metrics;
}

function getBaseEnrollment(degreeLevel, performance) {
    const baseValues = {
        bachelors: { high: 200, medium: 150, low: 100 },
        masters: { high: 100, medium: 70, low: 40 },
        phd: { high: 40, medium: 25, low: 15 }
    };
    return baseValues[degreeLevel][performance];
}

function getBaseEmployability(programId, performance) {
    const baseRate = {
        high: 90,
        medium: 75,
        low: 60
    }[performance];

    const programModifier = {
        'CS': 5,
        'BUS': 3,
        'ENG': 4,
        'MED': 6,
        'MBA': 5,
        'MSCS': 6,
        'PHD-CS': 7,
        'PHD-ENG': 6
    }[programId] || 0;

    return Math.min(100, baseRate + programModifier);
}

function getBaseCostEfficiency(programId, degreeLevel, performance) {
    const baseEfficiency = {
        high: 80,
        medium: 65,
        low: 50
    }[performance];

    const levelModifier = {
        bachelors: 5,
        masters: 8,
        phd: -5
    }[degreeLevel];

    const programModifier = {
        'CS': 5,
        'BUS': 8,
        'ENG': 3,
        'MED': -5,
        'ARTS': -8,
        'MBA': 12,
        'MSCS': 8,
        'MENG': 5
    }[programId] || 0;

    return baseEfficiency + levelModifier + programModifier;
}

function getTuitionFee(degreeLevel) {
    const baseFees = {
        'bachelors': 45000,
        'masters': 65000,
        'phd': 85000
    };
    return baseFees[degreeLevel] || 45000;
}

function getAverageSalary(programId, degreeLevel) {
    const baseSalary = {
        'bachelors': 120000,
        'masters': 180000,
        'phd': 250000
    }[degreeLevel] || 120000;

    const programModifier = {
        'CS': 1.3,
        'BUS': 1.2,
        'ENG': 1.25,
        'MED': 1.4,
        'MBA': 1.5,
        'MSCS': 1.4,
        'PHD-CS': 1.6,
        'PHD-ENG': 1.5,
        'ARCH': 1.1,
        'ECON': 1.15
    }[programId] || 1.0;

    return Math.round(baseSalary * programModifier);
}

function updateBubbleChart(data) {
    if (window.viabilityChart) {
        const statusColors = {
            viable: 'rgba(40, 167, 69, 0.7)',
            watch: 'rgba(255, 193, 7, 0.7)',
            'at-risk': 'rgba(220, 53, 69, 0.7)'
        };

        const datasets = Object.keys(statusColors).map(status => ({
            label: status.charAt(0).toUpperCase() + status.slice(1),
            data: data
                .filter(program => program.status === status)
                .map(program => ({
                    x: program.enrollment,
                    y: program.employabilityScore,
                    r: Math.max(8, program.costEfficiency / 8), // Minimum size of 8, scale down for better visualization
                    program: program
                })),
            backgroundColor: statusColors[status],
            hoverBackgroundColor: statusColors[status].replace('0.7', '0.9'),
            hoverBorderColor: statusColors[status].replace('0.7', '1'),
            hoverBorderWidth: 2,
            borderWidth: 1,
            borderColor: statusColors[status].replace('0.7', '1')
        }));

        window.viabilityChart.data.datasets = datasets;
        window.viabilityChart.update('none'); // Use 'none' for smoother updates
    }
}

function showProgramDetails(program) {
    const modal = new bootstrap.Modal(document.getElementById('programDetailsModal'));
    const content = document.getElementById('programDetailsContent');
    
    // Format currency values
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Create status badge
    const getStatusBadge = (status) => {
        const colors = {
            'viable': 'success',
            'watch': 'warning',
            'at-risk': 'danger'
        };
        return `<span class="badge bg-${colors[status]}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    };

    // Format the content with a clean, modern design
    content.innerHTML = `
        <div class="program-details">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>${program.name}</h3>
                ${getStatusBadge(program.status)}
            </div>
            
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">Enrollment & Cost</h5>
                            <ul class="list-unstyled">
                                <li class="mb-2">
                                    <strong>Current Enrollment:</strong>
                                    <span class="float-end">${program.enrollment}</span>
                                </li>
                                <li class="mb-2">
                                    <strong>Revenue:</strong>
                                    <span class="float-end">${formatCurrency(program.metrics.revenue)}</span>
                                </li>
                                <li class="mb-2">
                                    <strong>Operating Cost:</strong>
                                    <span class="float-end">${formatCurrency(program.metrics.cost)}</span>
                                </li>
                                <li class="mb-2">
                                    <strong>Cost Efficiency:</strong>
                                    <span class="float-end">${program.costEfficiency.toFixed(1)}%</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">Employment Metrics</h5>
                            <ul class="list-unstyled">
                                <li class="mb-2">
                                    <strong>Employability Score:</strong>
                                    <span class="float-end">${program.employabilityScore.toFixed(1)}%</span>
                                </li>
                                <li class="mb-2">
                                    <strong>Employment Rate (6m):</strong>
                                    <span class="float-end">${program.metrics.employedWithin6Months}%</span>
                                </li>
                                <li class="mb-2">
                                    <strong>Average Starting Salary:</strong>
                                    <span class="float-end">${formatCurrency(program.metrics.averageSalary)}/year</span>
                                </li>
                                <li class="mb-2">
                                    <strong>Employer Satisfaction:</strong>
                                    <span class="float-end">${program.metrics.employerSatisfaction}/5.0</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.show();
}

// Export the initialization function
window.initViabilityMatrix = initViabilityMatrix;