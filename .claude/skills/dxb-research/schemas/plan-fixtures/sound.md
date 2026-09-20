dert: |
  codex'in 200 dolarlık paketinde %50 astra sınırı yok ama fable 5.1'de var. Dün bir iş
  yaptık, haftalık hemen %13'e çıktı. Ne yapmalıyım?
dil: [tr, en]
alt_sorular:
  - id: S1
    soru: "Dün hangi iş haftalık kotayı %13'e çıkardı?"
    etiket: MAKINE
    komut: "bash scripts/probe.sh"
  - id: S2
    soru: "Claude Max 20x kullanım limiti Pro'nun kaç katı?"
    etiket: DISARIDA
    kisa: "Claude Max 20x limits"
    diller: [en]
    silah: [crowd, measure]
    kabul: "≥3 bağımsız kaynak aynı sayıyı veriyor"
  - id: S3
    soru: "Fable 5.1'i bırakmalı mıyım?"
    etiket: ONUN_KARARI
    soru_ona: "Ölçüm A'yı gösteriyor; Codex'e 200 dolar daha verilsin mi?"
