import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2,
  VolumeX,
  Zap,
  Brain,
  Stars,
  Wand2,
  Circle,
  Play,
  Languages,
  Speaker
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiConfig } from "@/utils/apiConfig";

const GEMINI_API_KEY = "AIzaSyCa4pclqzhR4PaUyr81irTxp1rPQzEK3IU";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface EnhancedStats {
  financial: {
    todayRevenue: number;
    monthRevenue: number;
    profitMargin: number;
    revenueGrowth: number;
    netProfit: number;
    grossProfit: number;
    monthExpenses: number;
  };
  sales: {
    todaySales: number;
    weekSales: number;
    avgOrderValue: number;
    highValueSales: Array<{
      orderNumber: string;
      amount: number;
      customer: string;
      date: string;
    }>;
  };
  inventory: {
    totalInventoryValue: number;
    lowStockItems: number;
    deadStockValue: number;
    inventoryTurnover: number;
    fastMovingProducts: Array<{
      name: string;
      sold: number;
      remaining: number;
    }>;
  };
  customers: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    avgCustomerValue: number;
    totalReceivables: number;
  };
  cashFlow: {
    netCashFlow: number;
    monthlyInflows: number;
    monthlyOutflows: number;
  };
  alerts: Array<{
    type: string;
    title: string;
    message: string;
    action: string;
  }>;
}

