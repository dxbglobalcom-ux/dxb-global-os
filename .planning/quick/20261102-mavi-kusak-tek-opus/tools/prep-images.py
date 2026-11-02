import sys, glob, os
from PIL import Image
D='/home/dxb/tools/ComfyUI/output/scrollcraft/proje-mavi-kusak-cini-2026-10-28'
out=sys.argv[1]
m={
'hero':('da4bff10',2200),'atolye-ic':('05d45b80',1800),
'usta-eller':('408c8ee1',1100),'kuvars':('461bd9c7',1100),'silkme':('bb521528',1100),'mercan':('0dc2e72e',1100),'arka':('6e3aca58',1100),'sir-yakin':('da5d183b',1100),
'karo':('c700101e',1200),'kusak':('718ed845',2400),
'd-lale':('1a468f53',900),'d-karanfil':('436990ff',900),'d-sumbul':('5bda1cd7',900),'d-hatayi':('29d8fce5',900),'d-rumi':('9e584a15',900),'d-saz':('90e47deb',900),
'p01':('69bbbdc2',1100),'p02':('6df5bca4',1100),'p03':('9e85ac9b',1100),
'p04':('a99e4f82',1100),'p05':('ba661870',1100),'p06':('2a9ed9df',1100),
'p07':('0b72a81c',1100),'p08':('d57e2a51',1100),'p09':('08cb2117',1100),
'p10':('45875130',1100),'p11':('385403ca',1100),'p12':('c074ea9f',1100),
's-hamur':('8c18af95',1100),'s-desen':('86b5047f',1100),'s-boyama':('bedbd796',1100),'s-sir':('0b44bf7b',1100),'s-firin':('540676a3',1100),
'm-somine':('5bdf4539',1100),'m-resepsiyon':('ffc4e7ff',1100),'m-tabak':('251e4aa6',1100),
}
for k,(h,w) in m.items():
    f=glob.glob(f'{D}/**/sc_{h}*.png',recursive=True)[0]
    im=Image.open(f).convert('RGB')
    if im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    im.save(f'{out}/img/{k}.webp','WEBP',quality=80,method=6)
print('ok',len(m))
