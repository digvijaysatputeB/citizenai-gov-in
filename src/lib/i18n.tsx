import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN", speech: "en-IN" },
  { code: "hi", label: "हिन्दी", short: "हि", speech: "hi-IN" },
  { code: "mr", label: "मराठी", short: "मर", speech: "mr-IN" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

const en = {
  "nav.home": "Home",
  "nav.report": "Report Issue",
  "nav.track": "Track Complaint",
  "nav.alerts": "Gov Alerts",
  "nav.schemes": "Gov Schemes",
  "nav.emergency": "Emergency",
  "nav.officer": "Officer",
  "nav.profile": "Profile",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",
  "nav.menu": "Menu",
  "nav.language": "Language",

  "report.title": "Report an Issue",
  "report.subtitle":
    "Tell us what's wrong. Six AI agents turn it into a formal, department-ready complaint.",
  "report.describe": "Describe your issue",
  "report.placeholder":
    "Describe your issue… e.g. The street light outside house no. 42 has been off for two weeks and the road is unsafe at night.",
  "report.address": "Address / landmark",
  "report.addressPlaceholder": "Street, area, city",
  "report.upload": "Upload image",
  "report.location": "Use current location",
  "report.submit": "Generate & file report",
  "report.another": "Report another issue",
  "report.speak": "Speak your complaint",
  "report.listening": "Listening…",
  "report.stopListening": "Stop listening",
  "report.voiceUnsupported": "Voice input isn't supported in this browser. Please type instead.",
  "report.micDenied": "Microphone access was blocked. Allow it in your browser settings.",
  "report.next": "What happens next",

  "emergency.title": "Emergency Contacts",
  "emergency.subtitle": "Direct lines to essential public services. Tap to call — no app needed.",
  "emergency.call": "Call Now",
  "emergency.copy": "Copy number",
  "emergency.copied": "Copied to clipboard",
  "emergency.email": "Email",
  "emergency.open": "Emergency contacts",
  "emergency.close": "Close",
  "emergency.viewAll": "View all emergency contacts",
  "emergency.police": "Police",
  "emergency.policeDesc": "Crime, public safety and immediate police assistance.",
  "emergency.ambulance": "Ambulance",
  "emergency.ambulanceDesc": "Medical emergencies and hospital transport.",
  "emergency.fire": "Fire Brigade",
  "emergency.fireDesc": "Fire, rescue and hazardous material incidents.",
  "emergency.women": "Women Helpline",
  "emergency.womenDesc": "24x7 support for women in distress.",
  "emergency.child": "Child Helpline",
  "emergency.childDesc": "Assistance for children in need of care and protection.",
  "emergency.cyber": "Cyber Crime Helpline",
  "emergency.cyberDesc": "Online fraud, phishing and financial cyber crime.",
  "emergency.disaster": "Disaster Management",
  "emergency.disasterDesc": "Floods, earthquakes and civil emergencies.",
  "emergency.support": "Citizen Support",
  "emergency.supportDesc": "Help with complaints, tracking and this platform.",
  "emergency.unified": "Unified Emergency Number",
  "emergency.unifiedDesc": "One number for police, fire and ambulance across India.",
};

type Dict = typeof en;
export type TKey = keyof Dict;

const hi: Dict = {
  "nav.home": "होम",
  "nav.report": "शिकायत दर्ज करें",
  "nav.track": "शिकायत ट्रैक करें",
  "nav.alerts": "सरकारी अलर्ट",
  "nav.schemes": "सरकारी योजनाएँ",
  "nav.emergency": "आपातकाल",
  "nav.officer": "अधिकारी",
  "nav.profile": "प्रोफ़ाइल",
  "nav.signIn": "साइन इन",
  "nav.signOut": "साइन आउट",
  "nav.menu": "मेन्यू",
  "nav.language": "भाषा",

  "report.title": "समस्या दर्ज करें",
  "report.subtitle":
    "हमें बताएं क्या समस्या है। छह AI एजेंट इसे विभाग-तैयार औपचारिक शिकायत में बदल देंगे।",
  "report.describe": "अपनी समस्या बताएं",
  "report.placeholder":
    "अपनी समस्या लिखें… जैसे मकान नं. 42 के बाहर स्ट्रीट लाइट दो हफ्तों से बंद है और रात में सड़क असुरक्षित है।",
  "report.address": "पता / लैंडमार्क",
  "report.addressPlaceholder": "सड़क, क्षेत्र, शहर",
  "report.upload": "फोटो अपलोड करें",
  "report.location": "वर्तमान स्थान लें",
  "report.submit": "रिपोर्ट बनाएं और दर्ज करें",
  "report.another": "एक और समस्या दर्ज करें",
  "report.speak": "बोलकर शिकायत दर्ज करें",
  "report.listening": "सुन रहे हैं…",
  "report.stopListening": "सुनना बंद करें",
  "report.voiceUnsupported": "इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया टाइप करें।",
  "report.micDenied": "माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र सेटिंग्स में इसे चालू करें।",
  "report.next": "आगे क्या होगा",

  "emergency.title": "आपातकालीन संपर्क",
  "emergency.subtitle": "आवश्यक सेवाओं के सीधे नंबर। कॉल करने के लिए टैप करें।",
  "emergency.call": "अभी कॉल करें",
  "emergency.copy": "नंबर कॉपी करें",
  "emergency.copied": "क्लिपबोर्ड पर कॉपी हो गया",
  "emergency.email": "ईमेल",
  "emergency.open": "आपातकालीन संपर्क",
  "emergency.close": "बंद करें",
  "emergency.viewAll": "सभी आपातकालीन संपर्क देखें",
  "emergency.police": "पुलिस",
  "emergency.policeDesc": "अपराध, सार्वजनिक सुरक्षा और तत्काल पुलिस सहायता।",
  "emergency.ambulance": "एम्बुलेंस",
  "emergency.ambulanceDesc": "चिकित्सा आपात स्थिति और अस्पताल परिवहन।",
  "emergency.fire": "अग्निशमन दल",
  "emergency.fireDesc": "आग, बचाव और खतरनाक सामग्री की घटनाएँ।",
  "emergency.women": "महिला हेल्पलाइन",
  "emergency.womenDesc": "संकट में महिलाओं के लिए 24x7 सहायता।",
  "emergency.child": "चाइल्ड हेल्पलाइन",
  "emergency.childDesc": "देखभाल और सुरक्षा की आवश्यकता वाले बच्चों के लिए सहायता।",
  "emergency.cyber": "साइबर क्राइम हेल्पलाइन",
  "emergency.cyberDesc": "ऑनलाइन धोखाधड़ी, फ़िशिंग और वित्तीय साइबर अपराध।",
  "emergency.disaster": "आपदा प्रबंधन",
  "emergency.disasterDesc": "बाढ़, भूकंप और नागरिक आपात स्थितियाँ।",
  "emergency.support": "नागरिक सहायता",
  "emergency.supportDesc": "शिकायत, ट्रैकिंग और इस प्लेटफ़ॉर्म से जुड़ी मदद।",
  "emergency.unified": "एकीकृत आपातकालीन नंबर",
  "emergency.unifiedDesc": "पूरे भारत में पुलिस, अग्निशमन और एम्बुलेंस के लिए एक नंबर।",
};

const mr: Dict = {
  "nav.home": "मुख्यपृष्ठ",
  "nav.report": "तक्रार नोंदवा",
  "nav.track": "तक्रार तपासा",
  "nav.alerts": "सरकारी सूचना",
  "nav.schemes": "सरकारी योजना",
  "nav.emergency": "आपत्कालीन",
  "nav.officer": "अधिकारी",
  "nav.profile": "प्रोफाइल",
  "nav.signIn": "साइन इन",
  "nav.signOut": "साइन आउट",
  "nav.menu": "मेनू",
  "nav.language": "भाषा",

  "report.title": "समस्या नोंदवा",
  "report.subtitle":
    "तुमची अडचण सांगा. सहा AI एजंट ती विभागासाठी तयार औपचारिक तक्रारीत रूपांतरित करतात.",
  "report.describe": "तुमची समस्या सांगा",
  "report.placeholder":
    "तुमची समस्या लिहा… उदा. घर क्र. ४२ बाहेरील पथदिवा दोन आठवड्यांपासून बंद आहे आणि रात्री रस्ता असुरक्षित आहे.",
  "report.address": "पत्ता / खूण",
  "report.addressPlaceholder": "रस्ता, परिसर, शहर",
  "report.upload": "फोटो अपलोड करा",
  "report.location": "सध्याचे स्थान वापरा",
  "report.submit": "अहवाल तयार करा व नोंदवा",
  "report.another": "आणखी एक समस्या नोंदवा",
  "report.speak": "बोलून तक्रार नोंदवा",
  "report.listening": "ऐकत आहोत…",
  "report.stopListening": "ऐकणे थांबवा",
  "report.voiceUnsupported": "या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया टाइप करा.",
  "report.micDenied": "मायक्रोफोनची परवानगी नाकारली गेली. ब्राउझर सेटिंग्जमध्ये ती द्या.",
  "report.next": "पुढे काय होते",

  "emergency.title": "आपत्कालीन संपर्क",
  "emergency.subtitle": "अत्यावश्यक सेवांचे थेट क्रमांक. कॉल करण्यासाठी टॅप करा.",
  "emergency.call": "आता कॉल करा",
  "emergency.copy": "क्रमांक कॉपी करा",
  "emergency.copied": "क्लिपबोर्डवर कॉपी झाले",
  "emergency.email": "ईमेल",
  "emergency.open": "आपत्कालीन संपर्क",
  "emergency.close": "बंद करा",
  "emergency.viewAll": "सर्व आपत्कालीन संपर्क पहा",
  "emergency.police": "पोलीस",
  "emergency.policeDesc": "गुन्हे, सार्वजनिक सुरक्षा आणि तातडीची पोलीस मदत.",
  "emergency.ambulance": "रुग्णवाहिका",
  "emergency.ambulanceDesc": "वैद्यकीय आपत्काल आणि रुग्णालय वाहतूक.",
  "emergency.fire": "अग्निशमन दल",
  "emergency.fireDesc": "आग, बचाव आणि घातक पदार्थांच्या घटना.",
  "emergency.women": "महिला हेल्पलाइन",
  "emergency.womenDesc": "संकटातील महिलांसाठी २४x७ मदत.",
  "emergency.child": "चाइल्ड हेल्पलाइन",
  "emergency.childDesc": "काळजी व संरक्षणाची गरज असलेल्या मुलांसाठी मदत.",
  "emergency.cyber": "सायबर क्राइम हेल्पलाइन",
  "emergency.cyberDesc": "ऑनलाइन फसवणूक, फिशिंग आणि आर्थिक सायबर गुन्हे.",
  "emergency.disaster": "आपत्ती व्यवस्थापन",
  "emergency.disasterDesc": "पूर, भूकंप आणि नागरी आपत्काल.",
  "emergency.support": "नागरिक मदत",
  "emergency.supportDesc": "तक्रारी, ट्रॅकिंग आणि या प्लॅटफॉर्मबाबत मदत.",
  "emergency.unified": "एकत्रित आपत्कालीन क्रमांक",
  "emergency.unifiedDesc": "संपूर्ण भारतात पोलीस, अग्निशमन व रुग्णवाहिकेसाठी एकच क्रमांक.",
};

const dicts: Record<LangCode, Dict> = { en, hi, mr };

const STORAGE_KEY = "cca-lang";

type I18nValue = {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: TKey) => string;
  speechLocale: string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (stored && stored in dicts) setLangState(stored);
  }, []);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key: TKey) => dicts[lang][key] ?? en[key],
      speechLocale: LANGUAGES.find((l) => l.code === lang)?.speech ?? "en-IN",
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
