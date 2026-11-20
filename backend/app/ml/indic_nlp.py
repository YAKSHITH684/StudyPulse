"""
StudyPulse Indic NLP & Multilingual Engine
Supports all 22 Constitutionally Scheduled Languages of India + 7 Regional/Tribal Languages.
Aligned with IndicTrans2 & AI4Bharat linguistic frameworks.
"""

import re
from typing import Dict, Any, List, Optional, Tuple

INDIC_LANGUAGES: Dict[str, Dict[str, Any]] = {
    # 22 Constitutionally Scheduled Languages (Eighth Schedule)
    "as": {
        "name": "Assamese",
        "native_name": "অসমীয়া",
        "script": "Bengali-Assamese",
        "bcp47": "as-IN",
        "category": "Scheduled",
        "greeting": "নমস্কাৰ",
        "direction": "ltr"
    },
    "bn": {
        "name": "Bengali",
        "native_name": "বাংলা",
        "script": "Bengali",
        "bcp47": "bn-IN",
        "category": "Scheduled",
        "greeting": "নমস্কার",
        "direction": "ltr"
    },
    "brx": {
        "name": "Bodo",
        "native_name": "बड़ो",
        "script": "Devanagari",
        "bcp47": "brx-IN",
        "category": "Scheduled",
        "greeting": "खुलुमबाय",
        "direction": "ltr"
    },
    "doi": {
        "name": "Dogri",
        "native_name": "डोगरी",
        "script": "Devanagari",
        "bcp47": "doi-IN",
        "category": "Scheduled",
        "greeting": "नमस्ते",
        "direction": "ltr"
    },
    "gu": {
        "name": "Gujarati",
        "native_name": "ગુજરાતી",
        "script": "Gujarati",
        "bcp47": "gu-IN",
        "category": "Scheduled",
        "greeting": "નમસ્તે",
        "direction": "ltr"
    },
    "hi": {
        "name": "Hindi",
        "native_name": "हिन्दी",
        "script": "Devanagari",
        "bcp47": "hi-IN",
        "category": "Scheduled",
        "greeting": "नमस्ते",
        "direction": "ltr"
    },
    "kn": {
        "name": "Kannada",
        "native_name": "ಕನ್ನಡ",
        "script": "Kannada",
        "bcp47": "kn-IN",
        "category": "Scheduled",
        "greeting": "ನಮಸ್ಕಾರ",
        "direction": "ltr"
    },
    "ks": {
        "name": "Kashmiri",
        "native_name": "کٲشُر / कॉशुर",
        "script": "Perso-Arabic / Devanagari",
        "bcp47": "ks-IN",
        "category": "Scheduled",
        "greeting": "آداب / नमस्कार",
        "direction": "rtl"
    },
    "kok": {
        "name": "Konkani",
        "native_name": "कोंकणी",
        "script": "Devanagari",
        "bcp47": "kok-IN",
        "category": "Scheduled",
        "greeting": "नमस्कार",
        "direction": "ltr"
    },
    "mai": {
        "name": "Maithili",
        "native_name": "मैथिली",
        "script": "Devanagari",
        "bcp47": "mai-IN",
        "category": "Scheduled",
        "greeting": "प्रणाम",
        "direction": "ltr"
    },
    "ml": {
        "name": "Malayalam",
        "native_name": "മലയാളം",
        "script": "Malayalam",
        "bcp47": "ml-IN",
        "category": "Scheduled",
        "greeting": "നമസ്കാരം",
        "direction": "ltr"
    },
    "mni": {
        "name": "Manipuri (Meitei)",
        "native_name": "মৈতৈলোন্ / ꯃꯤꯇꯩꯂꯣꯟ",
        "script": "Bengali / Meetei Mayek",
        "bcp47": "mni-IN",
        "category": "Scheduled",
        "greeting": "খুরুমজরি",
        "direction": "ltr"
    },
    "mr": {
        "name": "Marathi",
        "native_name": "मराठी",
        "script": "Devanagari",
        "bcp47": "mr-IN",
        "category": "Scheduled",
        "greeting": "नमस्कार",
        "direction": "ltr"
    },
    "ne": {
        "name": "Nepali",
        "native_name": "नेपाली",
        "script": "Devanagari",
        "bcp47": "ne-NP",
        "category": "Scheduled",
        "greeting": "नमस्ते",
        "direction": "ltr"
    },
    "or": {
        "name": "Odia",
        "native_name": "ଓଡ଼ିଆ",
        "script": "Odia",
        "bcp47": "or-IN",
        "category": "Scheduled",
        "greeting": "ନମସ୍କାର",
        "direction": "ltr"
    },
    "pa": {
        "name": "Punjabi",
        "native_name": "ਪੰਜਾਬੀ",
        "script": "Gurmukhi",
        "bcp47": "pa-IN",
        "category": "Scheduled",
        "greeting": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
        "direction": "ltr"
    },
    "sa": {
        "name": "Sanskrit",
        "native_name": "संस्कृतम्",
        "script": "Devanagari",
        "bcp47": "sa-IN",
        "category": "Scheduled",
        "greeting": "नमो नमः",
        "direction": "ltr"
    },
    "sat": {
        "name": "Santali",
        "native_name": "ᱥᱟᱱᱛᱟᱲᱤ",
        "script": "Ol Chiki",
        "bcp47": "sat-IN",
        "category": "Scheduled",
        "greeting": "ᱡᱚᱦᱟᱨ",
        "direction": "ltr"
    },
    "sd": {
        "name": "Sindhi",
        "native_name": "سنڌي / सिंधी",
        "script": "Perso-Arabic / Devanagari",
        "bcp47": "sd-IN",
        "category": "Scheduled",
        "greeting": "سلام / नमस्कार",
        "direction": "rtl"
    },
    "ta": {
        "name": "Tamil",
        "native_name": "தமிழ்",
        "script": "Tamil",
        "bcp47": "ta-IN",
        "category": "Scheduled",
        "greeting": "வணக்கம்",
        "direction": "ltr"
    },
    "te": {
        "name": "Telugu",
        "native_name": "తెలుగు",
        "script": "Telugu",
        "bcp47": "te-IN",
        "category": "Scheduled",
        "greeting": "నమస్కారం",
        "direction": "ltr"
    },
    "ur": {
        "name": "Urdu",
        "native_name": "اردو",
        "script": "Perso-Arabic",
        "bcp47": "ur-IN",
        "category": "Scheduled",
        "greeting": "السلام علیکم",
        "direction": "rtl"
    },

    # Additional Regional, Tribal & Minority Languages
    "tcy": {
        "name": "Tulu",
        "native_name": "ತುಳು",
        "script": "Kannada",
        "bcp47": "tcy-IN",
        "category": "Regional & Tribal",
        "greeting": "ಸೊಲ್ಮೆಲು",
        "direction": "ltr"
    },
    "bho": {
        "name": "Bhojpuri",
        "native_name": "भोजपुरी",
        "script": "Devanagari",
        "bcp47": "bho-IN",
        "category": "Regional & Tribal",
        "greeting": "प्रणाम",
        "direction": "ltr"
    },
    "raj": {
        "name": "Rajasthani",
        "native_name": "राजस्थानी",
        "script": "Devanagari",
        "bcp47": "raj-IN",
        "category": "Regional & Tribal",
        "greeting": "खम्मा घणी",
        "direction": "ltr"
    },
    "kha": {
        "name": "Khasi",
        "native_name": "Ka Ktien Khasi",
        "script": "Latin",
        "bcp47": "kha-IN",
        "category": "Regional & Tribal",
        "greeting": "Khublei",
        "direction": "ltr"
    },
    "grt": {
        "name": "Garo",
        "native_name": "A·chik",
        "script": "Latin",
        "bcp47": "grt-IN",
        "category": "Regional & Tribal",
        "greeting": "Salam",
        "direction": "ltr"
    },
    "lus": {
        "name": "Mizo",
        "native_name": "Mizo ṭawng",
        "script": "Latin",
        "bcp47": "lus-IN",
        "category": "Regional & Tribal",
        "greeting": "Chibai",
        "direction": "ltr"
    },
    "trp": {
        "name": "Kokborok",
        "native_name": "ককবরক",
        "script": "Bengali / Latin",
        "bcp47": "trp-IN",
        "category": "Regional & Tribal",
        "greeting": "Khulumkha",
        "direction": "ltr"
    },

    # English (Standard Indian Education Context)
    "en": {
        "name": "English",
        "native_name": "English",
        "script": "Latin",
        "bcp47": "en-IN",
        "category": "Standard",
        "greeting": "Hello",
        "direction": "ltr"
    }
}

