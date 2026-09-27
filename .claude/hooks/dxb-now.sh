#!/usr/bin/env bash
# UserPromptSubmit hook — THE CLOCK ON THE WALL.
# WHY: CEO 2026-09-27: sessions called a session one hour old 'dün akşam' and mapped 'dün' to a
# date two days back; no hook told them the time. This is a clock on the wall, not a rule.
#
# Two lines on every prompt: the local date-time with the weekday, when this session opened (the
# first "timestamp" in its transcript) and how long ago, and the absolute dates behind "dün",
# "evvelsi gün" and "geçen hafta bugün". bash builtins + grep + date only; no network, no python.
# Test overrides: DXB_NOW_EPOCH (unix seconds, replaces now) and DXB_NOW_TRANSCRIPT (replaces
# transcript_path); TZ is respected. It never fails the prompt: on any error it prints nothing.

DAYS=(Pazartesi Salı Çarşamba Perşembe Cuma Cumartesi Pazar)
MONTHS=(Ocak Şubat Mart Nisan Mayıs Haziran Temmuz Ağustos Eylül Ekim Kasım Aralık)

# day EPOCH -> REPLY="<Weekday> <D> <Month>", local time
day() {
  local u d m
  printf -v u '%(%u)T' "$1" && printf -v d '%(%-d)T' "$1" && printf -v m '%(%-m)T' "$1" || return 1
  REPLY="${DAYS[u-1]} $d ${MONTHS[m-1]}"
}

main() {
  local m="" tp="" ts="" start="" sess="" pre="" now H M S Y hm z noon today d1 d2 d7 el ago shm sd nd
  local re='"transcript_path"[[:space:]]*:[[:space:]]*"([^"]*)"'
  now=${DXB_NOW_EPOCH:-}
  [[ -n $now ]] || printf -v now '%(%s)T' -1
  [[ $now =~ ^[0-9]{1,12}$ ]] || return 1
  printf -v H '%(%-H)T' "$now" && printf -v M '%(%-M)T' "$now" && printf -v S '%(%-S)T' "$now" &&
    printf -v Y '%(%Y)T' "$now" && printf -v hm '%(%H:%M)T' "$now" && printf -v z '%(%Z)T' "$now" || return 1
  # Noon today, then whole days back: a DST day of 23 or 25 hours still lands on the right date.
  noon=$(( now - H*3600 - M*60 - S + 43200 ))
  day "$now" && today=$REPLY && day $(( noon - 86400 )) && d1=$REPLY &&
    day $(( noon - 2*86400 )) && d2=$REPLY && day $(( noon - 7*86400 )) && d7=$REPLY || return 1
  # Session start = the first "timestamp" in the transcript; none readable -> no session part.
  [[ -t 0 ]] || m=$(grep -a -m1 -o -E "$re")
  [[ ${m%%$'\n'*} =~ $re ]] && tp=${BASH_REMATCH[1]}
  tp=${DXB_NOW_TRANSCRIPT:-$tp}
  [[ -n $tp && -r $tp ]] && ts=$(grep -a -m1 -o '"timestamp":"[^"]*"' "$tp")
  ts=${ts%%$'\n'*}; ts=${ts#*:\"}; ts=${ts%\"}
  [[ -n $ts ]] && start=$(date -d "$ts" +%s)
  if [[ $start =~ ^[0-9]+$ ]] && (( now >= start )); then
    el=$(( now/60 - start/60 ))   # both floored to the minute: 16:52:45 -> 17:34:00 is 42 dk
    if (( el < 60 )); then ago="$el dk önce"; else ago="$(( el/60 )) sa $(( el%60 )) dk önce"; fi
    printf -v shm '%(%H:%M)T' "$start" && printf -v sd '%(%F)T' "$start" && printf -v nd '%(%F)T' "$now" || return 1
    [[ $sd != "$nd" ]] && day "$start" && pre="$REPLY "
    sess=" · bu oturum ${pre}${shm}'de açıldı ($ago)"
  fi
  printf '%s\n%s\n' "ŞU AN — $today $Y, $hm $z$sess · dün = $d1 · evvelsi gün = $d2 · geçen hafta bugün = $d7" \
    'Tarih söylerken hafta günü ve saatle söyle; "dün / akşam / az önce" önce yukarıdan mutlak tarihe çevrilir, sonra kayıt aranır; gece yarısından sonraki saat başladığı gecenin adıyla anılır (örn. "26 Eylül gecesi 02:36"); bir oturuma atıf, açıldığı tarih ve saatle yapılır.'
}

main 2>/dev/null || exit 0
exit 0
