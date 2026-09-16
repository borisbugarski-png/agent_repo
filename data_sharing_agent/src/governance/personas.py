"""Stakeholder Personas & Data Sharing Role Definitions for the Data Mesh."""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel


class UserRole(str, Enum):
    STORE_MANAGER = "STORE_MANAGER"
    REGIONAL_MANAGER = "REGIONAL_MANAGER"
    ADMIN = "ADMIN"


class StakeholderPersona(BaseModel):
    persona_id: str
    role: UserRole
    full_name: str
    title: str
    assigned_store_id: Optional[int] = None
    assigned_store_name: Optional[str] = None
    assigned_region_id: Optional[str] = None
    assigned_region_name: Optional[str] = None
    governance_scope_summary: str


# Mapping of all 10 Stores from lustrous-stone-417013.ecommerce.distribution_centers
STORE_METADATA: Dict[int, Dict[str, str]] = {
    1: {"name": "Memphis TN", "region_id": "SOUTH_CENTRAL", "region_name": "South Central Region", "manager": "Marcus Vance"},
    2: {"name": "Chicago IL", "region_id": "MIDWEST", "region_name": "Midwest Region", "manager": "Elena Rostova"},
    3: {"name": "Houston TX", "region_id": "SOUTH_CENTRAL", "region_name": "South Central Region", "manager": "Carlos Mendoza"},
    4: {"name": "Los Angeles CA", "region_id": "WEST", "region_name": "West Region", "manager": "Chloe Lin"},
    5: {"name": "New Orleans LA", "region_id": "SOUTH_CENTRAL", "region_name": "South Central Region", "manager": "Andre Dupont"},
    6: {"name": "Port Authority of New York/New Jersey NY/NJ", "region_id": "NORTHEAST", "region_name": "Northeast Region", "manager": "Rachel Sterling"},
    7: {"name": "Philadelphia PA", "region_id": "NORTHEAST", "region_name": "Northeast Region", "manager": "David Miller"},
    8: {"name": "Mobile AL", "region_id": "SOUTH_CENTRAL", "region_name": "South Central Region", "manager": "Hannah Brooks"},
    9: {"name": "Charleston SC", "region_id": "SOUTHEAST", "region_name": "Southeast Region", "manager": "Lucas Sterling"},
    10: {"name": "Savannah GA", "region_id": "SOUTHEAST", "region_name": "Southeast Region", "manager": "Sophia Chen"},
}

REGION_METADATA: Dict[str, Dict[str, str]] = {
    "NORTHEAST": {
        "name": "Northeast Region",
        "manager": "Victoria Sterling",
        "stores": "Port Authority NY/NJ (#6), Philadelphia PA (#7)",
    },
    "MIDWEST": {
        "name": "Midwest Region",
        "manager": "henrik Lindqvist",
        "stores": "Chicago IL (#2)",
    },
    "SOUTH_CENTRAL": {
        "name": "South Central Region",
        "manager": "Liam O'Connor",
        "stores": "Memphis TN (#1), Houston TX (#3), New Orleans LA (#5), Mobile AL (#8)",
    },
    "SOUTHEAST": {
        "name": "Southeast Region",
        "manager": "Amara Patel",
        "stores": "Charleston SC (#9), Savannah GA (#10)",
    },
    "WEST": {
        "name": "West Region",
        "manager": "Kenji Takahashi",
        "stores": "Los Angeles CA (#4)",
    },
}


def get_store_manager_persona(store_id: int = 2) -> StakeholderPersona:
    """Returns a Store Manager persona scoped strictly to a single store."""
    meta = STORE_METADATA.get(store_id, STORE_METADATA[2])
    return StakeholderPersona(
        persona_id=f"store_mgr_{store_id}",
        role=UserRole.STORE_MANAGER,
        full_name=meta["manager"],
        title=f"Store Manager — Store #{store_id} ({meta['name']})",
        assigned_store_id=store_id,
        assigned_store_name=meta["name"],
        assigned_region_id=meta["region_id"],
        assigned_region_name=meta["region_name"],
        governance_scope_summary=(
            f"Row-Level Security Policy: Restricted exclusively to Store #{store_id} ({meta['name']}). "
            f"Data from other stores in {meta['region_name']} or other regions is strictly masked."
        ),
    )


def get_regional_manager_persona(region_id: str = "SOUTH_CENTRAL") -> StakeholderPersona:
    """Returns a Regional Manager persona scoped to all stores within a specific region."""
    meta = REGION_METADATA.get(region_id, REGION_METADATA["SOUTH_CENTRAL"])
    return StakeholderPersona(
        persona_id=f"region_mgr_{region_id.lower()}",
        role=UserRole.REGIONAL_MANAGER,
        full_name=meta["manager"],
        title=f"Regional Operations Director — {meta['name']}",
        assigned_store_id=None,
        assigned_store_name=None,
        assigned_region_id=region_id,
        assigned_region_name=meta["name"],
        governance_scope_summary=(
            f"Row-Level Security Policy: Authorized for all stores within {meta['name']} "
            f"({meta['stores']}). Other geographic regions are isolated by Data Mesh policy."
        ),
    )


def get_admin_persona() -> StakeholderPersona:
    """Returns the Global Admin / Enterprise Data Mesh Steward persona."""
    return StakeholderPersona(
        persona_id="global_admin",
        role=UserRole.ADMIN,
        full_name="Dr. Clara Vance",
        title="VP of Global Analytics & Enterprise Data Mesh Steward",
        assigned_store_id=None,
        assigned_store_name="All 10 Stores",
        assigned_region_id=None,
        assigned_region_name="All 5 US Regions",
        governance_scope_summary=(
            "Enterprise Admin Policy: Full cross-domain read access across all 5 US Regions "
            "and all 10 Retail Stores/Distribution Centers."
        ),
    )


def list_all_personas() -> List[StakeholderPersona]:
    """Returns a curated list of all selectable personas for the UI/CLI switcher."""
    personas = [
        get_admin_persona(),
        # All 5 Regional Managers
        get_regional_manager_persona("SOUTH_CENTRAL"),
        get_regional_manager_persona("NORTHEAST"),
        get_regional_manager_persona("MIDWEST"),
        get_regional_manager_persona("SOUTHEAST"),
        get_regional_manager_persona("WEST"),
        # All 10 Store Managers
    ]
    for s_id in sorted(STORE_METADATA.keys()):
        personas.append(get_store_manager_persona(s_id))
    return personas