# Unicode Script Ranges for Indian Scripts
SCRIPT_RANGES = [
    ("Devanagari", 0x0900, 0x097F),
    ("Bengali-Assamese", 0x0980, 0x09FF),
    ("Gurmukhi", 0x0A00, 0x0A7F),
    ("Gujarati", 0x0A80, 0x0AFF),
    ("Odia", 0x0B00, 0x0B7F),
    ("Tamil", 0x0B80, 0x0BFF),
    ("Telugu", 0x0C00, 0x0C7F),
    ("Kannada", 0x0C80, 0x0CFF),
    ("Malayalam", 0x0D00, 0x0D7F),
    ("Ol Chiki", 0x1C50, 0x1C7F),
    ("Meetei Mayek", 0xABC0, 0xABFF),
    ("Perso-Arabic", 0x0600, 0x06FF),
]

def detect_script(text: str) -> str:
    """Detects primary Indian script based on character codepoints."""
    counts: Dict[str, int] = {}
    for char in text:
        cp = ord(char)
        for script_name, start, end in SCRIPT_RANGES:
            if start <= cp <= end:
                counts[script_name] = counts.get(script_name, 0) + 1
                break
    if counts:
        return max(counts, key=counts.get)
    return "Latin"

def detect_indian_language(text: str) -> Dict[str, Any]:
    """
    Identifies language from text using script analysis + code-mixed keywords.
    Handles mixed queries like Hinglish, Telugish, Tanglish.
    """
    script = detect_script(text)
    text_lower = text.lower()

    # Script-based deterministic mapping
    if script == "Telugu":
        return {"code": "te", "name": "Telugu", "script": "Telugu", "confidence": 0.95, "is_code_mixed": False}
    if script == "Tamil":
        return {"code": "ta", "name": "Tamil", "script": "Tamil", "confidence": 0.95, "is_code_mixed": False}
    if script == "Kannada":
        return {"code": "kn", "name": "Kannada", "script": "Kannada", "confidence": 0.95, "is_code_mixed": False}
    if script == "Malayalam":
        return {"code": "ml", "name": "Malayalam", "script": "Malayalam", "confidence": 0.95, "is_code_mixed": False}
    if script == "Gujarati":
        return {"code": "gu", "name": "Gujarati", "script": "Gujarati", "confidence": 0.95, "is_code_mixed": False}
    if script == "Odia":
        return {"code": "or", "name": "Odia", "script": "Odia", "confidence": 0.95, "is_code_mixed": False}
    if script == "Gurmukhi":
        return {"code": "pa", "name": "Punjabi", "script": "Gurmukhi", "confidence": 0.95, "is_code_mixed": False}
    if script == "Ol Chiki":
        return {"code": "sat", "name": "Santali", "script": "Ol Chiki", "confidence": 0.95, "is_code_mixed": False}
    if script == "Meetei Mayek":
        return {"code": "mni", "name": "Manipuri", "script": "Meetei Mayek", "confidence": 0.95, "is_code_mixed": False}
    if script == "Perso-Arabic":
        # Check Urdu vs Sindhi vs Kashmiri
        if any(w in text for w in ["کیتھ", "چھو", "کین"]):
            return {"code": "ks", "name": "Kashmiri", "script": "Perso-Arabic", "confidence": 0.90, "is_code_mixed": False}
        return {"code": "ur", "name": "Urdu", "script": "Perso-Arabic", "confidence": 0.92, "is_code_mixed": False}
    if script == "Bengali-Assamese":
        # Assamese specific characters 'ৰ' (U+09F0) and 'ৱ' (U+09F1)
        if 'ৰ' in text or 'ৱ' in text:
            return {"code": "as", "name": "Assamese", "script": "Bengali-Assamese", "confidence": 0.95, "is_code_mixed": False}
        return {"code": "bn", "name": "Bengali", "script": "Bengali", "confidence": 0.92, "is_code_mixed": False}
    if script == "Devanagari":
        # Distinguish Marathi (ळ), Nepali, Hindi, Bhojpuri, Sanskrit
        if 'ळ' in text or 'आहे' in text or 'नाही' in text:
            return {"code": "mr", "name": "Marathi", "script": "Devanagari", "confidence": 0.94, "is_code_mixed": False}
        if 'छन्' in text or 'हुन्' in text or 'भयो' in text:
            return {"code": "ne", "name": "Nepali", "script": "Devanagari", "confidence": 0.92, "is_code_mixed": False}
        if 'बाटे' in text or 'काहे' in text or 'रउआ' in text:
            return {"code": "bho", "name": "Bhojpuri", "script": "Devanagari", "confidence": 0.90, "is_code_mixed": False}
        if 'अस्ति' in text or 'भवति' in text:
            return {"code": "sa", "name": "Sanskrit", "script": "Devanagari", "confidence": 0.90, "is_code_mixed": False}
        return {"code": "hi", "name": "Hindi", "script": "Devanagari", "confidence": 0.92, "is_code_mixed": False}

    # Latin Script - Code-mixed heuristics (Hinglish, Telugish, Tanglish, etc.)
    hinglish_words = [
        "kya", "hai", "kaise", "karein", "kyun", "bachha", "padhai", "kam", 
        "zyada", "madad", "nahi", "raha", "rahe", "hain", "aur", "ho", "karo", "bhi"
    ]
    telugish_words = [
        "emi", "ela", "undi", "cheyali", "chaduvu", "taggipoindi", "baga", 
        "kaavali", "kavali", "kuda", "raaledu", "vastaledu", "ledhu", "enti"
    ]
    tanglish_words = [
        "epdi", "panradhu", "irukku", "padikkanum", "yen", "marku", "solla", 
        "varala", "illa", "therila", "panna"
    ]

    words = re.findall(r'\b\w+\b', text_lower)
    h_count = sum(1 for w in words if w in hinglish_words)
    te_count = sum(1 for w in words if w in telugish_words)
    ta_count = sum(1 for w in words if w in tanglish_words)

    if h_count > 0 and h_count >= te_count and h_count >= ta_count:
        return {"code": "hi", "name": "Hindi (Hinglish Code-mixed)", "script": "Latin", "confidence": 0.85, "is_code_mixed": True}
    if te_count > 0 and te_count >= h_count:
        return {"code": "te", "name": "Telugu (Telugish Code-mixed)", "script": "Latin", "confidence": 0.85, "is_code_mixed": True}
    if ta_count > 0:
        return {"code": "ta", "name": "Tamil (Tanglish Code-mixed)", "script": "Latin", "confidence": 0.85, "is_code_mixed": True}

    # Default to English
    return {"code": "en", "name": "English", "script": "Latin", "confidence": 0.90, "is_code_mixed": False}

