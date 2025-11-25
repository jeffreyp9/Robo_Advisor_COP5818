// Jeffrey Potvin, Krishana Thapa, Alexey Akopov
// Final Project
// COP 5818
// PIDs: 5066496, 5663249, 5013953

// import models
const UserProfile = require('../models/UserProfile');
const LifeExpectancy = require('../models/LifeExpectancy');

// Controller to calculate portfolio allocation
const calculatePortfolio = async (req, res) => {
  try {
    const {
      email,
      age,
      retirementAge,
      gender,
      income,
      maritalStatus,
      spouseIncome,
      kids,
      homeowner,
      significantDebt
    } = req.body;

    // Ensure required fields are present for calculation
    if (!email || !age || !retirementAge || !gender || income === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, age, retirementAge, gender, income' 
      });
    }

    // Validate retirement age
    if (retirementAge <= age) {
      return res.status(400).json({ 
        error: 'Retirement age must be greater than current age' 
      });
    }

    // Find life expectancy from database
    let lifeExpectancy;
    
    try {
      // Find the life expectancy record for the given age
      const lifeExpectancyRecord = await LifeExpectancy.findOne({ age });
      
      // If found, calculate total life expectancy
      if (lifeExpectancyRecord) {
        // Calculate remaining years based on gender
        const remainingYears = gender.toLowerCase() === 'male' ? 
          lifeExpectancyRecord.male : lifeExpectancyRecord.female;
        // convert the remaining years to total
        lifeExpectancy = age + remainingYears;
      } else {
        // return error if not found
        return res.status(400).json({ 
          error: `Life expectancy data is not found for age ${age}.` 
        });
      }
      // if database error in spicific lookup 
    } catch (dbError) {
      console.error('Database lookup failed:', dbError.message);
      return res.status(500).json({ 
        error: 'Unable to retrieve life expectancy data. Please try again later.' 
      });
    }

    // Calculate investment horizon which is the years until retirement
    const investmentHorizon = retirementAge - age;

    // Create the base allocation based on investment horizon
    let equityPercentage;
    let riskLevel;
    
    // If investment horizon is greater than 35 years 
    // then aggressive
    if (investmentHorizon > 35) {
      equityPercentage = 80;
      riskLevel = 'Aggressive';
    // If investment horizon is between 20 and 35 years
    // then moderate
    } else if (investmentHorizon >= 20) {
      equityPercentage = 60;
      riskLevel = 'Moderate';
    // Otherwise conservative
    } else {
      equityPercentage = 40;
      riskLevel = 'Conservative';
    }

    // Apply modifiers to the base allocation
    
    // Income modifier for high and low income to adjust risk
    if (income > 100000) {
      equityPercentage += 10;
    } else if (income < 50000) {
      equityPercentage -= 10;
    }

    // Marital status modifier for married individuals
    if (maritalStatus === 'married') {
      equityPercentage -= 5;
      
      // Spouse income modifier if the user is married
      if (spouseIncome > 50000) {
        equityPercentage += 10;
      }
    }

    // Kids modifier for families with more than 2 children
    if (kids > 2) {
      equityPercentage -= 10;
    }

    // Homeowner modifier for homeowners
    if (homeowner) {
      equityPercentage += 10;
    }

    // Debt modifier for individuals with significant debt
    if (significantDebt) {
      equityPercentage -= 10;
    }

    // Ensure equity percentage is within 0-100% 
    equityPercentage = Math.max(0, Math.min(100, equityPercentage));
    const fixedIncomePercentage = 100 - equityPercentage;

    // Determine risk level based on final equity percentage
    if (equityPercentage >= 70) {
      riskLevel = 'Aggressive';
    } else if (equityPercentage >= 45) {
      riskLevel = 'Moderate';
    } else {
      riskLevel = 'Conservative';
    }

    // create the user profile data for storage in the database
    const profileData = {
      email: email.toLowerCase().trim(),
      age: parseInt(age),
      retirementAge: parseInt(retirementAge),
      gender: gender.toLowerCase(),
      income: parseFloat(income),
      maritalStatus,
      spouseIncome: parseFloat(spouseIncome) || 0,
      kids: parseInt(kids) || 0,
      homeowner: Boolean(homeowner),
      significantDebt: Boolean(significantDebt),
      lifeExpectancy: Math.round(lifeExpectancy * 10) / 10,
      investmentHorizon: investmentHorizon,
      riskLevel,
      equityPercentage: Math.round(equityPercentage),
      fixedIncomePercentage: Math.round(fixedIncomePercentage)
    };

    // save the user profile data to the database
    const userProfile = await UserProfile.findOneAndUpdate(
      { email: profileData.email },
      profileData,
      // use upsert to create new if the user does not exist and return the new document
      { upsert: true, new: true, runValidators: true }
    );

    // output the saved profile for debugging
    console.log('Saved userProfile:', {
      retirementAge: userProfile.retirementAge,
      lifeExpectancy: userProfile.lifeExpectancy,
      investmentHorizon: userProfile.investmentHorizon
    });

    // return the results of the calculation for display on the frontend
    res.json({
      success: true,
      data: {
        email: userProfile.email,
        retirementAge: userProfile.retirementAge,
        lifeExpectancy: userProfile.lifeExpectancy,
        investmentHorizon: userProfile.investmentHorizon,
        riskLevel: userProfile.riskLevel,
        allocation: {
          equity: userProfile.equityPercentage,
          fixedIncome: userProfile.fixedIncomePercentage
        },
        profile: userProfile
      }
    });
    // if any error occurs during the process
  } catch (error) {
    // display the error in the console for debugging
    console.error('Error calculating portfolio:', error);
    res.status(500).json({ 
      // also return a generic error message to the user
      error: 'Internal server error while calculating portfolio' 
    });
  }
};

// Controller to get user profile by email
const getUserProfile = async (req, res) => {
  try {
    const { email } = req.params;
    // Validate email parameter
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    // Find the document for this email
    const userProfile = await UserProfile.findOne({ 
      email: email.toLowerCase().trim() 
    }).sort({ createdAt: -1 });
    // if no profile is found for this email return a message
    if (!userProfile) {
      return res.status(404).json({ 
        error: 'No profile found for this email address' 
      });
    }
    // else return the profile data
    res.json({
      success: true,
      data: {
        email: userProfile.email,
        retirementAge: userProfile.retirementAge,
        lifeExpectancy: userProfile.lifeExpectancy,
        investmentHorizon: userProfile.investmentHorizon,
        riskLevel: userProfile.riskLevel,
        allocation: {
          equity: userProfile.equityPercentage,
          fixedIncome: userProfile.fixedIncomePercentage
        },
        profile: userProfile
      }
    });

  } catch (error) {
    // display the error in the console for debugging
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ 
      // also return a generic error message to the user
      error: 'Internal server error while retrieving profile' 
    });
  }
};

// export the controller functions
module.exports = {
  calculatePortfolio,
  getUserProfile
};