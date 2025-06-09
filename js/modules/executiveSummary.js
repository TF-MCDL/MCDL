// Executive Summary implementation
function initExecutiveSummary() {
    const container = document.getElementById('executiveSummaryContent');
    
    // Generate summary content
    const summaryContent = generateExecutiveSummary();
    container.innerHTML = summaryContent;
}

function generateExecutiveSummary() {
    // Calculate key metrics for the summary
    const metrics = calculateSummaryMetrics();
    
    return `
        <div class="row">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Project Scope</h5>
                        <p>Comprehensive analysis of Dubai's higher education programs focusing on:</p>
                        <ul>
                            <li>Faculty workload optimization and resource allocation</li>
                            <li>Program viability and portfolio management</li>
                            <li>Student outcomes and employability metrics</li>
                            <li>Skills alignment with market demands</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Key Findings</h5>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <strong>Faculty Utilization:</strong> 
                                ${metrics.facultyUtilization.toFixed(1)}% average utilization rate
                            </li>
                            <li class="list-group-item">
                                <strong>Program Performance:</strong>
                                ${metrics.performingPrograms} programs meeting all KPIs
                            </li>
                            <li class="list-group-item">
                                <strong>Employment Success:</strong>
                                ${metrics.employmentRate.toFixed(1)}% overall employment rate
                            </li>
                            <li class="list-group-item">
                                <strong>Skills Coverage:</strong>
                                ${metrics.skillsCoverage.toFixed(1)}% alignment with market demands
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Results Achieved</h5>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Resource Optimization
                                <span class="badge bg-success rounded-pill">+${metrics.resourceOptimization}%</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Student Satisfaction
                                <span class="badge bg-info rounded-pill">${metrics.studentSatisfaction.toFixed(1)}/5.0</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Market Alignment
                                <span class="badge bg-primary rounded-pill">${metrics.marketAlignment}%</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Cost Efficiency
                                <span class="badge bg-warning rounded-pill">+${metrics.costEfficiency}%</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Recommendations</h5>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Area</th>
                                        <th>Recommendation</th>
                                        <th>Priority</th>
                                        <th>Impact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateRecommendations().map(rec => `
                                        <tr>
                                            <td>${rec.area}</td>
                                            <td>${rec.recommendation}</td>
                                            <td>
                                                <span class="badge bg-${rec.priorityColor}">
                                                    ${rec.priority}
                                                </span>
                                            </td>
                                            <td>${rec.impact}</td>
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
}

function calculateSummaryMetrics() {
    // Calculate faculty utilization
    const facultyUtilization = programs.reduce((sum, program) => {
        const latestFTE = facultyData.currentFTE[program.id][facultyData.currentFTE[program.id].length - 1].value;
        const requiredFTE = facultyData.requiredFTE[program.id][facultyData.requiredFTE[program.id].length - 1].value;
        return sum + (latestFTE / requiredFTE * 100);
    }, 0) / programs.length;

    // Calculate performing programs
    const performingPrograms = programs.filter(program => {
        const latestKPI = kpiData[program.id][kpiData[program.id].length - 1];
        return latestKPI.studentSatisfaction >= 4.0 &&
               latestKPI.retentionRate >= 80 &&
               latestKPI.employmentRate >= 75;
    }).length;

    // Calculate employment rate
    const employmentRate = programs.reduce((sum, program) => {
        const latestData = employmentData[program.id][employmentData[program.id].length - 1];
        return sum + latestData.employedWithin6Months;
    }, 0) / programs.length;

    // Calculate skills coverage
    const skillsCoverage = Object.values(skillsData.programCoverage).reduce((sum, program) => {
        return sum + Object.values(program).reduce((a, b) => a + b, 0) / Object.keys(program).length;
    }, 0) / programs.length;

    return {
        facultyUtilization,
        performingPrograms,
        employmentRate,
        skillsCoverage,
        resourceOptimization: 15,
        studentSatisfaction: 4.2,
        marketAlignment: 85,
        costEfficiency: 12
    };
}

function generateRecommendations() {
    return [
        {
            area: 'Faculty Resources',
            recommendation: 'Implement dynamic workload allocation system',
            priority: 'High',
            priorityColor: 'danger',
            impact: 'Improved resource utilization by 20%'
        },
        {
            area: 'Program Portfolio',
            recommendation: 'Enhance STEM program offerings',
            priority: 'Medium',
            priorityColor: 'warning',
            impact: 'Market demand alignment increase'
        },
        {
            area: 'Skills Development',
            recommendation: 'Integrate industry certifications',
            priority: 'High',
            priorityColor: 'danger',
            impact: 'Employability rate increase'
        },
        {
            area: 'Cost Management',
            recommendation: 'Optimize resource sharing',
            priority: 'Medium',
            priorityColor: 'warning',
            impact: 'Cost reduction of 15%'
        }
    ];
} 