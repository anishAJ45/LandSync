import re
from typing import List, Dict, Any, Optional
from app.services.normalization_service import NormalizationService

class FieldExtractionService:
    """
    Extracts structured cadastral entities and attributes from OCR raw and cleaned texts
    using regex patterns, keyword anchoring, and context heuristics.
    """

    PATTERNS = {
        "OWNER_NAME": [
            r"(?:owner|owner\s*name|pattadar|purchaser|vendee|buyer|holder|name\s*of\s*the\s*owner|in\s*favour\s*of)\s*[:\-\s]+([A-Za-z\s\.]+?)(?=\n|,|\b(?:s/o|d/o|w/o|residing|son|daughter|wife|aged|survey|date)\b)",
            r"(?:thiru|mr\.|shri)\s+([A-Za-z\s\.]+?)(?=\s+(?:s/o|d/o|w/o|aged|residing))",
            r"(?:name|applicant)\s*[:\-]\s*([A-Za-z\s\.]+)"
        ],
        "FATHER_OR_SPOUSE_NAME": [
            r"(?:s/o|d/o|w/o|son\s*of|daughter\s*of|wife\s*of|father\s*name)\s*[:\-\s]+([A-Za-z\s\.]+?)(?=\n|,|\b(?:residing|aged|survey|district)\b)"
        ],
        "SURVEY_NUMBER": [
            r"(?:survey\s*(?:no|num|number)|s\.?\s*no|sy\s*no|khasra\s*no)\s*[:\-\.\s]+([0-9]+(?:\s*[\/\-]\s*[0-9A-Za-z]+)?)",
            r"(?:survey\s*and\s*subdivision\s*no)\s*[:\-\.\s]+([0-9]+(?:\s*[\/\-]\s*[0-9A-Za-z]+)?)"
        ],
        "SUBDIVISION_NUMBER": [
            r"(?:sub\s*division\s*(?:no|number)|sub-div|subdiv)\s*[:\-\.\s]+([0-9A-Za-z]+)",
            r"survey\s*no\s*[0-9]+\s*[\/]\s*([0-9A-Za-z]+)"
        ],
        "PARCEL_NUMBER": [
            r"(?:parcel\s*(?:id|no|number)|plot\s*(?:no|number)|khatian\s*no)\s*[:\-\.\s]+([A-Za-z0-9\-_]+)"
        ],
        "VILLAGE": [
            r"(?:village|mouza|taluk|revenue\s*village)\s*[:\-\s]+([A-Za-z\s]+?)(?=\n|,|\b(?:district|taluk|sub-district|state)\b)",
            r"(?:situated\s*at|situated\s*in)\s+([A-Za-z\s]+?)\s+(?:village|taluk)"
        ],
        "DISTRICT": [
            r"(?:district|dist\.?|revenue\s*district)\s*[:\-\s]+([A-Za-z\s]+?)(?=\n|,|\b(?:state|pincode|pin|taluk)\b)",
            r"in\s+the\s+district\s+of\s+([A-Za-z\s]+)"
        ],
        "STATE": [
            r"(?:state)\s*[:\-\s]+([A-Za-z\s]+?)(?=\n|,|\b(?:pin|pincode|india)\b)",
            r"(?:tamil\s*nadu|karnataka|kerala|maharashtra|telangana|andhra\s*pradesh)"
        ],
        "LAND_AREA": [
            r"(?:extent|area|land\s*area|total\s*area|measurement)\s*[:\-\s]+([0-9]+(?:\.[0-9]+)?\s*(?:acres?|cents?|sq\.?\s*ft|sq\.?\s*meters?|hectares?|guntas?))",
            r"([0-9]+(?:\.[0-9]+)?\s*(?:acres?|cents?|sq\.?\s*ft|hectares?))\s*(?:of\s*land)"
        ],
        "DOCUMENT_NUMBER": [
            r"(?:document\s*(?:no|number)|doc\.?\s*no)\s*[:\-\s]+([A-Za-z0-9\/\-_]+)",
            r"(?:registered\s*as\s*document\s*no)\s*[:\-\s]+([A-Za-z0-9\/\-_]+)"
        ],
        "REGISTRATION_NUMBER": [
            r"(?:registration\s*(?:no|number)|reg\.?\s*no)\s*[:\-\s]+([A-Za-z0-9\/\-_]+)",
            r"(?:book\s*1\s*volume\s*[0-9]+\s*page\s*[0-9]+)"
        ],
        "REGISTRATION_DATE": [
            r"(?:registered\s*on|registration\s*date|date\s*of\s*registration)\s*[:\-\s]+([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})",
            r"(?:dated\s*this|executed\s*on)\s*[:\-\s]+([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})"
        ],
        "PROPERTY_TYPE": [
            r"(?:property\s*type|land\s*classification|nature\s*of\s*land)\s*[:\-\s]+([A-Za-z\s]+?)(?=\n|,|\b(?:extent|survey)\b)",
            r"(?:agricultural|residential|commercial|industrial|punja|nandhavanam|nanjai|punjai)\s*(?:land)?"
        ],
        "BOUNDARY_DETAILS": [
            r"(?:boundaries|schedule\s*of\s*property|north\s*by|bounded\s*on)\s*[:\-\s]+([^.\n]+(?:\.[^.\n]+){1,3})"
        ]
    }

    @classmethod
    def extract_fields(cls, text: str, document_type: str = "OTHER_LAND_DOCUMENT") -> List[Dict[str, Any]]:
        """
        Extracts all potential fields from OCR text and normalizes them.
        """
        extracted = []
        clean_text = text or ""
        
        for field_name, patterns in cls.PATTERNS.items():
            matched_val = None
            source_snippet = None
            conf = 0.0

            for pattern in patterns:
                match = re.search(pattern, clean_text, re.IGNORECASE)
                if match:
                    # Captured value
                    val = match.group(1).strip() if match.groups() else match.group(0).strip()
                    # Filter out trailing junk
                    val = re.sub(r'[\r\n\t]+', ' ', val).strip()
                    if len(val) >= 1 and len(val) <= 120:
                        matched_val = val
                        # Context snippet
                        start = max(0, match.start() - 20)
                        end = min(len(clean_text), match.end() + 20)
                        source_snippet = clean_text[start:end].replace('\n', ' ')
                        conf = 92.0
                        break

            if matched_val:
                # Normalization
                norm_val = matched_val
                if "NAME" in field_name:
                    norm_val = NormalizationService.normalize_name(matched_val)
                elif "SURVEY" in field_name:
                    norm_val = NormalizationService.normalize_survey_number(matched_val)
                elif "AREA" in field_name:
                    num_val, unit = NormalizationService.normalize_area(matched_val)
                    if num_val is not None:
                        norm_val = f"{num_val:.2f} {unit}"
                else:
                    norm_val = matched_val.strip().upper()

                extracted.append({
                    "field_name": field_name,
                    "field_value": matched_val,
                    "normalized_value": norm_val,
                    "confidence": conf,
                    "source_text": source_snippet,
                    "status": "FOUND"
                })
            else:
                extracted.append({
                    "field_name": field_name,
                    "field_value": "N/A",
                    "normalized_value": "N/A",
                    "confidence": 0.0,
                    "source_text": None,
                    "status": "NOT_FOUND"
                })

        return extracted
