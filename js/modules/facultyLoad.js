// Faculty Load Summary Module
let fteDepartmentChart = null;
let loadTrendChart = null;

// Add department-specific base data
const departmentData = {
    'Business': {
        baseCurrentFTE: 15,
        baseRequiredFTE: 18,
        programs: ['BBA', 'MBA', 'Finance', 'Marketing'],
        courseLoad: 4, // courses per faculty
        avgClassSize: 35,
        sections: 24 // total course sections per term
    },
    'CompSci': {
        baseCurrentFTE: 12,
        baseRequiredFTE: 14,
        programs: ['Computer Science', 'Data Science', 'Cybersecurity'],
        courseLoad: 3,
        avgClassSize: 30,
        sections: 20
    },
    'Engineering': {
        baseCurrentFTE: 20,
        baseRequiredFTE: 22,
        programs: ['Mechanical', 'Electrical', 'Civil', 'Chemical'],
        courseLoad: 3,
        avgClassSize: 25,
        sections: 28
    },
    'Healthcare': {
        baseCurrentFTE: 16,
        baseRequiredFTE: 18,
        programs: ['Nursing', 'Public Health', 'Healthcare Admin'],
        courseLoad: 4,
        avgClassSize: 20,
        sections: 22
    }
};

function initFacultyLoad() {
    try {
        // Initialize charts
        initializeFTEChart();
        initializeTrendChart();
        initializeHeatMap();
        populateTermsDropdown();
        
        // Add event listeners to filters
        document.getElementById('termFilter').addEventListener('change', updateDashboard);
        document.getElementById('deptFilter').addEventListener('change', updateDashboard);
        document.getElementById('facultyTypeFilter').addEventListener('change', updateDashboard);
        
        // Initial dashboard update
        updateDashboard();
    } catch (error) {
        console.error('Error initializing faculty load module:', error);
        throw error;
    }
}

function populateTermsDropdown() {
    const termFilter = document.getElementById('termFilter');
    const currentDate = new Date();
    const terms = [];
    
    // Generate last 10 terms (including current term)
    for(let i = 0; i < 10; i++) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Determine term based on month
        let term;
        if(month >= 8) { // Fall term (Aug-Dec)
            term = `Fall ${year}`;
        } else if(month >= 5) { // Summer term (May-Jul)
            term = `Summer ${year}`;
        } else { // Spring term (Jan-Apr)
            term = `Spring ${year}`;
        }
        
        terms.push({
            value: term.toLowerCase().replace(' ', ''),
            label: term
        });
        
        // Move back one term
        currentDate.setMonth(currentDate.getMonth() - 4);
    }
    
    // Clear existing options
    termFilter.innerHTML = '';
    
    // Add terms to dropdown (most recent first)
    terms.forEach(term => {
        const option = document.createElement('option');
        option.value = term.value;
        option.textContent = term.label;
        termFilter.appendChild(option);
    });
}

function updateDashboard() {
    const filters = {
        term: document.getElementById('termFilter').value,
        department: document.getElementById('deptFilter').value,
        facultyType: document.getElementById('facultyTypeFilter').value
    };

    // Update all dashboard components
    updateKPICards(filters);
    updateFTEChart(filters);
    updateTrendChart(filters);
    updateHeatMap(filters);
}

