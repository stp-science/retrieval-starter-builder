"""Compile the reviewed, focus-aligned direct-question bank without changing legacy IDs."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
curriculum=json.loads((root/'app/2027/curriculum.json').read_text())
focuses={f['id']:f for t in curriculum['topics'] for f in t['focuses']}
questions={}
for number,line in enumerate((root/'scripts/data/2027-direct-questions.txt').read_text().splitlines(),1):
 if not line.strip() or line.startswith('#'):continue
 fields=line.split('|')
 if len(fields)!=4:raise ValueError(f'Line {number}: expected four fields')
 focus,style,prompt,answer=fields
 if focus not in focuses or style not in {'term','short','explain'}:raise ValueError(f'Line {number}: invalid focus/style')
 if '___' in prompt or not prompt or not answer:raise ValueError(f'Line {number}: invalid direct question')
 items=questions.setdefault(focus,[])
 items.append({'id':f'{focus}-s{200+len(items):03d}','focusId':focus,'q':prompt,'a':answer,'difficulty':'foundation' if style=='term' else 'stretch' if style=='explain' else 'core','kind':'explain' if style=='explain' else 'short','oneWord':style=='term' or (style=='short' and len(answer.rstrip('.').split())<=4 and not answer.lower().startswith(('yes','no')))})
missing=set(focuses)-questions.keys()
if missing:raise ValueError(f'Missing focuses: {sorted(missing)}')
(root/'app/2027/question-expansion.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2)+'\n')
print(f'Compiled {sum(map(len,questions.values()))} direct questions across {len(questions)} learning focuses.')
