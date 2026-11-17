import os, shutil, subprocess, sys, re
repo='/home/dxb/DxB Global OS'; base=sys.argv[1]
seats={'cine':'personas/media-studio/media-cinematographer.md','sound':'personas/media-studio/media-sound-music.md','screen':'personas/media-studio/media-screenwriter.md','vfx':'personas/media-studio/media-vfx-post.md','cd':'personas/media-studio/media-creative-director.md','sb':'personas/media-studio/media-storyboard-previz.md','fd':'personas/media-studio/media-film-director.md','ave':'personas/media-studio/media-ai-video-engineer.md','coach':'personas/marketing/marketing-short-video-editing-coach.md','ipe':'personas/design/design-image-prompt-engineer.md','ci':'personas/media-studio/media-character-identity.md'}
def add(line): return lambda s: s.replace('\n## 2.', '\n'+line+'\n\n## 2.', 1)
def sub(a,b): return lambda s: s.replace(a,b)
M=[('M0 no mutation (must pass)',None,None,0),
 ('M1 Flux doctrine returns','cine',add('For a local-engine take Flux is not used at all.'),1),
 ('M2 only-voice returns','sound',add("The engine's own generated voice is the only voice."),1),
 ('M3 no voice-over returns','screen',add('No voice-over is written for any piece.'),1),
 ('M4 1080 ceiling returns','vfx',add('1080p is the ceiling the CEO chose for UGC.'),1),
 ('M5 engine-by-engine lost','cd',sub('decided engine by engine','decided case by case'),1),
 ('M6 voice criterion lost','sound',sub('cannot be told from a person','sounds fine'),1),
 ('M7 no-face rule returns','sb',add('No face is drawn outside the engine.'),1),
 ('M8 four-step standard returns','fd',add('The studio standard is 4 sampling steps for a keeper.'),1),
 ('M9 only-when-he-asks returns','ave',add('A film is enlarged only when he asks.'),1),
 ('M10 never-a-TTS returns','coach',add('A studio piece carries never a TTS track.'),1),
 ('M11 asked-at-that-job lost','vfx',sub('asked at that job','done when wanted'),1),
 ('M12 enlarging before his eye','cd',add("The film is enlarged before the CEO's eye sees it."),1),
 ('M13 presenters-from-drawings returns (Sol A1)','fd',add('The seat accepts zero client-facing presenters from drawings.'),1),
 ('M14 drawn client-facing human returns (Sol A1)','ci',add('A drawn client-facing human is refused.'),1),
 ('M15 external-routes-only returns (Sol A2)','ipe',add('The still engine is kept for the external routes only.'),1),
 ('M16 one chosen source is today rule (Sol B2, must pass)','sound',add('The winning clone is the only voice on this shot.'),0),
 ('M17 consent condition is today rule (Sol B2, must pass)','sound',add('No cloned voice without recorded consent is used.'),0),
]
ok=True
for name,seat,fn,want in M:
    root=os.path.join(base,'mut'); shutil.rmtree(root,ignore_errors=True)
    for d in ('personas/media-studio','personas/design','personas/marketing'):
        os.makedirs(os.path.join(root,d))
    for f in os.listdir(repo+'/personas/media-studio'): shutil.copy(f'{repo}/personas/media-studio/{f}', f'{root}/personas/media-studio/{f}')
    shutil.copy(f'{repo}/personas/design/design-image-prompt-engineer.md', f'{root}/personas/design/')
    shutil.copy(f'{repo}/personas/marketing/marketing-short-video-editing-coach.md', f'{root}/personas/marketing/')
    if seat:
        fp=os.path.join(root,seats[seat]); s=open(fp).read(); t=fn(s); assert t!=s, name; open(fp,'w').write(t)
    r=subprocess.run(['pnpm','vitest','run','tests/b43/road-consistency.test.ts'],cwd=repo,env={**os.environ,'DXB_ROAD_TEST_ROOT':root,'DXB_ENGINE_LOCK_WAIT':'200'},capture_output=True,text=True)
    m=re.search(r'Tests\s+(?:(\d+) failed \| )?(\d+) passed',r.stdout); failed=int(m.group(1) or 0) if m else -1
    good=(failed==0) if want==0 else (failed>=1)
    ok&=good; print(f"{'OK ' if good else 'BAD'} {name}: failed={failed}")
print('MUTATION_PROOF', 'ALL_BITE' if ok else 'HOLES')