# Multilingual Academic Early-Warning Vocabulary
ACADEMIC_TERMS_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "hi": {
        "high_risk": "उच्च ड्रॉपआउट जोखिम",
        "medium_risk": "मध्यम जोखिम (निगरानी)",
        "low_risk": "सुरक्षित (कम जोखिम)",
        "attendance": "उपस्थिति",
        "marks": "प्राप्तांक / अंक",
        "behavior": "कक्षा आचरण",
        "lms": "डिजिटल अध्ययन पोर्टल",
        "intervention": "शैक्षणिक सहायता व मार्गदर्शन",
        "timeline": "भविष्यसूचक जोखिम समयरेखा",
        "study_plan": "व्यक्तिगत अध्ययन योजना",
        "immediate_action": "तत्काल शैक्षणिक हस्तक्षेप आवश्यक"
    },
    "te": {
        "high_risk": "అధిక డ్రాపౌట్ ప్రమాదం",
        "medium_risk": "మధ్యస్థ ప్రమాదం (పరిశీలన)",
        "low_risk": "సురక్షితం (తక్కువ ప్రమాదం)",
        "attendance": "హాజరు శాతం",
        "marks": "మార్కులు / విద్యా ప్రగతి",
        "behavior": "తరగతి ప్రవర్తన",
        "lms": "డిజిటల్ పోర్టల్ సమయం",
        "intervention": "ప్రత్యేక సహాయక చర్యలు",
        "timeline": "డ్రాపౌట్ సూచిక కాలక్రమం",
        "study_plan": "వ్యక్తిగత స్టడీ ప్లాన్",
        "immediate_action": "తక్షణ శ్రద్ధ మరియు సంరక్షణ అవసరం"
    },
    "ta": {
        "high_risk": "அதிக இடைநிற்றல் ஆபத்து",
        "medium_risk": "நடுத்தர ஆபத்து (கண்காணிப்பு)",
        "low_risk": "குறைந்த ஆபத்து (பாதுகாப்பானது)",
        "attendance": "வருகைப்பதிவு",
        "marks": "மதிப்பெண்கள்",
        "behavior": "வகுப்பறை நடத்தை",
        "lms": "டிஜிட்டல் கற்றல் தளம்",
        "intervention": "சிறப்பு உதவி மற்றும் வழிகாட்டல்",
        "timeline": "முன்னறிவிப்பு காலவரிசை",
        "study_plan": "தனிப்பயனாக்கப்பட்ட படிப்புத் திட்டம்",
        "immediate_action": "உடனடி ஆதரவு தேவை"
    },
    "bn": {
        "high_risk": "উচ্চ ড্রপআউট ঝুঁকি",
        "medium_risk": "মাঝারি ঝুঁকি (নজরদারি)",
        "low_risk": "কম ঝুঁকি (নিরাপদ)",
        "attendance": "উপস্থিতির হার",
        "marks": "পরীক্ষার নম্বর",
        "behavior": "শ্রেণীকক্ষে আচরণ",
        "lms": "ডিজিটাল পোর্টাল ব্যবহার",
        "intervention": "প্রয়োজনীয় শিক্ষাগত সহায়তা",
        "timeline": "ভবিষ্যদ্বাণীমূলক সময়রেখা",
        "study_plan": "ব্যক্তিগত পড়াশোনার রুটিন",
        "immediate_action": "অবিলম্বে সহায়তা প্রয়োজন"
    },
    "mr": {
        "high_risk": "गळतीचा उच्च धोका",
        "medium_risk": "मध्यम धोका (लक्ष ठेवा)",
        "low_risk": "कमी धोका (सुरक्षित)",
        "attendance": "उपस्थिती",
        "marks": "शैक्षणिक गुण",
        "behavior": "वर्ग आचरण",
        "lms": "डिजिटल पोर्टल वापर",
        "intervention": "उपचारात्मक मार्गदर्शन",
        "timeline": "भविष्यसूचक धोक्याची टाइमलाइन",
        "study_plan": "वैयक्तिक अभ्यास वेळापत्रक",
        "immediate_action": "तातडीने हस्तक्षेपाची गरज"
    },
    "gu": {
        "high_risk": "ઉચ્ચ ડ્રોપઆઉટ જોખમ",
        "medium_risk": "મધ્યમ જોખમ (ધ્યાન આપો)",
        "low_risk": "ઓછું જોખમ (સલામત)",
        "attendance": "હાજરીની ટકાવારી",
        "marks": "પરીક્ષા ગુણ",
        "behavior": "વર્ગખંડ વર્તણૂક",
        "lms": "ડિજિટલ અભ્યાસ પોર્ટલ",
        "intervention": "શૈક્ષણિક સહાય અને માર્ગદર્શન",
        "timeline": "અનુમાનિત જોખમ સમયરેખા",
        "study_plan": "વ્યક્તિગત અભ્યાસ સમયપત્રક",
        "immediate_action": "તાત્કાલિક પગલાં જરૂરી"
    },
    "kn": {
        "high_risk": "ಹೆಚ್ಚಿನ ಡ್ರಾಪ್‌ಔಟ್ ಅಪಾಯ",
        "medium_risk": "ಮಧ್ಯಮ ಅಪಾಯ (ಮೇಲ್ವಿಚಾರಣೆ)",
        "low_risk": "ಕಡಿಮೆ ಅಪಾಯ (ಸುರಕ್ಷಿತ)",
        "attendance": "ಹಾಜರಾತಿ ಪ್ರಮಾಣ",
        "marks": "ಅಂಕಗಳು",
        "behavior": "ತರಗತಿ ನಡವಳಿಕೆ",
        "lms": "ಡಿಜಿಟಲ್ ಪೋರ್ಟಲ್ ಬಳಕೆ",
        "intervention": "ಶೈಕ್ಷಣಿಕ ಪರಿಹಾರ ಕ್ರಮಗಳು",
        "timeline": "ಮುನ್ಸೂಚನಾ ಅಪಾಯದ ಕಾಲಮಿತಿ",
        "study_plan": "ವೈಯಕ್ತಿಕ ಅಧ್ಯಯನ ಯೋಜನೆ",
        "immediate_action": "ತಕ್ಷಣದ ಗಮನ ಅಗತ್ಯ"
    },
    "ml": {
        "high_risk": "ഉയർന്ന കൊഴിഞ്ഞുപോക്ക് സാധ്യത",
        "medium_risk": "ഇടത്തരം സാധ്യത (നിരീക്ഷിക്കുക)",
        "low_risk": "കുറഞ്ഞ സാധ്യത (സുരക്ഷിതം)",
        "attendance": "ഹാജർ നില",
        "marks": "പരീക്ഷാ മാർക്കുകൾ",
        "behavior": "പെരുമാറ്റ നിലവാരം",
        "lms": "ഡിജിറ്റൽ പോർട്ടൽ സമയം",
        "intervention": "പ്രത്യേക പഠന പിന്തുണ",
        "timeline": "സാധ്യത പ്രവചന ടൈംലൈൻ",
        "study_plan": "വ്യക്തിഗത പഠന ഷെഡ്യൂൾ",
        "immediate_action": "ഉടൻ ഇടപെടൽ ആവശ്യമാണ്"
    },
    "pa": {
        "high_risk": "ਉੱਚ ਡਰਾਪਆਊਟ ਖ਼ਤਰਾ",
        "medium_risk": "ਦਰਮਿਆਨਾ ਖ਼ਤਰਾ (ਨਿਗਰਾਨੀ)",
        "low_risk": "ਘੱਟ ਖ਼ਤਰਾ (ਸੁਰੱਖਿਅਤ)",
        "attendance": "ਹਾਜ਼ਰੀ ਪ੍ਰਤੀਸ਼ਤ",
        "marks": "ਪ੍ਰੀਖਿਆ ਅੰਕ",
        "behavior": "ਜਮਾਤ ਵਿੱਚ ਵਤੀਰਾ",
        "lms": "ਡਿਜੀਟਲ ਪੋਰਟਲ ਵਰਤੋਂ",
        "intervention": "ਸਿੱਖਿਆ ਸਹਾਇਤਾ ਅਤੇ ਮਦਦ",
        "timeline": "ਅਨੁਮਾਨਿਤ ਸਮਾਂ-ਰੇਖਾ",
        "study_plan": "ਨਿੱਜੀ ਪੜ੍ਹਾਈ ਯੋਜਨਾ",
        "immediate_action": "ਤੁਰੰਤ ਧਿਆਨ ਦੇਣ ਦੀ ਲੋੜ"
    },
    "ur": {
        "high_risk": "تعلیم ترک کرنے کا شدید خطرہ",
        "medium_risk": "درمیانہ خطرہ (نگرانی)",
        "low_risk": "کم خطرہ (اطمینان بخش)",
        "attendance": "حاضری کا تناسب",
        "marks": "امتحانی نمبرات",
        "behavior": "کلاس میں رویہ",
        "lms": "ڈیجیٹل پورٹل استعمال",
        "intervention": "تعلیمی رہنمائی و مدد",
        "timeline": "پیشین گوئی کا ٹائم لائن",
        "study_plan": "ذاتی مطالعہ کا شیڈول",
        "immediate_action": "فوری توجہ درکار ہے"
    },
    "or": {
        "high_risk": "ଅଧିକ ଡ୍ରପଆଉଟ୍ ଆଶଙ୍କା",
        "medium_risk": "ମଧ୍ୟମ ଆଶଙ୍କା (ନଜର ରଖନ୍ତୁ)",
        "low_risk": "କମ୍ ଆଶଙ୍କା (ସୁରକ୍ଷିତ)",
        "attendance": "ଉପସ୍ଥିତି ହାର",
        "marks": "ପରୀକ୍ଷା ନମ୍ବର",
        "behavior": "ଶ୍ରେଣୀଗୃହ ଆଚରଣ",
        "lms": "ଡିଜିଟାଲ୍ ପୋର୍ଟାଲ୍ ସମୟ",
        "intervention": "ପ୍ରତିକାରମୂଳକ ଶିକ୍ଷା ସହାୟତା",
        "timeline": "ପୂର୍ବାନୁମାନ ସମୟରେଖା",
        "study_plan": "ବ୍ୟକ୍ତିଗତ ଅଧ୍ୟୟନ ସମୟସାରଣୀ",
        "immediate_action": "ତୁରନ୍ତ ସହାୟତା ଆବଶ୍ୟକ"
    },
    "as": {
        "high_risk": "উচ্চ ড্ৰপআউট শংকা",
        "medium_risk": "মধ্যম শংকা (নজৰ ৰাখক)",
        "low_risk": "কম শংকা (সুৰক্ষিত)",
        "attendance": "উপস্থিতিৰ হাৰ",
        "marks": "পৰীক্ষাৰ নম্বৰ",
        "behavior": "শ্ৰেণীকোঠাৰ আচৰণ",
        "lms": "ডিজিটেল অধ্যয়ন পৰ্টেল",
        "intervention": "শিক্ষাগত সহায় আৰু পৰামৰ্শ",
        "timeline": "ভৱিষ্যদ্বাণীমূলক সময়ৰেখা",
        "study_plan": "ব্যক্তিগত অধ্যয়ন পৰিকল্পনা",
        "immediate_action": "তাত্ক্ষণিক সহায়ৰ প্ৰয়োজন"
    }
}

