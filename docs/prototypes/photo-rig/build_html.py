import json,sys
d=json.load(open(sys.argv[1])); out=sys.argv[2]
# durasi (detik) dari pose i ke i+1; pose 8 kembali ke pose 0 (loop)
dur=[0.7,0.5,0.45,0.35,0.35,0.35,0.35,0.5,0.6]
html=open(sys.argv[3]).read().replace('__DATA__',json.dumps(d)).replace('__DUR__',json.dumps(dur))
open(out,'w',encoding='utf-8').write(html)
