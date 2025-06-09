// Initialize all modules when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
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

        // Initialize all modules
        initFacultyLoad();
        initWorkloadGap();
        initProgramAnalytics();
        initKPISummary();
        initEmployability();
        initSkillsAlignment();
        initImpactDashboard();
        initExecutiveSummary();
        initSuccessScorecard();
        initSmartAllocation();
        initFacultyPlanning();
        initViabilityMatrix();
        initPortfolioScenarios();
        
        // Set up tab switching
        const tabs = document.querySelectorAll('.nav-link');
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-bs-target');
                if (!targetId) return;
                
                // Hide all tab panes
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                
                // Show selected tab pane
                const targetPane = document.getElementById(targetId.substring(1));
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                }
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    } catch (error) {
        console.error('Error initializing modules:', error);
        // Display error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger m-3';
        errorDiv.innerHTML = `
            <h4 class="alert-heading">Error Loading Dashboard</h4>
            <p>${error.message}</p>
            <hr>
            <p class="mb-0">Please try refreshing the page. If the problem persists, contact support.</p>
        `;
        document.body.insertBefore(errorDiv, document.body.firstChild);
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
    
    // Display user-friendly error message if needed
    if (!document.querySelector('.alert-danger')) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger m-3';
        errorDiv.innerHTML = `
            <strong>An unexpected error occurred.</strong><br>
            ${event.message}<br>
            Please refresh the page or contact support if the problem persists.
        `;
        document.body.prepend(errorDiv);
    }
}); 