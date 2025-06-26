const translateText = async (text: string, sourceLang: string, targetLang: string) => {
  const url = 'https://google-translator9.p.rapidapi.com/v2';
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': 'd9792031b0msh2f79f6fcf79c333p1790b2jsn12ebf9a28b1b',
      'x-rapidapi-host': 'google-translator9.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    })
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original if translation fails
  }
};

type CategoryPrediction = {
  category: string;
  confidence: number;
  suggestedAgency: string;
  effects?: string[];
  consequences?: string[];
  severity?: 'low'|'medium'|'high';
};

type SimpleInstitution = {
  name: string;
  department: string;
};

// Cache for institutions
let institutionsCache: SimpleInstitution[] | null = null;
let lastCacheTime = 0;

async function fetchInstitutions(): Promise<{name: string, department: string}[]> {
  if (institutionsCache && Date.now() - lastCacheTime < 300000) {
    return institutionsCache;
  }

  try {
    const response = await fetch('/api/institutions');
    if (!response.ok) throw new Error('Failed to fetch institutions');
    const data: {name: string, department: string}[] = await response.json();
    
    institutionsCache = data;
    lastCacheTime = Date.now();
    return institutionsCache;
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return [];
  }
}

export async function processComplaint(complaintText: string, sourceLanguage: string = 'rw') {
  try {
    // Step 1: Translate to English if needed
    const translatedText = sourceLanguage !== 'en' 
      ? await translateText(complaintText, sourceLanguage, 'en')
      : complaintText;

    // Step 2: Analyze with AI
    const analysisResult = await analyzeComplaint(translatedText);
    
    // Step 3: Categorize and predict
    const categoryPrediction = await predictCategory(translatedText);
    
    // Step 4: Get additional insights
    const enhancedAnalysis = await enhanceAnalysis(translatedText, categoryPrediction.category);
    
    return {
      originalText: complaintText,
      translatedText,
      category: categoryPrediction,
      analysis: analysisResult,
      effects: enhancedAnalysis.effects,
      consequences: enhancedAnalysis.consequences,
      severity: enhancedAnalysis.severity,
      suggestedActions: enhancedAnalysis.suggestedActions
    };
  } catch (error) {
    console.error('Complaint processing error:', error);
    return {
      error: 'Failed to process complaint',
      details: error.message
    };
  }
}

async function analyzeComplaint(text: string) {
  const prompt = `Analyze this complaint and provide detailed insights:
  1. Main issues described
  2. Potential root causes
  3. Immediate concerns
  4. Long-term implications
  
  Complaint: "${text}"`;

  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that analyzes complaints thoroughly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) throw new Error(`API error: ${await response.text()}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim();
  } catch (error) {
    console.error('Analysis failed:', error);
    return 'Analysis unavailable';
  }
}

async function enhanceAnalysis(text: string, category: string) {
  const prompt = `For this ${category}-related complaint, provide:
  1. Potential effects on the community (3-5 items)
  2. Possible consequences if unresolved (3-5 items)
  3. Severity assessment (low/medium/high)
  4. Suggested immediate actions (3-5 items)
  
  Respond in JSON format exactly like this:
  {
    "effects": string[],
    "consequences": string[],
    "severity": "low|medium|high",
    "suggestedActions": string[]
  }
  
  Complaint: "${text}"`;

  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          {
            role: "system",
            content: "You provide detailed enhancement analysis for complaints in strict JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`API error: ${await response.text()}`);
    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content?.trim();
    
    try {
      return JSON.parse(resultText);
    } catch (e) {
      console.error('Failed to parse enhanced analysis:', e);
      return {
        effects: [],
        consequences: [],
        severity: 'medium',
        suggestedActions: []
      };
    }
  } catch (error) {
    console.error('Enhanced analysis failed:', error);
    return {
      effects: [],
      consequences: [],
      severity: 'medium',
      suggestedActions: []
    };
  }
}

export async function predictCategory(description: string): Promise<CategoryPrediction> {
  const prompt = `You are a complaint categorization system that understands multiple languages. 
  Analyze this complaint and respond with ONLY a JSON object in this exact format:
  {
    "category": "water|sanitation|roads|electricity|other",
    "confidence": 0-100,
    "suggestedAgency": "Agency Name"
  }

  Complaint: "${description}"`;

  try {
    const [institutions, aiResponse] = await Promise.all([
      fetchInstitutions(),
      fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that categorizes complaints and suggests agencies in JSON format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      })
    ]);

    if (!aiResponse.ok) throw new Error(`API error: ${await aiResponse.text()}`);

    const data = await aiResponse.json();
    const resultText = data.choices?.[0]?.message?.content?.trim();
    if (!resultText) throw new Error('Empty response from AI');

    let result;
    try {
      result = JSON.parse(resultText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${resultText.slice(0, 100)}`);
    }

    if (!result.category || !result.confidence) {
      throw new Error(`Missing required fields: ${JSON.stringify(result)}`);
    }

    return await validatePrediction(result, institutions);

  } catch (error) {
    console.error('AI prediction failed:', error);
    return keywordBasedFallback(description);
  }
}

