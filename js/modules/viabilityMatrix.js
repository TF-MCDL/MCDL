// Global variables from mockData.js are used: programs, enrollmentData, costData, revenueData, employmentData
function initViabilityMatrix() {
    const container = document.getElementById('viabilityGrid');
    
    // Calculate viability metrics for each program
    const viabilityData = calculateViabilityMetrics();
    
    // Create the matrix visualization
    const matrixHtml = `
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Program Viability Matrix</h5>
                        <div class="viability-grid">
                            ${generateMatrixGrid(viabilityData)}
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Program Details</h5>
                        <div id="programDetails">
                            <p class="text-muted">Select a program to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .viability-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-top: 1rem;
            }
            .viability-cell {
                padding: 1rem;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .viability-cell:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .program-tag {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                margin: 0.25rem;
                border-radius: 4px;
                font-size: 0.875rem;
                white-space: nowrap;
            }
        </style>
    `;
    
    container.innerHTML = matrixHtml;

    // Add click handlers for program selection
    const cells = container.querySelectorAll('.viability-cell');
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const category = cell.getAttribute('data-category');
            const programs = viabilityData.filter(p => p.category === category);
            displayProgramDetails(programs);
        });
    });
}

function calculateViabilityMetrics() {
    const currentYear = new Date().getFullYear();
    const metrics = programs.map(program => {
        // Get latest year data
        const enrollment = enrollmentData[program.id][enrollmentData[program.id].length - 1].value;
        const cost = costData[program.id][costData[program.id].length - 1].value;
        const revenue = revenueData[program.id][revenueData[program.id].length - 1].value;
        const employment = employmentData[program.id][employmentData[program.id].length - 1];

        // Calculate metrics
        const profitMargin = ((revenue - cost) / revenue) * 100;
        const employabilityScore = (
            employment.employedWithin6Months +
            (employment.averageSalary / 20000) * 100 + // Normalize salary to 0-100 scale
            employment.employerSatisfaction * 20 // Convert 1-5 scale to 0-100
        ) / 3;

        // Determine category based on metrics
        let category;
        if (enrollment > 120 && profitMargin > 20 && employabilityScore > 80) {
            category = 'star';
        } else if (enrollment > 100 && profitMargin > 15 && employabilityScore > 70) {
            category = 'growth';
        } else if (enrollment > 80 && profitMargin > 10 && employabilityScore > 60) {
            category = 'stable';
        } else if (enrollment > 60 && profitMargin > 5 && employabilityScore > 50) {
            category = 'monitor';
        } else if (enrollment < 60 || profitMargin < 0 || employabilityScore < 50) {
            category = 'atrisk';
        } else {
            category = 'review';
        }

        return {
            id: program.id,
            name: program.name,
            enrollment,
            profitMargin,
            employabilityScore,
            category,
            metrics: {
                revenue,
                cost,
                employedWithin6Months: employment.employedWithin6Months,
                averageSalary: employment.averageSalary,
                employerSatisfaction: employment.employerSatisfaction
            }
        };
    });

    return metrics;
}

function generateMatrixGrid(viabilityData) {
    const categories = {
        star: {
            title: 'Star Programs',
            description: 'High enrollment, profitability, and employability',
            color: 'success'
        },
        growth: {
            title: 'Growth Programs',
            description: 'Strong performance with growth potential',
            color: 'info'
        },
        stable: {
            title: 'Stable Programs',
            description: 'Consistent performance, meeting expectations',
            color: 'primary'
        },
        monitor: {
            title: 'Monitor Programs',
            description: 'Meeting minimum requirements, needs attention',
            color: 'warning'
        },
        review: {
            title: 'Review Programs',
            description: 'Underperforming in some areas',
            color: 'secondary'
        },
        atrisk: {
            title: 'At-Risk Programs',
            description: 'Critical performance issues',
            color: 'danger'
        }
    };

    return Object.entries(categories).map(([key, category]) => {
        const programsInCategory = viabilityData.filter(p => p.category === key);
        return `
            <div class="viability-cell bg-${category.color} bg-opacity-10 border border-${category.color}" data-category="${key}">
                <h6 class="text-${category.color}">${category.title}</h6>
                <p class="text-muted small mb-2">${category.description}</p>
                <div class="program-list">
                    ${programsInCategory.map(program => `
                        <span class="program-tag bg-${category.color} bg-opacity-25 text-${category.color}">
                            ${program.id}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function displayProgramDetails(programs) {
    const detailsContainer = document.getElementById('programDetails');
    
    if (programs.length === 0) {
        detailsContainer.innerHTML = '<p class="text-muted">No programs in this category</p>';
        return;
    }

    const detailsHtml = `
        ${programs.map(program => `
            <div class="program-detail mb-4">
                <h6>${program.name}</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <tbody>
                            <tr>
                                <td>Enrollment</td>
                                <td>${program.enrollment} students</td>
                            </tr>
                            <tr>
                                <td>Profit Margin</td>
                                <td>${program.profitMargin.toFixed(1)}%</td>
                            </tr>
                            <tr>
                                <td>Employability Score</td>
                                <td>${program.employabilityScore.toFixed(1)}%</td>
                            </tr>
                            <tr>
                                <td>Revenue</td>
                                <td>$${program.metrics.revenue.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Cost</td>
                                <td>$${program.metrics.cost.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Employment Rate (6mo)</td>
                                <td>${program.metrics.employedWithin6Months}%</td>
                            </tr>
                            <tr>
                                <td>Average Salary</td>
                                <td>$${program.metrics.averageSalary.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Employer Satisfaction</td>
                                <td>${program.metrics.employerSatisfaction}/5</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('')}
    `;

    detailsContainer.innerHTML = detailsHtml;
} 