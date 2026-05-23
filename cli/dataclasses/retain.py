import json
from datetime import datetime, timezone

MAX_CONCEPTS = 5
MAX_QUESTIONS = 6
MAX_PROBLEMS = 2
MAX_REVIEWS = 3
DEFAULT_RETAIN_SKILL_ID = "retain-v1"

_REVIEW_DEFAULTS = [
    ("1 day", "Re-answer the hardest cued recall question without looking."),
    ("3 days", "Redo one active reasoning problem in a new context."),
    ("7 days", "Explain the most important concept from memory in one paragraph."),
]

_ALLOWED_OPTIONS = (
    {"title", "domain", "conversation-id", "dry-run", "brain-dump-prompt"}
    | {f"concept{i}-{f}" for i in range(1, MAX_CONCEPTS + 1) for f in ("name", "distillation", "anchor", "hook")}
    | {f"question{i}" for i in range(1, MAX_QUESTIONS + 1)}
    | {f"answer{i}" for i in range(1, MAX_QUESTIONS + 1)}
    | {f"problem{i}-{f}" for i in range(1, MAX_PROBLEMS + 1) for f in ("scenario", "question", "criteria")}
    | {f"review{i}" for i in range(1, MAX_REVIEWS + 1)}
)


class RetainConcept:
    __slots__ = ("id", "name", "distillation", "vivid_anchor", "personal_hook")

    def __init__(self, concept_id: str, name: str, distillation: str, anchor: str, hook: str):
        self.id = concept_id
        self.name = name
        self.distillation = distillation
        self.vivid_anchor = anchor
        self.personal_hook = hook

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "distillation": self.distillation,
            "vivid_anchor": self.vivid_anchor,
            "personal_hook": self.personal_hook,
        }


class RetainQuestion:
    __slots__ = ("id", "prompt", "answer_key", "difficulty")

    def __init__(self, question_id: str, prompt: str, answer_key: str, index: int):
        self.id = question_id
        self.prompt = prompt
        self.answer_key = answer_key
        self.difficulty = "retrieval" if index <= 2 else "connection" if index <= 4 else "transfer"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "prompt": self.prompt,
            "answer_key": self.answer_key,
            "difficulty": self.difficulty,
        }


class RetainProblem:
    __slots__ = ("id", "scenario", "question", "strong_answer_criteria")

    def __init__(self, problem_id: str, scenario: str, question: str, criteria: str):
        self.id = problem_id
        self.scenario = scenario
        self.question = question
        self.strong_answer_criteria = criteria

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "scenario": self.scenario,
            "question": self.question,
            "strong_answer_criteria": self.strong_answer_criteria,
        }


class RetainReview:
    __slots__ = ("after", "prompt")

    def __init__(self, after: str, prompt: str):
        self.after = after
        self.prompt = prompt

    def to_dict(self) -> dict:
        return {"after": self.after, "prompt": self.prompt}


