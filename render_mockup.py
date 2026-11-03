"""Rebuild the simple review file from content.json. No network, images or animations; minimal local menu interaction."""
import json,html,re
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parent
D=json.loads((ROOT/'content.json').read_text())
NAV=json.loads((ROOT/'navigation.json').read_text())
pages=D['pages'];byid={p['id']:p for p in pages}
if len(byid)!=len(pages):raise ValueError('Duplicate page IDs')
esc=lambda x:html.escape(str(x),quote=True)
def paras(text):return ''.join('<p>'+esc(s)+'</p>'for s in str(text or '').split('\n\n')if s.strip())
known={'https://www.quadrasystems.net/':'home','https://www.quadrasystems.net/solutions':'solutions','https://www.quadrasystems.net/solutions/modernize-your-foundation':'modernize','https://www.quadrasystems.net/solutions/innovate-with-ai-data':'transform','https://www.quadrasystems.net/solutions/fortify-your-defenses':'secure','https://www.quadrasystems.net/solutions/empower-your-workforce':'empower','https://www.quadrasystems.net/happy':'happy-customers','https://www.quadrasystems.net/contact-us':'contact','https://www.quadrasystems.net/why-quadra':'why-quadra','https://www.quadrasystems.net/newsroom':'founder','https://www.quadrasystems.net/awards':'recognition'}
def link(label,target=None,url=None,button=False):
 if url in known:target=known[url];url=None
 if target:
  if target not in byid:raise ValueError('Unknown internal target '+target)
  return '<a class="'+('button'if button else 'text-link')+'" href="#'+esc(target)+'">'+esc(label)+'</a>'
 if url and re.match(r'^https://',url):return '<a class="'+('button secondary'if button else 'text-link')+'" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+' <span class="external-mark" aria-label="opens live page">↗</span></a>'
 return '<span class="plain-label">'+esc(label)+'</span>'
def action(a):
 typ=a.get('type','link')
 if typ in ['open_menu','menu']:return link(a['label'],'technology',button=True)
 if typ=='form':return '<button type="button" disabled>'+esc(a['label'])+'</button>'
 return link(a.get('label','Explore'),a.get('target')if a.get('target')in byid else None,a.get('url'),True)
def placeholder(label='Image placeholder'):return '<div class="placeholder" role="img" aria-label="'+esc(label)+'">'+esc(label)+'</div>'
def simplecards(cards):
 return '<div class="cards">'+''.join('<section class="card"><h3>'+esc(c.get('title')or c.get('heading')or '')+'</h3>'+paras(c.get('body',''))+(link('Explore',c['target'])if c.get('target')in byid else '')+'</section>'for c in cards)+'</div>'
def casecards(cases):
 return '<div class="case-grid">'+''.join('<section class="card">'+placeholder('Case image placeholder')+'<h3>'+esc(c['title'])+'</h3>'+paras(c['body'])+link('Read the existing case study',url=c['url'])+'</section>'for c in cases)+'</div>'