const Reports = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Assalam-o-Alaikum! I'm Usman Hardware AI, your friendly business assistant. I can help you with business insights, analytics, and general conversation. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en-US' | 'ur-PK'>('en-US');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Fetch enhanced stats from the API
  const { data: enhancedStats, isLoading: statsLoading } = useQuery({
    queryKey: ['enhanced-stats'],
    queryFn: async () => {
      const response = await fetch(`${apiConfig.getBaseUrl()}/dashboard/enhanced-stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Initialize Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = currentLanguage;

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognized:', transcript);
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: currentLanguage === 'ur-PK' 
            ? "آواز کی ان پٹ کیپچر نہیں کر سکا۔ برائے کرم دوبارہ کوشش کریں۔"
            : "Could not capture voice input. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [toast, currentLanguage]);

  // Update speech recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLanguage;
    }
  }, [currentLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatAIResponse = (text: string) => {
    // Clean the text first - remove extra asterisks and clean up formatting
    let cleanText = text.replace(/\*{3,}/g, '**'); // Replace 3+ asterisks with 2
    cleanText = cleanText.replace(/\*{2}\s*\*{2}/g, '**'); // Remove empty bold tags
    
    // Split text into paragraphs
    const paragraphs = cleanText.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Skip empty paragraphs
      if (!paragraph.trim()) return null;
      
      // Check if it's a header (starts with ** and ends with **)
      if (paragraph.match(/^\*\*[^*]+\*\*$/)) {
        const headerText = paragraph.replace(/^\*\*|\*\*$/g, '').trim();
        return (
          <h3 key={index} className="text-sm font-semibold text-primary mb-2 mt-3 first:mt-0 flex items-center">
            <Sparkles className="h-3 w-3 mr-2 text-primary" />
            {headerText}
          </h3>
        );
      }
      
      // Check if it's a list item (starts with * or -)
      if (paragraph.match(/^[\*\-]\s/)) {
        const listItems = paragraph.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="space-y-1 mb-3 ml-3">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="text-muted-foreground text-xs flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                <span>{item.replace(/^[\*\-]\s/, '').trim()}</span>
              </li>
            ))}
          </ul>
        );
      }
      
      // Check if it's a numbered list
      if (paragraph.match(/^\d+\./)) {
        const listItems = paragraph.split('\n').filter(item => item.trim());
        return (
          <ol key={index} className="space-y-1 mb-3 ml-3">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="text-muted-foreground text-xs flex items-start">
                <span className="inline-flex items-center justify-center w-4 h-4 bg-primary text-primary-foreground rounded-full text-xs font-medium mr-2 flex-shrink-0 mt-0.5">
                  {itemIndex + 1}
                </span>
                <span>{item.replace(/^\d+\.\s?/, '').trim()}</span>
              </li>
            ))}
          </ol>
        );
      }
      
      // Regular paragraph with inline formatting
      if (paragraph.trim()) {
        // Format bold text (**text**) - be more careful with replacement
        let formattedText = paragraph.replace(/\*\*([^*]+?)\*\*/g, '<strong class="font-medium text-foreground">$1</strong>');
        
        return (
          <p 
            key={index} 
            className="text-muted-foreground text-xs leading-relaxed mb-2"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  const generateBusinessContext = (businessData: EnhancedStats) => {
    const currentDate = new Date().toLocaleDateString();
    
    const contextInUrdu = `
BUSINESS CONTEXT & CURRENT DATA (بزنس ڈیٹا - ${currentDate} تک):

FINANCIAL OVERVIEW (مالی خلاصہ):
- آج کی آمدنی: ${formatCurrency(businessData.financial?.todayRevenue || 0)}
- ماہانہ آمدنی: ${formatCurrency(businessData.financial?.monthRevenue || 0)}
- خالص منافع: ${formatCurrency(businessData.financial?.netProfit || 0)}
- مجموعی منافع: ${formatCurrency(businessData.financial?.grossProfit || 0)}
- ماہانہ اخراجات: ${formatCurrency(businessData.financial?.monthExpenses || 0)}
- منافع کا فیصد: ${businessData.financial?.profitMargin || 0}%
- آمدنی میں اضافہ: ${businessData.financial?.revenueGrowth || 0}%

SALES PERFORMANCE (سیلز کی کارکردگی):
- آج کی سیلز: ${businessData.sales?.todaySales || 0} آرڈرز
- ہفتہ وار سیلز: ${businessData.sales?.weekSales || 0} آرڈرز
- اوسط آرڈر ویلیو: ${formatCurrency(businessData.sales?.avgOrderValue || 0)}
- حالیہ بڑی سیلز: ${businessData.sales?.highValueSales?.slice(0, 3).map(s => `${formatCurrency(s.amount)} from ${s.customer}`).join(', ') || 'کوئی حالیہ بڑی سیلز نہیں'}

INVENTORY STATUS (انوینٹری کی صورتحال):
- کل انوینٹری ویلیو: ${formatCurrency(businessData.inventory?.totalInventoryValue || 0)}
- کم اسٹاک آئٹمز: ${businessData.inventory?.lowStockItems || 0} پروڈکٹس توجہ چاہتے ہیں
- ڈیڈ اسٹاک ویلیو: ${formatCurrency(businessData.inventory?.deadStockValue || 0)}
- انوینٹری ٹرن اوور: ${businessData.inventory?.inventoryTurnover || 0}
- تیز فروخت ہونے والے پروڈکٹس: ${businessData.inventory?.fastMovingProducts?.slice(0, 3).map(p => `${p.name} (${p.sold} بکا، ${p.remaining} باقی)`).join(', ') || 'کوئی تیز فروخت ہونے والے پروڈکٹس کا ڈیٹا نہیں'}

CUSTOMER INSIGHTS (کسٹمر کی معلومات):
- کل کسٹمرز: ${businessData.customers?.totalCustomers || 0}
- اس مہینے نئے کسٹمرز: ${businessData.customers?.newCustomersThisMonth || 0}
- اوسط کسٹمر ویلیو: ${formatCurrency(businessData.customers?.avgCustomerValue || 0)}
- باقی وصولیاں: ${formatCurrency(businessData.customers?.totalReceivables || 0)}

CASH FLOW (کیش فلو):
- خالص کیش فلو: ${formatCurrency(businessData.cashFlow?.netCashFlow || 0)}
- ماہانہ آمد: ${formatCurrency(businessData.cashFlow?.monthlyInflows || 0)}
- ماہانہ اخراج: ${formatCurrency(businessData.cashFlow?.monthlyOutflows || 0)}

ALERTS & CRITICAL ISSUES (الرٹس اور اہم مسائل):
${businessData.alerts?.map(alert => `- ${alert.title}: ${alert.message}`).join('\n') || 'کوئی اہم الرٹس نہیں'}

BUSINESS TYPE: یہ لکڑی کے پروڈکٹس، شیٹس، اور تعمیراتی مواد کا کاروبار لگتا ہے (MDF, HDX, KMI, ZRK سیریز پروڈکٹس کی بنیاد پر)۔
`;

    const contextInEnglish = `
BUSINESS CONTEXT & CURRENT DATA (as of ${currentDate}):

FINANCIAL OVERVIEW:
- Today's Revenue: ${formatCurrency(businessData.financial?.todayRevenue || 0)}
- Monthly Revenue: ${formatCurrency(businessData.financial?.monthRevenue || 0)}
- Net Profit: ${formatCurrency(businessData.financial?.netProfit || 0)}
- Gross Profit: ${formatCurrency(businessData.financial?.grossProfit || 0)}
- Monthly Expenses: ${formatCurrency(businessData.financial?.monthExpenses || 0)}
- Profit Margin: ${businessData.financial?.profitMargin || 0}%
- Revenue Growth: ${formatCurrency(businessData.financial?.revenueGrowth || 0)}%

SALES PERFORMANCE:
- Today's Sales: ${businessData.sales?.todaySales || 0} orders
- Weekly Sales: ${businessData.sales?.weekSales || 0} orders
- Average Order Value: ${formatCurrency(businessData.sales?.avgOrderValue || 0)}
- Recent High-Value Sales: ${businessData.sales?.highValueSales?.slice(0, 3).map(s => `${formatCurrency(s.amount)} from ${s.customer}`).join(', ') || 'No recent high-value sales'}

INVENTORY STATUS:
- Total Inventory Value: ${formatCurrency(businessData.inventory?.totalInventoryValue || 0)}
- Low Stock Items: ${businessData.inventory?.lowStockItems || 0} products need attention
- Dead Stock Value: ${formatCurrency(businessData.inventory?.deadStockValue || 0)}
- Inventory Turnover: ${businessData.inventory?.inventoryTurnover || 0}
- Top Selling Products: ${businessData.inventory?.fastMovingProducts?.slice(0, 3).map(p => `${p.name} (${p.sold} sold, ${p.remaining} remaining)`).join(', ') || 'No fast-moving products data'}

CUSTOMER INSIGHTS:
- Total Customers: ${businessData.customers?.totalCustomers || 0}
- New Customers This Month: ${businessData.customers?.newCustomersThisMonth || 0}
- Average Customer Value: ${formatCurrency(businessData.customers?.avgCustomerValue || 0)}
- Outstanding Receivables: ${formatCurrency(businessData.customers?.totalReceivables || 0)}

CASH FLOW:
- Net Cash Flow: ${formatCurrency(businessData.cashFlow?.netCashFlow || 0)}
- Monthly Inflows: ${formatCurrency(businessData.cashFlow?.monthlyInflows || 0)}
- Monthly Outflows: ${formatCurrency(businessData.cashFlow?.monthlyOutflows || 0)}

ALERTS & CRITICAL ISSUES:
${businessData.alerts?.map(alert => `- ${alert.title}: ${alert.message}`).join('\n') || 'No critical alerts'}

BUSINESS TYPE: This appears to be a manufacturing/trading business dealing with wood products, sheets, and building materials based on the product names (MDF, HDX, KMI, ZRK series products).
`;

    return currentLanguage === 'ur-PK' ? contextInUrdu : contextInEnglish;
  };

  const sendMessageToGemini = async (userMessage: string) => {
    const needsBusinessContext = isBusinessQuery(userMessage);
    
    let prompt = '';
    
    if (needsBusinessContext && enhancedStats?.data) {
      const businessContext = generateBusinessContext(enhancedStats.data);
      const responseLanguage = currentLanguage === 'ur-PK' ? 'Urdu (اردو)' : 'English';
      
      prompt = `${businessContext}

RESPONSE LANGUAGE: Please respond in ${responseLanguage}

RESPONSE FORMAT REQUIREMENTS:
- Please format your response using proper headings with ** for main sections
- Use bullet points (*) for lists and recommendations
- Use numbered lists (1., 2., 3.) for step-by-step instructions
- Keep responses well-structured and easy to read
- Use bold text (**text**) for important numbers or key points
- Provide helpful, actionable insights and recommendations based on this current business data
- Keep responses conversational and easy to understand for business owners
- Use Pakistani Rupees (PKR) for all currency references
${currentLanguage === 'ur-PK' ? '- اردو میں جواب دیں اور مہذب انداز استعمال کریں' : ''}

USER QUESTION: ${userMessage}

Please provide a helpful, well-formatted response based on the current business data above.`;
    } else {
      // For general conversation, create a friendly AI persona without business context
      const personalityInUrdu = `آپ Usman Hardware AI ہیں، ایک دوستانہ اور ذہین کاروباری معاون۔ آپ عام گفتگو کر سکتے ہیں اور ضرورت پڑنے پر کاروباری بصیرت میں بھی مدد کر سکتے ہیں۔

شخصیت کی خصوصیات:
- آپ گرم، دوستانہ، اور گفتگو کرنے والے ہیں
- آپ اردو/انگلش ثقافتی سیاق (پاکستان) کو سمجھتے ہیں
- آپ عام موضوعات جیسے ٹیکنالوجی، موجودہ واقعات، مشورے وغیرہ پر بات کر سکتے ہیں
- آپ مددگار اور حمایتی ہیں
- کاروبار پر بات کرتے وقت پیشہ ورانہ ہو سکتے ہیں لیکن عام چیٹ کے لیے غیر رسمی
- آپ اسلامی سلام جیسے "السلام علیکم" کو سمجھتے ہیں اور مناسب جواب دیتے ہیں

جواب کی رہنمائی:
- "سلام"، "ہیلو"، "ہائی" جیسے سلام کے لیے - کاروباری ڈیٹا کے بغیر گرمجوشی سے جواب دیں
- عام گفتگو کے لیے - دلچسپ اور مددگار بنیں
- صرف اسی وقت کاروباری صلاحیات کا ذکر کریں جب براہ راست پوچھا جائے
- جوابات میں گفتگو اور دوستانہ انداز رکھیں
- پاکستانی کاروباری ماحول کے لیے مناسب ثقافتی سیاق استعمال کریں

صارف کا پیغام: ${userMessage}

برائے کرم قدرتی اور گفتگو کے انداز میں جواب دیں۔ صرف اسی وقت کاروباری معلومات شامل کریں جب خاص طور پر مانگی جائے۔`;

      const personalityInEnglish = `You are Usman Hardware AI, a friendly and intelligent business assistant. You can have casual conversations and also help with business insights when needed. 

PERSONALITY TRAITS:
- You are warm, friendly, and conversational
- You understand Urdu/English cultural context (Pakistan)
- You can discuss general topics like technology, current events, advice, etc.
- You're helpful and supportive
- You can be professional when discussing business but casual for general chat
- You understand Islamic greetings like "Assalam-o-Alaikum" and respond appropriately

RESPONSE GUIDELINES:
- For greetings like "Salam", "Hello", "Hi" - respond warmly without business data
- For general conversation - be engaging and helpful
- Only mention business capabilities if directly asked
- Keep responses conversational and friendly
- Use appropriate cultural context for Pakistani business environment

USER MESSAGE: ${userMessage}

Please respond naturally and conversationally. Only include business information if specifically requested.`;

      prompt = currentLanguage === 'ur-PK' ? personalityInUrdu : personalityInEnglish;
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: needsBusinessContext ? 0.7 : 0.8,
          topP: 0.8,
          maxOutputTokens: needsBusinessContext ? 1024 : 512,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || (currentLanguage === 'ur-PK' 
      ? 'معذرت، لیکن میں اس وقت جواب نہیں دے سکا۔ برائے کرم دوبارہ کوشش کریں۔'
      : 'I apologize, but I couldn\'t generate a response at the moment. Please try again.');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToGemini(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-speak if enabled
      if (autoSpeak && !isSpeaking) {
        setTimeout(() => {
          speakText(aiResponse);
        }, 500);
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: currentLanguage === 'ur-PK' 
          ? "معذرت، لیکن میں اس وقت معلومات تک رسائی میں مسئلہ کا سامنا کر رہا ہوں۔ برائے کرم اپنا کنکشن چیک کریں اور دوبارہ کوشش کریں۔"
          : "I apologize, but I'm having trouble accessing the information right now. Please check your connection and try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: currentLanguage === 'ur-PK' ? "خرابی" : "Error",
        description: currentLanguage === 'ur-PK' 
          ? "AI جواب حاصل کرنے میں ناکام۔ برائے کرم دوبارہ کوشش کریں۔"
          : "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: currentLanguage === 'ur-PK' ? "آواز کی ان پٹ سپورٹ نہیں" : "Voice Input Not Supported",
        description: currentLanguage === 'ur-PK' 
          ? "آپ کا براؤزر آواز کی ان پٹ فیچر کو سپورٹ نہیں کرتا۔"
          : "Your browser doesn't support voice input feature.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: currentLanguage === 'ur-PK' ? "آواز کی ان پٹ" : "Voice Input",
        description: currentLanguage === 'ur-PK' 
          ? "سن رہا ہوں... اب بولیں!"
          : "Listening... Speak now!",
      });
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) {
      toast({
        title: currentLanguage === 'ur-PK' ? "ٹیکسٹ ٹو اسپیچ سپورٹ نہیں" : "Text-to-Speech Not Supported",
        description: currentLanguage === 'ur-PK' 
          ? "آپ کا براؤزر ٹیکسٹ ٹو اسپیچ فیچر کو سپورٹ نہیں کرتا۔"
          : "Your browser doesn't support text-to-speech feature.",
        variant: "destructive",
      });
      return;
    }

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean the text for speech
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Set language for speech synthesis
    if (currentLanguage === 'ur-PK') {
      utterance.lang = 'ur-PK';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: currentLanguage === 'ur-PK' ? "اسپیچ کی خرابی" : "Speech Error",
        description: currentLanguage === 'ur-PK' 
          ? "ٹیکسٹ بولنے میں ناکام۔ برائے کرم دوبارہ کوشش کریں۔"
          : "Failed to speak the text. Please try again.",
        variant: "destructive",
      });
    };

    synthRef.current.speak(utterance);
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en-US' ? 'ur-PK' : 'en-US';
    setCurrentLanguage(newLanguage);
    
    toast({
      title: newLanguage === 'ur-PK' ? "زبان تبدیل کر دی گئی" : "Language Changed",
      description: newLanguage === 'ur-PK' 
        ? "اردو میں تبدیل کر دیا گیا"
        : "Switched to English",
    });
  };

  const isBusinessQuery = (message: string) => {
    const businessKeywords = [
      'sales', 'revenue', 'profit', 'inventory', 'stock', 'customers', 'orders', 'business',
      'financial', 'cash flow', 'expenses', 'income', 'analytics', 'performance', 'growth',
      'dashboard', 'stats', 'statistics', 'report', 'analysis', 'trends', 'kpi', 'metrics',
      'turnover', 'margin', 'receivables', 'products', 'company', 'operations',
      // Urdu keywords
      'سیلز', 'آمدنی', 'منافع', 'انوینٹری', 'اسٹاک', 'کسٹمرز', 'آرڈرز', 'کاروبار',
      'مالی', 'کیش فلو', 'اخراجات', 'آمد', 'تجزیات', 'کارکردگی', 'ترقی',
      'ڈیش بورڈ', 'اعداد و شمار', 'رپورٹ', 'تجزیہ', 'رجحانات', 'پروڈکٹس', 'کمپنی'
    ];
    
    const lowerMessage = message.toLowerCase();
    return businessKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
  };

  if (statsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-12 h-12 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-lg text-foreground font-medium">
            {currentLanguage === 'ur-PK' ? 'AI اسسٹنٹ شروع کر رہا ہے...' : 'Initializing AI Assistant...'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentLanguage === 'ur-PK' ? 'بزنس انٹیلیجنس ڈیٹا لوڈ کر رہا ہے' : 'Loading business intelligence data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <Circle className="h-2 w-2 text-white fill-current" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Usman Hardware AI</h1>
                <p className="text-xs text-muted-foreground">
                  {currentLanguage === 'ur-PK' ? 'آپ کا دوستانہ معاون' : 'Your Friendly Assistant'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-6 text-xs">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                {currentLanguage === 'ur-PK' ? 'آن لائن' : 'Online'}
              </Badge>
              <Badge variant="secondary" className="h-6 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {currentLanguage === 'ur-PK' ? 'اسمارٹ موڈ' : 'Smart Mode'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Auto Speak Toggle */}
              <div className="flex items-center gap-2 px-2">
                <Speaker className="h-3 w-3 text-muted-foreground" />
                <Switch
                  checked={autoSpeak}
                  onCheckedChange={setAutoSpeak}
                  className="scale-75"
                />
                <span className="text-xs text-muted-foreground">
                  {currentLanguage === 'ur-PK' ? 'خودکار' : 'Auto'}
                </span>
              </div>
              
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="h-7 px-2 text-xs"
              >
                <Languages className="h-3 w-3 mr-1" />
                {currentLanguage === 'ur-PK' ? 'اردو' : 'EN'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isSpeaking) {
                    synthRef.current?.cancel();
                    setIsSpeaking(false);
                  }
                }}
                className={`h-7 w-7 p-0 ${isSpeaking ? 'bg-secondary' : ''}`}
              >
                {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceInput}
                className={`h-7 w-7 p-0 ${isListening ? 'bg-secondary' : ''}`}
              >
                {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-4 space-y-4 pb-20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <div className="relative">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
                
                <Card className={`max-w-2xl ${
                  message.type === 'user' 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'bg-card border-border'
                }`}>
                  <CardContent className="p-3">
                    {message.type === 'user' ? (
                      <p className="text-foreground text-sm leading-relaxed">
                        {message.content}
                      </p>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {formatAIResponse(message.content)}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      {message.type === 'ai' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs"
                          onClick={() => speakText(message.content)}
                          disabled={isSpeaking}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          {isSpeaking ? 
                            (currentLanguage === 'ur-PK' ? 'بول رہا ہے...' : 'Speaking...') : 
                            (currentLanguage === 'ur-PK' ? 'بولیں' : 'Speak')
                          }
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <Card className="bg-card border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {currentLanguage === 'ur-PK' ? 'AI سوچ رہا ہے...' : 'AI is thinking...'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          {/* Updated Quick Action Chips */}
          {messages.length <= 2 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {(currentLanguage === 'ur-PK' ? [
                "آج آپ کیسے ہیں؟",
                "آج کی سیلز بتائیں",
                "موسم کیسا ہے؟",
                "بزنس ایگالیٹکس دکھائیں"
              ] : [
                "How are you today?",
                "Tell me about today's sales",
                "What's the weather like?",
                "Show business analytics"
              ]).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(suggestion)}
                  className="text-xs whitespace-nowrap h-7 px-3"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                placeholder={currentLanguage === 'ur-PK' 
                  ? "مجھ سے کچھ بھی پوچھیں - کاروبار کی معلومات، عام بات چیت، یا صرف سلام کہیں!"
                  : "Ask me anything - business insights, general chat, or just say hello!"
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="h-10 text-sm pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceInput}
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${isListening ? 'bg-secondary' : ''}`}
              >
                {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="h-10 px-4"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {currentLanguage === 'ur-PK' ? 'بھیجیں' : 'Send'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
