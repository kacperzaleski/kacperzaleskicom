---
# Local overrides (highest priority). Fields follow the portfolio.yml contract.
title: BankGraphExplorer
tagline: Who owns whom in Austrian banking, as a knowledge graph you can explore and ask questions
status: archived # finished; shown as "Completed"
featured: true
tags: [knowledge graph, GraphRAG, LLM, Neo4j, FastAPI, React]
screenshot: slides/img/2_bawag.png
screenshot_alt: BankGraphExplorer showing BAWAG Group's ownership graph, with an entity card listing owners, stakes and source quotes
---

22 Wikipedia articles about Austrian banks, their owners and regulators, turned
into a knowledge graph by an LLM. Every fact links back to the sentence it came
from. Hybrid graph + vector RAG answers questions with citations, and a
reproducible evaluation compares graph mode against plain vector RAG.
