"""Automated unit and integration tests for Data Mesh Governance & BigQuery RLS enforcement."""

import pytest
from src.governance.personas import (
    get_store_manager_persona,
    get_regional_manager_persona,
    get_admin_persona,
    UserRole,
)
from src.governance.policy_engine import POLICY_ENGINE
from src.repository.bigquery_client import BQ_REPO
from src.agent.data_sharing_agent import DATA_SHARING_AGENT


def test_store_manager_rls_filter():
    """Verify Store Manager #2 (Chicago IL) gets strict store_id = 2 SQL predicate."""
    persona = get_store_manager_persona(2)
    assert persona.role == UserRole.STORE_MANAGER
    assert persona.assigned_store_id == 2
    assert POLICY_ENGINE.get_sql_filter(persona) == "store_id = 2"

    # Check live BigQuery KPI summary only returns 1 active store
    kpi = BQ_REPO.get_kpi_summary(persona)
    assert kpi["active_stores"] == 1
    assert kpi["total_revenue"] > 1000000  # Chicago IL has ~$1.33M revenue


def test_store_manager_cross_boundary_blocked():
    """Verify Store Manager #2 asking about Houston TX is blocked by Policy Engine."""
    persona = get_store_manager_persona(2)
    is_violation, reason = POLICY_ENGINE.check_query_for_cross_boundary_violation(
        persona, "Show me total sales revenue for Houston TX"
    )
    assert is_violation is True
    assert "Houston TX" in reason

    # Check agent response returns CROSS_BOUNDARY_BLOCKED status
    resp = DATA_SHARING_AGENT.answer_question(persona, "What is the revenue of Houston TX store?")
    assert resp.policy_status == "CROSS_BOUNDARY_BLOCKED"
    assert "Cross-Boundary Access Restricted" in resp.content


def test_regional_manager_rls_filter():
    """Verify Regional Manager for SOUTH_CENTRAL sees all 4 stores in South Central and 1 region."""
    persona = get_regional_manager_persona("SOUTH_CENTRAL")
    assert persona.role == UserRole.REGIONAL_MANAGER
    assert POLICY_ENGINE.get_sql_filter(persona) == "region_id = 'SOUTH_CENTRAL'"

    # Check live BigQuery query returns 4 stores (Memphis #1, Houston #3, New Orleans #5, Mobile #8)
    kpi = BQ_REPO.get_kpi_summary(persona)
    assert kpi["active_stores"] == 4
    assert kpi["active_regions"] == 1


def test_regional_manager_cross_region_blocked():
    """Verify Regional Manager for SOUTH_CENTRAL asking about Chicago IL (Midwest) is blocked."""
    persona = get_regional_manager_persona("SOUTH_CENTRAL")
    is_violation, reason = POLICY_ENGINE.check_query_for_cross_boundary_violation(
        persona, "How much profit did Chicago IL make?"
    )
    assert is_violation is True
    assert "Chicago IL" in reason


def test_admin_global_access():
    """Verify Admin User sees all 10 stores across all 5 regions."""
    persona = get_admin_persona()
    assert persona.role == UserRole.ADMIN
    assert POLICY_ENGINE.get_sql_filter(persona) == "1=1"

    kpi = BQ_REPO.get_kpi_summary(persona)
    assert kpi["active_stores"] == 10
    assert kpi["active_regions"] == 5
    assert kpi["total_revenue"] > 10000000  # Total revenue ~$10.83M across all 10 stores


def test_destructive_sql_blocked():
    """Verify Policy Engine blocks DROP/DELETE/UPDATE statements."""
    persona = get_admin_persona()
    with pytest.raises(PermissionError):
        POLICY_ENGINE.validate_and_rewrite_sql(persona, "DROP TABLE `lustrous-stone-417013.ecommerce.orders`")