def render_modules(page):
 out=[]
 for m in page['modules']:
  f=m.get('fields',{});kind=m['kind'];items=m.get('items',[])
  if kind=='footer':continue
  # the page card states remain simulated, never pretend an external service runs
  b=[]
  if f.get('eyebrow'):b.append('<p class="eyebrow">'+esc(f['eyebrow'])+'</p>')
  if f.get('heading'):b.append('<'+('h1'if kind=='hero'else 'h2')+'>'+esc(f['heading'])+'</'+('h1'if kind=='hero'else 'h2')+'>')
  if f.get('body'):b.append(paras(f['body']))
  if kind=='hero':b.append(placeholder('Hero image placeholder'))
  if kind=='compass':
   b.append('<div class="demo-box"><p class="preview-label">Interface preview · no AI service connected</p><label for="compass-input">'+esc(f['input_label'])+'</label><div class="input-row"><input id="compass-input" disabled placeholder="'+esc(f['placeholder'])+'"><button type="button" disabled>'+esc(f['submit_label'])+'</button></div><p>'+esc(f.get('starter_label','Try a question'))+'</p><ul class="starter-list">'+''.join('<li>'+esc(i['fields']['question'])+'</li>'for i in items)+'</ul><small>'+esc(f['privacy_helper'])+'</small></div>')
  elif kind=='collection_controls':
   b.append('<div class="demo-box"><p class="preview-label">Filter and search layout preview · not connected to the case library</p><label for="case-search">'+esc(f['search_label'])+'</label><input id="case-search" disabled placeholder="'+esc(f['search_placeholder'])+'"><div class="control-grid"><label>'+esc(f['industry_label'])+'<select disabled><option>'+esc(f['industry_default'])+'</option></select></label><label>'+esc(f['priority_label'])+'<select disabled><option>'+esc(f['priority_default'])+'</option>'+''.join('<option>'+esc(i['fields']['label'])+'</option>'for i in items)+'</select></label></div><button type="button" disabled>'+esc(f['clear_filters'])+'</button></div>')
  elif kind=='existing_case_collection':
   b.append('<p class="preview-label">Representative existing cases · original titles and summaries retained; this is not the full collection</p>'+casecards(page.get('existing_case_sample',[])))
   b.append('<button disabled type="button">'+esc(f.get('load_more','Load More'))+'</button>')
  elif kind=='newsletter':
   b.append('<div class="demo-box"><p class="preview-label">Newsletter layout preview · no information collected</p><label>'+esc(f.get('email_label','Email address'))+'<input type="email" disabled placeholder="'+esc(f.get('email_label','Email address'))+'"></label></div>')
  elif items:
   cards=[]
   for i in items:
    g=i['fields'];t=g.get('heading')or g.get('label','')
    cards.append('<section class="card"><h3>'+esc(t)+'</h3>'+('<p class="question">'+esc(g['question'])+'</p>'if g.get('question')else '')+paras(g.get('body',''))+'<div class="actions">'+''.join(action(a)for a in i.get('actions',[]))+'</div></section>')
   b.append('<div class="cards">'+''.join(cards)+'</div>')
  if kind not in ['compass','existing_case_collection']:
   b.append('<div class="actions">'+''.join(action(a)for a in m.get('actions',[]))+'</div>')
  out.append('<section class="module" data-module="'+esc(m['id'])+'">'+''.join(b)+'</section>')
 return ''.join(out)
statuses={'prior_review_copy':'Previously reviewed copy','review_draft':'Updated draft for review','awaiting_source':'Updated content awaited','structure_only':'Structure placeholder','classification_review':'Portfolio classification to confirm','release_gated':'Launch claim — confirmation pending','form_preview':'Form layout preview'}
def render_page(p):
 crumbs=link('Home','home')
 if p.get('parent')in byid:crumbs+=' <span>/</span> '+link(byid[p['parent']]['title'],p['parent'])
 if p['id']!='home':crumbs+=' <span>/</span> '+esc(p['title'])
 b=['<article class="page" id="'+esc(p['id'])+'" tabindex="-1" aria-labelledby="title-'+esc(p['id'])+'"><div class="page-top"><nav class="breadcrumb" aria-label="Breadcrumb">'+crumbs+'</nav><span class="status">'+esc(statuses.get(p.get('stage'), 'Draft for review'))+'</span></div>']
 if p.get('kind')=='approved_modules':
  content=render_modules(p)
  # first main heading identifies its active article
  content=content.replace('<h1>','<h1 id="title-'+esc(p['id'])+'">',1)
  b.append(content)
 else:
  b.append('<header class="module"><p class="eyebrow">'+esc(p.get('eyebrow')or p['title'])+'</p><h1 id="title-'+esc(p['id'])+'">'+esc(p.get('heading')or p['title'])+'</h1>'+('<p class="subheading">'+esc(p['subheading'])+'</p>' if p.get('subheading') else '')+('<p class="lead">'+esc(p['lead'])+'</p>' if p.get('lead') else '')+paras(p.get('intro',''))+placeholder(p['title']+' — image placeholder')+'</header>')
  if p.get('stage')=='release_gated':b.append('<p class="state-note">Internal review only. The 21-year statement remains conditional on the public award announcement; no launch approval is implied.</p>')
  for s in p.get('sections',[]):
   b.append('<section class="module"><h2>'+esc(s.get('heading',''))+'</h2>'+paras(s.get('body','')))
   if s.get('bullets'):b.append('<ul>'+''.join('<li>'+esc(t)+'</li>'for t in s['bullets'])+'</ul>')
   if s.get('cards'):b.append(simplecards(s['cards']))
   if s.get('closing_body'):b.append(paras(s['closing_body']))
   b.append('</section>')
  if p['id']=='contact':b.append('<section class="module demo-box"><p class="preview-label">Contact form preview · no submission or data collection</p><label>Name<input disabled></label><label>Work email<input disabled type="email"></label><label>What would you like to achieve?<textarea disabled rows="4"></textarea></label><button disabled type="button">Start a Conversation</button></section>')
  if p.get('cta') and p['id']!='contact':b.append('<section class="module">'+('<h2>'+esc(p['cta_heading'])+'</h2>' if p.get('cta_heading') else '')+paras(p.get('cta_body',''))+'<div class="actions">'+link(p['cta'].get('label','Talk to an Architect'),target=p['cta'].get('target','contact'),button=True)+'</div></section>')
 children=[q for q in pages if q.get('parent')==p['id']]
 if children:b.append('<section class="module related"><h2>Explore this area</h2><ul>'+''.join('<li>'+link(q['title'],q['id'])+'</li>'for q in children)+'</ul></section>')
 rel=[i for i in p.get('related',[]) if i in byid and i!=p['id']]
 if rel:b.append('<section class="module related"><h2>Connected expertise</h2><ul>'+''.join('<li>'+link(byid[i]['title'],i)+'</li>'for i in rel)+'</ul></section>')
 b.append('<div class="page-end">'+link('Back to Home','home')+' · <a href="#site-map">View all review pages</a></div></article>')
 return ''.join(b)
