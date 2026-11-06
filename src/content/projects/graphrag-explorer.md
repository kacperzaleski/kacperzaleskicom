---
# Local overrides (highest priority). Fields follow the portfolio.yml contract.
title: GraphRAG Explorer
tagline: Who owns whom in Austrian banking, as a knowledge graph you can explore and ask questions
status: wip # TODO(kacper): confirm (live | demo | wip | archived)
featured: true
tags: [knowledge graph, GraphRAG, LLM, Neo4j, FastAPI, React]
screenshot: slides/img/2_bawag.png
screenshot_alt: GraphRAG Explorer showing BAWAG Group's ownership graph, with an entity card listing owners, stakes and source quotes
---

22 Wikipedia articles about Austrian banks, their owners and regulators, turned
into a knowledge graph by an LLM. Every fact links back to the sentence it came
from. Hybrid graph + vector RAG answers questions with citations, and a
reproducible evaluation compares graph mode against plain vector RAG.
