import json,re
from pathlib import Path
from collections import Counter
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parent
content=json.loads((R/'content.json').read_text());nav=json.loads((R/'navigation.json').read_text())
soup=BeautifulSoup((R/'Quadra_Website_Review.html').read_text(),'html.parser')
ids=[t['id']for t in soup.find_all(id=True)];dups=[k for k,v in Counter(ids).items()if v>1]
assert not dups,dups
missing=[]
for a in soup.select('a[href^="#"]'):
 if a['href'][1:]not in ids:missing.append(a['href'])
assert not missing,missing
scripts=soup.find_all('script')
assert len(scripts)==1 and not scripts[0].has_attr('src')
assert scripts[0].get_text().strip()==(R/'menu.js').read_text().strip()
assert not re.search(r'fetch\(|XMLHttpRequest|localStorage|sessionStorage|eval\(',scripts[0].get_text())
assert not soup.find_all('img')
assert not soup.find_all('iframe')
for t in soup.find_all(True):
 assert not any(k.lower().startswith('on')for k in t.attrs),t.name
for t in soup.find_all(['input','textarea','select','button']):
 if not t.has_attr('data-menu-close'):assert t.has_attr('disabled'),str(t)[:100]
assert soup.find('meta',attrs={'name':'robots'})['content']=='noindex, nofollow'
css=''.join(t.get_text()for t in soup.find_all('style'))
assert not re.search(r'animation\s*:|transition\s*:|@keyframes',css)
assert not re.search(r'@import|url\(',css)
assert ':target' in css and ':has(' in css
homepage=soup.find(id='home').get_text(' ',strip=True)
assert '21 Years of Global Recognition'in homepage
assert not re.search(r'Microsoft|Azure|\bAWS\b|Google|Anthropic|OpenAI|consecutive|unbroken',homepage,re.I)
assert 'Happy Customers'in soup.get_text()
# Original case text is preserved exactly in the sample and never replaced with new claims.
core=json.loads((R/'core_pages.json').read_text())['pages']
a=next(p for p in core if p['id']=='happy-customers')['existing_case_sample']
b=next(p for p in content['pages']if p['id']=='happy-customers')['existing_case_sample']
assert a==b
for p in content['pages']:
 if p.get('practice')=='CSG':
  visible=' '.join([p.get('intro','')]+[s.get('body','')for s in p.get('sections',[])])
  for sentence in re.split(r'(?<=[.!?])\s+',visible):
   if re.search(r'Microsoft',sentence) and not any(x in sentence.lower()for x in ['non-microsoft','separate microsoft','microsoft-specific','distinct','cross-link']):
    raise AssertionError('Review CSG boundary sentence: '+sentence)
actualids={p['id']for p in content['pages']}
assert {'azure','csg','google-cloud','aig','microsoft-workplace','microsoft-security','aws','hcdw'}.issubset(actualids)
all_text=soup.get_text(' ',strip=True)
assert 'Lorem ipsum'not in all_text and 'H1:'not in all_text
stats={'status':'pass','page_views':len(content['pages']),'practice_pages':sum(p.get('practice')is not None for p in content['pages']),'stage_counts':dict(Counter(p.get('stage')for p in content['pages'])),'internal_links':len(soup.select('a[href^="#"]')),'broken_internal_links':len(missing),'external_case_links':len(soup.select('a[target="_blank"]')),'scripts':1,'images':0,'animations':0,'forms_connected':False,'cases_modified':False,'html_bytes':(R/'Quadra_Website_Review.html').stat().st_size,'visual_check':'See browser_qa.json for browser interaction and layout checks.'}
(R/'qa_report.json').write_text(json.dumps(stats,indent=2))
print(json.dumps(stats))
