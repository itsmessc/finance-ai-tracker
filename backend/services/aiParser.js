const { GoogleGenerativeAI } = require('@google/generative-ai');

class AITransactionParser {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async parseTransaction(text) {
        const prompt = `
Parse the following transaction text and extract the transaction details. Return ONLY a valid JSON object with the following structure:
{
  "amount": number (positive number only),
  "type": "credit" or "debit" (use "credit" for income/money received, "debit" for expenses/money spent),
  "category": one of ["food", "transport", "entertainment", "utilities", "healthcare", "education", "shopping", "travel", "investment", "salary", "freelance", "business", "rent", "insurance", "other"],
  "description": "brief description of the transaction",
  "tags": ["tag1", "tag2"] (optional relevant tags),
  "location": "location if mentioned" (optional)
}

Examples:
- "Spent 25 dollars on lunch at McDonald's" → {"amount": 25, "type": "debit", "category": "food", "description": "Lunch at McDonald's", "tags": ["lunch", "fast food"], "location": "McDonald's"}
- "Received salary of 3000" → {"amount": 3000, "type": "credit", "category": "salary", "description": "Monthly salary", "tags": ["monthly", "income"]}
- "Paid 50 for uber ride to airport" → {"amount": 50, "type": "debit", "category": "transport", "description": "Uber ride to airport", "tags": ["uber", "airport"], "location": "airport"}
- "Bought groceries for 75 at Walmart" → {"amount": 75, "type": "debit", "category": "shopping", "description": "Groceries at Walmart", "tags": ["groceries"], "location": "Walmart"}

Text to parse: "${text}"

Return only the JSON object, no additional text or explanation.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const jsonText = response.text().trim();

            // Remove any markdown formatting if present
            const cleanJsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            const parsedData = JSON.parse(cleanJsonText);

            // Validate the parsed data
            this.validateParsedData(parsedData);

            return parsedData;
        } catch (error) {
            console.error('Error parsing transaction with AI:', error);
            throw new Error('Failed to parse transaction. Please enter details manually.');
        }
    }

    validateParsedData(data) {
        const validCategories = [
            'food', 'transport', 'entertainment', 'utilities', 'healthcare',
            'education', 'shopping', 'travel', 'investment', 'salary',
            'freelance', 'business', 'rent', 'insurance', 'other'
        ];

        const validTypes = ['credit', 'debit'];

        if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
            throw new Error('Invalid amount');
        }

        if (!data.type || !validTypes.includes(data.type)) {
            throw new Error('Invalid transaction type');
        }

        if (!data.category || !validCategories.includes(data.category)) {
            throw new Error('Invalid category');
        }

        if (!data.description || typeof data.description !== 'string') {
            throw new Error('Invalid description');
        }
    }
}

module.exports = new AITransactionParser();
