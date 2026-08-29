from typing import List, Dict, Any, Tuple, Optional
from app.services.normalization_service import NormalizationService
from app.models.document import MatchType, MismatchSeverity, VerificationStatus

class VerificationService:
    """
    Compares normalized extracted document fields with official system parcel and application records.
    Detects critical, major, and minor mismatches, calculates verification scores, and logs audit findings.
    """

    SEVERITY_DEDUCTIONS = {
        MismatchSeverity.INFO.value: 0,
        MismatchSeverity.LOW.value: 5,
        MismatchSeverity.MEDIUM.value: 10,
        MismatchSeverity.HIGH.value: 20,
        MismatchSeverity.CRITICAL.value: 30
    }

    @classmethod
    def verify_document_against_records(
        cls,
        extracted_fields: List[Dict[str, Any]],
        parcel_record: Optional[Dict[str, Any]],
        application_record: Optional[Dict[str, Any]]
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Executes cross-record validation.
        Returns: (verification_result_dict, mismatches_list)
        """
        mismatches: List[Dict[str, Any]] = []
        score = 100.0
        
        # Map extracted fields by field_name
        field_map = {f["field_name"]: f for f in extracted_fields if f.get("status") == "FOUND"}
        
        # 1. OWNER NAME COMPARISON
        owner_field = field_map.get("OWNER_NAME")
        system_owner = (
            parcel_record.get("owner_name") if parcel_record 
            else (application_record.get("citizen_name") if application_record else None)
        )
        
        if owner_field and system_owner:
            doc_owner = owner_field["field_value"]
            norm_doc = owner_field["normalized_value"]
            norm_sys = NormalizationService.normalize_name(system_owner)
            
            sim = NormalizationService.calculate_similarity(norm_doc, norm_sys)
            is_initial = NormalizationService.is_name_initial_match(doc_owner, system_owner)
            
            if sim >= 95.0 or norm_doc == norm_sys:
                pass  # Exact Match
            elif is_initial or sim >= 80.0:
                mismatches.append({
                    "field_name": "OWNER_NAME",
                    "document_value": doc_owner,
                    "system_value": system_owner,
                    "match_type": MatchType.FUZZY_MATCH.value if sim >= 80.0 else MatchType.MINOR_DIFFERENCE.value,
                    "severity": MismatchSeverity.LOW.value,
                    "confidence": sim,
                    "description": f"Minor spelling or initials variation in owner name ('{doc_owner}' vs '{system_owner}'). Similarity: {sim:.0f}%."
                })
                score -= cls.SEVERITY_DEDUCTIONS[MismatchSeverity.LOW.value]
            elif sim >= 60.0:
                mismatches.append({
                    "field_name": "OWNER_NAME",
                    "document_value": doc_owner,
                    "system_value": system_owner,
                    "match_type": MatchType.MISMATCH.value,
                    "severity": MismatchSeverity.HIGH.value,
                    "confidence": sim,
                    "description": f"Significant discrepancy in owner name ('{doc_owner}' vs official record '{system_owner}'). Similarity: {sim:.0f}%."
                })
                score -= cls.SEVERITY_DEDUCTIONS[MismatchSeverity.HIGH.value]
            else:
                mismatches.append({
                    "field_name": "OWNER_NAME",
                    "document_value": doc_owner,
                    "system_value": system_owner,
                    "match_type": MatchType.MISMATCH.value,
                    "severity": MismatchSeverity.CRITICAL.value,
                    "confidence": 95.0,
                    "description": f"Critical owner name mismatch: Document states '{doc_owner}', but official parcel record belongs to '{system_owner}'."
                })
                score -= cls.SEVERITY_DEDUCTIONS[MismatchSeverity.CRITICAL.value]

        # 2. SURVEY NUMBER COMPARISON
        survey_field = field_map.get("SURVEY_NUMBER")
        system_survey = (
            parcel_record.get("survey_number") if parcel_record
            else (application_record.get("survey_number") if application_record else None)
        )
        
        if survey_field and system_survey:
            doc_survey = survey_field["field_value"]
            norm_doc_survey = NormalizationService.normalize_survey_number(doc_survey)
            norm_sys_survey = NormalizationService.normalize_survey_number(system_survey)
            
            if norm_doc_survey == norm_sys_survey:
                pass # Exact Match
            else:
                mismatches.append({
                    "field_name": "SURVEY_NUMBER",
                    "document_value": doc_survey,
                    "system_value": system_survey,
                    "match_type": MatchType.MISMATCH.value,
                    "severity": MismatchSeverity.CRITICAL.value,
                    "confidence": 98.0,
                    "description": f"Survey number mismatch: Document references Survey '{doc_survey}', but linked cadastre is '{system_survey}'."
                })
                score -= cls.SEVERITY_DEDUCTIONS[MismatchSeverity.CRITICAL.value]

        # 3. LAND AREA COMPARISON
        area_field = field_map.get("LAND_AREA")
        system_area = parcel_record.get("area_sqft") if parcel_record else None
        system_area_acres = parcel_record.get("area_acres") if parcel_record else None
        
        if area_field and (system_area or system_area_acres):
            doc_area_str = area_field["field_value"]
            doc_num, doc_unit = NormalizationService.normalize_area(doc_area_str)
            
            if doc_num is not None:
                # Convert doc area to acres approx for comparison
                doc_acres = doc_num
                if doc_unit == "Sq.Ft":
                    doc_acres = doc_num / 43560.0
                elif doc_unit == "Hectares":
                    doc_acres = doc_num * 2.47105
                elif doc_unit == "Cents":
                    doc_acres = doc_num * 0.01

                target_acres = system_area_acres or ((system_area / 43560.0) if system_area else doc_acres)
                diff_pct = abs(doc_acres - target_acres) / target_acres if target_acres > 0 else 0
                
                if diff_pct <= 0.03: # <= 3% variance acceptable in survey rounding
                    pass
                elif diff_pct <= 0.10: # 3% to 10%
                    mismatches.append({
                        "field_name": "LAND_AREA",
                        "document_value": doc_area_str,
                        "system_value": f"{target_acres:.2f} Acres",
                        "match_type": MatchType.MINOR_DIFFERENCE.value,
                        "severity": MismatchSeverity.MEDIUM.value,
                        "confidence": 90.0,
                        "description": f"Land extent variance of {diff_pct*100:.1f}% detected between deed extent ({doc_area_str}) and cadastral boundary ({target_acres:.2f} Acres)."
                    })
                    score -= cls.SEVERITY_DEDUCTIONS[MismatchSeverity.MEDIUM.value]
                else: # > 10% variance
                    mismatches.append({
                        "field_name": "LAND_AREA",
                        "document_value": doc_area_str,
                        "system_value": f"{target_acres:.2f} Acres",
                        "match_type": MatchType.MISMATCH.value,
                        "severity": MismatchSeverity.HIGH.value,
                        "confidence": 94.0,
                        "description": f"Major land area divergence: Document claims {doc_area_str}, whereas GIS polygon measures {target_acres:.2f} Acres ({diff_pct*100:.1f}% discrepancy)."
                    })
                    score -= cls.SEVERITY_DEDUCTIONS[MismatchSeverity.HIGH.value]

        # 4. DISTRICT & VILLAGE JURISDICTION
        district_field = field_map.get("DISTRICT")
        system_dist = parcel_record.get("district") if parcel_record else None
        if district_field and system_dist:
            doc_dist = district_field["normalized_value"]
            sys_dist = system_dist.strip().upper()
            if doc_dist and sys_dist and doc_dist not in sys_dist and sys_dist not in doc_dist:
                mismatches.append({
                    "field_name": "DISTRICT",
                    "document_value": district_field["field_value"],
                    "system_value": system_dist,
                    "match_type": MatchType.MISMATCH.value,
                    "severity": MismatchSeverity.HIGH.value,
                    "confidence": 88.0,
                    "description": f"Revenue District mismatch: Document lists '{district_field['field_value']}', system belongs to '{system_dist}'."
                })
                score -= cls.SEVERITY_DEDUCTIONS[MismatchSeverity.HIGH.value]

        # Bounds checking on score
        final_score = max(0.0, min(100.0, score))
        
        # Categorize score
        critical_count = sum(1 for m in mismatches if m["severity"] == MismatchSeverity.CRITICAL.value)
        high_count = sum(1 for m in mismatches if m["severity"] == MismatchSeverity.HIGH.value)
        
        if final_score >= 90.0 and critical_count == 0:
            confidence_level = "HIGH CONFIDENCE"
            v_status = VerificationStatus.VERIFIED.value
            review_req = False
            summary = "Document attributes align closely with the official cadastral registry. AI confidence is high."
        elif final_score >= 75.0 and critical_count == 0:
            confidence_level = "REVIEW RECOMMENDED"
            v_status = VerificationStatus.MISMATCH_FOUND.value
            review_req = True
            summary = f"Minor variations detected ({len(mismatches)} discrepancy notes). Officer inspection recommended prior to sign-off."
        elif final_score >= 50.0:
            confidence_level = "SIGNIFICANT DIFFERENCES"
            v_status = VerificationStatus.REVIEW_REQUIRED.value
            review_req = True
            summary = f"Significant discrepancies ({len(mismatches)} findings, {critical_count} critical) detected. Detailed field survey comparison mandated."
        else:
            confidence_level = "CRITICAL REVIEW REQUIRED"
            v_status = VerificationStatus.FAILED.value
            review_req = True
            summary = f"Critical record inconsistencies detected ({critical_count} critical mismatches). Automatic flags raised for Sub-Collector docket review."

        result = {
            "overall_score": final_score,
            "verification_status": v_status,
            "confidence_level": confidence_level,
            "mismatch_count": len(mismatches),
            "critical_mismatch_count": critical_count,
            "summary": summary,
            "review_required": review_req
        }
        
        return result, mismatches
