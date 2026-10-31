import subprocess, sys, os, re, xml.etree.ElementTree as ET
SRC=sys.argv[1]; OUT=sys.argv[2]
FRAMES=list(range(0,72,2)); FPS=29.97; STEP=2
SVG='http://www.w3.org/2000/svg'; INK='{http://www.inkscape.org/namespaces/inkscape}label'
ET.register_namespace('',SVG)
tmp='/tmp/lotframes'; os.makedirs(tmp,exist_ok=True)
trees={}
for f in FRAMES:
    p=f'{tmp}/f{f}.svg'
    subprocess.run(['/tmp/venv/bin/python','-I','/tmp/venv/bin/lottie_convert.py',SRC,p,'--frame',str(f)],check=True,capture_output=True)
    trees[f]=ET.parse(p).getroot()
def drop_solid(r):
    for par in list(r.iter()):
        for c in list(par):
            if c.get(INK)=='White Solid 1': par.remove(c)
for r in trees.values(): drop_solid(r)
base=trees[FRAMES[0]]
def walk(e,path=()):
    # yield (path, element) for every <g> with a transform
    for i,c in enumerate(e):
        if c.tag==f'{{{SVG}}}g':
            yield path+(i,),c
            yield from walk(c,path+(i,))
def index(root): return dict(walk(root))
idx={f:index(r) for f,r in trees.items()}
paths=list(idx[FRAMES[0]].keys())
bad=[f for f in FRAMES if list(idx[f].keys())!=paths]
if bad: print('STRUCTURE DIFFERS at frames',bad); 
nums=re.compile(r'matrix\(([^)]*)\)')
def mat(g):
    m=nums.match(g.get('transform','')); 
    return [float(x) for x in m.group(1).replace(',',' ').split()] if m else None
css=[]; n=0
dur=len(FRAMES)*STEP/FPS
for k,pth in enumerate(paths):
    g0=idx[FRAMES[0]][pth]
    ms=[mat(idx[f][pth]) if pth in idx[f] else None for f in FRAMES]
    if any(m is None for m in ms): continue
    for f in FRAMES: 
        pass
    if all(m==ms[0] for m in ms): continue
    gid=f'p{k}'; g0.set('id',gid)
    steps=[]
    for i,m in enumerate(ms+[ms[0]]):
        pct=100*i/len(ms)
        steps.append(f'{pct:.2f}%{{transform:matrix({",".join(f"{v:.4f}" for v in m)})}}')
    css.append(f'#{gid}{{animation:a{k} {dur:.3f}s linear infinite}}@keyframes a{k}{{{"".join(steps)}}}')
    n+=1

# ---- SMIL for path morphs and opacity (all elements, positional match)
def allel(e,path=()):
    for i,c in enumerate(e):
        yield path+(i,),c
        yield from allel(c,path+(i,))
aidx={f:dict(allel(r)) for f,r in trees.items()}
apaths=list(aidx[FRAMES[0]].keys())
same=all(list(aidx[f].keys())==apaths for f in FRAMES)
print('full structure same:',same)
nm=0
for pth in apaths:
    e0=aidx[FRAMES[0]][pth]
    for attr in ('d','opacity','fill-opacity','fill'):
        vals=[aidx[f][pth].get(attr) for f in FRAMES]
        if any(v is None for v in vals) or len(set(vals))==1: continue
        an=ET.SubElement(e0,f'{{{SVG}}}animate')
        an.set('attributeName',attr); an.set('dur',f'{dur:.3f}s'); an.set('repeatCount','indefinite')
        an.set('values',';'.join(vals+[vals[0]])); an.set('calcMode','linear')
        nm+=1
print('smil animates',nm)
for e in base.iter():
    for a in list(e.attrib):
        if a.startswith('{http://www.inkscape.org') or a.startswith('{http://sodipodi'): del e.attrib[a]
style=ET.Element(f'{{{SVG}}}style'); style.text='@media (prefers-reduced-motion:reduce){*{animation:none!important}}'+''.join(css)
base.insert(0,style)
ET.ElementTree(base).write(OUT,encoding='utf-8',xml_declaration=True)
print('animated groups',n,'duration s',round(dur,2),'bytes',os.path.getsize(OUT))
