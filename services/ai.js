const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

class AIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
                "HTTP-Referer": "https://kmrl-docs.local",
                "X-Title": "KMRL Document Management System"
            }
        });
    }

    async summarizeTender(tender) {
        try {
            const prompt = `Please provide a concise summary of the following tender:
      
Title: ${tender.title}
Organization: ${tender.organization}
Description: ${tender.description}
Value: ${tender.value}
Location: ${tender.location}
Category: ${tender.category}

Summary:`;

            const response = await this.openai.chat.completions.create({
                model: "microsoft/wizardlm-2-8x22b",
                messages: [
                    { role: "user", content: prompt }
                ],
                max_tokens: 150,
                temperature: 0.3,
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error summarizing tender:', error);
            // Return a default summary if AI fails
            return `A tender from ${tender.organization} for ${tender.title} with value ${tender.value}.`;
        }
    }

    async categorizeTender(tender) {
        try {
            const prompt = `Based on the following tender information, categorize this tender into one of these departments:
      - Infrastructure
      - Electrical
      - Mechanical
      - Civil
      - Technology
      - Maintenance
      - Safety
      - Other

Tender Details:
Title: ${tender.title}
Organization: ${tender.organization}
Description: ${tender.description}
Category: ${tender.category}
Keywords: ${tender.keywords.join(', ')}

Department:`;

            const response = await this.openai.chat.completions.create({
                model: "microsoft/wizardlm-2-8x22b",
                messages: [
                    { role: "user", content: prompt }
                ],
                max_tokens: 20,
                temperature: 0.1,
            });

            const department = response.choices[0].message.content.trim();

            // Validate the department
            const validDepartments = ['Infrastructure', 'Electrical', 'Mechanical', 'Civil', 'Technology', 'Maintenance', 'Safety', 'Other'];
            if (validDepartments.includes(department)) {
                return department;
            } else {
                return 'Other';
            }
        } catch (error) {
            console.error('Error categorizing tender:', error);
            // Return a default category if AI fails
            return 'Other';
        }
    }

    async extractKeywords(tender) {
        try {
            const prompt = `Extract 5-10 important keywords from the following tender information:

Tender Details:
Title: ${tender.title}
Organization: ${tender.organization}
Description: ${tender.description}

Keywords (comma separated):`;

            const response = await this.openai.chat.completions.create({
                model: "microsoft/wizardlm-2-8x22b",
                messages: [
                    { role: "user", content: prompt }
                ],
                max_tokens: 100,
                temperature: 0.3,
            });

            const keywordsText = response.choices[0].message.content.trim();
            return keywordsText.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0);
        } catch (error) {
            console.error('Error extracting keywords:', error);
            // Return original keywords if AI fails
            return tender.keywords || [];
        }
    }

    async assessTenderPriority(tender) {
        try {
            const prompt = `Based on the following tender information, assess the priority level as one of:
      - urgent (for high-value or time-sensitive tenders)
      - high (for important tenders)
      - medium (for standard tenders)
      - low (for less important tenders)

Tender Details:
Title: ${tender.title}
Organization: ${tender.organization}
Description: ${tender.description}
Value: ${tender.value}
Deadline: ${tender.submissionDeadline}
Keywords: ${tender.keywords.join(', ')}

Priority:`;

            const response = await this.openai.chat.completions.create({
                model: "microsoft/wizardlm-2-8x22b",
                messages: [
                    { role: "user", content: prompt }
                ],
                max_tokens: 10,
                temperature: 0.1,
            });

            const priority = response.choices[0].message.content.trim().toLowerCase();

            // Validate the priority
            const validPriorities = ['urgent', 'high', 'medium', 'low'];
            if (validPriorities.includes(priority)) {
                return priority;
            } else {
                return 'medium';
            }
        } catch (error) {
            console.error('Error assessing tender priority:', error);
            // Return a default priority if AI fails
            return 'medium';
        }
    }
}

module.exports = AIService;