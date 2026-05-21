<!--
CONTEXT PROTOCOL HEADER
Description: Seed primer dictionary reference for the scope utility skill.
Purpose: Provides pre-mapped core pillars, adjacent fields, and misconceptions for high-frequency disciplines, facilitating immediate offline boundary cartography.
Architecture: Structured Markdown tables grouped by major technical and academic domain.
Relation to Codebase: Resides under skills/scope/references/ and referenced by the scope prompt engine during domain routing.
Similar Files: skills/jargon/references/jargon-field-map.md.
-->

# Scope Seed Priming Reference Map

Use this reference to map the boundaries, cores, adjacencies, and misattributions across foundational disciplines.

---

## 1. Machine Learning

| Category | Component | Boundary Distinction / Description |
|:---|:---|:---|
| **Core Pillars** | **Representation** | The model structure (neural networks, decision trees, support vector machines) used to represent patterns in data. |
| **Core Pillars** | **Evaluation** | The scoring functions (precision, recall, mean-squared error, entropy) used to measure model accuracy and guide updates. |
| **Core Pillars** | **Optimization** | The search algorithms (gradient descent, genetic algorithms) used to adjust model parameters to minimize errors. |
| **Adjacent & Distinct** | **Data Analysis** | Focuses on examining past data to discover insights and compile reports, whereas Machine Learning focuses on building predictive models to act on new data. |
| **Adjacent & Distinct** | **Software Engineering** | Deals with building systems, writing clean code, and deploying apps, while Machine Learning is experimental, probabilistic, and focused on training mathematical models. |
| **Commonly Misattributed**| **Artificial General Intelligence**| A theoretical human-level AI capable of any intellectual task, whereas Machine Learning consists of narrow, statistical pattern-matching systems. |
| **Commonly Misattributed**| **Hard-coded Algorithms** | Static, rule-based programs (like standard chess engines) that follow explicit developer instructions, rather than learning relationships from data. |

---

## 2. Systems Design

| Category | Component | Boundary Distinction / Description |
|:---|:---|:---|
| **Core Pillars** | **Scalability & Load** | How systems handle growing volumes of requests or data through horizontal/vertical scaling and partition management. |
| **Core Pillars** | **Availability & Reliability**| Techniques (redundancy, failover, replication) used to ensure a system remains online and operational despite failures. |
| **Core Pillars** | **Data Partitioning & State**| Designing database boundaries, replication schemes, caching layers, and transaction consistency (ACID vs. BASE). |
| **Adjacent & Distinct** | **Code Refactoring** | Focuses on micro-level clean code, object-oriented design patterns, and internal files, while Systems Design focuses on macro-level service architecture and network components. |
| **Adjacent & Distinct** | **DevOps & Infrastructure**| Focuses on deploying, provisioning servers (Terraform, Kubernetes), and CI/CD pipelines, whereas Systems Design is the theoretical plan of component interactions. |
| **Commonly Misattributed**| **UI/UX Design** | The visual design, layouts, buttons, and user interface flow, which are entirely separate from backend service architecture and database scaling. |
| **Commonly Misattributed**| **Network Troubleshooting** | The physical wiring, IP configurations, router setups, and hardware diagnostics, which are underlying utilities rather than software architecture design. |

---

## 3. Economics

| Category | Component | Boundary Distinction / Description |
|:---|:---|:---|
| **Core Pillars** | **Microeconomics** | The study of decisions made by individual agents (households, firms) under resource scarcity and market mechanisms. |
| **Core Pillars** | **Macroeconomics** | The study of aggregate economy-wide phenomena including inflation, interest rates, GDP, employment, and fiscal policy. |
| **Core Pillars** | **Econometrics** | The application of statistical and mathematical methods to analyze and test empirical economic relationships. |
| **Adjacent & Distinct** | **Finance** | Focuses on assets, markets, valuations, portfolio structures, and raising capital, whereas Economics studies broader systemic behaviors and resource allocation. |
| **Adjacent & Distinct** | **Sociology** | Studies social behaviors, institutional structures, and group dynamics, while Economics concentrates on incentive systems, scarcity, and utility optimization. |
| **Commonly Misattributed**| **Personal Wealth Management**| Advice on savings accounts, buying stocks, or selecting retirement plans, which is retail finance rather than systemic economic science. |
| **Commonly Misattributed**| **Corporate Accounting** | The formal recording, classifying, and reporting of a business's internal financial transactions for tax and audit compliance. |

---

## 4. Philosophy

| Category | Component | Boundary Distinction / Description |
|:---|:---|:---|
| **Core Pillars** | **Epistemology** | The branch studying the nature, origin, scope, and limits of human knowledge and belief validation. |
| **Core Pillars** | **Metaphysics** | The study of the fundamental nature of reality, existence, mind, matter, identity, space, and time. |
| **Core Pillars** | **Ethics & Moral Philosophy**| The systematizing, defending, and recommending of concepts of right and wrong behaviors (normative, meta-ethics). |
| **Adjacent & Distinct** | **Psychology** | Empirically studies brain processes, emotions, and human mental states, while Philosophy investigates the conceptual, logical, and normative foundations of mind. |
| **Adjacent & Distinct** | **Theology** | Concentrates on religious scriptures, divine natures, and faith-based doctrines, whereas Philosophy relies on reasoned argumentation and logical proofs. |
| **Commonly Misattributed**| **Inspirational Life Coaching**| Inspirational speaking, self-help guidelines, or motivational advice, which are psychological practices rather than rigorous philosophical inquiry. |
| **Commonly Misattributed**| **Esotericism & Mysticism** | Belief in direct personal spiritual revelations, occult secrets, or supernatural magic, which bypasses logical philosophical argumentation. |
