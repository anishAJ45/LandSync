import re
from typing import Tuple, Optional

try:
    from rapidfuzz import fuzz
    RAPIDFUZZ_AVAILABLE = True
except ImportError:
    RAPIDFUZZ_AVAILABLE = False
    import difflib

class NormalizationService:
    @staticmethod
    def normalize_name(name: Optional[str]) -> str:
        """
        Normalizes names: converts to uppercase, removes honorifics (Mr, Mrs, Thiru, Dr, Shri, Smt),
        strips special characters, and removes redundant whitespace.
        """
        if not name:
            return ""
        n = name.upper().strip()
        # Remove honorifics
        n = re.sub(r'^(MR\.|MRS\.|MS\.|DR\.|SHRI\.|SMT\.|THIRU\.|THIRUMATHI\.|SELVI\.)\s*', '', n, flags=re.IGNORECASE)
        n = re.sub(r'^(MR|MRS|MS|DR|SHRI|SMT|THIRU|THIRUMATHI|SELVI)\s+', '', n, flags=re.IGNORECASE)
        # Remove special characters except letters and spaces
        n = re.sub(r'[^A-Z0-9\s]', ' ', n)
        # Collapse multiple spaces
        n = re.sub(r'\s+', ' ', n).strip()
        return n

    @staticmethod
    def normalize_survey_number(survey_no: Optional[str]) -> str:
        """
        Normalizes survey numbers: converts "124 - 2", "124/02", "124 / 2" to "124/2".
        """
        if not survey_no:
            return ""
        s = survey_no.strip().upper()
        # Replace dashes or spaces around slashes with single slash
        s = re.sub(r'\s*[-\\/]\s*', '/', s)
        parts = s.split('/')
        if len(parts) >= 2:
            # Strip leading zeros from numeric components: 124/02 -> 124/2
            clean_parts = []
            for p in parts:
                p_clean = re.sub(r'[^A-Z0-9]', '', p)
                if p_clean.isdigit():
                    clean_parts.append(str(int(p_clean)))
                else:
                    clean_parts.append(p_clean)
            return "/".join(clean_parts)
        return re.sub(r'[^A-Z0-9/]', '', s)

    @staticmethod
    def normalize_area(area_str: Optional[str]) -> Tuple[Optional[float], str]:
        """
        Normalizes land area representations (e.g. "2.5 Acres", "2.50 AC", "10890 Sq.Ft")
        Returns (numeric_value, standardized_unit)
        """
        if not area_str:
            return None, "Acres"
        
        a = area_str.lower().strip()
        # Find numeric value
        match = re.search(r'([0-9]+(?:\.[0-9]+)?)', a)
        if not match:
            return None, "Acres"
        
        val = float(match.group(1))
        
        unit = "Acres"
        if "sq" in a or "square" in a or "ft" in a or "feet" in a:
            unit = "Sq.Ft"
        elif "hectare" in a or "ha" in a:
            unit = "Hectares"
        elif "cent" in a or "cts" in a:
            unit = "Cents"
        elif "guntha" in a or "guntas" in a:
            unit = "Guntas"
            
        return val, unit

    @classmethod
    def calculate_similarity(cls, str1: str, str2: str) -> float:
        """
        Calculates string similarity score between 0.0 and 100.0 using RapidFuzz or difflib.
        """
        if not str1 or not str2:
            return 0.0
            
        s1 = str1.strip().upper()
        s2 = str2.strip().upper()
        
        if s1 == s2:
            return 100.0
            
        if RAPIDFUZZ_AVAILABLE:
            ratio = fuzz.token_sort_ratio(s1, s2)
            return float(ratio)
        else:
            matcher = difflib.SequenceMatcher(None, s1, s2)
            return round(matcher.ratio() * 100.0, 1)

    @classmethod
    def is_name_initial_match(cls, name1: str, name2: str) -> bool:
        """
        Detects if 'R. Kumar' matches 'Ramesh Kumar' or 'V. Rathore' matches 'Vikram Rathore'
        """
        n1 = cls.normalize_name(name1)
        n2 = cls.normalize_name(name2)
        
        if not n1 or not n2:
            return False
            
        parts1 = n1.split()
        parts2 = n2.split()
        
        if len(parts1) == 2 and len(parts2) == 2:
            # Check if last names match and first initial matches
            if parts1[1] == parts2[1]:
                if len(parts1[0]) == 1 and parts2[0].startswith(parts1[0]):
                    return True
                if len(parts2[0]) == 1 and parts1[0].startswith(parts2[0]):
                    return True
            # Check reverse initial order (e.g. Kumar R vs Ramesh Kumar)
            if parts1[0] == parts2[0]:
                if len(parts1[1]) == 1 and parts2[1].startswith(parts1[1]):
                    return True
                if len(parts2[1]) == 1 and parts1[1].startswith(parts2[1]):
                    return True
                    
        return False
