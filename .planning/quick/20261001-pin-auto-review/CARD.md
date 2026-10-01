# Score card — the pin check reads a changed tool and decides; it alerts either way

job: A tool whose text drifts is re-approved by the pin check when the change reads clean, quarantined with a high alert when it does not; the approved text is stored so the change itself is judged and shown
range: 6139610f..HEAD
blast: 2
risk: 2
reasoning: 2
ambiguity: 1

why: gateway + a migration on the company's tool_pins + the scheduler's daily job + the alerts the CEO sees (several subsystems); security and database (the anti rug-pull guard is being loosened); classifying untrusted text against an adversary (stateful, adversarial); "reads clean" is a judgment the CEO left to us.
