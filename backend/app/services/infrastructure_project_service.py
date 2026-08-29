"""
LandSync SIH26014 - Infrastructure Project Proximity & Impact Service
"""
from typing import Dict, Any, List

def evaluate_project_impact(parcel_id: str, distance_meters: float, project: Dict[str, Any]) -> Dict[str, Any]:
    influence_radius = project.get("influence_radius_meters", 500.0)
    
    if distance_meters <= 50:
        impact = "REQUIRES_AUTHORITY_REVIEW"
        note = "Direct alignment or right-of-way acquisition corridor buffer."
    elif distance_meters <= influence_radius:
        impact = "POSSIBLE_IMPACT"
        note = f"Inside {influence_radius}m development impact zone; high economic catalyst."
    elif distance_meters <= 2000:
        impact = "NEARBY_PROJECT"
        note = f"Located {distance_meters}m from {project.get('project_name')}."
    else:
        impact = "NO_KNOWN_IMPACT"
        note = "Outside active project statutory influence perimeter."

    return {
        "project_id": project.get("project_id"),
        "project_name": project.get("project_name"),
        "project_type": project.get("project_type"),
        "distance_meters": distance_meters,
        "impact_level": impact,
        "is_inside_influence_zone": distance_meters <= influence_radius,
        "potential_benefit_or_disruption": note
    }
