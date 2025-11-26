// Jeffrey Potvin, Krishana Thapa, Alexey Akopov
// Final Project
// COP 5818
// PIDs: 5066496, 5663249, 5013953

// Global variables
let currentChart = null;

// Document elements
const advisorForm = document.getElementById('advisorForm');
const maritalStatusSelect = document.getElementById('maritalStatus');
const spouseIncomeGroup = document.getElementById('spouseIncomeGroup');
const resultsSection = document.getElementById('resultsSection');
const loadingDiv = document.getElementById('loading');
const errorMessageDiv = document.getElementById('errorMessage');
const loadProfileBtn = document.getElementById('loadProfileBtn');

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Show/hide spouse income field based on marital status
    maritalStatusSelect.addEventListener('change', function() {
        if (this.value === 'married') {
            spouseIncomeGroup.style.display = 'block';
            document.getElementById('spouseIncome').required = false; // Optional field
        } else {
            spouseIncomeGroup.style.display = 'none';
            document.getElementById('spouseIncome').value = '0';
        }
    });

    // Handle form submission
    advisorForm.addEventListener('submit', handleFormSubmission);
    
    // Handle load profile button
    loadProfileBtn.addEventListener('click', handleLoadProfile);
});

// Handle form submission
async function handleFormSubmission(event) {
    event.preventDefault();
    
    // Hide previous results and errors
    hideResults();
    hideError();
    showLoading();

    try {
        // Collect form data
        const formData = new FormData(advisorForm);
        const userData = {
            email: formData.get('email'),
            age: parseInt(formData.get('age')),
            retirementAge: parseInt(formData.get('retirementAge')),
            gender: formData.get('gender'),
            income: parseFloat(formData.get('income')),
            maritalStatus: formData.get('maritalStatus'),
            spouseIncome: parseFloat(formData.get('spouseIncome')) || 0,
            kids: parseInt(formData.get('kids')) || 0,
            homeowner: formData.has('homeowner'),
            significantDebt: formData.has('significantDebt')
        };

        // Validate required fields
        if (!userData.email || !userData.age || !userData.retirementAge || !userData.gender || userData.income === undefined) {
            throw new Error('Please fill in all required fields');
        }

        if (userData.age < 20 || userData.age > 80) {
            throw new Error('Current age must be between 20 and 80 years');
        }

        if (userData.retirementAge < 50 || userData.retirementAge > 80) {
            throw new Error('Retirement age must be between 50 and 80 years');
        }

        if (userData.retirementAge <= userData.age) {
            throw new Error('Retirement age must be greater than current age');
        }

        // Send data to backend
        const response = await fetch('/api/advisor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to calculate portfolio');
        }
        
        // Display results
        displayResults(result.data);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An error occurred while calculating your portfolio');
    } finally {
        hideLoading();
    }
}

