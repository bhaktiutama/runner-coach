import json, math, statistics as st
d=json.load(open('/tmp/pose/landmarks.json')); N=d['names']; F=d['frames']
def P(f,n):
    i=N.index(n); return (f[i][0],f[i][1])
def avg(f,a,b):
    pa,pb=P(f,a),P(f,b); return ((pa[0]+pb[0])/2,(pa[1]+pb[1])/2)
def ang(a,b): return math.degrees(math.atan2(b[0]-a[0],b[1]-a[1]))   # 0 = down, +90 = forward (right)
def dist(a,b): return math.hypot(a[0]-b[0],a[1]-b[1])
rows=[]; L={k:[] for k in('torso','ua','fa','th','sh','ft','head','hd')}
for f in F:
    sh=avg(f,'l_sh','r_sh'); el=avg(f,'l_el','r_el'); wr=avg(f,'l_wr','r_wr')
    hip=avg(f,'l_hip','r_hip'); kn=avg(f,'l_kn','r_kn'); an=avg(f,'l_an','r_an')
    toe=avg(f,'l_ft','r_ft'); heel=avg(f,'l_he','r_he')
    ear=avg(f,'l_ear','r_ear'); nose=P(f,'nose'); hc=((ear[0]+nose[0])/2,(ear[1]+nose[1])/2)
    rows.append(dict(ank=an[1],torso=ang(hip,sh),head=ang(sh,hc),ua=ang(sh,el),fa=ang(el,wr),th=ang(hip,kn),sh=ang(kn,an),ft=ang(an,toe),
        low=0))
    for k,v in dict(torso=dist(hip,sh),ua=dist(sh,el),fa=dist(el,wr),th=dist(hip,kn),sh=dist(kn,an),ft=dist(an,toe),head=dist(sh,hc),hd=dist(ear,nose)).items(): L[k].append(v)
len_={k:round(st.median(v),1) for k,v in L.items()}
ground=st.median([r['ank'] for i,r in enumerate(rows) if i!=4])
for r in rows:
    r['lift']=round(max(0,ground-r['ank']),1); r['lift']=r['lift'] if rows.index(r)==4 else 0; del r['ank']; r['torso']=r['torso']+360 if r['torso']<0 else r['torso']
    for k in ('torso','head','ua','fa','th','sh','ft'): r[k]=round(r[k],1)
    del r['low']
print('lengths',len_); print('ground',round(ground,1))
for i,r in enumerate(rows): print(i,r)
json.dump({'lengths':len_,'keys':rows},open('/home/user/runner-coach/docs/prototypes/photo-rig/jump-squat.angles.json','w'),indent=1)
