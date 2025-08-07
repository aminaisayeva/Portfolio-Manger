import OpenAI from "openai";
import { Portfolio, StockData } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-dummy-key-for-testing"
});

export class AIService {
  async getPortfolioInsights(
    portfolio: Portfolio[], 
    totalValue: number, 
    cashBalance: number,
    message: string
  ): Promise<string> {
    try {
      const portfolioSummary = this.formatPortfolioForAI(portfolio, totalValue, cashBalance);
      
      const systemPrompt = `You are a professional financial advisor AI assistant specializing in portfolio management and investment analysis. 

Current Portfolio Summary:
${portfolioSummary}

Provide helpful, accurate, and professional investment advice. Focus on:
- Portfolio analysis and diversification
- Risk assessment
- Market trends and insights
- Specific actionable recommendations
- Educational content about investing

Keep responses concise but informative. Always include appropriate disclaimers about investment risks.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time. Please try again.";
    } catch (error) {
      console.error("AI Service Error:", error);
      return "I'm experiencing technical difficulties right now. Please try again later, or consider consulting with a financial advisor for personalized investment advice.";
    }
  }

  async analyzePortfolio(portfolio: Portfolio[], marketData: StockData[]): Promise<string> {
    try {
      const portfolioSummary = this.formatPortfolioForAI(portfolio, 0, 0);
      const marketSummary = this.formatMarketDataForAI(marketData);

      const prompt = `Analyze this investment portfolio and provide insights:

Portfolio:
${portfolioSummary}

Current Market Data:
${marketSummary}

Please provide:
1. Portfolio diversification analysis
2. Risk assessment
3. Performance evaluation
4. Recommendations for improvement
5. Market outlook impact

Respond in JSON format with the following structure:
{
  "diversification_score": number (1-10),
  "risk_level": "low" | "medium" | "high",
  "key_insights": string[],
  "recommendations": string[],
  "overall_assessment": string
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 800
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      return `**Portfolio Analysis**

**Diversification Score:** ${analysis.diversification_score}/10
**Risk Level:** ${analysis.risk_level}

**Key Insights:**
${analysis.key_insights?.map((insight: string) => `• ${insight}`).join('\n') || '• Analysis unavailable'}

**Recommendations:**
${analysis.recommendations?.map((rec: string) => `• ${rec}`).join('\n') || '• No recommendations available'}

**Overall Assessment:**
${analysis.overall_assessment || 'Assessment unavailable'}`;

    } catch (error) {
      console.error("Portfolio Analysis Error:", error);
      return "Unable to analyze portfolio at this time. Please ensure your portfolio data is complete and try again.";
    }
  }

  async getMarketInsights(): Promise<string> {
    try {
      const prompt = `Provide current market insights and analysis for today's trading session. Include:

1. Overall market sentiment
2. Key sector performances
3. Notable market events or trends
4. Investment opportunities to watch
5. Risk factors to consider

Keep the response concise and actionable for retail investors.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400
      });

      return response.choices[0].message.content || "Market insights are currently unavailable. Please check back later.";
    } catch (error) {
      console.error("Market Insights Error:", error);
      return "Unable to fetch market insights at this time. Please consult financial news sources for current market information.";
    }
  }

  private formatPortfolioForAI(portfolio: Portfolio[], totalValue: number, cashBalance: number): string {
    const positions = portfolio.map(pos => 
      `${pos.symbol} (${pos.companyName}): ${pos.shares} shares @ $${pos.averagePrice} avg cost`
    ).join('\n');

    return `Total Portfolio Value: $${totalValue.toLocaleString()}
Cash Balance: $${cashBalance.toLocaleString()}

Positions:
${positions}`;
  }

  private formatMarketDataForAI(marketData: StockData[]): string {
    return marketData.map(stock => 
      `${stock.symbol}: $${stock.price} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`
    ).join('\n');
  }
}

export const aiService = new AIService();