function updateKPICards(filters) {
    try {
        const departments = ['Business', 'CompSci', 'Engineering', 'Healthcare'];
        let totalCurrentFTE = 0;
        let totalRequiredFTE = 0;
        let understaffed = 0;
        let overstaffed = 0;

        // Process only selected department if filter is applied
        const deptsToProcess = filters.department === 'all' ? departments : [filters.department];

        deptsToProcess.forEach(dept => {
            let currentFTE = 0;
            let requiredFTE = 0;

            if (filters.facultyType === 'all') {
                // Sum up all faculty types
                ['Full-time', 'Adjunct', 'Visiting'].forEach(type => {
                    const typeFilters = { ...filters, facultyType: type };
                    currentFTE += calculateDepartmentFTE(dept, typeFilters);
                    requiredFTE += calculateRequiredDepartmentFTE(dept, typeFilters);
                });
            } else {
                // Calculate for specific faculty type
                currentFTE = calculateDepartmentFTE(dept, filters);
                requiredFTE = calculateRequiredDepartmentFTE(dept, filters);
            }

            totalCurrentFTE += currentFTE;
            totalRequiredFTE += requiredFTE;

            // Calculate staffing status
            const gap = currentFTE - requiredFTE;
            const gapPercentage = (gap / requiredFTE) * 100;

            // Consider a department understaffed if it's more than 10% below required
            if (gapPercentage < -10) {
                understaffed++;
            }
            // Consider a department overstaffed if it's more than 10% above required
            else if (gapPercentage > 10) {
                overstaffed++;
            }

            console.log(`Department: ${dept}`);
            console.log(`Current FTE: ${currentFTE}`);
            console.log(`Required FTE: ${requiredFTE}`);
            console.log(`Gap %: ${gapPercentage}%`);
            console.log(`Status: ${gapPercentage < -10 ? 'Understaffed' : gapPercentage > 10 ? 'Overstaffed' : 'Optimal'}`);
            console.log('-------------------');
        });

        // Update KPI displays
        document.getElementById('totalFTE').textContent = totalCurrentFTE.toFixed(1);
        document.getElementById('requiredFTE').textContent = totalRequiredFTE.toFixed(1);
        document.getElementById('understaffedCount').textContent = understaffed;
        document.getElementById('overstaffedCount').textContent = overstaffed;

        // Update color coding
        const totalFTEElement = document.getElementById('totalFTE');
        const staffingRatio = (totalCurrentFTE / totalRequiredFTE) * 100;
        
        if (staffingRatio < 90) {
            totalFTEElement.className = 'mb-0 text-danger';
        } else if (staffingRatio > 110) {
            totalFTEElement.className = 'mb-0 text-warning';
        } else {
            totalFTEElement.className = 'mb-0 text-success';
        }

        // Update tooltips
        document.getElementById('understaffedCount').title = 
            `Departments with staffing more than 10% below required FTE`;
        document.getElementById('overstaffedCount').title = 
            `Departments with staffing more than 10% above required FTE`;
    } catch (error) {
        console.error('Error updating KPI cards:', error);
    }
}

