function initFacultyLoad() {
    const ctx = document.getElementById('facultyLoadChart').getContext('2d');
    
    // Prepare data for the chart
    const labels = mockData.programs.map(p => p.name);
    const currentFTEs = mockData.programs.map(p => mockData.facultyData.currentFTE[p.id][mockData.facultyData.currentFTE[p.id].length - 1].value);
    const requiredFTEs = mockData.programs.map(p => mockData.facultyData.requiredFTE[p.id][mockData.facultyData.requiredFTE[p.id].length - 1].value);
    
    // Calculate gaps
    const gaps = currentFTEs.map((current, i) => requiredFTEs[i] - current);
    
    // Create the chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Current FTEs',
                    data: currentFTEs,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Required FTEs',
                    data: requiredFTEs,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Faculty Load Summary by Program',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(tooltipItems) {
                            const dataIndex = tooltipItems[0].dataIndex;
                            const gap = gaps[dataIndex];
                            return `Gap: ${Math.abs(gap.toFixed(1))} ${gap > 0 ? 'FTEs needed' : 'FTEs surplus'}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of FTEs'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Programs'
                    }
                }
            }
        }
    });

    // Add summary statistics
    const container = document.getElementById('facultyLoad');
    const totalGap = gaps.reduce((sum, gap) => sum + gap, 0);
    const programsNeedingFaculty = gaps.filter(gap => gap > 0).length;
    
    const statsHtml = `
        <div class="row mt-4">
            <div class="col-md-4">
                <div class="metric-card">
                    <div class="metric-value">${Math.abs(totalGap.toFixed(1))}</div>
                    <div class="metric-label">Total ${totalGap > 0 ? 'Faculty Shortage' : 'Faculty Surplus'}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="metric-card">
                    <div class="metric-value">${programsNeedingFaculty}</div>
                    <div class="metric-label">Programs Needing Faculty</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="metric-card">
                    <div class="metric-value">${mockData.programs.length - programsNeedingFaculty}</div>
                    <div class="metric-label">Programs Adequately Staffed</div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', statsHtml);
} 