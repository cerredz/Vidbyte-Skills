# Source-Type Playbook

This reference explains how `/find-resource` searches and evaluates each source
type. The final answer should use these rules as a quality filter, not as a
checklist to display to the user.

## Textbooks and Academic Books

Search targets:

- Academic publisher catalogs
- University course syllabi that name required texts
- Library catalog pages when they identify editions
- Author or publisher pages for the current edition

Good signals:

- Repeated use across university courses
- Academic press or established technical publisher
- Current edition is visible
- Author is an established researcher or practitioner
- Book has a clear fit to the topic rather than a broad adjacent field

Reject:

- Affiliate-heavy book lists
- Pages that only summarize book blurbs
- Pirated copies or unauthorized PDFs
- Outdated editions when a current edition is discoverable and materially better

## Research Papers and Preprints

Search targets:

- Semantic Scholar
- arXiv
- PubMed and PMC
- ERIC for education research
- SSRN for economics, law, and social science
- ACM, IEEE, USENIX, ACL, NeurIPS, ICML, CHI, KDD, SIGCOMM, and domain venues

Good signals:

- Seminal or highly cited paper for the concept
- Recent survey, review, or tutorial paper
- Peer-reviewed venue for settled knowledge
- Preprint for current-frontier work where peer review has not caught up

Reject:

- Papers that mention the topic but do not teach or ground it
- Duplicate versions when a published version exists
- Unverified citation claims

## White Papers

Search targets:

- Company research labs
- Government agencies
- Standards bodies
- Research institutes
- Vendor architecture and benchmark papers

Good signals:

- Clear authorship and organization
- Concrete implementation details or measured results
- Credible institution with relevant domain expertise
- Transparent limitations

Reject:

- Marketing pages posing as white papers
- Lead-capture pages with no accessible substance
- Vendor claims without technical detail

## Practitioner Blog Posts

Search targets:

- Engineering blogs from organizations that build relevant systems
- Maintainer blogs
- Long-form technical essays by recognized practitioners
- Postmortems and design notes

Good signals:

- Specific implementation experience
- Code, architecture, tradeoffs, or measured outcomes
- Author identity and credibility are visible
- The post adds original insight rather than summarizing common knowledge

Reject:

- Shallow tutorials
- SEO explainers
- Generic "what is X" content
- Reposted material from unknown sources

## Case Studies

Search targets:

- Organization engineering blogs
- Vendor case studies with concrete implementation details
- Conference experience reports
- Government or institutional project reports
- Postmortems

Good signals:

- Names the organization, problem, constraints, and outcome
- Shows scale, failure modes, or implementation tradeoffs
- Connects the concept to a real system or intervention

Reject:

- Anonymous claims
- Pure sales material
- Case studies with no technical or operational substance

## University Course Pages and Lecture Notes

Search targets:

- `site:edu course`
- `site:edu syllabus`
- `site:edu lecture notes`
- OpenCourseWare pages
- Professor-maintained course sites

Good signals:

- Full syllabus or lecture sequence
- Assignments, readings, or lecture notes are visible
- Course is from a relevant department
- The level matches the user's requested depth

Reject:

- Empty catalog pages
- Course listings with no materials
- Mirror pages without original course context

## Official Documentation and Standards

Search targets:

- Official project, language, library, or product documentation
- Standards bodies
- RFCs and specifications
- Government or institutional guidelines
- Versioned docs pages

Good signals:

- Official source
- Current version or clear version selection
- Stable canonical URL
- Normative language for standards

Reject:

- Unofficial docs when official docs exist
- Outdated docs for old versions unless the user requested that version
- Summaries that do not link to the primary standard or docs

## Conference Proceedings and Talks

Search targets:

- Conference proceedings
- Talk archives
- Tutorial sessions
- Keynotes and invited talks
- Workshop pages

Good signals:

- Speaker or paper is credible in the domain
- Talk is from a respected venue
- Slides, transcript, video, or paper are available
- It teaches a practical or frontier view not captured by docs/books

Reject:

- Uncontextualized video uploads
- Talks with no clear speaker or venue
- Promotional webinars with little technical depth

## Depth Labels

- `introductory`: approachable first contact; assumes little domain knowledge.
- `intermediate`: assumes basic vocabulary and teaches real use or theory.
- `advanced`: assumes math, research context, production experience, or field
  fluency.

## Orientation Labels

- `foundational`: canonical theory, textbook, course, standard, or seminal work.
- `applied`: implementation-oriented or practice-oriented resource.
- `case-study`: concrete real-world use.
- `reference`: official docs, standards, specs, or API references.
- `current-frontier`: recent research, preprint, emerging practice, or active
  debate.

## Rejection Rules

Do not include content farms, listicles, shallow explainers, unauthorized copies,
scraper mirrors, or pages that do not reveal original expertise. Use weak pages
only as leads to find the primary source.