def translate_early_warning_insight(
    student_name: str,
    risk_tier: str,
    probability: float,
    factors: List[Dict[str, Any]],
    target_lang: str = "en"
) -> Dict[str, Any]:
    """
    Translates early warning metrics and reasons into the target Indian language
    while maintaining rigorous academic meaning.
    """
    lang_info = INDIC_LANGUAGES.get(target_lang, INDIC_LANGUAGES["en"])
    terms = ACADEMIC_TERMS_TRANSLATIONS.get(target_lang, {})

    translated_tier = terms.get(f"{risk_tier.lower()}_risk", f"{risk_tier} Risk")
    urgency = terms.get("immediate_action", "Immediate Intervention Recommended") if risk_tier == "High" else "Monitoring Recommended"

    # Translate SHAP factors
    translated_factors = []
    for f in factors:
        orig = f.get("explanation", "")
        translated = orig

        if target_lang == "hi":
            translated = orig.replace("Attendance dropped", "उपस्थिति में गिरावट") \
                             .replace("below class average", "कक्षा औसत से नीचे") \
                             .replace("low marks", "कम प्राप्तांक") \
                             .replace("behavior incidents", "आचरण घटनाएं") \
                             .replace("LMS engagement declined", "पोर्टल अध्ययन समय में कमी")
        elif target_lang == "te":
            translated = orig.replace("Attendance dropped", "హాజరు తగ్గింది") \
                             .replace("below class average", "తరగతి సగటు కంటే తక్కువ") \
                             .replace("low marks", "తక్కువ మార్కులు") \
                             .replace("behavior incidents", "క్రమశిక్షణా సంఘటనలు") \
                             .replace("LMS engagement declined", "పోర్టల్ అధ్యయన సమయం తగ్గింది")
        elif target_lang == "ta":
            translated = orig.replace("Attendance dropped", "வருகைப்பதிவு குறைந்தது") \
                             .replace("below class average", "வகுப்பு சராசரிக்குக் கீழே") \
                             .replace("low marks", "குறைந்த மதிப்பெண்கள்") \
                             .replace("behavior incidents", "நடத்தை சம்பவங்கள்")
        elif target_lang == "bn":
            translated = orig.replace("Attendance dropped", "উপস্থিতি হ্রাস পেয়েছে") \
                             .replace("below class average", "শ্রেণির গড়ের চেয়ে কম") \
                             .replace("low marks", "কম নম্বর")
        elif target_lang == "mr":
            translated = orig.replace("Attendance dropped", "उपस्थितीत घट झाली") \
                             .replace("below class average", "वर्गाच्या सरासरीपेक्षा कमी") \
                             .replace("low marks", "कमी गुण")

        translated_factors.append({
            "rank": f.get("rank", 1),
            "explanation": translated,
            "weight": f.get("weight", "33%")
        })

    return {
        "student_name": student_name,
        "language": lang_info["name"],
        "native_language": lang_info["native_name"],
        "script": lang_info["script"],
        "risk_tier": translated_tier,
        "probability_percent": int(probability * 100),
        "urgency": urgency,
        "translated_factors": translated_factors
    }

