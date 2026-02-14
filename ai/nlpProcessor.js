const natural = require('natural');
const Sentiment = require('sentiment');
const compromise = require('compromise');

const sentiment = new Sentiment();
const tokenizer = new natural.WordTokenizer();

// Smart Chat Assistant
const generateAutoReply = (message) => {
  const lowerMsg = message.toLowerCase();
  
  const patterns = {
    available: /are you (available|free|busy)/i,
    location: /where are you|your location|where r u/i,
    price: /how much|price|cost|rate/i,
    time: /when|what time|timing/i,
    confirm: /ok|okay|yes|sure|confirm/i,
    deny: /no|not|nope|can't|cannot/i,
    greeting: /^(hi|hello|hey|good morning|good evening)/i,
    help: /help|assist|support|need/i
  };

  if (patterns.available.test(lowerMsg)) {
    return "Yes, I'm available right now!";
  } else if (patterns.location.test(lowerMsg)) {
    return "I'm nearby. I can share my exact location if needed.";
  } else if (patterns.price.test(lowerMsg)) {
    return "Let me share my pricing details with you.";
  } else if (patterns.time.test(lowerMsg)) {
    return "I'm flexible with timing. When works best for you?";
  } else if (patterns.greeting.test(lowerMsg)) {
    return "Hello! How can I help you today?";
  } else if (patterns.help.test(lowerMsg)) {
    return "Sure! I'm here to help. What do you need?";
  } else if (patterns.confirm.test(lowerMsg)) {
    return "Great! Looking forward to working with you.";
  } else if (patterns.deny.test(lowerMsg)) {
    return "No problem! Let me know if you change your mind.";
  }
  
  return "Thanks for your message! I'll get back to you soon.";
};

// Context Rewrite AI - Improve message tone
const rewriteMessage = (message, targetTone = 'professional') => {
  const sentimentScore = sentiment.analyze(message);
  const doc = compromise(message);
  
  if (targetTone === 'professional') {
    let improved = message;
    
    // Replace casual words
    improved = improved.replace(/\byeah\b/gi, 'yes');
    improved = improved.replace(/\bnope\b/gi, 'no');
    improved = improved.replace(/\bgonna\b/gi, 'going to');
    improved = improved.replace(/\bwanna\b/gi, 'want to');
    improved = improved.replace(/\bkinda\b/gi, 'kind of');
    
    // Capitalize sentences
    improved = improved.split('. ').map(s => 
      s.charAt(0).toUpperCase() + s.slice(1)
    ).join('. ');
    
    return improved;
  } else if (targetTone === 'polite') {
    if (sentimentScore.score < -2) {
      return "I understand your concern. " + message.replace(/!/g, '.');
    }
    return message;
  }
  
  return message;
};

// Text Safety Filter
const checkSafetyFilter = (message) => {
  const abusiveWords = [
    'stupid', 'idiot', 'hate', 'kill', 'damn', 'hell', 
    'shut up', 'loser', 'dumb', 'worthless'
  ];
  
  const lowerMsg = message.toLowerCase();
  const foundAbusive = abusiveWords.filter(word => lowerMsg.includes(word));
  
  if (foundAbusive.length > 0) {
    return {
      safe: false,
      warning: 'Your message contains potentially offensive language',
      words: foundAbusive
    };
  }
  
  return { safe: true };
};

// Smart Bio Generator
const generateBio = (keywords, serviceType) => {
  const templates = {
    electrician: [
      `Certified electrician specializing in ${keywords}. Licensed professional with years of experience. Available for residential and commercial projects.`,
      `Expert electrical services including ${keywords}. Fast, reliable, and affordable. Contact me for all your electrical needs.`
    ],
    plumber: [
      `Professional plumber offering ${keywords}. Emergency services available. Quality work guaranteed.`,
      `Licensed plumbing expert specializing in ${keywords}. Residential and commercial services. Call for immediate assistance.`
    ],
    mechanic: [
      `Skilled mechanic providing ${keywords}. Experienced with all vehicle types. Fair pricing and quality service.`,
      `Auto repair specialist offering ${keywords}. Certified technician. Get your vehicle fixed right.`
    ],
    freelancer: [
      `Freelance professional offering ${keywords}. Reliable, creative, and deadline-driven. Let's work together!`,
      `Experienced freelancer specializing in ${keywords}. Quality work delivered on time. Portfolio available.`
    ],
    default: [
      `Professional service provider offering ${keywords}. Experienced, reliable, and customer-focused.`,
      `Skilled in ${keywords}. Committed to excellence and customer satisfaction.`
    ]
  };
  
  const templateArray = templates[serviceType] || templates.default;
  const randomTemplate = templateArray[Math.floor(Math.random() * templateArray.length)];
  
  return randomTemplate;
};

// Service Recommendation Engine
const recommendServices = (services, userLocation) => {
  // Score services based on distance, rating, and activity
  return services.map(service => {
    const distanceScore = 100 - (service.distance || 0);
    const ratingScore = (service.rating || 0) * 20;
    const activityScore = service.is_online ? 20 : 0;
    
    const totalScore = (distanceScore * 0.4) + (ratingScore * 0.4) + (activityScore * 0.2);
    
    return {
      ...service,
      recommendationScore: totalScore
    };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore);
};

// Extract intent from message
const extractIntent = (message) => {
  const doc = compromise(message);
  
  const intents = {
    question: doc.questions().length > 0,
    request: /please|kindly|could you|can you/i.test(message),
    urgent: /urgent|asap|emergency|immediately/i.test(message),
    greeting: /^(hi|hello|hey)/i.test(message),
    booking: /book|schedule|appointment/i.test(message),
    inquiry: /how|what|when|where|why/i.test(message)
  };
  
  return intents;
};

module.exports = {
  generateAutoReply,
  rewriteMessage,
  checkSafetyFilter,
  generateBio,
  recommendServices,
  extractIntent
};
