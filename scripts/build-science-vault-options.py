"""Attach reviewed multiple-choice distractors to the current Year 9 snapshot.

The snapshot uses the same curriculumTopics + per-topic supplements and Scientific
Skills questions, duplicate removal, yes/no filtering and clarifyQuestion wording
as app/page.tsx. It deliberately excludes app/2027 data. Each text row corresponds
to the question at that index in its topic and supplies two reviewed wrong answers.
"""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
path = root / 'public/science-vault/questions.json'
topics = json.loads(path.read_text())
for topic in topics:
    rows = (root / 'scripts/science-vault' / (topic['id'] + '.txt')).read_text().splitlines()
    assert len(rows) == len(topic['questions']), topic['id']
    for q, row in zip(topic['questions'], rows):
        wrong = row.split('|')
        assert len(wrong) == 2 and len(set([q['a'].casefold(), *[x.casefold() for x in wrong]])) == 3, q
        q['wrong'] = wrong
# Small grammatical repairs for the original open-response stems.
repairs = {
    'Name two properties define matter.': 'Which two properties define matter?',
    'Name two broad influences shape phenotype.': 'Which two broad influences shape phenotype?',
    'Name group 18 elements.': 'What name is given to Group 18 elements?',
}
for topic in topics:
    for q in topic['questions']:
        q['q'] = repairs.get(q['q'], q['q'])
        if topic['id'] == 'y9-forces' and q['q'].startswith('Compare the forces that a large object'):
            q['a'] = "The interaction forces on the two objects are equal in magnitude and opposite in direction."
path.write_text(json.dumps(topics, ensure_ascii=False, indent=2) + '\n')
print(f"Prepared {sum(len(t['questions']) for t in topics)} questions with three distinct choices each.")
