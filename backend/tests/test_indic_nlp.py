import sys
sys.path.insert(0, 'backend')

from app.ml.indic_nlp import (
    INDIC_LANGUAGES,
    detect_indian_language,
    detect_script,
    translate_early_warning_insight,
    generate_parent_regional_alert,
    process_document_intelligence,
    generate_multilingual_quiz
)

def test_language_registry():
    assert len(INDIC_LANGUAGES) >= 29
    scheduled = [l for l in INDIC_LANGUAGES.values() if l['category'] == 'Scheduled']
    assert len(scheduled) == 22
    regional = [l for l in INDIC_LANGUAGES.values() if l['category'] == 'Regional & Tribal']
    assert len(regional) == 7

def test_language_detection():
    det_hi = detect_indian_language('विद्यार्थी नियमित रूप से स्कूल नहीं आ रहा है')
    assert det_hi['code'] == 'hi'
    assert det_hi['script'] == 'Devanagari'

    det_te = detect_indian_language('విద్యార్థి తరగతులకు గైర్హాజరవుతున్నాడు')
    assert det_te['code'] == 'te'
    assert det_te['script'] == 'Telugu'

    det_ta = detect_indian_language('மாணவி கணிதத்தில் குறைந்த மதிப்பெண் பெற்றுள்ளார்')
    assert det_ta['code'] == 'ta'
    assert det_ta['script'] == 'Tamil'

    det_bn = detect_indian_language('ছাত্রটি গত সপ্তাহে ৩ দিন অনুপস্থিত ছিল')
    assert det_bn['code'] == 'bn'
    assert det_bn['script'] == 'Bengali'

    # Code-mixed tests
    det_hinglish = detect_indian_language('Aryan regular school nahi aa raha aur math marks drop ho rahe hain')
    assert det_hinglish['code'] == 'hi'
    assert det_hinglish['is_code_mixed'] is True

    det_telugish = detect_indian_language('Rohan attendance taggipoindi, chaduvulo help kaavali')
    assert det_telugish['code'] == 'te'
    assert det_telugish['is_code_mixed'] is True

def test_document_intelligence_ocr():
    res = process_document_intelligence('ছাত্রটি ক্লাসে অনুপস্থিত এবং অঙ্কে ফেল করেছে। অবিলম্বে সাহায্য প্রয়োজন।', target_language='bn')
    assert res['source_language_code'] == 'bn'
    assert len(res['distress_indicators']) >= 2
    assert 'Chronic Absenteeism' in res['distress_indicators'][0] or 'Underperformance' in res['distress_indicators'][1]

def test_multilingual_quiz():
    quiz_hi = generate_multilingual_quiz('Mathematics', 'Quadratic Equations', language='hi')
    assert 'द्विघात' in quiz_hi['question']
    assert quiz_hi['correct_option'] == 'A'

    quiz_te = generate_multilingual_quiz('Mathematics', 'Quadratic Equations', language='te')
    assert 'వర్గ సమీకరణం' in quiz_te['question']

def test_regional_parent_alert():
    alert_te = generate_parent_regional_alert('Aryan Rao', 'High', 'Attendance dropped 22%', target_lang='te')
    assert 'నమస్కారం' in alert_te['greeting']
    assert 'Aryan Rao' in alert_te['message']
    assert 'స్టడీపల్స్' in alert_te['message']

def test_translate_early_warning_insight():
    factors = [{'rank': 1, 'explanation': 'Attendance dropped below class average', 'weight': '45%'}]
    trans = translate_early_warning_insight('Aryan Rao', 'High', 0.88, factors, target_lang='te')
    assert 'అధిక డ్రాపౌట్ ప్రమాదం' in trans['risk_tier']
    assert 'హాజరు తగ్గింది' in trans['translated_factors'][0]['explanation']

if __name__ == '__main__':
    test_language_registry()
    test_language_detection()
    test_document_intelligence_ocr()
    test_multilingual_quiz()
    test_regional_parent_alert()
    test_translate_early_warning_insight()
    print("ALL INDIC MULTILINGUAL TESTS PASSED SUCCESSFULLY!")
