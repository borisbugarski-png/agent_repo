"""
Agent Development Kit (ADK) Framework Core.
Provides modular abstractions for Tool definition, State management, Memory,
and Multi-step Reasoning & Action orchestration for specialized AI agents.
"""

import json
import logging
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class ToolParameter:
    name: str
    type_str: str
    description: str
    required: bool = True
    default: Any = None


class ADKTool:
    """
    Standard ADK Tool abstraction enabling typed parameter validation,
    introspection, and execution.
    """

    def __init__(
        self,
        name: str,
        description: str,
        func: Callable[..., Any],
        parameters: Optional[List[ToolParameter]] = None
    ):
        self.name = name
        self.description = description
        self.func = func
        self.parameters = parameters or []

    def execute(self, **kwargs) -> Any:
        try:
            return self.func(**kwargs)
        except Exception as e:
            logger.error(f"Error executing tool {self.name}: {e}")
            return {"error": str(e), "tool": self.name}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": [
                {
                    "name": p.name,
                    "type": p.type_str,
                    "description": p.description,
                    "required": p.required,
                    "default": p.default
                }
                for p in self.parameters
            ]
        }


@dataclass
class AgentMessage:
    role: str  # 'system', 'user', 'assistant', 'tool'
    content: str
    tool_call: Optional[Dict[str, Any]] = None
    tool_result: Optional[Any] = None


@dataclass
class AgentContext:
    session_id: str
    messages: List[AgentMessage] = field(default_factory=list)
    state: Dict[str, Any] = field(default_factory=dict)

    def add_user_message(self, content: str):
        self.messages.append(AgentMessage(role="user", content=content))

    def add_assistant_message(self, content: str, tool_call: Optional[Dict[str, Any]] = None):
        self.messages.append(AgentMessage(role="assistant", content=content, tool_call=tool_call))

    def add_tool_message(self, tool_name: str, result: Any):
        content = json.dumps(result, default=str) if not isinstance(result, str) else result
        self.messages.append(AgentMessage(role="tool", content=content, tool_result=result))


class ADKAgent:
    """
    Core ADK Agent execution engine supporting tool dispatch,
    operator assistance reasoning, and structured responses.
    """

    def __init__(
        self,
        name: str,
        system_instruction: str,
        tools: Optional[List[ADKTool]] = None
    ):
        self.name = name
        self.system_instruction = system_instruction
        self.tools: Dict[str, ADKTool] = {t.name: t for t in (tools or [])}

    def register_tool(self, tool: ADKTool):
        self.tools[tool.name] = tool

    def invoke_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name not in self.tools:
            return {"error": f"Tool '{tool_name}' not found. Available: {list(self.tools.keys())}"}
        return self.tools[tool_name].execute(**kwargs)
