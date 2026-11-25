"""Two films of one account side by side with Turkish captions. usage: yan_yana.py <out.mp4> <lose.mp4> <win.mp4> <title> <subtitle> <left> <left number> <right> <right number> [seconds]"""
import os, subprocess, sys, tempfile
out, lose, win, t, t2, a, a2, b, b2 = sys.argv[1:10]
D = sys.argv[10] if len(sys.argv) > 10 else '6.8'
fm = lambda q: subprocess.run(['fc-match', '-f', '%{file}', q], capture_output=True, text=True).stdout
font, font2 = fm('Noto Sans:bold'), fm('Noto Sans')
P = tempfile.mkdtemp()
for k, v in dict(t=t, t2=t2, a=a, a2=a2, b=b, b2=b2).items():
    open(f'{P}/{k}.txt', 'w').write(v)
dt = lambda k, x, y, s, c, f: f"drawtext=fontfile='{f}':textfile='{P}/{k}.txt':x={x}:y={y}:fontsize={s}:fontcolor={c}"
fc = ("[0:v]scale=520:924:force_original_aspect_ratio=increase,crop=520:924,setsar=1[l];[1:v]scale=520:924:force_original_aspect_ratio=increase,crop=520:924,setsar=1[r];"
      f"color=c=0x0d1117:s=1080x1350:r=30:d={D}[bg];[bg][l]overlay=12:220[x];[x][r]overlay=548:220[y];[y]"
      + dt('t', '(w-text_w)/2', 50, 58, 'white', font) + ',' + dt('t2', '(w-text_w)/2', 130, 38, '0xc9d1d9', font2) + ','
      + dt('a', '12+(520-text_w)/2', 1170, 36, 'white', font) + ',' + dt('a2', '12+(520-text_w)/2', 1232, 44, '0x8b949e', font) + ','
      + dt('b', '548+(520-text_w)/2', 1170, 36, 'white', font) + ',' + dt('b2', '548+(520-text_w)/2', 1232, 44, '0xffb020', font) + '[v]')
p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-t', D, '-i', lose, '-t', D, '-i', win, '-filter_complex', fc, '-map', '[v]', '-map', '1:a?', '-t', D, '-c:v', 'libx264', '-preset', 'medium',
                    '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', out], capture_output=True, text=True)
print(p.stderr[-300:], os.path.getsize(out))
