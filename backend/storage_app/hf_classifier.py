from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
import numpy as np

class ZometricMailClassifier:
    def __init__(self):
        # MAIN CLASSIFIER
        self.llm = pipeline(
            "text2text-generation",
            model="google/flan-t5-large"
        )

        # EMBEDDING MODEL (for confidence)
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")

        self.team_descriptions = {
            "CEO": "Leadership updates, company direction, strategy, high level vision",
            "Product": "Feature planning, roadmap, product ideas, design, user experience",
            "Dev": "Software development, bugs, coding, API, backend, technical issues",
            "Support": "Customer complaints, help needed, issues, tickets, problems",
            "Client": "Client discussion, partnership, onboarding, proposals, sales"
        }

        # Precompute category embeddings
        self.category_vectors = {
            team: self.embedder.encode(desc)
            for team, desc in self.team_descriptions.items()
        }

    def classify_summary(self, summary: str) -> dict:

        # 1️⃣ LLM suggestion
        prompt = f"""
Classify this business content into one team:

Summary:
{summary}

Teams: CEO, Product, Dev, Support, Client

Respond as:
TEAM, CONFIDENCE 0-100
        """

        raw = self.llm(prompt)[0]['generated_text']
        # Example: "Support, 87"

        try:
            llm_team, llm_conf = raw.split(',')
            llm_team = llm_team.strip()
            llm_conf = float(llm_conf.strip().replace('%','')) / 100
        except:
            llm_team = "Client"
            llm_conf = 0.5

        # 2️⃣ Embedding similarity check
        summary_vec = self.embedder.encode(summary)

        similarities = {
            team: float(util.cos_sim(summary_vec, vec))
            for team, vec in self.category_vectors.items()
        }

        embed_team = max(similarities, key=similarities.get)
        embed_conf = similarities[embed_team]

        # 3️⃣ MERGE BOTH
        final_team = embed_team if embed_conf > llm_conf else llm_team
        final_conf = max(embed_conf, llm_conf)

        return {
            "team": final_team,
            "confidence": final_conf,
            "llm_team": llm_team,
            "embed_team": embed_team,
            "embed_confidence": embed_conf,
            "top_embeddings": sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:3]
        }
