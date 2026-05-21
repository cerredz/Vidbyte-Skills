<!--
CONTEXT PROTOCOL HEADER
Description: Structure-to-field reference mapping guide for the read-paper skill.
Purpose: Serves as a reference guide for mapping standard, IMRaD, or theory research structures into the 6 signal fields.
Architecture: Markdown structure detailing layouts, sections, and mapping endpoints.
Functions/Key Elements: Standard Structure mapping, IMRaD Structure mapping, Theory/Review mapping.
Relation to Codebase: Packaged inside skills/read-paper/references/ and referenced by the main system prompt.
Similar Files: skills/find-papers/references/source-registry.md.
-->

# Reference Guide: Paper Structure Mapping

This document provides mapping rules for translating various academic paper structures to the 6 core signal fields used in `/read-paper`.

---

## 1. Standard Structure
*Common in Computer Science, Education, and Social Science papers.*

* **Abstract** ──> **Research Question** + **Why It Matters**
* **Introduction** ──> **Why It Matters** (Deeper context) + **Research Question** (Refined)
* **Methods/Procedure** ──> **What They Did**
* **Results/Findings** ──> **What They Found**
* **Discussion** ──> **Caveats** + **Practical Takeaway**
* **Conclusion** ──> **Practical Takeaway** (Confirmed synthesis)

---

## 2. IMRaD Structure
*Common in Medical, Biological, and Clinical research papers.*

* **Introduction** ──> **Research Question** + **Why It Matters**
* **Methods** ──> **What They Did**
* **Results** ──> **What They Found**
* **Discussion** ──> **Caveats** + **Practical Takeaway**

---

## 3. Theory / Review Papers
*No empirical Methods or Results sections.*

* **Introduction** ──> **Research Question** + **Why It Matters**
* **Main Argument** ──> **What They Found** (The theoretical thesis and argument)
* **Evidence Sections** ──> **What They Did** (Literature synthesized and logical proofs constructed)
* **Conclusion** ──> **Practical Takeaway**

---

## 4. Extraction Principles
1. **Always Anchor on abstract**: If the document structure is highly ambiguous, extract high-level representations from the abstract and conclusion first, then refine them by working inward.
2. **Never duplicate verbatim**: Paraphrase everything into clear, accessible prose.
3. **Keep numbers intact**: Ensure key numbers/metrics (such as sample sizes, confidence intervals, performance metrics) are never lost during paraphrasing.
