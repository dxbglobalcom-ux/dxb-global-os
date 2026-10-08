# Fable'ın çapraz bakışı — Opus'un yarısı (W001–W063)

Bakılan: 63 satır (split-opus.jsonl son hâli; her satır üç geçişin özetiyle — ilk tur, gelir turu, lider notu — yan yana okundu). İtiraz: 6 satır (puan ya da öneri farkı). Kalan 57 satırda puan, öneri ve ayrım kabul.
Biçim: id · Opus t/g/h/öneri → Fable t/g/h/öneri · neden (kısa; tam gerekçe itiraz-fable.jsonl'da).

- W011 · 2/1/2/Araştır → 1/1/1/Araştır · İddialar ucuz modelin KOD düzenlemesi için; makine koda ucuz model yollamıyor (brain_floor), kod high'da Claude Code'da — ilerleme koşullu, 1. Araştır onun notu için kalır; '100x' depoda yok.
- W048 · 1/1/1/Araştır → 1/1/1/İzle · B34 Gemma/Qwen ile kurulu; alternatif motorun kazancı küçük ve ölçülmemiş; B33 kuyruğu kıt — zamanlamayacağımız ölçüm sözü verilmez.
- W053 · 1/1/1/Araştır → 1/1/1/İzle · 'İyi bak' bu okumayla cevaplandı; istemler sığ, buzz kurulmaz; tek fikir B17 yenilenince yarım saatlik sütun — araştırma nesnesi yok.
- W054 · 1/1/1/Araştır → 0/0/0/Gerek yok · README verisinden aritmetik: K3 int4 ≈ 1,4 TB, her token bütün katmanları diskten okur → ~280 s/token (5 GB/s); Colibri'nin 744B ölçümü (0,05–0,1 tok/s) aynı yönde. Ölçülmüş sayılır; test yalnız doğrular. K3 API şeridinde kalır.
- W058 · 2/1/2/Araştır → 1/1/1/İzle · B46 kurulu ve kapalı, cite-check var; fikirler küçük ek, benchmark yazarın kendi ölçümü, depo kurulmaz (STACK). B17 #3 satılırsa cite-check'e girer.
- W063 · 2/1/2/Araştır → 2/1/2/Dene · W002 ile aynı alet (find-skills) — Opus W002'yi Dene yazdı; iki satır tek hüküm taşımalı.

Metin notu (puan itirazı değil):
- W021 · Opus metni '/goal, /agents, /ultrareview bizim sürümde var mı — UNVERIFIED' diyor; ilk tur bunu ölçmüştü (zaten_var: 'oturum komut listesinde yerleşik' — /goal, /agents, /ultrareview, /loop). UNVERIFIED etiketi kalksın, ilk turun ölçümüne atıf yapılsın.
- W033/W039/W029/W041 · Opus'un STACK.md satır atıfları doğrulandı: satır 7 'OpenRouter primary + NVIDIA Build dev tier' kilitli karar; satır 123 'automaton, free-tier-stacking routers' dışlanmış. Çelişki yok.
