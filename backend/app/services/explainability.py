"""
SentinelSIF Phase 8: Explainability Service Re-export Module.
Preserves backward compatibility while modularizing the service under app.services.explainability package.
"""

from app.services.explainability.base import ExplainabilityEngineBase
from app.services.explainability.engine import ExplainabilityEngine

__all__ = ["ExplainabilityEngineBase", "ExplainabilityEngine"]
