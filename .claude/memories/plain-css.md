---
name: Plain CSS, no CSS framework
description: The web UI is styled with plain CSS and colour variables mimicking the slide deck; no CSS framework or utility classes
metadata:
  type: project
---

The web UI is styled with plain CSS, using colour and font variables, to mimic the project's slide deck.

**Why:** a small UI like this one reads better on slides with semantic class names than with utility classes, and no framework keeps the build simpler.

**How to apply:** don't add a CSS framework or utility-class markup. Gold marks the main action, red marks danger (delete). Lavender was tried as a third accent colour and rejected because it didn't fit the deck. On the Game screen the game's name sits inside the game window, while other screens put their title above the content; that's deliberate, so don't "fix" it for consistency.
