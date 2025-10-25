export const GEMINI_API_KEY = "AIzaSyBm-JYWO7AtzUPM8_BEEMSqaARcRqHKWPA";
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export class GeminiService {
  private static async makeRequest(request: GeminiRequest): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  static async processVoiceCommand(
    voiceText: string, 
    selectedAction: string,
    availableEndpoints: Record<string, any>
  ): Promise<{
    intent: string;
    action: string;
    parameters: Record<string, any>;
    apiCall: {
      endpoint: string;
      method: string;
      payload?: any;
    } | null;
    response: string;
    quickOptions?: string[];
  }> {
    const systemPrompt = `You are an AI assistant for a business management system. 

Available API endpoints:
${JSON.stringify(availableEndpoints, null, 2)}

The user wants to work with: ${selectedAction}

Analyze the voice command and return a JSON response with:
{
  "intent": "what the user wants to do",
  "action": "specific action to take", 
  "parameters": "extracted parameters",
  "apiCall": {
    "endpoint": "exact API endpoint to call",
    "method": "HTTP method",
    "payload": "request body if needed"
  },
  "response": "friendly response to user with specific actionable suggestions",
  "quickOptions": ["List of clickable options user can choose from"]
}

IMPORTANT: Always include quickOptions array with 4-8 specific actionable items the user can click on.
For example, if they ask about dashboard, include options like:
- "Get Dashboard Stats"
- "Get Enhanced Dashboard Stats" 
- "Get Revenue Trend"
- "Get Category Performance"
- "Get Daily Sales"
- "Get Inventory Status"

Make sure quickOptions match actual API endpoint names when possible.
If you cannot determine a specific API call, set apiCall to null but still provide quickOptions.

Voice command: "${voiceText}"`;

    const request: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const response = await this.makeRequest(request);
    
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return {
        intent: 'unknown',
        action: 'parse_error',
        parameters: {},
        apiCall: null,
        response: 'I had trouble understanding your request. Please try again with a clearer command.',
        quickOptions: [
          "Get Dashboard Stats",
          "List All Products", 
          "List All Customers",
          "Get Enhanced Dashboard Stats",
          "Get Daily Sales",
          "Show basic dashboard statistics"
        ]
      };
    }
  }

  static async processImageAnalysis(
    imageBase64: string,
    selectedAction: string,
    availableEndpoints: Record<string, any>
  ): Promise<{
    analysis: string;
    extractedData: Record<string, any>;
    suggestedActions: string[];
    apiCalls: Array<{
      endpoint: string;
      method: string;
      payload?: any;
    }>;
    response: string;
  }> {
    const systemPrompt = `You are an AI assistant analyzing business documents/images for a management system.

Available API endpoints:
${JSON.stringify(availableEndpoints, null, 2)}

Context: User is working with ${selectedAction}

Analyze this image and extract relevant business data. Return JSON with:
{
  "analysis": "description of what you see",
  "extractedData": "structured data extracted from image",
  "suggestedActions": ["list of suggested actions"],
  "apiCalls": [{"endpoint": "api to call", "method": "HTTP method", "payload": "data to send"}],
  "response": "friendly response to user"
}`;

    const request: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              text: `data:image/jpeg;base64,${imageBase64}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const response = await this.makeRequest(request);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return {
        analysis: 'Image analysis failed',
        extractedData: {},
        suggestedActions: [],
        apiCalls: [],
        response: 'I had trouble analyzing the image. Please try uploading a clearer image.'
      };
    }
  }

  static async translateToUrdu(text: string): Promise<string> {
    const systemPrompt = `You are a translator. Translate the following English text to Urdu. Only return the Urdu translation, nothing else.

Text: "${text}"`;

    const request: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 256,
      }
    };

    const response = await this.makeRequest(request);
    return response.trim();
  }

  static async convertToProperUrdu(textOrPrompt: string): Promise<string> {
    // Check if it's an edit prompt (contains "Current message")
    const isEditPrompt = textOrPrompt.includes('Current message');
    
    const systemPrompt = isEditPrompt 
      ? textOrPrompt // Use the prompt as-is for editing
      : `You are an Urdu language expert. Convert the following spoken/transcribed text into properly written formal Urdu. Make it professional and suitable for business communication. Only return the properly formatted Urdu text, nothing else.

Spoken text: "${textOrPrompt}"`;

    const request: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      }
    };

    const response = await this.makeRequest(request);
    return response.trim();
  }
}