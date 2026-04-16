# Ethical Commitments

The AI Regression Database operates under the following ethical requirements:

1. **NO AI TOOL SHAMING**
   The database documents patterns, not rankings. Every AI tool has failure modes. The database is neutral infrastructure. Avoid "Which AI is worst" framing completely.

2. **REPRODUCIBILITY OVER ANECDOTES**
   Every pattern must include reproduction steps. If a claimed pattern cannot be reproduced at least 3 out of 10 attempts, it is rejected. Subjective complaints are not patterns.

3. **VERSION AWARENESS**
   AI tools improve. A pattern that existed in Copilot v1.100 may be fixed in v1.200. The database tracks this. When a vendor fixes a pattern, the entry is updated with "fixed in version X." This is public recognition of vendor improvement.

4. **NO ADVERSARIAL USE**
   Patterns are documented for defensive purposes. Do not publish patterns that exist specifically to trick AI tools into producing harmful code. The focus is on patterns that emerge in normal developer workflows, not jailbreaking research.

5. **CONTRIBUTOR ATTRIBUTION**
   Every pattern credits its contributor (unless anonymous). This motivates community contribution and gives practitioners professional credit for their observations.

6. **VENDOR NOTIFICATION**
   When a new pattern is confirmed, the AI tool vendor is notified 7 days before publication. Shorter than AICI (14 days) because regression patterns are less sensitive than security incidents. Vendor can provide a response that is published alongside the pattern.
