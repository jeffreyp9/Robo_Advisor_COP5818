# Robo-Advisor Chatbot (Group 20)

## Overview

This full-stack web application serves as a "Robo-Advisor" to democratize personalized asset allocation. It uses a Node.js/Express backend and a MongoDB database to calculate a user's life expectancy based on official SSA Actuarial Life Tables. The system processes financial and demographic inputs (such as income, marital status, and debt) to generate a tailored investment portfolio (Equity vs. Fixed Income) and visualizes the results using Chart.js.

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd Robo_Advisor
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    MONGO_URI=mongodb://localhost:27017/robo-advisor
    PORT=3000
    ```

4.  **Seed the Database:**
    Run the seed script to populate MongoDB with the SSA Actuarial Life Table data (derived from official 2022 SSA statistics).
    ```bash
    npm run seed
    ```

5.  **Run the application:**
    ```bash
    npm start
    ```
    Access the UI at: `http://localhost:3000`

## API Endpoints

### Advisor Operations

-   `POST /api/advisor` – Submits user financial data, calculates life expectancy and risk profile, saves the profile to MongoDB, and returns the asset allocation.
-   `GET /api/advisor/:email` – Retrieves the most recent investment profile for a specific user email.

## Asset Allocation Logic

The engine determines the Equity (Stocks) / Fixed Income (Bonds) split based on:

1.  **Investment Horizon:** Calculated as `Life Expectancy - Current Age`.
    * Horizon > 35 years: **80/20** (Aggressive)
    * Horizon 20-35 years: **60/40** (Moderate)
    * Horizon < 20 years: **40/60** (Conservative)
2.  **Modifiers:**
    * High Income (>$100k): **+10% Equity**
    * Low Income (<$50k): **-10% Equity**
    * Married: **-5% Equity** (Conservative shift)
    * Homeowner: **+10% Equity** (Stability boost)
    * Significant Debt: **-10% Equity** (Risk reduction)


## References

-   [SSA Actuarial Life Tables](https://www.ssa.gov/oact/STATS/table4c6.html)
-   [FINRA - Managing Retirement Income](https://www.finra.org/investors/learn-to-invest/types-investments/retirement/managing-retirement-income/sources-retirement-income)

## Authors

**Jeffrey Potvin** (PID: 5066496)
**Krishana Thapa** (PID: 5663249)
**Alexey Akopov** (PID: 5013953)

## Github Repository
https://github.com/jeffreyp9/Robo_Advisor_COP5818