# Navigation uses native expandable HTML; all local navigation is standard fragment links.
nav=[]
for n in NAV['header']:
 if n.get('groups'):
  panel='<div class="menu-tools"><button type="button" data-menu-close>Close menu</button></div><p>'+link('Explore '+n['label'],n['page'])+'</p><div class="menu-grid">'
  for g in n['groups']:
   panel+='<section><h3>'+esc(g['title'])+'</h3><ul>'+''.join('<li>'+link(t,i)+'</li>'for t,i in g['links'])+'</ul></section>'
  panel+='</div>'
  nav.append('<details class="nav-menu" name="quadra-main-menu"><summary aria-expanded="false" aria-controls="menu-'+esc(n['page'])+'">'+esc(n['label'])+'</summary><div id="menu-'+esc(n['page'])+'" class="menu-panel">'+panel+'</div></details>')
 else:nav.append(link(n['label'],n['page']))
header='<a class="skip" href="#home">Skip to content</a><aside class="review-bar"><strong>QUADRA · CONTENT REVIEW</strong><span>2 November 2026 · v0.5 · Internal mockup · Not a published website</span><a href="#site-map">Page index</a></aside><header class="site-header"><a class="wordmark" href="#home">Quadra</a><nav class="top-nav" aria-label="Main navigation">'+''.join(nav)+link(NAV['cta']['label'],NAV['cta']['page'],button=True)+'</nav></header>'
sitemap='<article class="page" id="site-map" tabindex="-1"><div class="page-top"><span class="status">Review navigation only</span></div><h1>Website review index</h1><p>Use the links to review each page. Source-awaited destinations preserve the structure without inventing new practice content. Technical and editorial findings are in the separate review notes.</p><div class="index-grid">'
for p in pages:sitemap+='<div>'+link(p['title'],p['id'])+'<small>'+esc(statuses.get(p.get('stage'),'Draft for review'))+'</small></div>'
sitemap+='</div></article>'
footer='<footer class="site-footer"><strong>Quadra</strong><p>Cloud. AI. Security. One Architect.</p><nav aria-label="Footer">'+link('Happy Customers','happy-customers')+' '+link('Contact Us','contact')+' '+link('Careers','careers')+' '+link('Privacy','privacy')+' '+link('Terms','terms')+'</nav><p class="preview-label">Image placeholders only. Forms, search and The Compass are non-functional layout previews.</p></footer>'
CSS='''
:root{--paper:#ffffff;--canvas:#f6f4f8;--ink:#211e28;--muted:#5b5663;--border:#d6d0dc;--accent:#54258a;--soft:#eee8f5;--placeholder:#f1eff3;--focus:#8b3e00;--button-ink:#ffffff;--max:1200px}
@media(prefers-color-scheme:dark){:root{--paper:#1c1a20;--canvas:#131117;--ink:#f1edf7;--muted:#c3bbcf;--border:#514b5d;--accent:#cdb1f5;--soft:#30283b;--placeholder:#27232f;--focus:#ffc48e;--button-ink:#211e28}}
*{box-sizing:border-box}html{font-family:Raleway,Arial,Helvetica,sans-serif;line-height:1.6;color:var(--ink);background:var(--canvas)}body{margin:0;max-inline-size:none;padding:0;color:var(--ink);background:var(--canvas)}a{color:var(--accent);text-decoration:underline;text-underline-offset:.18em}a:focus-visible,summary:focus-visible{outline:3px solid var(--focus);outline-offset:4px}.review-bar{display:flex;gap:1rem;flex-wrap:wrap;align-items:center;justify-content:space-between;background:var(--soft);padding:.7rem max(1rem,calc((100% - var(--max))/2));font-size:.8rem}.review-bar strong{letter-spacing:.06em}.site-header{max-inline-size:var(--max);margin-inline:auto;display:flex;gap:2rem;align-items:start;padding:1.4rem 1rem;border-block-end:1px solid var(--border)}.wordmark{font:2rem Georgia,serif;color:var(--ink);text-decoration:none}.top-nav{position:relative;display:flex;gap:1rem;align-items:center;flex-wrap:wrap;flex:1;justify-content:flex-end}.top-nav>.text-link{text-decoration:none}.nav-menu{position:static}.nav-menu summary{cursor:pointer;font-weight:600}.menu-panel{position:absolute;inset-block-start:calc(100% + .6rem);inset-inline-end:0;inline-size:min(90vw,800px);border:1px solid var(--border);padding:1.2rem;background:var(--paper);z-index:5;max-block-size:70vh;overflow:auto}.menu-tools{position:sticky;inset-block-start:-1.2rem;background:var(--paper);padding-block:.3rem;display:flex;justify-content:flex-end;z-index:1}.menu-tools button{background:var(--paper);color:var(--accent);padding:.25rem .55rem}.menu-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.2rem}.menu-grid h3{font-size:.95rem;color:var(--accent);margin:0 0 .4rem}.menu-grid ul{list-style:none;margin:0;padding:0}.menu-grid li{margin-block:.45rem}.menu-grid a{font-size:.9rem;text-decoration:none}main{max-inline-size:var(--max);margin-inline:auto;padding:1rem}.page{display:none;padding:1.5rem 2.6rem 2.8rem;background:var(--paper);border:1px solid var(--border)}.page:target{display:block}body:not(:has(.page:target)) #home{display:block}.page-top{display:flex;gap:1rem;align-items:center;justify-content:space-between;flex-wrap:wrap;font-size:.8rem;padding-block-end:1.2rem;border-block-end:1px solid var(--border)}.status{background:var(--soft);padding:.2rem .6rem;border-radius:3px;color:var(--muted)}.breadcrumb{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}.module{padding-block:1.7rem;border-block-end:1px solid var(--border)}h1,h2,h3{line-height:1.2;color:var(--ink);text-wrap:balance}h1{font:2.7rem/1.13 "EB Garamond",Georgia,serif;max-inline-size:24ch;margin:.3rem 0 1rem}h2{font:1.8rem/1.25 "EB Garamond",Georgia,serif;margin:0 0 1rem}h3{font-size:1.08rem;margin:.2rem 0 .65rem}p{margin:.65rem 0;max-inline-size:85ch}.eyebrow{font-size:.8rem;font-weight:bold;letter-spacing:.05em;color:var(--accent);margin-block-end:.6rem}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.card{border:1px solid var(--border);padding:1.25rem;min-inline-size:0}.card p{font-size:.95rem}.question{font-weight:600}.subheading{font-size:1.2rem;font-weight:600}.lead{font-size:1.05rem}.actions{display:flex;gap:.7rem;flex-wrap:wrap;margin-block-start:1rem}.button,button{display:inline-block;border:1px solid var(--accent);border-radius:3px;background:var(--accent);color:var(--button-ink);padding:.55rem .85rem;font:600 .9rem/1.4 Arial,sans-serif;text-decoration:none}.button.secondary{background:var(--paper);color:var(--accent)}button:disabled{background:var(--soft);border-color:var(--border);color:var(--muted);cursor:not-allowed}input,select,textarea{display:block;inline-size:100%;padding:.7rem;border:1px solid var(--border);background:var(--paper);color:var(--ink);font:inherit;border-radius:2px}input:disabled,select:disabled,textarea:disabled{color:var(--muted);opacity:1}label{display:block;font-size:.9rem;font-weight:600;margin-block:.6rem}.input-row{display:grid;grid-template-columns:1fr auto;gap:.6rem}.control-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.placeholder{background:var(--placeholder);border:1px dashed var(--border);min-block-size:90px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.85rem;text-align:center;margin-block:1rem;padding:1rem}.card .placeholder{min-block-size:100px}.preview-label,small{font-size:.8rem;color:var(--muted)}.demo-box{background:var(--canvas);padding:1.2rem;border:1px solid var(--border);margin-block:1rem}.starter-list{display:flex;flex-wrap:wrap;gap:.6rem;list-style:none;padding:0}.starter-list li{background:var(--paper);border:1px solid var(--border);padding:.5rem .75rem;font-size:.9rem;flex:1 1 40%}.case-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin-block:1rem}.related ul{display:flex;list-style:none;flex-wrap:wrap;gap:.6rem 1.2rem;padding:0}.page-end{font-size:.85rem;padding-block-start:2rem}.site-footer{max-inline-size:var(--max);margin-inline:auto;padding:2rem 1rem;color:var(--muted);font-size:.9rem}.site-footer nav{display:flex;flex-wrap:wrap;gap:1rem}.index-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-block:1rem}.index-grid>div{border:1px solid var(--border);padding:1rem}.index-grid small{display:block}.state-note{padding:1rem;border:1px solid var(--border);background:var(--soft)}.skip{position:absolute;inset-inline-start:1rem;inset-block-start:-100px}.skip:focus{inset-block-start:1rem;background:var(--paper);padding:1rem;z-index:10}.external-mark{font-size:.8em}
@media(max-width:800px){.site-header{display:block}.top-nav{justify-content:flex-start;margin-block-start:1rem}.page{padding:1.1rem}.menu-panel{position:fixed;inset-inline:1rem;inset-block-start:8rem;inline-size:auto;max-block-size:70vh;overflow:auto}.menu-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.cards,.case-grid,.index-grid{grid-template-columns:1fr}h1{font-size:2.1rem}.input-row,.control-grid{grid-template-columns:1fr}.starter-list li{flex-basis:100%}}
@media print{.review-bar,.site-header,.site-footer,.demo-box,.placeholder,.page-end,.skip{display:none!important}body{background:var(--paper)}main{padding:0}.page{display:block!important;border:0;padding:0;break-before:page}.page:first-child{break-before:auto}.module{break-inside:avoid}.menu-panel{display:none}.cards,.case-grid{grid-template-columns:1fr 1fr}.index-grid{grid-template-columns:1fr 1fr}.button{background:none;color:var(--ink);border:0;padding:0}.status{background:none}}
'''
# Start from the generated skill template and replace only its page content/styles.
soup=BeautifulSoup((ROOT/'seed.html').read_text(),'html.parser')
soup.html['lang']='en-IN';soup.html['dir']='ltr'
soup.head.title.string='Quadra Website — Content Review'
for s in soup.find_all('style'):s.decompose()
style=soup.new_tag('style');style.string=CSS;soup.head.append(style)
robots=soup.new_tag('meta');robots['name']='robots';robots['content']='noindex, nofollow';soup.head.append(robots)
meta=soup.new_tag('meta');meta['name']='description';meta['content']='Internal Quadra website content and structure review. No production services are connected.';soup.head.append(meta)
soup.body.clear()
fragment=BeautifulSoup(header+'<main>'+''.join(render_page(p)for p in pages)+sitemap+'</main>'+footer,'html.parser')
for item in list(fragment.contents):soup.body.append(item)
script=soup.new_tag('script');script.string=(ROOT/'menu.js').read_text();soup.body.append(script)
out=ROOT/'Quadra_Website_Review.html';out.write_text(str(soup),encoding='utf-8')
print(json.dumps({'file':str(out),'pages':len(pages),'review_index':1,'bytes':out.stat().st_size,'scripts':1,'images':0}))
