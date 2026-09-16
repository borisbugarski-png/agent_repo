"""Data Mesh Governance & Policy Enforcement Engine (Row-Level Security & Audit Trail)."""

import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel

from src.config import GCP_PROJECT_ID, BQ_DATASET_ID
from src.governance.personas import (
    StakeholderPersona,
    UserRole,
    STORE_METADATA,
    REGION_METADATA,
)


class AuditEvent(BaseModel):
    timestamp: str
    persona_name: str
    role: str
    scope: str
    action: str
    status: str  # ALLOWED | RLS_APPLIED | CROSS_BOUNDARY_BLOCKED
    sql_executed: Optional[str] = None
    governance_note: str


class GovernancePolicyEngine:
    """Enforces Row-Level Security (RLS) and Data Sharing policies across Data Products."""

    def __init__(self) -> None:
        self.audit_log: List[AuditEvent] = []

    def get_scope_label(self, persona: StakeholderPersona) -> str:
        if persona.role == UserRole.STORE_MANAGER:
            return f"Store #{persona.assigned_store_id} ({persona.assigned_store_name})"
        if persona.role == UserRole.REGIONAL_MANAGER:
            return f"Region: {persona.assigned_region_name} ({persona.assigned_region_id})"
        return "Global Enterprise Admin (All 5 Regions & 10 Stores)"

    def get_sql_filter(self, persona: StakeholderPersona, table_alias: str = "") -> str:
        """Returns the SQL WHERE predicate for the given persona."""
        prefix = f"{table_alias}." if table_alias else ""
        if persona.role == UserRole.STORE_MANAGER:
            return f"{prefix}store_id = {persona.assigned_store_id}"
        if persona.role == UserRole.REGIONAL_MANAGER:
            return f"{prefix}region_id = '{persona.assigned_region_id}'"
        return "1=1"

    def check_query_for_cross_boundary_violation(
        self, persona: StakeholderPersona, user_text: str
    ) -> Tuple[bool, Optional[str]]:
        """Detects if a user prompt explicitly asks for unauthorized stores or regions."""
        if persona.role == UserRole.ADMIN:
            return False, None

        text_lower = user_text.lower()

        if persona.role == UserRole.STORE_MANAGER:
            # Check if mentioning any other store name or ID
            for s_id, meta in STORE_METADATA.items():
                if s_id == persona.assigned_store_id:
                    continue
                city_keywords = [w.lower() for w in meta["name"].split() if len(w) > 3 and w.lower() not in ("port", "authority", "york/new", "jersey")]
                if "new york" in meta["name"].lower():
                    city_keywords.extend(["new york", "ny/nj", "new jersey"])
                for kw in city_keywords:
                    if re.search(rf"\b{re.escape(kw)}\b", text_lower):
                        reason = (
                            f"Data Mesh Policy Violation: Store Manager for Store #{persona.assigned_store_id} "
                            f"({persona.assigned_store_name}) requested data for unauthorized store '{meta['name']}' "
                            f"(Store #{s_id}). Access restricted to Store #{persona.assigned_store_id}."
                        )
                        self.record_audit(
                            persona=persona,
                            action=f"Natural Language Query: '{user_text[:80]}'",
                            status="CROSS_BOUNDARY_BLOCKED",
                            sql_executed=None,
                            governance_note=reason,
                        )
                        return True, reason

        elif persona.role == UserRole.REGIONAL_MANAGER:
            # Check if mentioning stores outside their region
            for s_id, meta in STORE_METADATA.items():
                if meta["region_id"] == persona.assigned_region_id:
                    continue
                city_keywords = [w.lower() for w in meta["name"].split() if len(w) > 3 and w.lower() not in ("port", "authority", "york/new", "jersey")]
                if "new york" in meta["name"].lower():
                    city_keywords.extend(["new york", "ny/nj"])
                for kw in city_keywords:
                    if re.search(rf"\b{re.escape(kw)}\b", text_lower):
                        reason = (
                            f"Data Mesh Policy Violation: Regional Manager for {persona.assigned_region_name} "
                            f"requested data for store '{meta['name']}' located in {meta['region_name']}. "
                            f"Access restricted to {persona.assigned_region_name}."
                        )
                        self.record_audit(
                            persona=persona,
                            action=f"Natural Language Query: '{user_text[:80]}'",
                            status="CROSS_BOUNDARY_BLOCKED",
                            sql_executed=None,
                            governance_note=reason,
                        )
                        return True, reason

            # Check if mentioning another region name explicitly
            for reg_id, rmeta in REGION_METADATA.items():
                if reg_id == persona.assigned_region_id:
                    continue
                reg_kw = rmeta["name"].replace(" Region", "").lower()
                if re.search(rf"\b{re.escape(reg_kw)}\b", text_lower) and "south central" not in text_lower:
                    reason = (
                        f"Data Mesh Policy Violation: Regional Manager for {persona.assigned_region_name} "
                        f"requested data for {rmeta['name']}. Access is scoped strictly to {persona.assigned_region_name}."
                    )
                    self.record_audit(
                        persona=persona,
                        action=f"Natural Language Query: '{user_text[:80]}'",
                        status="CROSS_BOUNDARY_BLOCKED",
                        sql_executed=None,
                        governance_note=reason,
                    )
                    return True, reason

        return False, None

    def validate_and_rewrite_sql(
        self, persona: StakeholderPersona, sql_query: str, action_description: str = "SQL Query"
    ) -> str:
        """
        Validates SQL for read-only safety and rewrites Data Product table references
        with mandatory Row-Level Security (RLS) subqueries based on the active persona.
        """
        cleaned = sql_query.strip().rstrip(";")
        upper_sql = cleaned.upper()

        # 1. Block destructive statements
        forbidden = ["DROP ", "DELETE ", "UPDATE ", "INSERT ", "TRUNCATE ", "ALTER ", "CREATE ", "GRANT "]
        for keyword in forbidden:
            if keyword in upper_sql:
                note = f"Blocked destructive/mutation keyword '{keyword.strip()}' in SQL query."
                self.record_audit(persona, action_description, "CROSS_BOUNDARY_BLOCKED", cleaned, note)
                raise PermissionError(note)

        # 2. If Admin, no RLS filter rewrite needed, just log audit
        if persona.role == UserRole.ADMIN:
            self.record_audit(
                persona=persona,
                action=action_description,
                status="ALLOWED",
                sql_executed=cleaned,
                governance_note="Admin policy: Full access to all Data Products granted.",
            )
            return cleaned

        # 3. For Store Manager or Regional Manager, inject RLS subquery around any Data Product view
        rls_predicate = self.get_sql_filter(persona)
        rewritten = cleaned
        dp_views = [
            "dp_store_region_governance",
            "dp_sales_and_orders",
            "dp_inventory_health",
            "dp_customer_segments",
        ]

        for view_name in dp_views:
            pattern = rf"`?(?:{re.escape(GCP_PROJECT_ID)}\.)?{re.escape(BQ_DATASET_ID)}\.{re.escape(view_name)}`?"
            governed_subquery = f"(SELECT * FROM `{GCP_PROJECT_ID}.{BQ_DATASET_ID}.{view_name}` WHERE {rls_predicate})"
            rewritten = re.sub(pattern, governed_subquery, rewritten)

        # If none of the Data Product views were matched (e.g., raw table queried), wrap or enforce
        self.record_audit(
            persona=persona,
            action=action_description,
            status="RLS_APPLIED",
            sql_executed=rewritten,
            governance_note=f"Injected Data Mesh RLS predicate: WHERE {rls_predicate}",
        )
        return rewritten

    def record_audit(
        self,
        persona: StakeholderPersona,
        action: str,
        status: str,
        sql_executed: Optional[str],
        governance_note: str,
    ) -> None:
        event = AuditEvent(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            persona_name=f"{persona.full_name} ({persona.title})",
            role=persona.role.value,
            scope=self.get_scope_label(persona),
            action=action,
            status=status,
            sql_executed=sql_executed,
            governance_note=governance_note,
        )
        self.audit_log.insert(0, event)  # Most recent first


# Singleton policy engine instance shared across repository & agent
POLICY_ENGINE = GovernancePolicyEngine()