// Display the calculated results
function displayResults(data) {
    // Update summary cards
    const retirementAgeElement = document.getElementById('retirementAgeDisplay');
    const lifeExpectancyElement = document.getElementById('lifeExpectancyDisplay');
    
    if (retirementAgeElement) {
        retirementAgeElement.textContent = data.retirementAge || '0';
    }
    
    document.getElementById('investmentHorizon').textContent = data.investmentHorizon || '0';
    document.getElementById('riskLevel').textContent = data.riskLevel || 'Unknown';
    
    if (lifeExpectancyElement) {
        lifeExpectancyElement.textContent = data.lifeExpectancy ? data.lifeExpectancy.toFixed(1) : '0.0';
    }
    
    // Update allocation details
    document.getElementById('equityPercentage').textContent = `${data.allocation.equity}%`;
    document.getElementById('bondsPercentage').textContent = `${data.allocation.fixedIncome}%`;
    
    // Create or update the pie chart
    createAllocationChart(data.allocation);
    
    // Show results section
    resultsSection.style.display = 'block';
    
    // Smooth scroll to results
    resultsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Create allocation pie chart using Chart.js
// We used https://www.chartjs.org/docs/latest/ to implement this function
function createAllocationChart(allocation) {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (currentChart) {
        currentChart.destroy();
    }
    
    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Equity (SPY/VOO)', 'Fixed Income (BND/AGG)'],
            datasets: [{
                data: [allocation.equity, allocation.fixedIncome],
                backgroundColor: [
                    'rgba(79, 172, 254, 0.8)',  // Blue for equity
                    'rgba(67, 233, 123, 0.8)'   // Green for fixed income
                ],
                borderColor: [
                    'rgba(79, 172, 254, 1)',
                    'rgba(67, 233, 123, 1)'
                ],
                borderWidth: 3,
                hoverBackgroundColor: [
                    'rgba(79, 172, 254, 1)',
                    'rgba(67, 233, 123, 1)'
                ],
                hoverBorderColor: [
                    'rgba(79, 172, 254, 1)',
                    'rgba(67, 233, 123, 1)'
                ],
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Recommended Asset Allocation',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    color: '#4a5568',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14,
                            weight: '500'
                        },
                        color: '#4a5568',
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value}%`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutQuart'
            },
            elements: {
                arc: {
                    borderWidth: 0
                }
            }
        }
    });
}

// Utility functions for showing/hiding elements
function showLoading() {
    loadingDiv.style.display = 'block';
    loadingDiv.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    errorMessageDiv.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

function hideError() {
    errorMessageDiv.style.display = 'none';
}

function hideResults() {
    resultsSection.style.display = 'none';
}

// Input validation helpers
function validateEmail(email) {
    return email && email.includes('@') && email.includes('.');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Add real-time input validation
document.addEventListener('DOMContentLoaded', function() {
    // Email validation
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            this.style.borderColor = '#e53e3e';
        } else {
            this.style.borderColor = '#e2e8f0';
        }
    });

    // Age validation
    const ageInput = document.getElementById('age');
    const retirementAgeInput = document.getElementById('retirementAge');
    
    ageInput.addEventListener('input', function() {
        const age = parseInt(this.value);
        if (age && (age < 20 || age > 80)) {
            this.style.borderColor = '#e53e3e';
            this.title = 'Current age must be between 20 and 80 years';
        } else {
            this.style.borderColor = '#e2e8f0';
            this.title = '';
        }
        validateRetirementAge();
    });

    // Retirement age validation
    retirementAgeInput.addEventListener('input', function() {
        const retirementAge = parseInt(this.value);
        if (retirementAge && (retirementAge < 50 || retirementAge > 80)) {
            this.style.borderColor = '#e53e3e';
            this.title = 'Retirement age must be between 50 and 80 years';
        } else {
            this.style.borderColor = '#e2e8f0';
            this.title = '';
        }
        validateRetirementAge();
    });

    function validateRetirementAge() {
        const age = parseInt(ageInput.value);
        const retirementAge = parseInt(retirementAgeInput.value);
        
        if (age && retirementAge && retirementAge <= age) {
            retirementAgeInput.style.borderColor = '#e53e3e';
            retirementAgeInput.title = 'Retirement age must be greater than current age';
        } else if (retirementAge && (retirementAge >= 50 && retirementAge <= 80)) {
            retirementAgeInput.style.borderColor = '#e2e8f0';
            retirementAgeInput.title = '';
        }
    }

    // Income formatting
    const incomeInput = document.getElementById('income');
    incomeInput.addEventListener('blur', function() {
        const value = parseFloat(this.value);
        if (value && value >= 0) {
            this.placeholder = formatCurrency(value);
        }
    });

    const spouseIncomeInput = document.getElementById('spouseIncome');
    spouseIncomeInput.addEventListener('blur', function() {
        const value = parseFloat(this.value);
        if (value && value >= 0) {
            this.placeholder = formatCurrency(value);
        }
    });
});

// Handle load previous profile
async function handleLoadProfile() {
    try {
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        
        if (!email) {
            alert('Please enter an email address first');
            emailInput.focus();
            return;
        }
        
        // Disable button and show loading
        loadProfileBtn.disabled = true;
        loadProfileBtn.textContent = 'Loading...';
        
        // Fetch previous profile
        const response = await fetch(`/api/advisor/${encodeURIComponent(email)}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to load profile');
        }
        
        // Fill form with previous data and show results
        const profile = result.data.profile;
        fillFormWithProfile(profile);
        displayResults(result.data);
        
        // Show success message
        alert('Previous profile loaded successfully!');
        
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Error: ' + error.message);
    } finally {
        // Re-enable button
        loadProfileBtn.disabled = false;
        loadProfileBtn.textContent = 'Load Previous Profile';
    }
}

// Fill form with profile data
function fillFormWithProfile(profile) {
    document.getElementById('age').value = profile.age;
    document.getElementById('retirementAge').value = profile.retirementAge;
    document.getElementById('gender').value = profile.gender;
    document.getElementById('income').value = profile.income;
    document.getElementById('maritalStatus').value = profile.maritalStatus;
    document.getElementById('spouseIncome').value = profile.spouseIncome || 0;
    document.getElementById('kids').value = profile.kids || 0;
    document.getElementById('homeowner').checked = profile.homeowner || false;
    document.getElementById('significantDebt').checked = profile.significantDebt || false;
    
    // Trigger marital status change to show/hide spouse income
    maritalStatusSelect.dispatchEvent(new Event('change'));
}