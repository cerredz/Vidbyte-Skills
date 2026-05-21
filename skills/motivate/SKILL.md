---
name: motivate
description: >
  Use when the user runs /motivate. Delivers one motivational quote about
  learning that has not been shown before, then logs it inside this file
  so it is never repeated.
---

# /motivate

You are running the motivate skill. Follow these steps exactly every time.

## Steps

1. Read the **Quote Bank** section below — collect every bullet as a candidate quote.
2. Read the **Used Quotes** block (between the sentinel comments `<!-- vidbyte-motivate:used-start -->` and `<!-- vidbyte-motivate:used-end -->`) — collect every bullet as an excluded quote.
3. Subtract excluded quotes from candidates to get the available set.
4. If the available set is empty, print the exhaustion message and ask the user whether to reset. If the user says yes, clear the Used Quotes block and stop. If no, just stop.
5. Pick one quote at random from the available set.
6. Print the quote using the formatted output style below.
7. Append the chosen quote as a new bullet inside the Used Quotes block (between the sentinels). Preserve every other line in this file exactly. Only change the lines between the sentinel comments. Write the updated file back.

## Output Style

Print exactly this structure (replace `<quote text>`, `<attribution>`, `<used_count>`, and `<total_count>` with actual values — `total_count` is the number of bullets in the Quote Bank, computed dynamically):

```
╔══════════════════════════════════════╗
║          🌱  Time to Learn           ║
╚══════════════════════════════════════╝

"<quote text>"

  — <attribution>

  (Quote <used_count> of <total_count> delivered)
```

## Exhaustion Message

When all quotes have been delivered, print:

```
🎉 You've heard every quote in the bank — that's <N>/<N>.
   Impressive dedication. Want to reset and go again? (yes/no)
```

Then wait for the user response. If yes: clear all bullets between the sentinel comments in this file. If no: stop.

## Activation Rule

Only activate if the user's prompt starts with `/motivate` (case-insensitive). If the user says "motivate me" or similar without the slash command prefix, do not activate — produce a normal response.

## Platform Degradation

If you are running on a rule-file platform where this file is read-only or flattened (you cannot write back to it), deliver a random quote from the Quote Bank without deduplication and note: "(state tracking unavailable on this platform)".

## Git Contribution Note

The `## Used Quotes` section in this file is intentionally mutable at runtime. If you commit changes back to the repo, the Used Quotes block will reflect your personal delivery history. Before submitting a PR that modifies this file, clear the Used Quotes block so your personal history is not included.

## Quote Bank
- "An investment in knowledge pays the best interest. — Benjamin Franklin"
- "The beautiful thing about learning is that no one can take it away from you. — B.B. King"
- "Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi"
- "The more that you read, the more things you will know. — Dr. Seuss"
- "Education is not the filling of a pail, but the lighting of a fire. — W.B. Yeats"
- "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch"
- "Anyone who stops learning is old, whether at twenty or eighty. — Henry Ford"
- "Learning never exhausts the mind. — Leonardo da Vinci"
- "Tell me and I forget. Teach me and I remember. Involve me and I learn. — Benjamin Franklin"
- "It does not matter how slowly you go as long as you do not stop. — Confucius"
- "Real learning comes about when the competitive spirit has ceased. — Jiddu Krishnamurti"
- "Every expert was once a beginner. — Helen Hayes"
- "Wisdom is not a product of schooling but of the lifelong attempt to acquire it. — Albert Einstein"
- "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. — Brian Herbert"
- "I am always doing what I cannot do yet, in order to learn how to do it. — Vincent van Gogh"
- "Study without desire spoils the memory, and it retains nothing that it takes in. — Leonardo da Vinci"
- "The only real mistake is the one from which we learn nothing. — Henry Ford"
- "You don't have to be great to start, but you have to start to be great. — Zig Ziglar"
- "The more I learn, the more I realize how much I don't know. — Albert Einstein"
- "In learning you will teach, and in teaching you will learn. — Phil Collins"
- "I never lose. I either win or I learn. — Nelson Mandela"
- "Develop a passion for learning. If you do, you will never cease to grow. — Anthony J. D'Angelo"
- "Education is the passport to the future, for tomorrow belongs to those who prepare for it today. — Malcolm X"
- "To learn is to change. Education is a process that changes the learner. — George B. Leonard"
- "Mistakes are proof that you are trying. — Unknown"
- "Push yourself, because no one else is going to do it for you. — Unknown"
- "Great things never came from comfort zones. — Neil Strauss"
- "The secret of getting ahead is getting started. — Mark Twain"
- "It always seems impossible until it's done. — Nelson Mandela"
- "You are never too old to set another goal or to dream a new dream. — C.S. Lewis"

## Used Quotes
<!-- vidbyte-motivate:used-start -->
<!-- vidbyte-motivate:used-end -->
