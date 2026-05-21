<!--
CONTEXT PROTOCOL HEADER
Description: Reference seed library of high-quality domain-specific examples for the theoretical-feedback skill.
Purpose: To serve as a calibration catalog (few-shot examples) that anchors the AI's principle extraction quality at an elite/expert level.
Architecture: Structured by domain, illustrating the exact difference between low-level practical feedback and high-level theoretical feedback.
Functions/Key Elements: Covers 10 domains: Software Engineering, Chess, Writing, Design (UI/UX), Machine Learning, Investing/Finance, Negotiation, Public Speaking, Mathematics, and Management.
Relation to Codebase: Placed in skills/theoretical-feedback/references/domain-examples.md; read by the AI host when executing the theoretical-feedback skill prompt.
Similar Files: N/A.
-->

# Theoretical Feedback Seed Library

This library contains elite-grade examples of the distinction between practical and theoretical feedback across 10 domains. The model references these examples to calibrate the abstraction bar, ensuring principles describe **how to think, not what to do**.

---

## 1. Software Engineering

| Mode | Practical Feedback (Instance Level) | Theoretical Feedback (Class Level) |
|---|---|---|
| **Testing** | "This test is fragile because you are mocking private methods of `UserService`." | "Testability is not a property you add to code — it is a signal that your code has low coupling. If something is hard to test, the test is telling you something about the design. Senior engineers read test difficulty as a design smell and follow it upstream. The fix is never in the test." |
| **Refactoring** | "This function is too long — split it here into a helper." | "Senior engineers write code for the reader, not the writer. If you cannot name a function in a single, clear verb-noun phrase, it has more than one job. Keep functions single-purpose and readably named." |

---

## 2. Chess

| Mode | Practical Feedback (Instance Level) | Theoretical Feedback (Class Level) |
|---|---|---|
| **Tactics** | "You shouldn't have traded your bishop for the knight on move 12." | "Strong players always ask: does this trade improve my pawn structure or my opponent's piece activity? Material equality does not equal positional equality. A trade is only good if it shifts the imbalances in your favor." |
| **Strategy** | "Your pieces were all huddled on the queenside, leaving your king undefended." | "Strong players evaluate the entire board before committing to a plan — activity on one side is only meaningful in the context of what the other side allows your opponent to do. Connection and coordination multiply piece value; uncoordinated pieces are half an army." |

---

## 3. Writing

| Mode | Practical Feedback (Instance Level) | Theoretical Feedback (Class Level) |
|---|---|---|
| **Clarity** | "This paragraph is confusing; simplify the sentences." | "Strong writers know the one specific thing they want the reader to feel or understand before they write. Every sentence must either earn its place by serving that goal, or be deleted because it dilutes the overall impact." |
| **Voice** | "Avoid using passive voice in this paragraph." | "Great writers use active voice to establish clear agency and ownership of action. Passive voice obscures who is doing what, turning a direct narrative into a defensive, muddy report." |

---

## 4. Design (UI/UX)

| Mode | Practical Feedback (Instance Level) | Theoretical Feedback (Class Level) |
|---|---|---|
| **Contrast** | "Your primary action button contrast is too low." | "Great designers always ask: what is the user's primary goal on this screen? Every visual choice — contrast, size, alignment — must either actively guide the user to that goal or intentionally disappear into the background." |
| **Layout** | "Put the search bar on the top-right instead of the bottom-left." | "Users carry mental models built from the thousands of other websites they visit. Align with these structural conventions rather than forcing them to learn a new grammar, unless the innovation significantly reduces cognitive load." |

---

## 5. Machine Learning

| Mode | Practical Feedback (Instance Level) | Theoretical Feedback (Class Level) |
|---|---|---|
| **Training** | "Your learning rate is too high, decrease it to 1e-4." | "Experienced ML engineers validate their basic assumptions about data quality and distribution before touching any hyperparameters. Most model failures are data problems wearing the costume of architecture or optimization problems." |
| **Overfitting** | "Add dropout layers to stop overfitting on the training set." | "Model regularization is a balance between representation power and generalization capacity. Never solve an overfitting problem by crippling the model; instead, seek to increase data diversity or reduce noise." |

---

## 6. Investing / Finance

| Mode | Practical Feedback (Instance Level) | Theoretical Feedback (Class Level) |
|---|---|---|
| **Portfolio** | "You shouldn't have sold that tech stock last week." | "Strong investors separate the quality of an outcome from the quality of a decision. A good decision can lead to a bad outcome, and a bad decision can lead to a good outcome. Always judge your processes, rules, and risk filters, not the immediate result." |
| **Asset Allocation**| "Put more money into bonds since stocks are volatile right now." | "Asset allocation is a tool for managing uncertainty, not for timing markets. The goal is to construct a portfolio of uncorrelated risks that performs robustly across multiple economic futures, rather than maximizing returns in one." |

---

## 7. Negotiation

| Mode | Practical Feedback (Instance Level) | Theoretical Feedback (Class Level) |
|---|---|---|
| **First Offer** | "You accepted their first salary offer too quickly." | "Skilled negotiators always anchor first, and anchor high. The first number set in a negotiation creates a powerful psychological frame that pulls all subsequent counter-offers toward it. Silence or a counter-anchor is the best way to break it." |
| **Concessions** | "Don't lower your price without asking for something back." | "Every concession in a negotiation must be traded, never given away. A free concession signals weakness and invites further demands, whereas a reciprocal concession maintains mutual respect and establishes the value of what is being exchanged." |

---

## 8. Public Speaking

| Mode | Practical Feedback (Instance Level) | Theoretical Feedback (Class Level) |
|---|---|---|
| **Pacing** | "You spoke too fast on slide three." | "Great speakers treat silence as punctuation. A deliberate pause after a key point gives the audience time to feel the weight of what was said, shifting the presentation from a stream of information to a series of impactful moments." |
| **Body Language** | "Stop pacing back and forth across the stage." | "Physical movement should serve as visual punctuation for your message. Move purposefully when transitioning between main points or stories, and remain completely still and grounded when delivering your core arguments to command maximum authority." |

---

## 9. Mathematics / Problem Solving

| Mode | Practical Feedback (Instance Level) | Theoretical Feedback (Class Level) |
|---|---|---|
| **Algebra** | "You should have factored the equation instead of expanding it." | "Expert problem-solvers look for symmetry and structure before performing calculations. Simplifying, reframing, or looking at the extreme bounds of a problem often renders complex mechanical arithmetic completely unnecessary." |
| **Proofs** | "Use proof by contradiction for this theorem." | "A robust mathematical proof is a sequence of logical deductions that removes all alternative possibilities. When a direct path is blocked, ask: what is the minimal set of assumptions required to make the inverse statement impossible?" |

---

## 10. Management / Leadership

| Mode | Practical Feedback (Instance Level) | Theoretical Feedback (Class Level) |
|---|---|---|
| **Delegation** | "You should let Sarah write the report instead of doing it yourself." | "Effective leaders do not delegate tasks; they delegate ownership. When you delegate a task, you remain the bottleneck and the decision-maker; when you delegate ownership, you empower others to solve problems and grow while freeing yourself to lead." |
| **Conflict** | "Tell Bob and Alice to stop arguing about the project timeline." | "A leader's role in a conflict is to shift the conversation from positions ('what they want') to interests ('why they want it'). Resolving conflict requires uncovering the shared organizational goal that both parties are trying to achieve in different ways." |
