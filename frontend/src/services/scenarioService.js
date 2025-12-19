import { enhancedExcelService } from "./enhancedExcelService"

export const scenarioService = {
  analyzeScenario: async (scenarioData) => {
    try {
      // Get current user ID
      const userId = localStorage.getItem("user_id")

      // Get file ID
      const fileId = localStorage.getItem(`uploadedFileId_${userId}`)

      if (!fileId) {
        throw new Error("No document found")
      }

      // Simulate scenario analysis
      const result = {
        scenario: scenarioData,
        impact: {
          revenue: Math.random() * 50000 - 25000,
          expenses: Math.random() * 30000 - 15000,
          profit: Math.random() * 20000 - 10000,
        },
        risk_level: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      }

      return result
    } catch (error) {
      console.error("Error analyzing scenario:", error)
      throw error
    }
  },

  getSavedScenarios: async () => {
    try {
      // Get current user ID
      const userId = localStorage.getItem("user_id")

      // Get file ID
      const fileId = localStorage.getItem(`uploadedFileId_${userId}`)

      if (!fileId) {
        throw new Error("No document found")
      }

      // Return saved scenarios
      return [
        {
          id: 1,
          name: "Delayed Payment",
          description: "Impact of clients delaying payments by 30 days",
          date_created: "2023-05-15",
          impact: {
            revenue: -15000,
            expenses: 0,
            profit: -15000,
          },
          risk_level: "Medium",
        },
        {
          id: 2,
          name: "Cost Reduction",
          description: "Impact of reducing operational costs by 10%",
          date_created: "2023-06-02",
          impact: {
            revenue: 0,
            expenses: -25000,
            profit: 25000,
          },
          risk_level: "Low",
        },
      ]
    } catch (error) {
      console.error("Error fetching saved scenarios:", error)
      throw error
    }
  },

  getPredefinedScenarios: async () => {
    try {
      // Get current user ID
      const userId = localStorage.getItem("user_id")

      // Get file ID
      const fileId = localStorage.getItem(`uploadedFileId_${userId}`)

      if (!fileId) {
        throw new Error("No document found")
      }

      // Verify we have access to the actual data
      const cashFlowData = enhancedExcelService.getCashFlowData(fileId)
      const revenueExpensesData = enhancedExcelService.getRevenueExpensesData(fileId)
      const projectData = enhancedExcelService.getProjectProfitabilityData(fileId)

      // Log data verification
      console.log("VERIFICATION - Using actual uploaded Excel data for scenarios:")
      console.log("Cash Flow Data Sample:", {
        months: cashFlowData.months ? cashFlowData.months.slice(0, 3) : "No months data",
        inflows: cashFlowData.inflows ? cashFlowData.inflows.slice(0, 3) : "No inflows data",
        outflows: cashFlowData.outflows ? cashFlowData.outflows.slice(0, 3) : "No outflows data",
      })
      console.log("Revenue Data Sample:", {
        categories: revenueExpensesData.revenue_categories
          ? revenueExpensesData.revenue_categories.slice(0, 3)
          : "No revenue categories",
        amounts: revenueExpensesData.revenue_amounts
          ? revenueExpensesData.revenue_amounts.slice(0, 3)
          : "No revenue amounts",
      })
      console.log("Project Data Sample:", {
        names: projectData.project_names ? projectData.project_names.slice(0, 3) : "No project names",
        revenues: projectData.total_revenue ? projectData.total_revenue.slice(0, 3) : "No project revenues",
      })

      // Create scenarios based on the actual data
      const scenarios = [
        {
          id: 1,
          name: "Delayed Payment",
          description: "Impact of clients delaying payments by 30 days",
          parameters: {
            scenario_type: "payment_delay",
            delay_days: 30,
          },
        },
        {
          id: 2,
          name: "Cost Reduction",
          description: "Impact of reducing operational costs by 10%",
          parameters: {
            scenario_type: "cost_reduction",
            reduction_percentage: 10,
          },
        },
        {
          id: 3,
          name: "Revenue Increase",
          description: "Impact of increasing revenue by 15%",
          parameters: {
            scenario_type: "revenue_increase",
            increase_percentage: 15,
          },
        },
      ]

      // Add scenarios based on actual projects if available
      if (projectData && projectData.project_names && projectData.project_names.length > 0) {
        const projectScenarios = projectData.project_names.map((name, index) => ({
          id: 4 + index,
          name: `${name} Delay`,
          description: `Impact of delaying ${name} by 2 months`,
          parameters: {
            scenario_type: "project_delay",
            project_name: name,
            delay_months: 2,
          },
        }))

        scenarios.push(...projectScenarios.slice(0, 2)) // Add up to 2 project-specific scenarios
      }

      return scenarios
    } catch (error) {
      console.error("Error fetching predefined scenarios:", error)
      throw error
    }
  },

  simulateScenario: async (scenarioType, parameters, description) => {
    try {
      // Get current user ID
      const userId = localStorage.getItem("user_id")

      // Get file ID
      const fileId = localStorage.getItem(`uploadedFileId_${userId}`)

      if (!fileId) {
        throw new Error("No document found")
      }

      console.log("Simulating scenario:", { scenarioType, parameters, description })

      // Get actual data from the uploaded Excel file
      const cashFlowData = enhancedExcelService.getCashFlowData(fileId)
      const revenueExpensesData = enhancedExcelService.getRevenueExpensesData(fileId)
      const projectData = enhancedExcelService.getProjectProfitabilityData(fileId)

      // Validate that we have the necessary data
      if (!cashFlowData || !cashFlowData.months || cashFlowData.months.length === 0) {
        throw new Error("Cash flow data not found or invalid")
      }

      // Log verification of data being used
      console.log("VERIFICATION - Using actual data for scenario simulation:")
      console.log("Cash Flow Data:", {
        monthsCount: cashFlowData.months.length,
        totalInflows: cashFlowData.inflows.reduce((sum, val) => sum + val, 0),
        totalOutflows: cashFlowData.outflows.reduce((sum, val) => sum + val, 0),
        netFlow: cashFlowData.net_flow.reduce((sum, val) => sum + val, 0),
      })

      // Create a deep copy of the original data to avoid modifying it
      const original_data = {
        cash_flow: {
          months: [...cashFlowData.months],
          values: [...cashFlowData.net_flow],
        },
        total_revenue: cashFlowData.inflows.reduce((sum, val) => sum + val, 0),
        total_expenses: cashFlowData.outflows.reduce((sum, val) => sum + val, 0),
        net_profit: cashFlowData.net_flow.reduce((sum, val) => sum + val, 0),
      }

      // Create a modified copy that we'll adjust based on the scenario
      const modified_data = {
        cash_flow: {
          months: [...cashFlowData.months],
          values: [...cashFlowData.net_flow],
        },
        total_revenue: original_data.total_revenue,
        total_expenses: original_data.total_expenses,
        net_profit: original_data.net_profit,
      }

      // Apply scenario effects based on the scenario type
      switch (scenarioType) {
        case "payment_delay": {
          // Payment delay calculation (already fixed)
          const delayDays = parameters.delay_days || 30
          const delayMonths = Math.ceil(delayDays / 30)

          console.log("Payment Delay Parameters:", { delayDays, delayMonths })

          // Calculate the percentage of revenue that will be delayed based on delay length
          // Longer delays mean higher percentage of delayed payments and higher loss
          const delayPercentage = Math.min(0.7, 0.3 + delayMonths * 0.05) // 30% to 70% based on delay length
          const lossPercentage = Math.min(0.2, 0.05 + delayMonths * 0.01) // 5% to 20% based on delay length

          console.log("Payment Delay Impact Factors:", {
            delayPercentage: delayPercentage * 100 + "%",
            lossPercentage: lossPercentage * 100 + "%",
          })

          // Apply the delay to cash flows
          const shiftedValues = [...modified_data.cash_flow.values]
          const inflowsTotal = cashFlowData.inflows.reduce((sum, val) => sum + val, 0)
          let totalDelayed = 0
          let totalLost = 0

          // For each month, calculate how much is delayed and lost
          for (let i = 0; i < shiftedValues.length; i++) {
            // Calculate how much of this month's inflows will be delayed
            const monthlyInflow = cashFlowData.inflows[i] || 0
            const delayedAmount = monthlyInflow * delayPercentage
            const lostAmount = delayedAmount * lossPercentage

            // Reduce current month's cash flow by the delayed amount
            shiftedValues[i] -= delayedAmount
            totalDelayed += delayedAmount
            totalLost += lostAmount

            // Add the recovered amount (minus losses) to a future month if possible
            if (i + delayMonths < shiftedValues.length) {
              shiftedValues[i + delayMonths] += delayedAmount - lostAmount
            } else {
              // If beyond our time horizon, it's effectively lost
              totalLost += delayedAmount - lostAmount
            }
          }

          modified_data.cash_flow.values = shiftedValues

          // Update totals - reduce revenue by the lost amount
          modified_data.total_revenue = original_data.total_revenue - totalLost
          modified_data.net_profit = modified_data.cash_flow.values.reduce((sum, val) => sum + val, 0)

          // Add time value of money impact - longer delays have higher financial cost
          const financialCostPercentage = 0.005 * delayMonths // 0.5% per month of delay
          const financialCost = inflowsTotal * financialCostPercentage
          modified_data.total_expenses += financialCost
          modified_data.net_profit -= financialCost

          // Log the impact for verification
          console.log("Payment Delay Impact:", {
            delayDays,
            delayMonths,
            totalDelayed,
            totalLost,
            financialCost,
            originalNetProfit: original_data.net_profit,
            modifiedNetProfit: modified_data.net_profit,
            impact: modified_data.net_profit - original_data.net_profit,
            impactPercentage: ((modified_data.net_profit - original_data.net_profit) / original_data.net_profit) * 100,
          })

          break
        }

        case "cost_reduction": {
          // FIXED: Improved cost reduction calculation
          const reductionPercentage = parameters.reduction_percentage || 10

          // Validate the reduction percentage is within reasonable bounds
          const validReductionPercentage = Math.min(50, Math.max(1, reductionPercentage))
          const reductionFactor = 1 - validReductionPercentage / 100

          console.log("Cost Reduction Parameters:", {
            requestedReduction: reductionPercentage + "%",
            appliedReduction: validReductionPercentage + "%",
          })

          // Calculate total expense reduction
          const totalExpenseReduction = original_data.total_expenses * (1 - reductionFactor)

          // Reduce expenses
          modified_data.total_expenses = original_data.total_expenses * reductionFactor

          // Implementation costs - higher reductions have higher implementation costs
          const implementationCostPercentage = Math.min(0.2, validReductionPercentage / 100)
          const implementationCost = totalExpenseReduction * implementationCostPercentage

          // Adjust each month's cash flow
          const modifiedValues = [...modified_data.cash_flow.values]

          // Distribute the expense reduction across months based on the original expense distribution
          let totalOutflows = cashFlowData.outflows.reduce((sum, val) => sum + val, 0)
          if (totalOutflows <= 0) totalOutflows = 1 // Prevent division by zero

          for (let i = 0; i < modifiedValues.length; i++) {
            // Calculate this month's share of the expense reduction
            const monthlyOutflow = cashFlowData.outflows[i] || 0
            const monthShare = monthlyOutflow / totalOutflows

            // Apply the reduction to this month
            const monthlyExpenseReduction = totalExpenseReduction * monthShare

            // For the first month, subtract implementation costs
            if (i === 0) {
              modifiedValues[i] += monthlyExpenseReduction - implementationCost
            } else {
              modifiedValues[i] += monthlyExpenseReduction
            }
          }

          modified_data.cash_flow.values = modifiedValues

          // Update net profit
          modified_data.net_profit = modified_data.cash_flow.values.reduce((sum, val) => sum + val, 0)

          // Log the impact for verification
          console.log("Cost Reduction Impact:", {
            originalExpenses: original_data.total_expenses,
            modifiedExpenses: modified_data.total_expenses,
            expenseSavings: totalExpenseReduction,
            implementationCost,
            netSavings: totalExpenseReduction - implementationCost,
            originalNetProfit: original_data.net_profit,
            modifiedNetProfit: modified_data.net_profit,
            profitIncrease: modified_data.net_profit - original_data.net_profit,
          })

          break
        }

        case "revenue_increase": {
          // FIXED: Improved revenue increase calculation
          const increasePercentage = parameters.increase_percentage || 15

          // Validate the increase percentage is within reasonable bounds
          const validIncreasePercentage = Math.min(50, Math.max(1, increasePercentage))
          const increaseFactor = 1 + validIncreasePercentage / 100

          console.log("Revenue Increase Parameters:", {
            requestedIncrease: increasePercentage + "%",
            appliedIncrease: validIncreasePercentage + "%",
          })

          // Calculate total revenue increase
          const totalRevenueIncrease = original_data.total_revenue * (increaseFactor - 1)

          // Increase revenue
          modified_data.total_revenue = original_data.total_revenue * increaseFactor

          // Marketing/implementation costs - higher increases have higher costs
          const marketingCostPercentage = Math.min(0.3, validIncreasePercentage / 100)
          const marketingCost = totalRevenueIncrease * marketingCostPercentage
          modified_data.total_expenses += marketingCost

          // Adjust each month's cash flow
          const modifiedValues = [...modified_data.cash_flow.values]

          // Distribute the revenue increase across months based on the original revenue distribution
          let totalInflows = cashFlowData.inflows.reduce((sum, val) => sum + val, 0)
          if (totalInflows <= 0) totalInflows = 1 // Prevent division by zero

          for (let i = 0; i < modifiedValues.length; i++) {
            // Calculate this month's share of the revenue increase
            const monthlyInflow = cashFlowData.inflows[i] || 0
            const monthShare = monthlyInflow / totalInflows

            // Apply the increase to this month
            const monthlyRevenueIncrease = totalRevenueIncrease * monthShare

            // For the first month, subtract marketing costs
            if (i === 0) {
              modifiedValues[i] += monthlyRevenueIncrease - marketingCost
            } else {
              modifiedValues[i] += monthlyRevenueIncrease
            }
          }

          modified_data.cash_flow.values = modifiedValues

          // Update net profit
          modified_data.net_profit = modified_data.cash_flow.values.reduce((sum, val) => sum + val, 0)

          // Log the impact for verification
          console.log("Revenue Increase Impact:", {
            originalRevenue: original_data.total_revenue,
            modifiedRevenue: modified_data.total_revenue,
            revenueIncrease: totalRevenueIncrease,
            marketingCost,
            netIncrease: totalRevenueIncrease - marketingCost,
            originalNetProfit: original_data.net_profit,
            modifiedNetProfit: modified_data.net_profit,
            profitIncrease: modified_data.net_profit - original_data.net_profit,
          })

          break
        }

        case "project_delay": {
          // FIXED: Improved project delay calculation
          const projectName = parameters.project_name || ""
          const delayMonths = parameters.delay_months || 2

          // Find the project in the project data
          const projectIndex = projectData.project_names.findIndex((name) => name === projectName)

          if (projectIndex >= 0) {
            // Get project revenue and costs
            const projectRevenue = projectData.total_revenue[projectIndex] || 0
            const projectCosts = projectData.total_costs[projectIndex] || 0
            const projectProfit = projectRevenue - projectCosts
            const projectStatus = projectData.status[projectIndex] || ""

            // Log project details for verification
            console.log("Project Delay - Project Details:", {
              projectName,
              projectRevenue,
              projectCosts,
              projectProfit,
              projectStatus,
              delayMonths,
            })

            // Calculate impact factors based on delay length and project status
            let revenueDelayFactor = 0
            let costIncreaseFactor = 0

            // Different impact based on project status
            if (projectStatus.toLowerCase().includes("complete")) {
              // Completed projects - minimal impact
              revenueDelayFactor = 0.05
              costIncreaseFactor = 0.02
            } else if (projectStatus.toLowerCase().includes("progress")) {
              // In-progress projects - significant impact
              revenueDelayFactor = 0.15 + delayMonths * 0.05 // 15% + 5% per month
              costIncreaseFactor = 0.1 + delayMonths * 0.03 // 10% + 3% per month
            } else {
              // Other projects - moderate impact
              revenueDelayFactor = 0.1 + delayMonths * 0.03 // 10% + 3% per month
              costIncreaseFactor = 0.05 + delayMonths * 0.02 // 5% + 2% per month
            }

            // Cap the factors at reasonable values
            revenueDelayFactor = Math.min(0.5, revenueDelayFactor)
            costIncreaseFactor = Math.min(0.3, costIncreaseFactor)

            // Calculate the impact
            const delayedRevenue = projectRevenue * revenueDelayFactor
            const increasedCosts = projectCosts * costIncreaseFactor
            const totalImpact = delayedRevenue + increasedCosts

            console.log("Project Delay Impact Factors:", {
              revenueDelayFactor: (revenueDelayFactor * 100).toFixed(1) + "%",
              costIncreaseFactor: (costIncreaseFactor * 100).toFixed(1) + "%",
              delayedRevenue,
              increasedCosts,
              totalImpact,
            })

            // Distribute the impact over months
            const monthsCount = modified_data.cash_flow.months.length

            // Create a realistic distribution - more impact in early months
            const modifiedValues = [...modified_data.cash_flow.values]

            for (let i = 0; i < monthsCount; i++) {
              // Early months have more impact
              let monthImpactFactor = 1
              if (i < 3) {
                monthImpactFactor = 2 // Double impact in first 3 months
              } else if (i < 6) {
                monthImpactFactor = 1.5 // 1.5x impact in months 4-6
              }

              const monthlyImpact = (totalImpact / monthsCount) * monthImpactFactor
              modifiedValues[i] -= monthlyImpact
            }

            modified_data.cash_flow.values = modifiedValues

            // Update totals
            modified_data.total_revenue = original_data.total_revenue - delayedRevenue
            modified_data.total_expenses = original_data.total_expenses + increasedCosts
            modified_data.net_profit = modified_data.cash_flow.values.reduce((sum, val) => sum + val, 0)

            // Log the impact for verification
            console.log("Project Delay Impact:", {
              originalRevenue: original_data.total_revenue,
              modifiedRevenue: modified_data.total_revenue,
              originalExpenses: original_data.total_expenses,
              modifiedExpenses: modified_data.total_expenses,
              originalNetProfit: original_data.net_profit,
              modifiedNetProfit: modified_data.net_profit,
              impact: modified_data.net_profit - original_data.net_profit,
              impactPercentage:
                ((modified_data.net_profit - original_data.net_profit) / original_data.net_profit) * 100,
            })
          } else {
            console.warn(`Project "${projectName}" not found in project data.`)

            // Apply a generic project delay impact if specific project not found
            const genericImpact = (original_data.net_profit * 0.05 * delayMonths) / 6

            // Distribute the impact over months
            const monthsCount = modified_data.cash_flow.months.length
            const impactPerMonth = genericImpact / monthsCount

            for (let i = 0; i < monthsCount; i++) {
              modified_data.cash_flow.values[i] -= impactPerMonth
            }

            modified_data.net_profit = modified_data.cash_flow.values.reduce((sum, val) => sum + val, 0)

            console.log("Generic Project Delay Impact (project not found):", {
              delayMonths,
              genericImpact,
              originalNetProfit: original_data.net_profit,
              modifiedNetProfit: modified_data.net_profit,
            })
          }

          break
        }

        case "custom":
        default: {
          // FIXED: Improved custom scenario calculation
          // Extract parameters from description if possible
          const lowerDesc = description.toLowerCase()
          let impactType = "neutral"
          let impactMagnitude = "medium"

          // Determine impact type from description
          if (lowerDesc.includes("increase") || lowerDesc.includes("growth") || lowerDesc.includes("improve")) {
            impactType = "positive"
          } else if (
            lowerDesc.includes("decrease") ||
            lowerDesc.includes("reduce") ||
            lowerDesc.includes("cut") ||
            lowerDesc.includes("loss") ||
            lowerDesc.includes("delay")
          ) {
            impactType = "negative"
          }

          // Determine magnitude from description
          if (
            lowerDesc.includes("significant") ||
            lowerDesc.includes("major") ||
            lowerDesc.includes("large") ||
            lowerDesc.includes("substantial")
          ) {
            impactMagnitude = "large"
          } else if (lowerDesc.includes("minor") || lowerDesc.includes("small") || lowerDesc.includes("slight")) {
            impactMagnitude = "small"
          }

          // Calculate impact factor based on type and magnitude
          let impactFactor = 0

          if (impactType === "positive") {
            if (impactMagnitude === "small") impactFactor = 0.05
            else if (impactMagnitude === "medium") impactFactor = 0.1
            else impactFactor = 0.2 // large
          } else if (impactType === "negative") {
            if (impactMagnitude === "small") impactFactor = -0.05
            else if (impactMagnitude === "medium") impactFactor = -0.1
            else impactFactor = -0.2 // large
          } else {
            // Neutral - small random impact
            impactFactor = Math.random() * 0.06 - 0.03 // -3% to +3%
          }

          console.log("Custom Scenario Analysis:", {
            description,
            impactType,
            impactMagnitude,
            impactFactor: (impactFactor * 100).toFixed(1) + "%",
          })

          // Apply the impact to revenue and expenses
          const revenueImpact = original_data.total_revenue * impactFactor
          const expenseImpact = original_data.total_expenses * (impactFactor * -0.5) // Opposite direction, half magnitude

          modified_data.total_revenue = original_data.total_revenue + revenueImpact
          modified_data.total_expenses = original_data.total_expenses + expenseImpact

          // Apply the impact to each month's cash flow
          const modifiedValues = [...modified_data.cash_flow.values]

          for (let i = 0; i < modifiedValues.length; i++) {
            // Calculate monthly impacts
            const monthlyInflow = cashFlowData.inflows[i] || 0
            const monthlyOutflow = cashFlowData.outflows[i] || 0

            const monthlyRevenueImpact = monthlyInflow * impactFactor
            const monthlyExpenseImpact = monthlyOutflow * (impactFactor * -0.5)

            modifiedValues[i] += monthlyRevenueImpact - monthlyExpenseImpact
          }

          modified_data.cash_flow.values = modifiedValues
          modified_data.net_profit = modified_data.cash_flow.values.reduce((sum, val) => sum + val, 0)

          // Log the impact for verification
          console.log("Custom Scenario Impact:", {
            description,
            impactFactor: (impactFactor * 100).toFixed(1) + "%",
            revenueImpact,
            expenseImpact,
            originalNetProfit: original_data.net_profit,
            modifiedNetProfit: modified_data.net_profit,
            impact: modified_data.net_profit - original_data.net_profit,
            impactPercentage: ((modified_data.net_profit - original_data.net_profit) / original_data.net_profit) * 100,
          })

          break
        }
      }

      // Calculate impact summary
      const revenue_impact = modified_data.total_revenue - original_data.total_revenue
      const expense_impact = modified_data.total_expenses - original_data.total_expenses
      const cash_flow_impact =
        modified_data.cash_flow.values.reduce((sum, val) => sum + val, 0) -
        original_data.cash_flow.values.reduce((sum, val) => sum + val, 0)
      const profit_impact = modified_data.net_profit - original_data.net_profit

      // FIXED: Improved risk level calculation to be more balanced
      let risk_level = "Low"

      // Calculate the absolute and percentage impacts
      const absProfit = Math.abs(original_data.net_profit)
      const absProfitImpact = Math.abs(profit_impact)

      // Only calculate percentage if original profit is not zero or very small
      const profitImpactPercentage = absProfit > 1000 ? (absProfitImpact / absProfit) * 100 : 0

      console.log("Risk Calculation Details:", {
        original_profit: original_data.net_profit,
        profit_impact: profit_impact,
        abs_profit_impact: absProfitImpact,
        profit_impact_percentage: profitImpactPercentage,
      })

      // Determine risk level based on scenario type and impact
      if (scenarioType === "revenue_increase" || scenarioType === "cost_reduction") {
        // Positive scenarios - only high risk if extremely large changes (which might be unrealistic)
        if (profitImpactPercentage > 50) {
          risk_level = "High"
        } else if (profitImpactPercentage > 25) {
          risk_level = "Medium"
        } else {
          risk_level = "Low"
        }
      } else {
        // Negative scenarios like payment delay or project delay
        if (profit_impact < 0) {
          // Only high risk if significant negative impact
          if (profitImpactPercentage > 25 || absProfitImpact > 50000) {
            risk_level = "High"
          } else if (profitImpactPercentage > 10 || absProfitImpact > 20000) {
            risk_level = "Medium"
          } else {
            risk_level = "Low"
          }
        } else {
          // Positive impact from what should be a negative scenario - likely low risk
          risk_level = "Low"
        }
      }

      // Override for cost reduction - should generally be low or medium risk
      if (scenarioType === "cost_reduction") {
        risk_level = profitImpactPercentage > 45 ? "Medium" : "Low" // Increased threshold from 30% to 45%
      }

      // Override for revenue increase - should generally be low risk unless very large
      if (scenarioType === "revenue_increase") {
        risk_level = profitImpactPercentage > 40 ? "Medium" : "Low"
      }

      // Special override for payment delay - longer delays should have higher risk
      if (scenarioType === "payment_delay") {
        const delayDays = parameters.delay_days || 30
        if (delayDays >= 60) {
          risk_level = "High"
        } else if (delayDays >= 30) {
          risk_level = "Medium"
        }
      }

      // Special override for project delay - longer delays should have higher risk
      if (scenarioType === "project_delay") {
        const delayMonths = parameters.delay_months || 2
        if (delayMonths >= 3) {
          risk_level = "High"
        } else if (delayMonths >= 2) {
          risk_level = "Medium"
        }
      }

      // Final verification log
      console.log("VERIFICATION - Final Scenario Impact Summary:", {
        scenarioType,
        revenue_impact,
        expense_impact,
        cash_flow_impact,
        profit_impact,
        profitImpactPercentage,
        risk_level,
      })

      // Return the simulation results
      return {
        original_data,
        modified_data,
        impact_summary: {
          revenue_impact: Math.round(revenue_impact),
          expense_impact: Math.round(expense_impact),
          cash_flow_impact: Math.round(cash_flow_impact),
          profit_impact: Math.round(profit_impact),
          risk_level,
        },
      }
    } catch (error) {
      console.error("Error simulating scenario:", error)
      throw error
    }
  },
}