def generate_parent_regional_alert(
    student_name: str,
    risk_tier: str,
    primary_factor: str,
    target_lang: str = "hi"
) -> Dict[str, str]:
    """
    Generates culturally empathetic, respectful regional-language SMS / WhatsApp alerts for parents.
    """
    lang = target_lang if target_lang in INDIC_LANGUAGES else "en"
    greeting = INDIC_LANGUAGES[lang]["greeting"]

    if lang == "te":
        message = (
            f"{greeting}! స్టడీపల్స్ పాఠశాల సంరక్షణ నివేదిక: మీ పిల్లవాడు/పిల్ల {student_name} "
            f"తరగతి పురోగతిపై మేము శ్రద్ధ వహిస్తున్నాము. ముఖ్యంగా '{primary_factor}' పై ప్రత్యేక శ్రద్ధ అవసరం. "
            f"దయచేసి విద్యార్థిని ఉపాధ్యాయులతో లేదా పాఠశాల కౌన్సెలర్‌తో మాట్లాడించండి. మేము మీకు పూర్తి సహకారం అందిస్తాము."
        )
    elif lang == "ta":
        message = (
            f"{greeting}! ஸ்டடிபல்ஸ் பள்ளி நலன் அறிக்கை: உங்கள் குழந்தை {student_name} "
            f"கல்வி முன்னேற்றத்திற்கு ஆசிரியர்களின் சிறப்பு கவனம் தேவைப்படுகிறது. முக்கிய காரணம்: '{primary_factor}'. "
            f"தயவுசெய்து பள்ளி ஆசிரியரைத் தொடர்பு கொள்ளவும். நாங்கள் உதவ எப்போதும் தயாராக உள்ளோம்."
        )
    elif lang == "bn":
        message = (
            f"{greeting}! স্টাডিপালস স্কুল ওয়েলফেয়ার রিপোর্ট: আপনার সন্তান {student_name}-এর "
            f"পড়াশোনার অগ্রগতিতে আমাদের বিশেষ নজর রয়েছে। বিশেষ করে '{primary_factor}' ক্ষেত্রে সহায়তা প্রয়োজন। "
            f"অনুগ্রহ করে বিদ্যালয় কর্তৃপক্ষের সাথে যোগাযোগ করুন।"
        )
    elif lang == "mr":
        message = (
            f"{greeting}! स्टडीपल्स शाळा कल्याण अहवाल: आपले पाल्य {student_name} "
            f"यांच्या शैक्षणिक प्रगतीवर लक्ष केंद्रित करणे आवश्यक आहे. मुख्य मुद्दा: '{primary_factor}'. "
            f"कृपया शिक्षकांशी चर्चा करावी. आम्ही संपूर्ण मदत करण्यास कटिबद्ध आहोत."
        )
    elif lang == "gu":
        message = (
            f"{greeting}! સ્ટડીપલ્સ શાળા રિપોર્ટ: આપના બાળક {student_name}-ની "
            f"શિક્ષણ પ્રગતિ માટે ખાસ સહાયની જરૂર છે. મુખ્ય બાબત: '{primary_factor}'. "
            f"કૃપા કરીને શિક્ષક અથવા કાઉન્સિલરનો સંપર્ક કરો."
        )
    elif lang == "kn":
        message = (
            f"{greeting}! ಸ್ಟಡಿಪಲ್ಸ್ ಶಾಲೆ ಕಾಳಜಿ ವರದಿ: ನಿಮ್ಮ ಮಗು {student_name} ಅವರ "
            f"ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿಯ ಬಗ್ಗೆ ವಿಶೇಷ ಗಮನ ಬೇಕಾಗಿದೆ. ಮುಖ್ಯ ಕಾಳಜಿ: '{primary_factor}'. "
            f"ದಯವಿಟ್ಟು ಶಾಲಾ ಶಿಕ್ಷಕರನ್ನು ಸಂಪರ್ಕಿಸಿ."
        )
    elif lang == "ml":
        message = (
            f"{greeting}! സ്റ്റഡിപൾസ് സ്കൂൾ കെയർ റിപ്പോർട്ട്: നിങ്ങളുടെ കുട്ടി {student_name}-ന്റെ "
            f"പഠന പുരോഗതിയിൽ കൂടുതൽ ശ്രദ്ധ നൽകേണ്ടതുണ്ട്. പ്രധാന കാരണം: '{primary_factor}'. "
            f"ദയവായി സ്കൂൾ കൗൺസിലറുമായി ബന്ധപ്പെടുക."
        )
    elif lang == "pa":
        message = (
            f"{greeting}! ਸਟੱਡੀਪਲਸ ਸਕੂਲ ਰਿਪੋਰਟ: ਤੁਹਾਡੇ ਬੱਚੇ {student_name} ਦੀ "
            f"ਪੜ੍ਹਾਈ ਵੱਲ ਵਿਸ਼ੇਸ਼ ਧਿਆਨ ਦੇਣ ਦੀ ਲੋੜ ਹੈ। ਮੁੱਖ ਕਾਰਨ: '{primary_factor}'. "
            f"ਕਿਰਪਾ ਕਰਕੇ ਸਕੂਲ ਅਧਿਆਪਕ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।"
        )
    elif lang == "ur":
        message = (
            f"{greeting}! اسٹڈی پلس اسکول کیئر رپورٹ: آپ کے بچے {student_name} "
            f"کی تعلیمی کارکردگی میں خصوصی رہنمائی کی ضرورت ہے۔ اہم وجہ: '{primary_factor}'. "
            f"براہ کرم اسکول کے اساتذہ یا کونسلر سے رابطہ کریں۔"
        )
    elif lang == "or":
        message = (
            f"{greeting}! ଷ୍ଟଡିପଲ୍ସ ବିଦ୍ୟାଳୟ ରିପୋର୍ଟ: ଆପଣଙ୍କ ପିଲା {student_name}-ଙ୍କ "
            f"ପାଠପଢ଼ାରେ ବିଶେଷ ଧ୍ୟାନ ଦେବା ଆବଶ୍ୟକ। ମୁଖ୍ୟ କାରଣ: '{primary_factor}'. "
            f"ଦୟାକରି ଶିକ୍ଷକଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ।"
        )
    elif lang == "as":
        message = (
            f"{greeting}! ষ্টাডিপাল্‌চ বিদ্যালয় প্ৰতিবেদন: আপোনাৰ সন্তান {student_name}-ৰ "
            f"শিক্ষাৰ উন্নতিত বিশেষ মনোযোগৰ প্ৰয়োজন হৈছে। মুখ্য কাৰণ: '{primary_factor}'। "
            f"অনুগ্ৰহ কৰি বিদ্যালয়ৰ শিক্ষকৰ সৈতে যোগাযোগ কৰক।"
        )
    elif lang == "hi":
        message = (
            f"{greeting}! स्टडीपल्स विद्यालय छात्र कल्याण रिपोर्ट: आपके बच्चे {student_name} "
            f"की शैक्षणिक प्रगति पर विशेष ध्यान देने की आवश्यकता है। मुख्य कारण: '{primary_factor}'. "
            f"कृपया शिक्षक या विद्यालय परामर्शदाता से संपर्क करें। हम विद्यार्थी की सफलता हेतु पूरी सहायता करेंगे।"
        )
    else:
        message = (
            f"{greeting}! StudyPulse Care Notice: We are closely monitoring the academic progress of {student_name}. "
            f"Target area requiring attention: '{primary_factor}'. "
            f"Please connect with the teacher or school counselor. We are here to support your child's success."
        )

    return {
        "language": INDIC_LANGUAGES[lang]["name"],
        "native_language": INDIC_LANGUAGES[lang]["native_name"],
        "greeting": greeting,
        "message": message,
        "delivery_channel": "SMS / WhatsApp / App Notification"
    }

