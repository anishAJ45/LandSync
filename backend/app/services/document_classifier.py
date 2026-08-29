import re
from typing import Tuple, Dict, Any

class DocumentClassifier:
    """
    Keyword-based and rule-based heuristic classifier for land governance documents.
    """
    
    KEYWORDS_MAP = {
        "SALE_DEED": [
            r"sale\s*deed", r"vendor", r"vendee", r"purchaser", r"consideration\s*amount",
            r"conveyance", r"schedule\s*of\s*property", r"deed\s*of\s*sale", r"sub-registrar"
        ],
        "PATTA": [
            r"patta", r"record\s*of\s*rights", r"chitta", r"adangal", r"khatoni",
            r"revenue\s*inspector", r"tahsildar", r"patta\s*passbook", r"khasra"
        ],
        "ENCUMBRANCE_CERTIFICATE": [
            r"encumbrance\s*certificate", r"form\s*no\.\s*15", r"form\s*no\.\s*16",
            r"nil\s*encumbrance", r"registration\s*district", r"search\s*period"
        ],
        "PROPERTY_TAX_RECORD": [
            r"property\s*tax", r"tax\s*receipt", r"municipal\s*corporation",
            r"assessment\s*number", r"panchayat\s*tax", r"annual\s*value", r"demand\s*notice"
        ],
        "LAND_SURVEY_DOCUMENT": [
            r"survey\s*sketch", r"field\s*measurement\s*book", r"fmb",
            r"traverse\s*survey", r"cadastral\s*survey", r"triangulation", r"boundary\s*demarcation"
        ],
        "IDENTITY_DOCUMENT": [
            r"aadhaar", r"unique\s*identification", r"elector\s*photo\s*identity",
            r"pan\s*card", r"income\s*tax\s*department", r"passport", r"voter\s*id"
        ]
    }

    @classmethod
    def classify_document(cls, text: str, user_selected_type: str = "OTHER_LAND_DOCUMENT", filename: str = "") -> Tuple[str, float, str, bool]:
        """
        Classifies document based on text content and filename hints.
        Returns: (detected_type, confidence, reason, has_type_mismatch_warning)
        """
        lower_text = (text or "").lower()
        lower_fname = (filename or "").lower()
        
        scores: Dict[str, int] = {}
        reasons: Dict[str, list] = {}
        
        for doc_type, patterns in cls.KEYWORDS_MAP.items():
            score = 0
            matched = []
            for pat in patterns:
                matches = re.findall(pat, lower_text)
                if matches:
                    score += len(matches) * 10
                    matched.append(pat.replace(r"\s*", " ").replace("\\", ""))
                # Also check filename hints
                if any(k in lower_fname for k in pat.split(r"\s*") if len(k) > 3):
                    score += 15
                    matched.append(f"filename hint '{lower_fname}'")
                    
            if score > 0:
                scores[doc_type] = score
                reasons[doc_type] = matched

        if not scores:
            detected_type = user_selected_type or "OTHER_LAND_DOCUMENT"
            return detected_type, 70.0, "Classified by user selection / generic land document metadata", False

        # Find best matching type
        best_type = max(scores, key=scores.get)
        raw_score = scores[best_type]
        confidence = min(98.0, 65.0 + min(33.0, raw_score * 0.8))
        reason = f"Detected key cadastral markers: {', '.join(reasons[best_type][:3])}"
        
        is_mismatch = (user_selected_type != "OTHER_LAND_DOCUMENT" and user_selected_type != best_type)
        return best_type, round(confidence, 1), reason, is_mismatch
