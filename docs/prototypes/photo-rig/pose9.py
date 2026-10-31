import json, numpy as np, cv2
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision
img=cv2.imread('/tmp/claude-0/-home-user-runner-coach/b6307a05-5ced-5933-8867-62bd2f792a89/images/2.webp')
if img is None:
    from PIL import Image; img=cv2.cvtColor(np.array(Image.open('/tmp/claude-0/-home-user-runner-coach/b6307a05-5ced-5933-8867-62bd2f792a89/images/2.webp').convert('RGB')),cv2.COLOR_RGB2BGR)
S=img.shape[0]//3
opts=vision.PoseLandmarkerOptions(base_options=mpp.BaseOptions(model_asset_path='/tmp/pose/pose_landmarker_heavy.task'),running_mode=vision.RunningMode.IMAGE)
det=vision.PoseLandmarker.create_from_options(opts)
out=[]; sheet=[]
names=['nose','l_eye_i','l_eye','l_eye_o','r_eye_i','r_eye','r_eye_o','l_ear','r_ear','mouth_l','mouth_r','l_sh','r_sh','l_el','r_el','l_wr','r_wr','l_pi','r_pi','l_in','r_in','l_th','r_th','l_hip','r_hip','l_kn','r_kn','l_an','r_an','l_he','r_he','l_ft','r_ft']
for i in range(9):
    r,c=divmod(i,3); cell=img[r*S:(r+1)*S,c*S:(c+1)*S].copy()
    rgb=cv2.cvtColor(cell,cv2.COLOR_BGR2RGB)
    res=det.detect(mp.Image(image_format=mp.ImageFormat.SRGB,data=rgb))
    if not res.pose_landmarks: print(i,'NO POSE'); out.append(None); sheet.append(cell); continue
    lm=res.pose_landmarks[0]
    out.append([[l.x*S,l.y*S,l.visibility] for l in lm])
    for l,n in zip(lm,names):
        p=(int(l.x*S),int(l.y*S)); 
        if n in('l_sh','r_sh','l_el','r_el','l_wr','r_wr','l_hip','r_hip','l_kn','r_kn','l_an','r_an','l_he','r_he','l_ft','r_ft','nose','l_ear','r_ear'):
            cv2.circle(cell,p,5,(0,0,255) if n[0]=='l' else (255,0,0) if n[0]=='r' else (0,200,0),-1)
    sheet.append(cell)
json.dump({'size':S,'names':names,'frames':out},open('/tmp/pose/landmarks.json','w'))
rows=[np.hstack(sheet[k*3:(k+1)*3]) for k in range(3)]
cv2.imwrite('/tmp/pose/overlay.jpg',cv2.resize(np.vstack(rows),(1254,1254)))
print('done',[o is not None for o in out])
