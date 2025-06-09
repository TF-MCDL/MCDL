// Impact Dashboard implementation
function initImpactDashboard() {
    const container = document.getElementById('impactMetricsChart');
    
    // Calculate impact metrics
    const impactMetrics = calculateImpactMetrics();
    
    // Create charts
    createEmploymentChart(container, impactMetrics);
    
    // Add detailed metrics table
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'mt-4';
    detailsContainer.innerHTML = generateMetricsTable(impactMetrics);
    container.parentNode.appendChild(detailsContainer);
}

function calculateImpactMetrics() {
    const currentYear = new Date().getFullYear();
    const metrics = {};
    
    // Calculate overall employment rate
    const totalEmployed = programs.reduce((sum, program) => {
        const latestData = employmentData[program.id][employmentData[program.id].length - 1];
        return sum + latestData.employedWithin6Months;
    }, 0);
    metrics.overallEmploymentRate = totalEmployed / programs.length;
    
    // Calculate average salary
    const totalSalary = programs.reduce((sum, program) => {
        const latestData = employmentData[program.id][employmentData[program.id].length - 1];
        return sum + latestData.averageSalary;
    }, 0);
    metrics.averageSalary = totalSalary / programs.length;
    
    // Calculate employer satisfaction
    const totalSatisfaction = programs.reduce((sum, program) => {
        const latestData = employmentData[program.id][employmentData[program.id].length - 1];
        return sum + latestData.employerSatisfaction;
    }, 0);
    metrics.employerSatisfaction = totalSatisfaction / programs.length;
    
    // Mock data for top employers (in a real implementation, this would come from actual data)
    metrics.topEmployers = [
        { name: 'Dubai Technology Solutions', hires: 45 },
        { name: 'Emirates Group', hires: 38 },
        { name: 'Dubai Smart Government', hires: 32 },
        { name: 'Etisalat', hires: 28 },
        { name: 'Dubai Healthcare City', hires: 25 }
    ];
    
    // Industry distribution (mock data)
    metrics.industryDistribution = [
        { industry: 'Technology', percentage: 35 },
        { industry: 'Finance', percentage: 25 },
        { industry: 'Healthcare', percentage: 15 },
        { industry: 'Government', percentage: 15 },
        { industry: 'Others', percentage: 10 }
    ];
    
    return metrics;
}

function createEmploymentChart(container, metrics) {
    const ctx = container.getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Employment Rate', 'Employer Satisfaction', 'Industry Coverage'],
            datasets: [{
                label: 'Impact Metrics (%)',
                data: [
                    metrics.overallEmploymentRate,
                    (metrics.employerSatisfaction / 5) * 100, // Convert 5-point scale to percentage
                    metrics.industryDistribution.reduce((sum, ind) => sum + (ind.percentage > 10 ? 1 : 0), 0) * 20 // Each major industry = 20%
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Key Impact Indicators'
                }
            }
        }
    });
}

function generateMetricsTable(metrics) {
    return `
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Key Metrics</h5>
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td>Overall Employment Rate</td>
                                    <td>${metrics.overallEmploymentRate.toFixed(1)}%</td>
                                </tr>
                                <tr>
                                    <td>Average Starting Salary</td>
                                    <td>$${metrics.averageSalary.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td>Employer Satisfaction</td>
                                    <td>${metrics.employerSatisfaction.toFixed(1)}/5.0</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Top Employers</h5>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Employer</th>
                                    <th>Recent Hires</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${metrics.topEmployers.map(employer => `
                                    <tr>
                                        <td>${employer.name}</td>
                                        <td>${employer.hires}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Industry Distribution</h5>
                        <div class="progress" style="height: 25px;">
                            ${metrics.industryDistribution.map(ind => `
                                <div class="progress-bar" role="progressbar" 
                                     style="width: ${ind.percentage}%; background-color: ${getRandomColor()}" 
                                     title="${ind.industry}: ${ind.percentage}%">
                                    ${ind.industry} ${ind.percentage}%
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getRandomColor() {
    const colors = [
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(255, 99, 132, 0.8)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
} 