"""Give physical control legends explicit accessible team/timer names in source HTML."""
from pathlib import Path
import re,html

def plain(value):return ' '.join(html.unescape(re.sub('<[^>]*>',' ',value)).split())
def attribute(attrs,name,value):
 attrs=re.sub(r'\s'+re.escape(name)+r'="[^"]*"','',attrs)
 return attrs+' '+name+'="'+html.escape(value,quote=True)+'"'
for p in Path('dist').glob('*.html'):
 s=p.read_text()
 if 'class="console ' not in s:continue
 roto='data-profile="rotomatic"' in s
 side_counts={}
 def label_button(m):
  attrs,body=m.groups();key_match=re.search(r'data-(?:key|act)="([^"]+)"',attrs);key=key_match.group(1) if key_match else '';disabled=bool(re.search(r'\bdisabled\b',attrs));existing=re.search(r'aria-label="([^"]+)"',attrs);legend=plain(body)
  if disabled and (not legend or re.search(r'class="[^"]*\bunused\b',attrs)) :
   attrs=re.sub(r'\s+title="[^"]*"','',attrs);attrs=attribute(attribute(attrs,'aria-hidden','true'),'tabindex','-1');return '<button'+attrs+'>'+body+'</button>'
  if not key and not disabled:return m.group(0)
  name=plain(existing.group(1)) if existing else legend
  name=re.sub(r' \(unavailable in this training profile\)$','',name)
  name={'▲':'Menu up','▼':'Menu down','◀ MENU ▶':'Menu navigation left and right'}.get(name,name)
  if name=='left MENU right':name='Menu navigation left and right'
  if disabled and (p.stem=='hamilton2000' and legend in ['BONUS','POSSESSION'] or p.stem=='scoretec' and legend=='TIME OUT'):
   index=side_counts.get(legend,0);side_counts[legend]=index+1
   if not re.search(r'\b(home|guest)\b',name,re.I):name=('Home ' if index==0 else 'Guest ')+name
  if disabled and p.stem=='daktronics' and legend in ['TIME OUT ◀','TIME OUT ▶'] and not re.search(r'\b(home|guest)\b',name,re.I):name=('Home ' if '◀' in legend else 'Guest ')+name
  name=name.replace('←','left').replace('→','right').replace('◀','left').replace('▶','right')
  pen=re.match(r'pen:(home|guest):([01]):',key)
  if pen:name=pen.group(1).title()+' penalty timer '+str(int(pen.group(2))+1)+' '+legend
  elif roto and key in ['start','minute','timeReset']:name='Main timer '+legend
  else:
   side=next((t for t in key.split(':') if t in ['home','guest']),None)
   if side and not re.search(r'\b(home|guest|visitor)\b',name,re.I):name=side.title()+' '+name
  attrs=attribute(attrs,'aria-label',name+(' (unavailable in this training profile)' if disabled else ''))
  if disabled:attrs=attribute(attrs,'title',name+' — unavailable in this training profile. See Supported functions & limits.')
  return '<button'+attrs+'>'+body+'</button>'
 s=re.sub(r'<button([^>]*)>(.*?)</button>',label_button,s,flags=re.S)
 p.write_text(s)
