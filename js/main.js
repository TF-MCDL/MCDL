// Initialize all modules when the DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Wait for Chart.js to be fully loaded
        if (typeof Chart === 'undefined') {
            await new Promise(resolve => {
                const checkChart = setInterval(() => {
                    if (typeof Chart !== 'undefined') {
                        clearInterval(checkChart);
                        resolve();
                    }
                }, 100);
                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkChart);
                    throw new Error('Chart.js failed to load');
                }, 5000);
            });
        }

        // Validate that required data is loaded
        if (!window.mockData) {
            throw new Error('Required data not loaded. Please refresh the page.');
        }

        // Validate required data structures
        const requiredData = ['programs', 'facultyData', 'enrollmentData', 'costData', 'revenueData'];
        requiredData.forEach(key => {
            if (!window.mockData[key]) {
                throw new Error(`Missing required data: ${key}`);
            }
        });

        // Initialize modules that don't require tab visibility
        const moduleInits = [
            { name: 'Faculty Load', fn: initFacultyLoad },
            { name: 'Workload Gap', fn: initWorkloadGap },
            { name: 'Program Analytics', fn: initProgramAnalytics },
            { name: 'KPI Summary', fn: initKPISummary },
            { name: 'Employability', fn: initEmployability },
            { name: 'Skills Alignment', fn: initSkillsAlignment },
            { name: 'Impact Dashboard', fn: initImpactDashboard },
            { name: 'Executive Summary', fn: initExecutiveSummary },
            { name: 'Success Scorecard', fn: initSuccessScorecard },
            { name: 'Smart Allocation', fn: initSmartAllocation },
            { name: 'Faculty Planning', fn: initFacultyPlanning },
            { name: 'Viability Matrix', fn: initViabilityMatrix },
            { name: 'Portfolio Scenarios', fn: initPortfolioScenarios }
        ];

        // Initialize each module with error handling
        for (const module of moduleInits) {
            try {
                if (typeof module.fn === 'function') {
                    await Promise.resolve(module.fn());
                }
            } catch (error) {
                console.error(`Error initializing ${module.name} module:`, error);
                // Continue with other modules
            }
        }
        
        // Set up tab switching with proper chart handling
        const tabs = document.querySelectorAll('.nav-link');
        if (!tabs.length) {
            throw new Error('No tab elements found');
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', async function(e) {
                try {
                    // Get target tab
                    const targetId = this.getAttribute('data-bs-target');
                    if (!targetId) return;

                    // Update active states
                    tabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');

                    // Handle tab-specific initialization if needed
                    const tab = document.querySelector(targetId);
                    if (tab) {
                        tab.classList.add('show', 'active');
                    }
                } catch (error) {
                    console.error('Error in tab click handler:', error);
                    showErrorMessage(error);
                }
            });
        });

        // Show first tab by default
        const firstTab = document.querySelector('.nav-link');
        if (firstTab) {
            firstTab.click();
        }

    } catch (error) {
        console.error('Error initializing modules:', error);
        showErrorMessage(error);
    }
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // Prevent default browser error handling
    event.preventDefault();
    
    showErrorMessage(event);
});

// Utility function to show error messages
function showErrorMessage(error) {
    // Remove any existing error messages
    const existingErrors = document.querySelectorAll('.alert-danger');
    existingErrors.forEach(el => el.remove());
    
    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger m-3';
    errorDiv.innerHTML = `
        <strong>An unexpected error occurred.</strong><br>
        ${error.message || 'Unknown error'}<br>
        Please refresh the page or contact support if the problem persists.
    `;
    
    // Insert at the top of the body
    const firstChild = document.body.firstChild;
    document.body.insertBefore(errorDiv, firstChild);
} 