"""Unit tests for CraftSure AI visual matching and OOD detection."""
import sys
import os

# Ensure apps/ai-service directory is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.craft_matcher import match_craft_image

def test_chikankari_matching():
    res = match_craft_image(sample_query="lucknow_chikankari")
    assert res.status == "similarity_match"
    assert res.calibratedConfidence >= 0.70
    assert len(res.topMatches) == 1
    assert res.topMatches[0].craftSlug == "lucknow-chikankari"
    assert "Visual similarity indicates stylistic match only" in res.disclaimer

def test_banarasi_silk_matching():
    res = match_craft_image(sample_query="banarasi_silk_saree")
    assert res.status == "similarity_match"
    assert res.topMatches[0].craftSlug == "banarasi-silk"

def test_ood_rejection():
    res = match_craft_image(sample_query="non_craft_synthetic")
    assert res.status == "unsupported_or_inconclusive"
    assert res.rejectionReason == "out_of_distribution"
    assert res.calibratedConfidence < 0.30
    assert len(res.topMatches) == 0

def test_disclaimer_always_present():
    res = match_craft_image(sample_query="moradabad_brass")
    assert "Visual similarity indicates stylistic match only" in res.disclaimer
    assert "Authenticity requires artisan verification" in res.disclaimer

if __name__ == "__main__":
    test_chikankari_matching()
    test_banarasi_silk_matching()
    test_ood_rejection()
    test_disclaimer_always_present()
    print("All 4 AI service unit tests passed successfully!")