class RetainModule:
    __slots__ = (
        "title", "domain", "conversation_id", "generated_at",
        "concepts", "questions", "problems", "reviews",
        "brain_dump_prompt", "skill_id",
    )

    def __init__(self, options: dict):
        self.title = options.get("title") or "Session retention module"
        self.domain = options.get("domain") or "unknown"
        self.conversation_id = options.get("conversation-id") or ""
        self.generated_at = datetime.now(timezone.utc).isoformat()
        self.brain_dump_prompt = options.get("brain-dump-prompt") or (
            "Write everything you remember from the conversation. Do not look back. Do not organize. Just output."
        )
        self.skill_id = "retain"

        self.concepts = RetainModule._collect_concepts(options)
        self.questions = RetainModule._collect_questions(options)
        self.problems = RetainModule._collect_problems(options)
        self.reviews = RetainModule._collect_reviews(options)

    @staticmethod
    def _collect_concepts(options: dict) -> list[RetainConcept]:
        concepts = []
        for i in range(1, MAX_CONCEPTS + 1):
            fields = ("name", "distillation", "anchor", "hook")
            values = {f: options.get(f"concept{i}-{f}", "") for f in fields}
            if not any(values.values()):
                continue
            missing = [f"--concept{i}-{f}" for f in fields if not values[f]]
            if missing:
                raise RuntimeError(f"Incomplete concept{i}; missing {', '.join(missing)}.")
            concepts.append(RetainConcept(
                f"concept-{len(concepts) + 1}",
                values["name"], values["distillation"], values["anchor"], values["hook"],
            ))
        if not concepts:
            raise RuntimeError(
                "Missing retain concepts. Provide at least --concept1-name, "
                "--concept1-distillation, --concept1-anchor, and --concept1-hook."
            )
        return concepts

    @staticmethod
    def _collect_questions(options: dict) -> list[RetainQuestion]:
        questions = []
        for i in range(1, MAX_QUESTIONS + 1):
            prompt = options.get(f"question{i}", "")
            answer = options.get(f"answer{i}", "")
            if not prompt and not answer:
                continue
            if not prompt:
                raise RuntimeError(f"Missing --question{i} for --answer{i}.")
            if not answer:
                raise RuntimeError(f"Missing --answer{i} for --question{i}.")
            questions.append(RetainQuestion(f"question-{len(questions) + 1}", prompt, answer, len(questions) + 1))
        if not questions:
            raise RuntimeError("Missing retain questions. Provide at least --question1 and --answer1.")
        return questions

    @staticmethod
    def _collect_problems(options: dict) -> list[RetainProblem]:
        problems = []
        for i in range(1, MAX_PROBLEMS + 1):
            fields = ("scenario", "question", "criteria")
            values = {f: options.get(f"problem{i}-{f}", "") for f in fields}
            if not any(values.values()):
                continue
            missing = [f"--problem{i}-{f}" for f in fields if not values[f]]
            if missing:
                raise RuntimeError(f"Incomplete problem{i}; missing {', '.join(missing)}.")
            problems.append(RetainProblem(
                f"problem-{len(problems) + 1}",
                values["scenario"], values["question"], values["criteria"],
            ))
        return problems

    @staticmethod
    def _collect_reviews(options: dict) -> list[RetainReview]:
        reviews = []
        for i in range(1, MAX_REVIEWS + 1):
            prompt = options.get(f"review{i}")
            if prompt:
                reviews.append(RetainReview(_REVIEW_DEFAULTS[i - 1][0], prompt))
        if reviews:
            return reviews
        return [RetainReview(after, prompt) for after, prompt in _REVIEW_DEFAULTS]

    def to_dict(self) -> dict:
        concept_ids = [c.id for c in self.concepts]
        question_ids = [q.id for q in self.questions]
        problem_ids = [p.id for p in self.problems]
        return {
            "version": 1,
            "type": "retain_module",
            "title": self.title,
            "estimated_minutes": 15,
            "source": {
                "domain": self.domain,
                "conversation_id": self.conversation_id,
                "generated_at": self.generated_at,
            },
            "access": {
                "free_phase": "brain_dump",
                "premium_required_for_full_module": True,
            },
            "concepts": [c.to_dict() for c in self.concepts],
            "phases": [
                {
                    "id": "encoding_anchors",
                    "title": "Encoding Anchors",
                    "duration_seconds": 120,
                    "locked_until_timer_complete": True,
                    "items": [c.to_dict() for c in self.concepts],
                },
                {
                    "id": "brain_dump",
                    "title": "Brain Dump",
                    "duration_seconds": 120,
                    "locked_until_timer_complete": False,
                    "prompt": self.brain_dump_prompt,
                    "expected_concept_ids": concept_ids,
                },
                {
                    "id": "cued_recall",
                    "title": "Cued Recall",
                    "duration_seconds": 300,
                    "reveal": "one_at_a_time",
                    "items": [q.to_dict() for q in self.questions],
                },
                {
                    "id": "active_reasoning",
                    "title": "Active Reasoning Problems",
                    "duration_seconds": 240,
                    "items": [p.to_dict() for p in self.problems],
                },
                {
                    "id": "gap_analysis",
                    "title": "Gap Analysis",
                    "duration_seconds": 120,
                    "concept_ids": concept_ids,
                    "question_ids": question_ids,
                    "problem_ids": problem_ids,
                },
            ],
            "review_schedule": [r.to_dict() for r in self.reviews],
        }


class RetainPayload:
    __slots__ = ("module", "generated_at")

    def __init__(self, module: RetainModule):
        self.module = module
        self.generated_at = module.generated_at

    def to_json(self) -> str:
        return json.dumps({
            "type": "retain",
            "domain": self.module.domain,
            "conversation_id": self.module.conversation_id,
            "module": self.module.to_dict(),
            "generated_at": self.generated_at,
        })

    @property
    def skill_id(self) -> str:
        return self.module.skill_id