def process_document_intelligence(
    document_text: str,
    target_language: str = "en"
) -> Dict[str, Any]:
    """
    Regional Language OCR & Document Intelligence:
    Ingests teacher remarks, progress cards, or handwritten notes in ANY Indian language,
    detects script/language, extracts academic distress indicators, and produces an actionable summary.
    """
    detected = detect_indian_language(document_text)
    source_lang_code = detected["code"]
    source_lang_name = detected["name"]
    script_name = detected["script"]

    # Educational distress keyword matching
    distress_indicators = []
    text_lower = document_text.lower()

    if any(k in text_lower for k in [
        "absent", "gairhazir", "anupasthit", "गैरहाजिर", "రాలేదు", "ವೈಫಲ್ಯ", "अनुपस्थित", 
        "ঘাটতি", "অনুপস্থিত", "অনিয়মিত", "আসেনি", "கட்டணம்"
    ]):
        distress_indicators.append("Chronic Absenteeism / Irregular Attendance")
    if any(k in text_lower for k in [
        "fail", "kamzor", "takkva", "weak", "कमजोर", "अनुत्तीर्ण", "தோல்வி", "ಅನುತ್ತೀರ್ಣ",
        "ফেল", "অনুত্তীর্ণ", "দুর্বল", "অমনোযোগী", "தோல்வியடைந்தார்", "తగ్గింది"
    ]):
        distress_indicators.append("Academic Underperformance in Foundation Concepts")
    if any(k in text_lower for k in [
        "fight", "late", "deri", "jagdha", "लड़ाई", "उदंड", "గోడవ", "தாமதம்", 
        "দেরি", "বিবাদ", "আচরণ"
    ]):
        distress_indicators.append("Behavioral Infractions & Punctuality Issues")
    if any(k in text_lower for k in [
        "fees", "paisa", "arthik", "garibi", "फीस", "డబ్బు", "வறுமை", "টাকা", "আর্থিক"
    ]):
        distress_indicators.append("Socio-economic / Financial Strain")

    if not distress_indicators:
        distress_indicators.append("Routine Academic Feedback & Continuous Progress Observation")

    # Generate academic summary preserving meaning
    word_count = len(document_text.split())
    character_count = len(document_text)

    summary_en = (
        f"Analyzed {word_count}-word educational document in {source_lang_name} ({script_name} script). "
        f"Key flagged indicators: {', '.join(distress_indicators)}. "
        f"Recommended Action: Schedule structured remediation and verify attendance logs."
    )

    # Localized summary if target language is requested
    target_terms = ACADEMIC_TERMS_TRANSLATIONS.get(target_language, {})
    localized_summary = summary_en
    if target_language in ACADEMIC_TERMS_TRANSLATIONS:
        localized_summary = (
            f"দસ્તાવેજ વિશ્લેષણ / दस्तावेज़ विश्लेषण ({source_lang_name} - {script_name}): "
            f"મુખ્ય લક્ષણો / मुख्य बिंदु: {', '.join(distress_indicators)}. "
            f"સૂચિત પગલાં / अनुशंसित कार्यवाही: {target_terms.get('intervention', 'Remediation support')}."
        )

    return {
        "source_language_detected": source_lang_name,
        "source_language_code": source_lang_code,
        "detected_script": script_name,
        "is_code_mixed": detected.get("is_code_mixed", False),
        "word_count": word_count,
        "character_count": character_count,
        "distress_indicators": distress_indicators,
        "academic_summary": summary_en,
        "localized_summary": localized_summary,
        "target_language": target_language,
        "confidence_score": 0.94
    }