function initializeFTEChart() {
    try {
        const canvas = document.getElementById('fteDepartmentChart');
        if (!canvas) {
            console.error('FTE Department Chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (fteDepartmentChart instanceof Chart) {
            fteDepartmentChart.destroy();
        }
        
        fteDepartmentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Current FTE',
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        data: []
                    },
                    {
                        label: 'Required FTE',
                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                        data: []
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
                            text: 'FTE Count'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Department'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y.toFixed(1);
                                return `${label}: ${value} FTE`;
                            },
                            afterBody: function(tooltipItems) {
                                const dataIndex = tooltipItems[0].dataIndex;
                                const currentFTE = tooltipItems[0].parsed.y;
                                const requiredFTE = fteDepartmentChart.data.datasets[1].data[dataIndex];
                                const gap = (requiredFTE - currentFTE).toFixed(1);
                                const status = gap > 0 ? 'Understaffed' : gap < 0 ? 'Overstaffed' : 'Optimal';
                                return [`Status: ${status}`, `Gap: ${Math.abs(gap)} FTE`];
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing FTE chart:', error);
        throw error;
    }
}

function initializeTrendChart() {
    try {
        const canvas = document.getElementById('loadTrendChart');
        if (!canvas) {
            console.error('Load Trend Chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (loadTrendChart instanceof Chart) {
            loadTrendChart.destroy();
        }
        
        loadTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Faculty Load',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true,
                    data: []
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
                            text: 'FTE Count'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Faculty Load Trend'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `FTE: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing trend chart:', error);
        throw error;
    }
}

function initializeHeatMap() {
    try {
        const container = document.getElementById('loadHeatMap');
        if (!container) {
            console.error('Heat map container not found');
            return;
        }

        // Clear existing content
        container.innerHTML = '';
        
        // Add CSS classes
        container.className = 'heatmap-container';
        
        // Initial update will be handled by updateHeatMap()
    } catch (error) {
        console.error('Error initializing heat map:', error);
    }
}

function updateFTEChart(filters) {
    try {
        if (!fteDepartmentChart) {
            console.warn('FTE chart not initialized');
            return;
        }

        const departments = ['Business', 'CompSci', 'Engineering', 'Healthcare'];
        const currentFTE = departments.map(dept => calculateDepartmentFTE(dept, filters));
        const requiredFTE = departments.map(dept => calculateRequiredDepartmentFTE(dept, filters));

        // Update chart
        fteDepartmentChart.data.labels = departments;
        fteDepartmentChart.data.datasets[0].data = currentFTE;
        fteDepartmentChart.data.datasets[1].data = requiredFTE;
        
        // Update title
        fteDepartmentChart.options.plugins.title = {
            display: true,
            text: `FTE Distribution by Department (${document.getElementById('termFilter').options[document.getElementById('termFilter').selectedIndex].text})`
        };
        
        fteDepartmentChart.update();
    } catch (error) {
        console.error('Error updating FTE chart:', error);
    }
}

function updateTrendChart(filters) {
    try {
        if (!loadTrendChart) {
            console.warn('Trend chart not initialized');
            return;
        }

        const selectedDept = filters.department;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        
        // Generate trend data based on current FTE values
        const trendData = months.map((_, index) => {
            let totalFTE = 0;
            
            // If specific department is selected, only show its trend
            if (selectedDept !== 'all') {
                const deptInfo = departmentData[selectedDept];
                if (deptInfo) {
                    // Base calculation on current FTE with some variation
                    const baseFTE = deptInfo.baseCurrentFTE;
                    // Add seasonal variation and growth trend
                    totalFTE = baseFTE * (1 + (index * 0.03)) * (1 + Math.sin(index * Math.PI / 6) * 0.1);
                }
            } else {
                // Sum up all departments
                Object.keys(departmentData).forEach(dept => {
                    const deptInfo = departmentData[dept];
                    const baseFTE = deptInfo.baseCurrentFTE;
                    // Add seasonal variation and growth trend
                    totalFTE += baseFTE * (1 + (index * 0.02)) * (1 + Math.sin(index * Math.PI / 6) * 0.1);
                });
            }
            
            return Number(totalFTE.toFixed(1));
        });

        // Update chart
        loadTrendChart.data.labels = months;
        loadTrendChart.data.datasets[0].data = trendData;
        
        // Update chart title
        loadTrendChart.options.plugins.title = {
            display: true,
            text: `Faculty Load Trend ${selectedDept !== 'all' ? '- ' + selectedDept : '(All Departments)'}`
        };
        
        loadTrendChart.update();
    } catch (error) {
        console.error('Error updating trend chart:', error);
    }
}

function getTermFactor(term) {
    try {
        // Extract just the season part (fall, spring, summer) by removing any digits
        const season = term.toLowerCase().replace(/[0-9]/g, '');
        
        switch (season) {
            case 'fall':
                return 1.0;  // 100% for Fall
            case 'spring':
                return 0.9;  // 90% for Spring
            case 'summer':
                return 0.7;  // 70% for Summer
            default:
                console.warn(`Invalid term format: ${term}. Expected format: fall/spring/summer + optional year. Using default factor.`);
                return 1.0;  // Default to 100% if unknown
        }
    } catch (error) {
        console.error('Error in getTermFactor:', error);
        return 1.0; // Default to 100% in case of error
    }
}

function updateHeatMap(filters) {
    try {
        const departments = ['Business', 'CompSci', 'Engineering', 'Healthcare'];
        const facultyTypes = ['Full-time', 'Adjunct', 'Visiting'];
        const heatmapData = [];

        // Only process selected department if filter is applied
        const deptsToProcess = filters.department === 'all' ? departments : [filters.department];

        deptsToProcess.forEach(dept => {
            facultyTypes.forEach(type => {
                // Skip if faculty type filter is applied and doesn't match
                if (filters.facultyType !== 'all' && filters.facultyType !== type) {
                    return;
                }

                const currentFTE = calculateFacultyTypeFTE(dept, type, filters);
                const requiredFTE = calculateRequiredFacultyTypeFTE(dept, type, filters);
                const percentage = ((currentFTE / requiredFTE) * 100).toFixed(1);

                heatmapData.push({
                    department: dept,
                    facultyType: type,
                    percentage: isNaN(percentage) ? '0.0' : percentage,
                    color: getHeatMapColor(percentage)
                });
            });
        });

        // Get heat map container
        const heatmapContainer = document.getElementById('loadHeatMap');
        if (!heatmapContainer) {
            console.error('Heat map container not found');
            return;
        }

        // Clear existing heat map
        heatmapContainer.innerHTML = '';

        // Create header row
        const headerRow = document.createElement('div');
        headerRow.className = 'heatmap-row header';
        headerRow.innerHTML = `
            <div class="heatmap-cell"></div>
            ${facultyTypes.map(type => 
                filters.facultyType === 'all' || filters.facultyType === type ? 
                `<div class="heatmap-cell">${type}</div>` : 
                ''
            ).join('')}
        `;
        heatmapContainer.appendChild(headerRow);

        // Create data rows
        deptsToProcess.forEach(dept => {
            const row = document.createElement('div');
            row.className = 'heatmap-row';
            
            // Add department name
            const deptCell = document.createElement('div');
            deptCell.className = 'heatmap-cell dept-name';
            deptCell.textContent = dept;
            row.appendChild(deptCell);
            
            // Add faculty type cells
            facultyTypes.forEach(type => {
                if (filters.facultyType === 'all' || filters.facultyType === type) {
                    const data = heatmapData.find(d => d.department === dept && d.facultyType === type);
                    if (data) {
                        const cell = document.createElement('div');
                        cell.className = 'heatmap-cell load-cell';
                        cell.style.backgroundColor = data.color;
                        cell.textContent = `${data.percentage}%`;
                        cell.style.color = parseFloat(data.percentage) > 50 ? 'white' : 'black';
                        cell.title = `${dept} - ${type}\nLoad: ${data.percentage}%`;
                        row.appendChild(cell);
                    }
                }
            });
            
            heatmapContainer.appendChild(row);
        });
    } catch (error) {
        console.error('Error updating heat map:', error);
    }
}

function calculateFacultyTypeFTE(department, facultyType, filters) {
    try {
        const deptData = departmentData[department];
        if (!deptData) return 0;

        const termFactor = getTermFactor(filters.term);
        let baseFTE = deptData.baseCurrentFTE;

        // Apply faculty type distribution
        switch (facultyType) {
            case 'Full-time':
                baseFTE *= 0.7; // 70% full-time
                break;
            case 'Adjunct':
                baseFTE *= 0.2; // 20% adjunct
                break;
            case 'Visiting':
                baseFTE *= 0.1; // 10% visiting
                break;
        }

        return Number((baseFTE * termFactor).toFixed(1));
    } catch (error) {
        console.error('Error calculating faculty type FTE:', error);
        return 0;
    }
}

function calculateRequiredFacultyTypeFTE(department, facultyType, filters) {
    try {
        const deptData = departmentData[department];
        if (!deptData) return 0;

        const termFactor = getTermFactor(filters.term);
        let baseFTE = deptData.baseRequiredFTE;

        // Apply faculty type distribution
        switch (facultyType) {
            case 'Full-time':
                baseFTE *= 0.7; // Target 70% full-time
                break;
            case 'Adjunct':
                baseFTE *= 0.2; // Target 20% adjunct
                break;
            case 'Visiting':
                baseFTE *= 0.1; // Target 10% visiting
                break;
        }

        return Number((baseFTE * termFactor).toFixed(1));
    } catch (error) {
        console.error('Error calculating required faculty type FTE:', error);
        return 0;
    }
}

// Helper functions
function matchesFilters(program, filters) {
    if (filters.department !== 'all' && program.department !== filters.department) return false;
    if (filters.program !== 'all' && program.id !== filters.program) return false;
    return true;
}

function getCurrentFTE(program, filters) {
    const facultyData = window.facultyData.currentFTE[program.id];
    // Filter by faculty type if specified
    if (filters.facultyType !== 'all') {
        return facultyData[facultyData.length - 1].value * 
            (filters.facultyType === 'fulltime' ? 0.7 : 0.3); // Approximate split between full-time and adjunct
    }
    return facultyData[facultyData.length - 1].value;
}

function getRequiredFTE(program, filters) {
    const facultyData = window.facultyData.requiredFTE[program.id];
    // Adjust required FTE based on term (assuming some seasonal variation)
    const termAdjustment = {
        'fall': 1,
        'spring': 0.9,
        'summer': 0.7
    };
    const term = filters.term.toLowerCase().includes('fall') ? 'fall' : 
                 filters.term.toLowerCase().includes('spring') ? 'spring' : 'summer';
    
    return facultyData[facultyData.length - 1].value * termAdjustment[term];
}

function calculateDepartmentFTE(dept, filters) {
    try {
        const deptInfo = departmentData[dept];
        if (!deptInfo) return 0;

        // Get term adjustment factor
        const termFactor = getTermFactor(filters.term);
        let baseFTE = deptInfo.baseCurrentFTE;

        // Apply faculty type filter if specified
        if (filters.facultyType !== 'all') {
            switch (filters.facultyType) {
                case 'Full-time':
                    baseFTE *= 0.7; // 70% full-time
                    break;
                case 'Adjunct':
                    baseFTE *= 0.2; // 20% adjunct
                    break;
                case 'Visiting':
                    baseFTE *= 0.1; // 10% visiting
                    break;
            }
        }

        // Apply term adjustment
        return Number((baseFTE * termFactor).toFixed(1));
    } catch (error) {
        console.error(`Error calculating current FTE for ${dept}:`, error);
        return 0;
    }
}

function calculateRequiredDepartmentFTE(dept, filters) {
    try {
        const deptInfo = departmentData[dept];
        if (!deptInfo) return 0;

        // Get term adjustment factor
        const termFactor = getTermFactor(filters.term);
        let baseFTE = deptInfo.baseRequiredFTE;

        // Apply faculty type filter if specified
        if (filters.facultyType !== 'all') {
            switch (filters.facultyType) {
                case 'Full-time':
                    baseFTE *= 0.7; // Target 70% full-time
                    break;
                case 'Adjunct':
                    baseFTE *= 0.2; // Target 20% adjunct
                    break;
                case 'Visiting':
                    baseFTE *= 0.1; // Target 10% visiting
                    break;
            }
        }

        // Apply term adjustment
        return Number((baseFTE * termFactor).toFixed(1));
    } catch (error) {
        console.error(`Error calculating required FTE for ${dept}:`, error);
        return 0;
    }
}

function getHeatMapColor(percentage) {
    // Convert percentage string to number if needed
    const value = parseFloat(percentage) / 100;
    
    // Enhanced color scale
    if (value < 0.5) {
        // Green to Yellow gradient for under 50%
        const r = Math.round(255 * (value * 2));
        const g = 255;
        const b = 0;
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
    } else {
        // Yellow to Red gradient for over 50%
        const r = 255;
        const g = Math.round(255 * (2 - value * 2));
        const b = 0;
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
    }
}

// Update or create the style element
const heatMapStyles = `
    .heatmap-container {
        display: flex;
        flex-direction: column;
        gap: 1px;
        background: #f0f0f0;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
    }

    .heatmap-row {
        display: grid;
        grid-template-columns: 150px repeat(3, 1fr);
        gap: 1px;
    }

    .heatmap-cell {
        padding: 12px;
        text-align: center;
        background: white;
        font-size: 0.9rem;
        font-weight: 500;
        border-radius: 4px;
    }

    .header .heatmap-cell {
        font-weight: bold;
        background: #f8f9fa;
        color: #495057;
    }

    .dept-name {
        font-weight: bold;
        background: #f8f9fa;
        color: #495057;
        display: flex;
        align-items: center;
        padding-left: 1rem;
    }

    .load-cell {
        transition: all 0.3s ease;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .load-cell:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
`;

// Apply styles
let styleElement = document.getElementById('heatmap-styles');
if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'heatmap-styles';
    document.head.appendChild(styleElement);
}
styleElement.textContent = heatMapStyles;

// Initialize the module
document.addEventListener('DOMContentLoaded', initFacultyLoad); 