async function validatePrediction(result: any, institutions: SimpleInstitution[]): Promise<CategoryPrediction> {
  const validCategories = ['water', 'sanitation', 'roads', 'electricity', 'other'];
  const category = validCategories.includes(result.category?.toLowerCase()) 
    ? result.category.toLowerCase() 
    : 'other';

  const confidence = Math.min(100, Math.max(0, Number(result.confidence) || 70));

  let suggestedAgency = "Not Found";
  
  if (institutions.length > 0) {
    if (result.suggestedAgency) {
      const exactMatch = institutions.find(inst => 
        inst.name.toLowerCase() === result.suggestedAgency.toLowerCase()
      );
      if (exactMatch) suggestedAgency = exactMatch.name;
    }

    if (suggestedAgency === "Not Found") {
      const departmentMatch = institutions.find(inst => 
        inst.department.toLowerCase() === category
      );
      if (departmentMatch) suggestedAgency = departmentMatch.name;
    }
  }

  return { category, confidence, suggestedAgency };
}

async function keywordBasedFallback(description: string): Promise<CategoryPrediction> {
  const text = description.toLowerCase();
  
  // English and Kinyarwanda keywords
  const keywordMatches: Record<string, number> = {
    water: [
      ...(text.match(/water|tap|pipe|leak|wasac|drinking|flow|supply/g) || []),
      ...(text.match(/amazi|pompe|umutozi|gusuka|gusomba|kugwa/g) || [])
    ].length,
    
    sanitation: [
      ...(text.match(/garbage|waste|trash|sewage|toilet|hygiene|clean/g) || []),
      ...(text.match(/imyanda|ubwiza|ubuhonero|gutwikurura|isuku/g) || [])
    ].length,
    
    roads: [
      ...(text.match(/road|street|pothole|highway|traffic|asphalt|pavement/g) || []),
      ...(text.match(/umuhanda|ibyondo|inzererezi|guhagarara|gutwika/g) || [])
    ].length,
    
    electricity: [
      ...(text.match(/power|electricity|outage|light|electric|bulb|voltage/g) || []),
      ...(text.match(/amashanyarazi|kumira|kuzima|ampare|generateri/g) || [])
    ].length
  };

  const predictedCategory = Object.entries(keywordMatches).reduce(
    (max, [cat, score]) => score > max[1] ? [cat, score] : max,
    ['other', 0]
  )[0];

  const confidence = Math.min(Math.round((keywordMatches[predictedCategory] / 3) * 100), 98);

  const institutions = await fetchInstitutions();
  let suggestedAgency = "Not Found";

  if (institutions.length > 0) {
    const departmentMatch = institutions.find(inst => 
      inst.department.toLowerCase() === predictedCategory
    );
    if (departmentMatch) suggestedAgency = departmentMatch.name;
  }

  return {
    category: predictedCategory,
    confidence: confidence > 0 ? confidence : 70,
    suggestedAgency
  };
}

export async function predictFutureIssues(
  complaints: any[],
  location: string
): Promise<{ issue: string; probability: number; timeframe: string }[]> {
  try {
    if (complaints.length > 10) {
      const prompt = `
      Based on these historical complaints from ${location}:
      ${JSON.stringify(complaints.slice(0, 10))}

      Predict likely future infrastructure issues in this area.
      Respond with an array of predictions in this exact format:
      [{
        "issue": "specific issue",
        "probability": 0-100,
        "timeframe": "when it might occur"
      }]
      `;

      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
          prompt,
          max_tokens: 300,
          temperature: 0.4,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const resultText = data.choices?.[0]?.text?.trim();
        const jsonMatch = resultText?.match(/\[.*?\]/);

        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    }

    return statisticalAnalysis(complaints, location);
  } catch (error) {
    console.error('AI prediction failed:', error);
    return statisticalAnalysis(complaints, location);
  }
}

function statisticalAnalysis(
  complaints: any[],
  location: string
): { issue: string; probability: number; timeframe: string }[] {
  const locationComplaints = complaints.filter(c => c.location.includes(location));
  const categoryCounts: Record<string, number> = {};

  locationComplaints.forEach(complaint => {
    categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
  });

  const total = locationComplaints.length;
  const predictions = [];

  for (const [category, count] of Object.entries(categoryCounts)) {
    const probability = Math.round((count / total) * 100);

    predictions.push({
      issue: `${category} issues likely to recur`,
      probability: Math.min(probability + 20, 95),
      timeframe: probability > 50 ? "Next month" : "Next 3 months",
    });
  }

  return predictions.length > 0
    ? predictions
    : [{
        issue: "General infrastructure maintenance needed",
        probability: 60,
        timeframe: "Next quarter",
      }];
}