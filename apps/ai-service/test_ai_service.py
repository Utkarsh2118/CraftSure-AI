"""Test runner executing tests from tests/ directory for backward compatibility."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tests.test_ai_service import (
    test_chikankari_matching,
    test_banarasi_silk_matching,
    test_ood_rejection,
    test_disclaimer_always_present,
)

if __name__ == "__main__":
    test_chikankari_matching()
    test_banarasi_silk_matching()
    test_ood_rejection()
    test_disclaimer_always_present()
    print("All 4 AI service unit tests passed successfully!")
