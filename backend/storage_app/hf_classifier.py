from transformers import pipeline
from sentence_transformers import SentenceTransformer
import torch
import numpy as np

class ZometricMailClassifier:
    def __init__(self):
        self.classifier = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli"
        )
        self.categories = [
            "CEO communication", "Product management", 
            "Software development", "Customer support", "Client success"
        ]
    
    def classify_summary(self, summary: str) -> dict:
        result = self.classifier(summary, self.categories)
        team_map = {
            "CEO communication": "CEO",
            "Product management": "Product",
            "Software development": "Dev", 
            "Customer support": "Support",
            "Client success": "Client"
        }
        return {
            'team': team_map[result['labels'][0]],
            'confidence': result['scores'][0],
            'top_categories': result['labels'][:3]
        }
