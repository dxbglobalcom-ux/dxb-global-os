# B72 off-site home — measured 2026-11-22 (read-only helper)

## The job today (scripts/backup/laptop-pg-dump.sh)
- BACKUP_DEST read from ~/.config/dxb/backup.env (unit: EnvironmentFile=-%h/.config/dxb/backup.env); file does NOT exist today (ls: No such file).
- copy_offsite (lines 116-130): only arm is `*:*` -> offsite_by_scp (lines 109-114: scp up, scp back, cmp every byte). Empty -> offsite=unset -> OFFSITE_FAIL + non-zero exit (line 138).
- A new destination kind = one new function + one case arm (comment lines 105-108).

## This machine (commands run today)
- `command -v`: rclone MISSING, age MISSING, restic MISSING, rustic MISSING; gpg 2.4.8 present; curl 8.18.0; sha1sum present; zstd, openssl present; python3 present, boto3 absent.
- gpg keyring: 0 public, 0 secret keys.
- ~/.config/rclone: absent; `rclone listremotes`: no rclone.
- `gh auth status`: logged in to github.com (keyring), scopes gist, read:org, repo, workflow.
- Tailscale 1.104.1, userspace mode (socket /run/user/1000/tailscaled.sock, SOCKS5 127.0.0.1:1055). Peers: this desktop + one Android phone (active).
- `adb devices` (via phone-adb-forward.service 127.0.0.1:15555): device OFFLINE at measurement time.
- ~/backups/dxb = 361M (du). Disk 1.2T free.

## Candidates (pages read today with fetch.py; files in scratchpad/pages*)
| candidate | free today | stops at owner | tool here | proof | anti-erasure (free) | paid 1 GB / 10 GB | source |
|---|---|---|---|---|---|---|---|
| Backblaze B2 | first 10 GB always free; class A/B/C calls free | sign-up click (+captcha); "No credit card required" read on sign-up page | curl (native API) — or rclone if installed | upload carries X-Bz-Content-Sha1, B2 checks it; list returns size+contentSha1; readback+cmp (egress free to 3x stored) | Object Lock governance/compliance, no extra cost; bucket key without deleteFiles; lifecycle keeps versions | $0 / $0 (inside 10 GB); beyond $6.95/TB = $0.007/GB | backblaze.com/cloud-storage/pricing, /docs/cloud-storage-object-lock, /docs/cloud-storage-application-keys, /apidocs/b2-upload-file, /sign-up/cloud-storage |
| Cloudflare R2 | 10 GB-month, 1M class A, 10M class B, egress free | sign-up + "checkout flow to add an R2 subscription" (payment method: UNVERIFIED but implied) | rclone/aws-cli needed (absent) | HeadObject/ListObjects size+ETag | Bucket locks (retention, or indefinite) | $0.015 / $0.15 per month (beyond free) | developers.cloudflare.com/r2/pricing/, /r2/get-started/, /r2/buckets/bucket-locks/ |
| Google Drive via rclone | 15 GB shared with Gmail/Photos | one OAuth consent click | rclone (absent) | rclone lsl / md5 | Trash only; OAuth token can delete permanently; versions UNVERIFIED | Google One 100 GB €1.99/mo (price localized to this machine's region) | one.google.com/about/plans, rclone.org/drive/ |
| GitHub private repo release | no limit on total release size; each file < 2 GiB; 1000 assets/release | NOTHING — gh already logged in | gh (present) | gh release view --json assets (size, digest UNVERIFIED) | none: token has `repo` scope; immutable releases UNVERIFIED | no paid storage needed | docs.github.com …/about-releases, …/about-large-files-on-github |
| Koofr | 10 GB free forever, "No credit card required" | sign-up click | rclone (absent) / WebDAV via curl | listing size/hash UNVERIFIED | trash/versions UNVERIFIED | paid 10 GB 0.5 EUR/mo | koofr.eu/pricing/ |
| Oracle Cloud | 20 GB object+archive always free | sign-up + credit/debit card required (read: "Why do I need to provide credit or debit card") | oci-cli/rclone (absent) | listing | retention rules UNVERIFIED | UNVERIFIED | oracle.com/cloud/free/, docs.oracle.com …Always_Free_Resources |
| iDrive e2 | "Try with 10GB Free" (trial nature UNVERIFIED) | sign-up | rclone (absent) | listing | object lock UNVERIFIED | min $6/TB charged per TB: $6 / $6 per month | idrive.com/s3-storage-e2/pricing |
| Storj | 30-day trial only, no card | sign-up | rclone/uplink (absent) | listing | UNVERIFIED | $5/month minimum floor: $5 / $5; 30-day min retention | storj.io/pricing |
| Google Cloud Storage | 5 GB-months, US regions only | billing account (card UNVERIFIED) | absent | — | — | — | cloud.google.com/free/docs/free-cloud-features |
| Phone over Tailscale (ADB) | free, phone storage | Wireless debugging re-enable after phone restart (pairing code if pairing lost) | adb (present) | adb shell sha256sum UNVERIFIED (offline) | none | — | measured: adb offline today |

## Recommendation: Backblaze B2 (primary) + GitHub private release (second leg)
Reasons: free 10 GB holds ~400 nightly 25 MB copies with no card; proof is native (server-verified SHA1 + list size/sha1 + readback cmp, same shape as offsite_by_scp); the only free tier read today with BOTH object lock and a key that cannot delete; works with curl already here, nothing to install; global vendor.
Weakest point: owner identity root. B2 account login must be recoverable without this machine — stored in his Google account's password manager (UNVERIFIED that this is how he wants it); and the gpg private key must live off-machine (his Google Drive + his phone). One vendor; beyond 10 GB costs $0.007/GB-month.
Encryption: gpg 2.4.8 public-key mode — the machine keeps ONLY the public key, so a compromised machine cannot decrypt the history; the private key never stays here.

## Steps (H = stops at the owner)
1. Lead: generate gpg keypair in a temporary GNUPGHOME; export public key to ~/.config/dxb; export private key file.
2. H (click): Google OAuth consent / or operator places private-key file into his Google Drive via browser he is signed into; second copy pushed to phone when ADB online. Delete private key from this machine.
3. H (click): Backblaze sign-up "Get Started Free" + captcha; operator types email/password in his browser; password saved to his Google password manager (H: save click). Email verification click (UNVERIFIED that one is sent).
4. Lead/operator: create bucket (private, Object Lock enabled, default retention e.g. 30 d), lifecycle keep all versions; create bucket-restricted app key: listFiles, readFiles, writeFiles (no deleteFiles). Key into backup.env (never printed).
5. Lead: add offsite_by_b2 (encrypt -> upload with sha1 -> list verify size+sha1 -> download readback cmp) + case arm; tests.
6. Lead: second leg offsite_by_gh (gh release upload of the .gpg to a private repo; verify asset size). Zero owner steps.
7. Lead: restore drill from the off-site copy on a clean dir using the off-machine private key (needs step 2 copy). 

## Not verified
B2 sign-up fields and any phone/email verification; Google sign-in on B2; R2 card; Google Drive revision/trash retention; GitHub immutable releases and asset digest; Oracle/iDrive/Storj/Koofr lock & versioning; Oracle paid price; phone free space & sha256sum (adb offline).
