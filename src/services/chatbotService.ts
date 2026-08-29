import { ChatbotMessage } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intent?: string;
  suggested_actions?: string[];
  parcel_reference?: string;
  navigation_target?: string;
}

export interface AssistantFAQ {
  id: string;
  intent: string;
  category?: string;
  keywords: string[];
  question_en: string;
  question_hi: string;
  question_ta: string;
  answer_en: string;
  answer_hi: string;
  answer_ta: string;
  actions?: Array<{
    label: string;
    action_type: 'NAVIGATE' | 'SEARCH_PARCEL' | 'QUERY' | 'OPEN_MODAL';
    payload: string;
  }>;
  suggested_actions?: string[];
  navigation_target?: string;
  parcel_reference?: string;
}

export const FAQ_KNOWLEDGE_BASE: AssistantFAQ[] = [
  {
    id: 'faq-1',
    intent: 'SEARCH_PARCEL',
    category: 'GIS & Parcels',
    keywords: ['search', 'find', 'locate', 'survey', 'ulpin', 'khata', 'patta', 'खोज', 'தேடு', '124/1', '124'],
    question_en: 'How do I search for my parcel?',
    question_hi: 'मैं अपने भूखंड (Parcel) को कैसे खोजूं?',
    question_ta: 'எனது நிலத்தை (Parcel) எவ்வாறு தேடுவது?',
    answer_en: 'You can search your land parcel using its 14-digit ULPIN (Bhudhaar), Survey Number, Patta Number, or District/Taluk in the GIS Explorer or Citizen Dashboard. The interactive map highlights your parcel boundaries and coordinates.',
    answer_hi: 'आप अपने भूखंड को 14-अंकीय ULPIN (भू-आधार), सर्वे नंबर, या पट्टा नंबर का उपयोग करके GIS Explorer या नागरिक डैशबोर्ड में खोज सकते हैं।',
    answer_ta: 'உங்கள் 14-இலக்க ULPIN, சர்வே எண் அல்லது பட்டா எண்ணைப் பயன்படுத்தி GIS Explorer அல்லது குடிமக்கள் போர்ட்டலில் தேடலாம்.',
    navigation_target: '/gis',
    parcel_reference: 'TN-CBE-001-124-1',
    suggested_actions: ['Open GIS Map', 'Inspect Survey 124/1', 'Check Ownership Records']
  },
  {
    id: 'faq-2',
    intent: 'CHECK_OWNERSHIP',
    category: 'Ownership & RoR',
    keywords: ['ownership', 'owner', 'title', 'ror', 'patta', 'jamabandi', 'मालिकाना', 'உரிமை', 'verify'],
    question_en: 'How do I check ownership and title records?',
    question_hi: 'मैं मालिकाना हक और राजस्व रिकॉर्ड (RoR) की जांच कैसे करूं?',
    question_ta: 'நில உரிமை மற்றும் பட்டா பதிவுகளை எவ்வாறு சரிபார்ப்பது?',
    answer_en: 'Go to Parcel 360° for your parcel. The "Ownership & RoR" section displays registered owners, share percentages, Aadhaar e-KYC status, and historical title transfers linked with State Revenue portals (Tamil Nilam, Bhoomi, MahaBhulekh).',
    answer_hi: 'अपने भूखंड के लिए Parcel 360° पर जाएं। "Ownership & RoR" टैब में पंजीकृत मालिक, हिस्सेदारी और आधार ई-केवाईसी सत्यापन विवरण दिखाई देंगे।',
    answer_ta: 'Parcel 360° பக்கத்திற்குச் செல்லவும். "Ownership & RoR" பிரிவில் நில உரிமையாளர் விவரங்கள் மற்றும் சரிபார்ப்பு நிலையை அறியலாம்.',
    navigation_target: '/parcel/TN-CBE-001-124-1',
    parcel_reference: 'TN-CBE-001-124-1',
    suggested_actions: ['Inspect Parcel 360°', 'View Land DNA Score', 'Check Encumbrance']
  },
  {
    id: 'faq-3',
    intent: 'UPLOAD_DOCS',
    category: 'Documents & OCR',
    keywords: ['upload', 'document', 'deed', 'fmb', 'encumbrance', 'ec', 'दस्तावेज', 'ஆவணம்'],
    question_en: 'How do I upload documents for AI verification?',
    question_hi: 'मैं AI सत्यापन के लिए दस्तावेज कैसे अपलोड करूं?',
    question_ta: 'AI சரிபார்ப்பிற்கு ஆவணங்களை எவ்வாறு பதிவேற்றுவது?',
    answer_en: 'Navigate to "Document Intelligence" or "My Documents". Upload your Sale Deed, Patta copy, or Encumbrance Certificate in PDF/JPG. Our on-device OCR and cross-record engine will extract metadata and cross-verify with revenue records automatically.',
    answer_hi: '"My Documents" अनुभाग में जाएं। अपनी सेल डीड, पट्टा प्रति या भार प्रमाण पत्र (EC) अपलोड करें। हमारा AI इंजन स्वचालित रूप से विवरण निकालेगा।',
    answer_ta: '"My Documents" பகுதிக்குச் சென்று பத்திர நகல், பட்டா அல்லது வில்லங்கச் சான்றிதழை பதிவேற்றவும்.',
    navigation_target: '/citizen/documents',
    suggested_actions: ['Go to Document Center', 'Upload Sale Deed', 'Review OCR Status']
  },
  {
    id: 'faq-4',
    intent: 'TRACK_APPLICATION',
    category: 'Applications',
    keywords: ['track', 'status', 'application', 'mutation', 'subdivision', 'स्थिति', 'நிலை'],
    question_en: 'How do I track my service or mutation application?',
    question_hi: 'मैं अपने नामांतरण (Mutation) आवेदन की स्थिति कैसे ट्रैक करूं?',
    question_ta: 'எனது பட்டா மாறுதல் விண்ணப்பத்தின் நிலையை எவ்வாறு கண்காணிப்பது?',
    answer_en: 'Open "Track Applications" from your Citizen menu. Enter your Application Reference Number (e.g. MUT-2026-881) to see real-time workflow milestones: VAO verification, Tahsildar approval, and SRO endorsement.',
    answer_hi: '"Track Applications" पृष्ठ खोलें और अपना संदर्भ संख्या दर्ज करें। आपको VAO, तहसीलदार और उप-पंजीयक द्वारा वर्तमान स्थिति दिखाई देगी।',
    answer_ta: '"Track Applications" பக்கத்தில் விண்ணப்ப எண்ணை உள்ளிட்டு தற்போதைய நிலையைத் தெரிந்துகொள்ளலாம்.',
    navigation_target: '/citizen/applications',
    suggested_actions: ['View Applications', 'Submit New Request', 'Check SLA Countdown']
  },
  {
    id: 'faq-5',
    intent: 'ENCROACHMENT_RISK',
    category: 'Risk & Compliance',
    keywords: ['encroachment', 'overlap', 'risk', 'buffer', 'waterbody', 'dispute', 'अतिक्रमण', 'ஆக்கிரமிப்பு'],
    question_en: 'How does encroachment and boundary risk detection work?',
    question_hi: 'अतिक्रमण और सीमा विवाद का पता कैसे लगाया जाता है?',
    question_ta: 'ஆக்கிரமிப்பு மற்றும் எல்லை இடர் கண்டறிதல் எவ்வாறு செயல்படுகிறது?',
    answer_en: 'Our GIS engine overlays satellite imagery with revenue survey cadastres and environmental buffers (waterbody, forest, highway). If a parcel boundary overlaps with restricted or adjacent land, an AI-generated risk indication is flagged for official field survey.',
    answer_hi: 'हमारा जीआईएस इंजन उपग्रह चित्रों, राजस्व नक्शों और जल निकाय/वन बफर सीमाओं का विश्लेषण करके संभावित अतिक्रमण को फ्लैग करता है।',
    answer_ta: 'எங்கள் ஜிஐஎஸ் தளம் செயற்கைக்கோள் வரைபடத்துடன் நீர்நிலைகள் மற்றும் பாதுகாக்கப்பட்ட எல்லைகளை ஒப்பிட்டு இடர்களைக் கண்டறிகிறது.',
    navigation_target: '/analytics/maps',
    suggested_actions: ['Explore Risk Heatmaps', 'View Encroachment Alerts', 'Inspect GIS Layers']
  },
  {
    id: 'faq-6',
    intent: 'LAND_DNA',
    category: 'Land DNA',
    keywords: ['dna', 'twin', 'health', 'score', 'trust', 'டிஎன்ஏ'],
    question_en: 'What is the Land DNA / Digital Twin score?',
    question_hi: 'लैंड डीएनए (Land DNA) या डिजिटल ट्विन स्कोर क्या है?',
    question_ta: 'லேண்ட் டிஎன்ஏ (Land DNA) குறியீடு என்றால் என்ன?',
    answer_en: 'Land DNA is a comprehensive 0–100 health index combining 6 dimensions: Geometric Integrity, Title Clarity, Civic/Tax Compliance, Environmental Clearances, Encumbrance Status, and Document Authenticity.',
    answer_hi: 'लैंड डीएनए 0-100 का समग्र स्वास्थ्य स्कोर है जो सीमा शुद्धता, स्वामित्व स्पष्टता, कर अनुपालन और कानूनी भारमुक्ति का मूल्यांकन करता है।',
    answer_ta: 'லேண்ட் டிஎன்ஏ என்பது நிலத்தின் எல்லைத் துல்லியம், உரிமைப் பதிவு, வரி செலுத்தல் மற்றும் வில்லங்கமின்மையை அளவிடும் 0-100 மதிப்பீடாகும்.',
    navigation_target: '/parcel/TN-CBE-001-124-1',
    parcel_reference: 'TN-CBE-001-124-1',
    suggested_actions: ['Inspect Land DNA Score', 'Check Geometric Integrity', 'View Anomaly History']
  },
  {
    id: 'faq-7',
    intent: 'MUTATION_PROCESS',
    category: 'Citizen Services',
    keywords: ['mutation', 'transfer', 'patta transfer', 'name change', 'दाखिल खारिज', 'பட்டா மாறுதல்'],
    question_en: 'What are the steps for Patta / Land Mutation?',
    question_hi: 'दाखिल-खारिज (नामांतरण) की क्या प्रक्रिया है?',
    question_ta: 'பட்டா மாறுதல் செய்வதற்கான படிநிலைகள் யாவை?',
    answer_en: '1) Submit Mutation Request with registered sale deed, 2) Automated cross-record AI validation, 3) Village Administrative Officer / Talathi field enquiry, 4) Tahsildar approval, and 5) Instant digital RoR / Patta update on LandSync.',
    answer_hi: '1) पंजीकृत सेल डीड के साथ आवेदन, 2) एआई सत्यापन, 3) पटवारी/तलाठी जांच, 4) तहसीलदार स्वीकृति, और 5) नया पट्टा जारी।',
    answer_ta: '1) பத்திர நகலுடன் விண்ணப்பித்தல், 2) தானியங்கி சரிபார்ப்பு, 3) கிராம நிர்வாக அலுவலர் அறிக்கை, 4) வட்டாட்சியர் ஒப்புதல், 5) புதிய பட்டா பதிவிறக்கம்.',
    navigation_target: '/citizen/guided-journey',
    suggested_actions: ['Start Guided Journey', 'Submit Mutation Request', 'View Required Documents']
  },
  {
    id: 'faq-8',
    intent: 'DATA_CONSENT',
    category: 'DPI & Consents',
    keywords: ['consent', 'share', 'bank', 'privacy', 'सहमति', 'அனுமதி'],
    question_en: 'How does consent-based data sharing work for bank loans?',
    question_hi: 'बैंक ऋण के लिए सहमति आधारित डेटा साझाकरण कैसे काम करता है?',
    question_ta: 'வங்கிக் கடன்களுக்கு நிலத் தரவு பகிர்வு எவ்வாறு செயல்படுகிறது?',
    answer_en: 'Under LandSync DPI, third parties (like SBI or HDFC) must request explicit digital consent. You can grant time-bound, purpose-restricted access to your verified title and GIS polygon, and revoke it anytime in "Consent & Data Sharing".',
    answer_hi: 'LandSync DPI के तहत, बैंक केवल आपकी डिजिटल सहमति से ही सत्यापित भूमि रिकॉर्ड देख सकते हैं। आप "Consent" टैब से इसे कभी भी निरस्त कर सकते हैं।',
    answer_ta: 'உங்கள் ஒப்புதலின்றி வங்கிகள் நில விவரங்களைப் பார்க்க முடியாது. "Consent & Data Sharing" பிரிவில் நேர வரம்புடன் அனுமதி வழங்கலாம்.',
    navigation_target: '/citizen/data-sharing',
    suggested_actions: ['Manage Consents', 'View Active Permissions', 'Revoke Bank Access']
  }
];

