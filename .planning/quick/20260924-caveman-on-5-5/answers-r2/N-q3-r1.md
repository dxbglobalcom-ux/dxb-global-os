# %50 kotada öncelik sıralaması

**Önce bir tempo kontrolü:** Bugün perşembe. Kotanız pazartesi civarı sıfırlandıysa %50 zaten normal tempo. Kalan günlere eşit bölmeniz yeterli, panik gerekmez.

## Öne alın

1. **Yarım kalmış altyapı işleri** (ör. `vps/provision` içinde tamamlanmamış adımlar)
   *Gerekçe:* Yarım provision edilmiş bir sunucu hem güvenlik hem tutarlılık riski taşır. Kota bitince ortada kalmak en pahalı senaryodur.
2. **Diğer işleri bloke eden işler**
   *Gerekçe:* Bunlar bittiğinde geri kalan işleri siz ya da daha ucuz araçlar yürütebilir.
3. **Yüksek bağlam gerektiren, bölünmesi pahalı işler**
   *Gerekçe:* Bağlam hazır kurulmuşken bitirin. Sonradan yeniden kurmak ek kota yer.
4. **Tasarım ve karar gerektiren işler** (mimari, plan, hata kök nedeni)
   *Gerekçe:* Model gücünün en çok değer kattığı yer burasıdır.

## Erteleyin veya ucuzlatın

- **Mekanik işler** (rename, format, boilerplate): `sed`, script ya da linter ile yapın veya Haiku/Sonnet'e verin.
- **Keşif amaçlı oturumlar ve uzun log okuma:** Önce `grep`/`tail` ile daraltın, sonra sadece ilgili kısmı paylaşın.
- **Geniş kapsamlı refactor ve review** (ör. `/code-review ultra`): Kota yenilendikten sonraya bırakın.

## Tasarruf taktikleri

- Uzayan oturumlarda `/compact` kullanın.
- Görevi net ve dar tanımlayın.
- Tüm repoyu değil, ilgili dosyaları verin.

İsterseniz `vps/provision` dizinine bakıp somut bir öncelik listesi çıkarabilirim.
