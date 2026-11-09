"""Create a WebP derivative using an existing Pillow installation; never overwrite."""
import argparse,json
from pathlib import Path
from PIL import Image,ImageOps
p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--output',required=True);p.add_argument('--lossless',action='store_true');a=p.parse_args()
src=Path(a.input).resolve();dst=Path(a.output).resolve()
if src==dst or dst.exists() or dst.suffix.lower()!='.webp':raise SystemExit('Choose a NEW .webp output path; source and existing files are preserved.')
with Image.open(src) as original:
 if getattr(original,'n_frames',1)!=1:raise SystemExit('Animated assets need separate handling.')
 im=ImageOps.exif_transpose(original);before=im.size
 if im.height>1080:im=im.resize((max(1,round(im.width*1080/im.height)),1080),Image.Resampling.LANCZOS)
 if im.mode not in ('RGB','RGBA'):im=im.convert('RGBA' if 'transparency' in im.info else 'RGB')
 dst.parent.mkdir(parents=True,exist_ok=True)
 with dst.open('xb') as f:im.save(f,'WEBP',quality=85,method=6,exact=True,lossless=a.lossless)
 print(json.dumps({'input':str(src),'output':str(dst),'before':before,'after':im.size,'bytes':dst.stat().st_size,'losslessEncoding':a.lossless}))
