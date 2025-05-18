// app/api/ussd/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Language texts
const languageTexts = {
  en: {
    welcome: "CON Welcome to Complaint System\n1. Report Complaint\n2. Check Status\n3. Exit",
    chooseLanguage: "CON Choose language:\n1. English\n2. Kinyarwanda",
    enterComplaint: "CON Enter your complaint description:",
    selectCategory: "CON Select complaint category:\n1. Infrastructure\n2. Sanitation\n3. Security\n4. Other",
    selectDistrict: "CON Select your district:",
    selectSector: "CON Select your sector:",
    selectCell: "CON Select your cell:",
    selectVillage: "CON Select your village:",
    complaintSuccess: "END Thank you! Your complaint ID is {id}. You'll receive updates via SMS.",
    enterComplaintId: "CON Enter your complaint ID:",
    complaintNotFound: "END Complaint not found. Please check your ID and try again.",
    complaintStatus: "END Complaint ID: {id}\nStatus: {status}\nLast Update: {date}",
    error: "END An error occurred. Please try again later.",
    goodbye: "END Thank you for using our service. Goodbye!"
  },
  rw: {
    welcome: "CON Murakaza neza kuri sisitemu y'ibyifuzo\n1. Tanga ikirego\n2. Reba imimerere\n3. Gusohoka",
    chooseLanguage: "CON Hitamwo ururimi:\n1. Icyongereza\n2. Ikinyarwanda",
    enterComplaint: "CON Andika ikirego cyawe:",
    selectCategory: "CON Hitamwo ubwoko bw'ikirego:\n1. Imishinga\n2. Isuku\n3. Umutekano\n4. Ibindi",
    selectDistrict: "CON Hitamwo akarere:",
    selectSector: "CON Hitamwo umurenge:",
    selectCell: "CON Hitamwo akagari:",
    selectVillage: "CON Hitamwo umudugudu:",
    complaintSuccess: "END Murakoze! Numero y'ikirego cyawe ni {id}. Uzahabwa amakuru ku message.",
    enterComplaintId: "CON Andika numero y'ikirego:",
    complaintNotFound: "END Ikirego ntabwo kibonetse. Gerageza nanone.",
    complaintStatus: "END Numero y'ikirego: {id}\nImimerere: {status}\nIheruka gusubirwaho: {date}",
    error: "END Habaye ikosa. Gerageza nanone.",
    goodbye: "END Murakoze gukoresha sisitemu yacu. Murabeho!"
  }
};

// Sample location data - replace with your actual data
const locations = {
  districts: [
    { id: 1, name_en: "Kigali", name_rw: "Kigali", sectors: [/*...*/] },
    // Add other districts...
  ]
  // You would expand this with actual sector, cell, village data
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const text = formData.get('text')?.toString() || '';
  const phoneNumber = formData.get('phoneNumber')?.toString() || '';

  try {
    const client = await clientPromise;
    const db = client.db();
    
    const response = await handleUSSDMenu(text, phoneNumber, db);
    
    return new NextResponse(response, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    return new NextResponse(languageTexts.en.error, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function handleUSSDMenu(text: string, phoneNumber: string, db: any) {
  const input = text.split('*');
  const step = input.length;
  let language = 'en'; // Default language
  let sessionData: any = {}; // Store temporary session data

  // Check if we have session data in DB for this phone number
  const existingSession = await db.collection("ussd_sessions").findOne({ phoneNumber });
  if (existingSession) {
    language = existingSession.language;
    sessionData = existingSession.data || {};
  }

  const t = languageTexts[language as keyof typeof languageTexts];

  // Language selection
  if (step === 1 && text === '') {
    return t.chooseLanguage;
  }

  if (step === 2) {
    // Set language
    if (['1', '2'].includes(input[1])) {
      language = input[1] === '1' ? 'en' : 'rw';
      await db.collection("ussd_sessions").updateOne(
        { phoneNumber },
        { $set: { language, data: {} } },
        { upsert: true }
      );
      return languageTexts[language as keyof typeof languageTexts].welcome;
    }
    return t.error;
  }

  // Main menu (step starts after language selection)
  const effectiveStep = step - 2;
  
  // Complaint reporting flow
  if (input[2] === '1') {
    switch (effectiveStep) {
      case 1: // Just entered complaint menu
        return t.enterComplaint;
        
      case 2: // Received complaint description
        sessionData.description = input[3];
        await saveSession(db, phoneNumber, language, sessionData);
        return t.selectCategory;
        
      case 3: // Received category
        sessionData.category = getCategory(input[4], language);
        await saveSession(db, phoneNumber, language, sessionData);
        return t.selectDistrict;
        
      case 4: // Received district
        sessionData.district = getLocationName(input[5], 'district', language);
        await saveSession(db, phoneNumber, language, sessionData);
        return t.selectSector;
        
      case 5: // Received sector
        sessionData.sector = getLocationName(input[6], 'sector', language);
        await saveSession(db, phoneNumber, language, sessionData);
        return t.selectCell;
        
      case 6: // Received cell
        sessionData.cell = getLocationName(input[7], 'cell', language);
        await saveSession(db, phoneNumber, language, sessionData);
        return t.selectVillage;
        
      case 7: // Received village - complete complaint
        sessionData.village = getLocationName(input[8], 'village', language);
        
        // Create complaint
        const complaint = {
          id: `C${Math.floor(1000 + Math.random() * 9000)}`,
          phoneNumber,
          description: sessionData.description,
          category: sessionData.category,
          district: sessionData.district,
          sector: sessionData.sector,
          cell: sessionData.cell,
          village: sessionData.village,
          status: "submitted",
          submissionMethod: "ussd",
          language,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.collection("complaints").insertOne(complaint);
        await db.collection("ussd_sessions").deleteOne({ phoneNumber });
        
        return t.complaintSuccess.replace('{id}', complaint.id);
    }
  }

  // Status check flow
  if (input[2] === '2') {
    if (effectiveStep === 1) {
      return t.enterComplaintId;
    }
    if (effectiveStep === 2) {
      const complaintId = input[3];
      const complaint = await db.collection("complaints").findOne({ id: complaintId });
      
      if (!complaint) {
        return t.complaintNotFound;
      }
      
      return t.complaintStatus
        .replace('{id}', complaint.id)
        .replace('{status}', complaint.status)
        .replace('{date}', complaint.updatedAt.toLocaleDateString());
    }
  }

  // Exit or invalid option
  await db.collection("ussd_sessions").deleteOne({ phoneNumber });
  return t.goodbye;
}

// Helper functions
async function saveSession(db: any, phoneNumber: string, language: string, data: any) {
  await db.collection("ussd_sessions").updateOne(
    { phoneNumber },
    { $set: { language, data } },
    { upsert: true }
  );
}

function getCategory(selection: string, language: string): string {
  const categories = {
    en: ['Infrastructure', 'Sanitation', 'Security', 'Other'],
    rw: ['Imishinga', 'Isuku', 'Umutekano', 'Ibindi']
  };
  const index = parseInt(selection) - 1;
  return categories[language as keyof typeof categories][index] || 'Other';
}

function getLocationName(selection: string, level: string, language: string): string {
  // In a real implementation, you would query your location database
  // This is a simplified version
  const index = parseInt(selection) - 1;
  return `${level} ${index + 1}`; // Example: "District 1"
}