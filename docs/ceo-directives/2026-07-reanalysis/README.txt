DXB GLOBAL OS DIRECTIVE PACKAGE

1. Put the entire extracted folder in the DXB Global OS repository (preferably under /docs/ceo-directives/2026-07-reanalysis/).
2. The controlling machine-readable file is: 00_READ_FIRST_MASTER_DIRECTIVE.md
3. READ THE DOCX TOO — IT IS NOT DECORATION. This line used to call the DOCX
   "the formatted human-review copy", and that one sentence cost the project six
   sources. Measured 2026-08-02: the CEO edited
   DXB_GLOBAL_OS_CEO_MASTER_DIRECTIVE.docx on 2026-08-01 at 17:45, adding five
   reels and the cognee repository to his source list and removing one line from
   his starting command. The Markdown was NOT updated — he writes his amendments
   into the DOCX, because that is the file he opens. Sessions obeyed this README,
   read only the Markdown, and were eight hours late and six sources short with
   nothing on disk saying so.
   THE RULE: both carriers are read, and where they disagree the NEWER file wins
   under the authority order (.claude/CLAUDE.md section 1). The gate that now
   enforces it mechanically is tests/c42/rival-intel-ledger.test.ts — every
   source URL in EITHER carrier must own a row in the rival-intel ledger.
   Read the DOCX with:  unzip -p <file>.docx word/document.xml
   or:                  pandoc -f docx -t plain --wrap=none <file>.docx
4. The original raw ODT is preserved under /source/.
5. Evidence images are under /evidence/.
6. Start Claude Code with the exact command in Section 12 of the Markdown file
   — but take its wording from the DOCX if the two differ, per item 3.