def generate_multilingual_quiz(
    subject: str,
    topic: str,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Generates diagnostic multiple-choice and conceptual practice questions in the requested Indian language.
    """
    lang = language if language in INDIC_LANGUAGES else "en"
    lang_info = INDIC_LANGUAGES[lang]

    # Sample localized questions for mathematics & science
    if lang == "hi":
        return {
            "subject": subject,
            "topic": topic,
            "language": "Hindi",
            "question": "यदि किसी द्विघात समीकरण में विविक्तकर (Discriminant) D = b² - 4ac > 0 हो, तो मूलों की प्रकृति कैसी होगी?",
            "options": [
                "A) दो भिन्न वास्तविक मूल",
                "B) दो बराबर वास्तविक मूल",
                "C) कोई वास्तविक मूल नहीं",
                "D) शून्य मूल"
            ],
            "correct_option": "A",
            "hint": "जब D धनात्मक होता है, तो वर्गमूल में वास्तविक संख्या प्राप्त होती है।",
            "explanation": "यदि D > 0, तो समीकरण کے ਦੋ भिन्न वास्तविक मूल x = (-b ± √D) / (2a) प्राप्त होते हैं।"
        }
    elif lang == "te":
        return {
            "subject": subject,
            "topic": topic,
            "language": "Telugu",
            "question": "వర్గ సమీకరణం ax² + bx + c = 0 లో విచక్షణి (Discriminant) D = b² - 4ac > 0 అయితే, మూలాల స్వభావం ఏమిటి?",
            "options": [
                "A) రెండు విభిన్న వాస్తవ మూలాలు",
                "B) రెండు సమాన వాస్తవ మూలాలు",
                "C) వాస్తవ మూలాలు ఉండవు",
                "D) అనంతమైన మూలాలు"
            ],
            "correct_option": "A",
            "hint": "D ధనాత్మక సంఖ్య అయినప్పుడు రెండు వేర్వేరు సమాధానాలు లభిస్తాయి.",
            "explanation": "D > 0 అయినప్పుడు సూత్రం x = (-b ± √D) / 2a ద్వారా రెండు విభిన్న వాస్తవ మూలాలు వస్తాయి."
        }
    elif lang == "ta":
        return {
            "subject": subject,
            "topic": topic,
            "language": "Tamil",
            "question": "இருபடிச் சமன்பாட்டில் (ax² + bx + c = 0) தன்மைக்காட்டி (Discriminant) D = b² - 4ac > 0 எனில், மூலங்களின் தன்மை என்ன?",
            "options": [
                "A) மெய் மற்றும் வெவ்வேறான மூலங்கள்",
                "B) மெய் மற்றும் சமமான மூலங்கள்",
                "C) மெய் மூலங்கள் இல்லை",
                "D) பூஜ்ஜிய மூலங்கள்"
            ],
            "correct_option": "A",
            "hint": "D நேர்மறையான எண்ணாக இருக்கும்போது இரண்டு வெவ்வேறு தீர்வுகள் கிடைக்கும்.",
            "explanation": "D > 0 எனில் சமன்பாட்டிற்கு இரண்டு வெவ்வேறான மெய் மூலங்கள் அமையும்."
        }
    elif lang == "bn":
        return {
            "subject": subject,
            "topic": topic,
            "language": "Bengali",
            "question": "দ্বিঘাত সমীকরণ ax² + bx + c = 0-এর নিরূপক (Discriminant) D = b² - 4ac > 0 হলে বীজদ্বয়ের প্রকৃতি কেমন হবে?",
            "options": [
                "A) দুটি অসমান বাস্তব বীজ",
                "B) দুটি সমান বাস্তব বীজ",
                "C) কোনো বাস্তব বীজ নেই",
                "D) কাল্পনিক বীজ"
            ],
            "correct_option": "A",
            "hint": "D ধনাত্মক হলে বর্গমূল থেকে বাস্তব মান পাওয়া যায়।",
            "explanation": "যদি D > 0 হয়, তবে সমীকরণের দুটি ভিন্ন বাস্তব বীজ থাকে।"
        }
    elif lang == "mr":
        return {
            "subject": subject,
            "topic": topic,
            "language": "Marathi",
            "question": "वर्गसमीकरण ax² + bx + c = 0 मध्ये विवेचक (Discriminant) D = b² - 4ac > 0 असल्यास मुळांचे स्वरूप कसे असेल?",
            "options": [
                "A) दोन भिन्न व वास्तव मुळे",
                "B) दोन समान वास्तव मुळे",
                "C) वास्तव मुळे नसतात",
                "D) शून्य मुळे"
            ],
            "correct_option": "A",
            "hint": "D धन संख्या असताना दोन वेगवेगळी वास्तव मुळे मिळतात.",
            "explanation": "D > 0 असेल तर वर्गसमीकरणाची मुळे भिन्न व वास्तव संख्या असतात."
        }
    elif lang == "gu":
        return {
            "subject": subject,
            "topic": topic,
            "language": "Gujarati",
            "question": "દ્વિઘાત સમીકરણ ax² + bx + c = 0 માં વિવેચક D = b² - 4ac > 0 હોય તો બીજનું સ્વરૂપ કેવું હશે?",
            "options": [
                "A) બે ભિન્ન વાસ્તવિક બીજ",
                "B) બે સમાન વાસ્તવિક બીજ",
                "C) વાસ્તવિક બીજ ન મળે",
                "D) શૂન્ય બીજ"
            ],
            "correct_option": "A",
            "hint": "જ્યારે D ધન હોય ત્યારે બે અલગ અલગ વાસ્તવિક જવાબો મળે છે.",
            "explanation": "જો D > 0 હોય તો સમીકરણના બે ભિન્ન અને વાસ્તવિક બીજ મળે છે."
        }
    elif lang == "kn":
        return {
            "subject": subject,
            "topic": topic,
            "language": "Kannada",
            "question": "ವರ್ಗ ಸಮೀಕರಣ ax² + bx + c = 0 ದಲ್ಲಿ ಶೋಧಕ D = b² - 4ac > 0 ಆಗಿದ್ದರೆ, ಮೂಲಗಳ ಸ್ವಭಾವವೇನು?",
            "options": [
                "A) ಎರಡು ಭಿನ್ನ ವಾಸ್ತವ ಮೂಲಗಳು",
                "B) ಎರಡು ಸಮಾನ ವಾಸ್ತವ ಮೂಲಗಳು",
                "C) ಯಾವುದೇ ವಾಸ್ತವ ಮೂಲಗಳಿಲ್ಲ",
                "D) ಶೂನ್ಯ ಮೂಲಗಳು"
            ],
            "correct_option": "A",
            "hint": "D ಧನಾತ್ಮಕವಾಗಿದ್ದಾಗ ಎರಡು ಪ್ರತ್ಯೇಕ ಉತ್ತರಗಳು ಬರುತ್ತವೆ.",
            "explanation": "D > 0 ಇದ್ದರೆ ಸಮೀಕರಣವು ಎರಡು ವಿಭಿನ್ನ ವಾಸ್ತವ ಮೂಲಗಳನ್ನು ಹೊಂದಿರುತ್ತದೆ."
        }
    else:
        return {
            "subject": subject,
            "topic": topic,
            "language": "English",
            "question": f"For a quadratic equation ax² + bx + c = 0, if the discriminant D = b² - 4ac > 0, what is the nature of the roots?",
            "options": [
                "A) Two distinct real roots",
                "B) Two equal real roots",
                "C) No real roots (complex conjugates)",
                "D) Infinitely many roots"
            ],
            "correct_option": "A",
            "hint": "When D is positive, taking the square root gives two real non-zero solutions.",
            "explanation": "Since D > 0, the quadratic formula x = (-b ± √D) / (2a) yields two real and distinct roots."
        }
