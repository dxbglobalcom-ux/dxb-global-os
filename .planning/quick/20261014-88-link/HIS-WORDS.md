# His words in session 8 (2026-10-14), verbatim — to apply when the board is written

- ~21:00, on "the first row makes the company breathe" (board line 2, which put ORDER rank 9 "morning jobs catch up" early):
  "Yok ya, o yanlış anlaşılmış. İlk iş şirkete nefes aldırmak dediğim işte bu aslında. Her şeyi ilk iş her şeyi
  tamamıyla bitirmek, ondan sonra çalıştırmak anlamında dedim."
  Before it: every part is tested on the bench and fitted, not run; the key is turned once, at the end, and
  everything starts together ("Her şey takılır, her parça test edilir, takılır. En sonunda marşa basılır.").
  → Board line 2 is rewritten to his meaning (LAW A); rank 9 (Y6) moves to the end, into the handover.
  Permanence of the bench rule: asked, his answer pending.
- Question 3 (machine awake at night): our recommendation changed to NO; his answer pending.
- Question 2 (DB door): "tmm yap. ama daha önce sorularımı cvpla bitince yaparsın ok."
- ~21:10, on the bench rule and stopping the company's own engine (dxb-scheduler) until the handover, in the same
  restart as the DB door, after his questions; the factory's tools (backup, board page, operator, research Chrome,
  guards, vitrin) keep running: "Evet, önerini kabul ediyorum. Kalıcı olsun tabii ki."
  Before it: "Tamam, döndüğü test edildi … Kenara konur. … Sürekli çalıştırma halinde bırakılmaz ki." and
  "Ya para harcayıp harcamaması önemli mi?" (the cost measurement dropped).
  → PERMANENT (his word): every part is tested on the bench, fitted, set aside — not left running; the key is turned
  once at the end and everything starts together. Register in ceo-approvals.json; board line 2 rewritten.
- ~21:15, two additions to the permanent bench rule:
  (a) the construction never stops — "İnşaatla ilgili hiçbir şey durmasına gerek yok. Biz Ferrari'nin kendisinden
      bahsediyoruz. Yani holdingin kendisinden. Dijital holdingin. Her şeyiyle beraber A'dan Z'ye."
  (b) before the key is handed over, the whole car runs once end to end on the bench (the construction copy) —
      parts that passed alone can misfit together, or drift while set aside: "evet, bunu da kurala ekle".
- ~21:25, on going to sleep: "Her şeyi toparlayıp komple tamamlamanı istiyorum bir orkestratör ve yönetici olarak.
  Excel dosyasıyla vesaireyle iyi, yani ne yapman gerekiyorsa biliyorsun sen. Tamam mı?"
- ~21:30, page questions 3 and 4: "Evet, üçüncü soru doğru. Dördüncü soru için de önerine evet."
  → Q3: the machine does NOT stay awake at night; the morning jobs go to the end, into the handover.
  → Q4: the two reports in ~/Desktop/İNCELEMELER/ (Anthropic-Konusmasi-Raporu.md, Theo-Video-Raporu.md) are read
    too and feed the same merge.
- Q2 (DB door): measured 2026-10-14 ~20:58 — already shut in the kernel since 2026-08-24 (dxb-company-wall,
  table inet dxb_wall, chain company_front_door, loaded at boot 07:48:39). A throwaway container on the bridge
  network (the August method): 54322/54321/54422/54421 → refused. R1's F-R1-1 login ran from this machine itself,
  whose own traffic never crosses PREROUTING — a false positive. No restart was needed.
- The company's own engine stopped on his yes: `systemctl --user disable --now dxb-scheduler.service` →
  inactive, disabled (2026-10-14 ~21:20). The construction's tools all active.