export const chatbotService = {
  getWelcomeGreeting: (lang: 'en' | 'hi' | 'ta' = 'en'): string => {
    switch (lang) {
      case 'hi':
        return 'नमस्ते! मैं लैंडसिंक एआई सहायक हूँ। आप भूमि रिकॉर्ड खोजने, पट्टा नामांतरण, या जीआईएस नक्शे के बारे में पूछ सकते हैं।';
      case 'ta':
        return 'வணக்கம்! நான் உங்கள் லேண்ட்சின்க் ஏஐ உதவியாளர். நிலப் பதிவேடுகள், பட்டா மாறுதல் அல்லது ஜிஐஎஸ் வரைபடம் பற்றி கேட்கலாம்.';
      default:
        return 'Namaste! I am your LandSync AI Assistant. You can speak or type to check land records, verify Patta, inspect Land DNA, or get guided service support.';
    }
  },

  getFAQTopics: () => {
    return FAQ_KNOWLEDGE_BASE.map((faq) => ({
      id: faq.id,
      question: faq.question_en,
      category: faq.category || 'General'
    }));
  },

  queryAssistant: async (
    query: string,
    lang: 'en' | 'hi' | 'ta' = 'en'
  ): Promise<{
    answer: string;
    intent?: string;
    suggested_actions?: string[];
    parcel_reference?: string;
    navigation_target?: string;
  }> => {
    const qLower = query.toLowerCase().trim();

    let bestMatch: AssistantFAQ | null = null;
    let maxMatchCount = 0;

    for (const faq of FAQ_KNOWLEDGE_BASE) {
      let count = 0;
      for (const kw of faq.keywords) {
        if (qLower.includes(kw.toLowerCase())) {
          count += 2;
        }
      }
      if (count > maxMatchCount) {
        maxMatchCount = count;
        bestMatch = faq;
      }
    }

    if (bestMatch && maxMatchCount > 0) {
      const answer =
        lang === 'hi'
          ? bestMatch.answer_hi
          : lang === 'ta'
          ? bestMatch.answer_ta
          : bestMatch.answer_en;

      return {
        answer,
        intent: bestMatch.intent,
        suggested_actions: bestMatch.suggested_actions,
        parcel_reference: bestMatch.parcel_reference,
        navigation_target: bestMatch.navigation_target
      };
    }

    // Default intelligent response
    const fallbackAnswer =
      lang === 'hi'
        ? `मैं समझता हूँ कि आप "${query}" के बारे में सहायता चाहते हैं। आप भूखंड विवरण देखने, सेवा विज़ार्ड शुरू करने, या जीआईएस नक्शा खोलने के लिए त्वरित विकल्पों का चयन कर सकते हैं। (एआई संकेत: आधिकारिक सत्यापन आवश्यक)`
        : lang === 'ta'
        ? `"${query}" தொடர்பான உங்கள் கேள்விக்கு உதவத் தயாராக உள்ளேன். நிலப் பதிவேடு, சேவைகள் அல்லது ஜிஐஎஸ் வரைபடத்தைக் காண கீழே உள்ள தேர்வுகளைப் பயன்படுத்தவும்.`
        : `I understand you are asking about "${query}". You can inspect parcel boundaries on the GIS Explorer, verify ownership records, or start our step-by-step Guided Citizen Journey. (Note: AI/GIS-generated indication. Requires official verification.)`;

    return {
      answer: fallbackAnswer,
      intent: 'GENERAL_INQUIRY',
      suggested_actions: ['Open GIS Map', 'Start Guided Journey', 'Inspect Survey 124/1'],
      navigation_target: '/gis'
    };
  },

  processQuery: (query: string, language: 'en' | 'hi' | 'ta' = 'en'): ChatbotMessage => {
    const qLower = query.toLowerCase().trim();

    let bestMatch: AssistantFAQ | null = null;
    let maxMatchCount = 0;

    for (const faq of FAQ_KNOWLEDGE_BASE) {
      let count = 0;
      for (const kw of faq.keywords) {
        if (qLower.includes(kw.toLowerCase())) {
          count++;
        }
      }
      if (count > maxMatchCount) {
        maxMatchCount = count;
        bestMatch = faq;
      }
    }

    const timestamp = new Date().toISOString();

    if (bestMatch && maxMatchCount > 0) {
      const text =
        language === 'hi'
          ? bestMatch.answer_hi
          : language === 'ta'
          ? bestMatch.answer_ta
          : bestMatch.answer_en;

      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text,
        timestamp,
        suggested_actions: bestMatch.actions,
        related_links: [
          { title: 'GIS Map & Cadastral Layers', url: '/gis' },
          { title: 'Citizen Service Wizard', url: '/citizen/guided-journey' }
        ]
      };
    }

    // Default Fallback
    const fallbackMap: Record<string, string> = {
      en: `I understand you are inquiring about "${query}". You can use the quick actions below to search your parcel, explore GIS cadastral maps, verify title deeds, or use our Guided Citizen Journey wizard.`,
      hi: `मैं समझता हूँ कि आप "${query}" के बारे में पूछ रहे हैं। आप भूखंड खोजने, जीआईएस नक्शा देखने, या नागरिक सेवा विज़ार्ड का उपयोग करने के लिए नीचे दिए गए विकल्पों का उपयोग कर सकते हैं।`,
      ta: `"${query}" பற்றிய உங்கள் கேள்வி புரிந்தது. கீழே உள்ள விருப்பங்களைப் பயன்படுத்தி உங்கள் நிலத்தைத் தேடலாம் அல்லது வழிகாட்டப்பட்ட சேவைகளைப் பயன்படுத்தலாம்.`
    };

    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: fallbackMap[language] || fallbackMap.en,
      timestamp,
      suggested_actions: [
        { label: 'Search Land Parcel', action_type: 'NAVIGATE', payload: '/gis' },
        { label: 'Open Citizen Wizard', action_type: 'NAVIGATE', payload: '/citizen/guided-journey' },
        { label: 'Inspect Land DNA', action_type: 'SEARCH_PARCEL', payload: 'TN-CBE-001-124-1' }
      ]
    };
  }
};

