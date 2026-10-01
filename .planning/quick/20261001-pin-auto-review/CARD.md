# Score card — the pin check reads a changed tool and decides; it alerts either way

job: A tool whose text drifts is re-approved by the pin check only when the repository vouches for the exact new text (our dxb-mcp source, or the reviewed tool manifest), otherwise quarantined with a high alert; both texts are kept in the audit row and the alert reads in Turkish on his screen
range: 6139610f..HEAD
blast: 2
risk: 2
reasoning: 2
ambiguity: 2

why: gateway + a migration on the company's tool_pins + the scheduler's daily job + the alerts the CEO sees (several subsystems); security and database (the anti rug-pull guard is being loosened); classifying untrusted text against an adversary (stateful, adversarial); what may be re-approved without a person was left to us, and the first draft left the growth bound and the no-baseline case unresolved (ambiguity 2, after Sol's plan read: 8, critical, Sol xhigh).
