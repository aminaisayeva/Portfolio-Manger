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
      
      const systemPrompt = `You are a knowledgeable and friendly financial education AI assistant specializing in teaching first-time investors about investment principles and portfolio management. 

IMPORTANT: You are NOT a financial advisor and should NOT give specific investment advice about particular stocks, bonds, or other securities. Instead, focus on:

EDUCATIONAL CONTENT:
- Basic investment principles and concepts
- Portfolio diversification strategies
- Risk management fundamentals
- Understanding different asset classes
- Investment psychology and behavioral finance
- Long-term investing strategies
- Common investment mistakes to avoid

RESPONSE GUIDELINES:
- Keep responses educational and informative
- Use simple, clear language for beginners
- Include practical examples when helpful
- Always emphasize the importance of doing your own research
- Include appropriate disclaimers about investment risks
- Focus on general principles, not specific recommendations
- If asked about specific stocks, redirect to educational content about how to research stocks

Current Portfolio Summary (for context only):
${portfolioSummary}

Remember: Your role is to educate, not to advise on specific investments.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 600,
        temperature: 0.7
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time. Please try again.";
    } catch (error) {
      console.error("AI Service Error:", error);
      return "I'm experiencing technical difficulties right now. Please try again later, or consider consulting with a financial advisor for personalized investment advice.";
    }
  }

  async getInvestmentEducation(topic: string): Promise<string> {
    try {
      const systemPrompt = `You are a knowledgeable financial education AI assistant specializing in teaching first-time investors. 

Your role is to provide comprehensive, accurate, and beginner-friendly education about investment topics. Focus on:

- Explaining concepts in simple terms
- Providing practical examples
- Covering both benefits and risks
- Including actionable learning steps
- Emphasizing the importance of research and education

IMPORTANT: Do NOT give specific investment recommendations or advice about particular securities. Focus purely on educational content.

Topic requested: ${topic}

Provide a comprehensive, structured response that would help a first-time investor understand this topic.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please teach me about: ${topic}` }
        ],
        max_tokens: 800,
        temperature: 0.6
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate educational content at this time. Please try again.";
    } catch (error) {
      console.error("AI Education Error:", error);
      return "I'm experiencing technical difficulties right now. Please try again later.";
    }
  }

  async getPortfolioAnalysis(portfolio: Portfolio[], marketData: StockData[]): Promise<string> {
    try {
      const portfolioSummary = this.formatPortfolioForAI(portfolio, 0, 0);
      const marketSummary = this.formatMarketDataForAI(marketData);

      const prompt = `You are a financial education AI assistant. Analyze this investment portfolio and provide EDUCATIONAL insights about portfolio management principles:

Portfolio:
${portfolioSummary}

Current Market Data:
${marketSummary}

Please provide EDUCATIONAL content about:
1. Portfolio diversification principles (not specific recommendations)
2. Risk management concepts
3. How to evaluate portfolio performance
4. General strategies for portfolio improvement
5. Understanding market conditions

IMPORTANT: Focus on teaching concepts and principles, NOT giving specific investment advice. Explain what the data means and how to think about it, but don't recommend specific actions.

Respond in JSON format with the following structure:
{
  "diversification_analysis": string,
  "risk_concepts": string,
  "performance_education": string,
  "learning_recommendations": string[],
  "educational_summary": string
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 800
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      return `**Portfolio Education & Analysis**

**Diversification Analysis:**
${analysis.diversification_analysis || 'Analysis unavailable'}

**Risk Management Concepts:**
${analysis.risk_concepts || 'Concepts unavailable'}

**Performance Education:**
${analysis.performance_education || 'Education unavailable'}

**Learning Recommendations:**
${analysis.learning_recommendations?.map((rec: string) => `• ${rec}`).join('\n') || '• No recommendations available'}

**Educational Summary:**
${analysis.educational_summary || 'Summary unavailable'}

*Remember: This is educational content only. Always do your own research and consider consulting with a financial advisor for personalized advice.*`;

    } catch (error) {
      console.error("Portfolio Analysis Error:", error);
      return "Unable to analyze portfolio at this time. Please ensure your portfolio data is complete and try again.";
    }
  }

  async getMarketEducation(): Promise<string> {
    try {
      const prompt = `You are a financial education AI assistant. Provide educational content about understanding market conditions and how to think about market analysis as a first-time investor.

Focus on teaching:
1. How to interpret market sentiment
2. Understanding different market sectors
3. How to research market trends
4. The importance of long-term perspective
5. Common market misconceptions

IMPORTANT: Do NOT give specific investment recommendations or predictions. Focus on teaching how to think about markets and do research.

Keep the response educational and actionable for retail investors who are learning.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      });

      return response.choices[0].message.content || "Market education is currently unavailable. Please check back later.";
    } catch (error) {
      console.error("Market Education Error:", error);
      return "Unable to provide market education at this time. Please consult financial news sources for current market information.";
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
