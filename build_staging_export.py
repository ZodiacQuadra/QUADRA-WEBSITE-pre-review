"""Prepared Framer staging content; no project writes or production publication."""
import csv,json,re,html,hashlib,zipfile,shutil
from pathlib import Path
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parent;O=R/'Framer_Staging'/'content_export';O.mkdir(parents=True,exist_ok=True)
D=json.loads((R/'content.json').read_text());by={p['id']:p for p in D['pages']};nav=json.loads((R/'navigation.json').read_text())
esc=lambda v:html.escape(str(v),quote=True)
def para(s):return ''.join('<p>'+esc(t)+'</p>'for t in str(s or '').split('\n\n')if t.strip())
def richlist(xs):return '<ul>'+''.join('<li>'+esc(t)+'</li>'for t in xs)+'</ul>' if xs else ''
def writejson(name,x):
 p=O/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def writecsv(name,rows,columns=None):
 p=O/name;p.parent.mkdir(parents=True,exist_ok=True)
 cols=columns or list(dict.fromkeys(k for row in rows for k in row))
 with p.open('w',encoding='utf-8-sig',newline='')as f:
  w=csv.DictWriter(f,fieldnames=cols);w.writeheader();w.writerows(rows)
 with p.open(encoding='utf-8-sig',newline='')as f:assert list(csv.DictReader(f))==[{k:str(r.get(k,'')) for k in cols}for r in rows],name
# Deliberate small gate: full review-copy standard pages only; no placeholders, cases or announcement-gated content.
include=[p for p in D['pages']if p.get('stage')=='review_draft'and p.get('kind')!='approved_modules']
# CSG service/advisory drafts have useful scoped content despite unresolved category packaging; keep separate for owner review, not auto-import.
excluded=[p for p in D['pages']if p not in include]
export_ids={p['id']for p in include}
public_known={
 'home':'https://www.quadrasystems.net/','solutions':'https://www.quadrasystems.net/solutions','modernize':'https://www.quadrasystems.net/solutions/modernize-your-foundation','transform':'https://www.quadrasystems.net/solutions/innovate-with-ai-data','secure':'https://www.quadrasystems.net/solutions/fortify-your-defenses','empower':'https://www.quadrasystems.net/solutions/empower-your-workforce','happy-customers':'https://www.quadrasystems.net/happy','contact':'https://www.quadrasystems.net/contact-us','why-quadra':'https://www.quadrasystems.net/why-quadra','recognition':'https://www.quadrasystems.net/awards','founder':'https://www.quadrasystems.net/newsroom','insights':'https://www.quadrasystems.net/newsroom','newsroom':'https://www.quadrasystems.net/newsroom'}
unresolved_links=[];links=[]
def url_for(target,url=None):
 if target in export_ids:return '/review/'+target
 # Static homepage/library and lead-generation remain disabled until wired inside actual staging, not linked to live conversion flows.
 if target:return None
 if url and url.startswith('https://www.quadrasystems.net/'):
  for k,v in public_known.items():
   if v==url:return url_for(k)
  return url # existing case detail link may be retained as external read-only evidence, never reimported
 return None
def action_html(label,target=None,url=None,source=None):
 u=url_for(target,url)
 if u:return '<p><a href="'+esc(u)+'">'+esc(label)+'</a></p>'
 if target:unresolved_links.append({'source_page':source or '', 'target_page':target,'label':label,'reason':'Target requires a static page, owner review or staging destination mapping; not silently linked to production.'})
 return '<p><strong>'+esc(label)+'</strong></p>'
def section_html(sec,source):
 body='<h2>'+esc(sec.get('heading',''))+'</h2>'+para(sec.get('body',''))+richlist(sec.get('bullets',[]))
 for card in sec.get('cards',[]):
  body+='<h3>'+esc(card.get('title')or card.get('heading',''))+'</h3>'+para(card.get('body',''))
  if card.get('target'):body+=action_html('Explore',card['target'],source=source)
 body+=para(sec.get('closing_body',''))
 return body
page_rows=[];module_rows=[];card_rows=[];action_rows=[];relation_rows=[];gate_rows=[];schema_records=[]
for p in include:
 pid=p['id'];body=''.join(section_html(s,pid)for s in p.get('sections',[]))
 if p.get('cta_heading'):body+='<h2>'+esc(p['cta_heading'])+'</h2>'+para(p.get('cta_body',''))
 if p.get('cta'):body+=action_html(p['cta']['label'],p['cta'].get('target'),source=pid)
 related=[q for q in p.get('related',[])if q in by]
 if related:
  body+='<h2>Connected expertise</h2>'
  for rid in related:body+=action_html(by[rid]['title'],rid,source=pid)
 # native URLs intentionally staging only, source canonical merely a candidate private mapping.
 row={'Name':p['title'],'Slug':pid,'PageKey':pid,'PageType':p.get('class','page'),'Eyebrow':p.get('eyebrow',''),'Heading':p.get('heading',p['title']),'Subheading':p.get('subheading',''),'Lead':p.get('lead',''),'Introduction':p.get('intro',''),'Content':body,'SEOTitle':p.get('seo',{}).get('title',p['title']+' | Quadra'),'SEODescription':p.get('seo',{}).get('description',''),'CTA':p.get('cta',{}).get('label',''),'CTATargetKey':p.get('cta',{}).get('target','')}
 page_rows.append(row)
 textparts=[]
 for name,tag in [('Heading','# '),('Subheading',''),('Lead',''),('Introduction','')]:
  if row[name]:textparts.append(tag+row[name])
 for sec in p.get('sections',[]):
  textparts+=['## '+sec.get('heading',''),sec.get('body','')]+['- '+s for s in sec.get('bullets',[])]
  for c in sec.get('cards',[]):textparts+=['### '+c.get('title',''),c.get('body','')]
  textparts.append(sec.get('closing_body',''))
 if p.get('cta_heading'):textparts.extend(['## '+p['cta_heading'],p.get('cta_body','')])
 if p.get('cta'):textparts.append(p['cta']['label'])
 if related:textparts.extend(['## Connected expertise']+['- '+by[rid]['title'] for rid in related])
 txt='\n\n'.join(s for s in textparts if s)
 path=O/'plain_copy'/f'{pid}.md';path.parent.mkdir(exist_ok=True);path.write_text(txt+'\n')
 schema_records.append({'page_key':pid,'type_candidate':'WebPage','name':p['title'],'description':row['SEODescription'],'staging_route':'/review/'+pid,'production_canonical':None,'status':'Do not deploy schema/canonical until the real page route, visible copy and indexing policy are confirmed. No Service/Review ratings or made-up dates.'})
for p in D['pages']:
 pid=p['id'];gate_rows.append({'PageKey':pid,'Name':p['title'],'MasterStage':p.get('stage',''),'ExportDisposition':'cms_review_copy'if pid in export_ids else ('static_module_handoff'if pid in ['home','happy-customers']else 'withheld_from_import'),'Reason':('Review copy, not public approval'if pid in export_ids else ('Existing case data and gated recognition not reimported'if pid in ['home','happy-customers']else 'Awaiting copy, classification, release approval or functional staging mapping')),'ProductionApproved':'false'})
 if pid in export_ids:
  for i,s in enumerate(p.get('sections',[]),1):
   module_rows.append({'Slug':s.get('id',pid+'-section-'+str(i)),'PageKey':pid,'Order':i,'Kind':'section','Heading':s.get('heading',''),'Body':s.get('body',''),'Bullets':'\n'.join(s.get('bullets',[])),'Closing':s.get('closing_body','')})
   for j,c in enumerate(s.get('cards',[]),1):card_rows.append({'Slug':s.get('id',pid+'-section-'+str(i))+'-card-'+str(j),'PageKey':pid,'SectionKey':s.get('id',''),'Order':j,'Heading':c.get('title')or c.get('heading',''),'Body':c.get('body',''),'TargetPageKey':c.get('target','')})
  if p.get('cta'):action_rows.append({'Slug':pid+'-primary-cta','PageKey':pid,'SectionKey':'','Label':p['cta']['label'],'Type':'link_mapping_required','TargetPageKey':p['cta'].get('target',''),'URL':''})
 for rid in p.get('related',[]):relation_rows.append({'SourcePageKey':pid,'TargetPageKey':rid,'Relation':'related_expertise','ImportReference':'not_assigned'})
 if p.get('parent'):relation_rows.append({'SourcePageKey':pid,'TargetPageKey':p['parent'],'Relation':'parent','ImportReference':'not_assigned'})
writecsv('cms/Pages.csv',page_rows)
pilotids=['hcdw','hcdw-resilience','aws','aig','google-cloud']
pilot=[r for r in page_rows if r['PageKey']in pilotids];writecsv('pilot/Pages_Pilot.csv',pilot)
writecsv('modules/Sections.csv',module_rows);writecsv('modules/Cards.csv',card_rows);writecsv('modules/Actions.csv',action_rows);writecsv('mapping/Page_Relationships.csv',relation_rows);writecsv('review/Page_Gates.csv',gate_rows)
# Static-page initial copy plus inactive UI state strings; technical wiring is deliberately separate.
static=[]
for p in D['pages']:
 if p['id']not in ['home','happy-customers']:continue
 obj={'page_key':p['id'],'title':p['title'],'modules':[]}
 for m in p['modules']:
  if p['id']=='home'and m['id']=='recognition':continue
  if (p['id']=='happy-customers'and m['kind']=='existing_case_collection')or(p['id']=='home'and m['id']=='happy_customers'):
   obj['modules'].append({'id':m['id'],'kind':m['kind'],'fields':m['fields'],'actions':m.get('actions',[]),'binding':'Preserve original approved case/spotlight bindings. No case or spotlight records supplied for replacement.'});continue
  obj['modules'].append(m)
 def map_actions(node):
  if isinstance(node,dict):
   if 'actions'in node:
    for a in node['actions']:
     old=a.get('url');target=next((k for k,v in public_known.items()if v==old),None)
     if old:
      a['url']=url_for(target,old)or''
      if not a['url']:a['mapping_status']='staging_destination_required'
     if a.get('type')=='form':a['enabled']=False;a['mapping_status']='disabled_until_sandbox_approved'
   for v in node.values():map_actions(v)
  elif isinstance(node,list):
   for v in node:map_actions(v)
 map_actions(obj)
 static.append(obj)
writejson('static/Static_Page_Modules.json',static)
writejson('static/Existing_Case_Collection.json',{'write_mode':'none','records_exported':0,'preserve':['IDs','names','titles','summaries','metrics','images','detail text','dates','canonical URLs','customer permissions'],'mapping_required':['Existing collection and template IDs','Industry and priority fields','Rendered pagination and filters','Source-grounded Compass index'],'no_sample_cases_as_real_import':True})
writejson('review/Recognition_Publication_Gate.json',{'page':'home','module':'recognition','imported_by_default':False,'planned_copy':'21 Years of Global Recognition','pre_announcement_copy':'20 Years of Global Recognition','condition':'Only switch to 21 after public Microsoft global POTYA announcement and owner confirmation','homepage_attribution':'Behind recognition link, not homepage vendor logo/name','no_consecutive_or_unbroken':True,'production_publish_approved':False})
nav_rows=[]
for n in nav['header']:
 nav_rows.append({'Header':n['label'],'Group':'','Label':n['label'],'TargetPageKey':n['page'],'StagingURL':url_for(n['page'])or'','Status':'mapped_to_review_route'if n['page']in export_ids else 'builder_mapping_required'})
 for g in n.get('groups',[]):
  for label,target in g['links']:nav_rows.append({'Header':n['label'],'Group':g['title'],'Label':label,'TargetPageKey':target,'StagingURL':url_for(target)or'','Status':'mapped_to_review_route'if target in export_ids else 'builder_mapping_required'})
writecsv('mapping/Navigation.csv',nav_rows)
unique={(x['source_page'],x['target_page'],x['label']):x for x in unresolved_links};writecsv('mapping/Unresolved_Link_Targets.csv',list(unique.values()))
route_rows=[]
for p in D['pages']:
 candidate=p.get('seo',{}).get('canonical_candidate')or p.get('seo',{}).get('url')or public_known.get(p['id'],'')
 route_rows.append({'PageKey':p['id'],'Name':p['title'],'ProposedStagingPath':'/review/'+p['id']if p['id']in export_ids else '','ProductionURLCandidate':candidate or'','ProductionURLValidated':'false','RedirectDecision':'No migration authorised','Disposition':'Keep existing URL where established; reconcile before production'})
writecsv('mapping/Route_Map.csv',route_rows)
assets=[]
for p in include:assets.append({'AssetKey':p['id']+'-hero','PageKey':p['id'],'Role':'hero','FileOrURL':'','AltText':'','Status':'image placeholder; approved asset and meaningful alt text needed before production','RightsVerified':'false'})
writecsv('mapping/Asset_Manifest.csv',assets)
writejson('seo/Schema_Binding_Plan.json',schema_records)
writejson('seo/Static_Metadata.json',[{'PageKey':p['id'],'metadata':p.get('seo',{}),'robots':'noindex on protected staging','status':'Explicit page-setting binding required; not automatically configured'}for p in D['pages']if p['id']in ['home','happy-customers']])
writejson('seo/Compass_Corpus_Manifest.json',{'status':'disabled_until_staging_validation','source':'Same approved content master, not editorial files or OEM research notes','production_index_approved':False,'allowed_content_fields':['Heading','Subheading','Lead','Introduction','Content'],'pages':[{'PageKey':r['PageKey'],'source_route':'/review/'+r['Slug'],'title':r['SEOTitle'],'production_eligible':False}for r in page_rows],'excluded':['Source-awaited and structure-only pages','Unresolved classification and recognition material','Private clarification notes','Credentials not approved for publication','Raw customer or source documents'],'answer_contract':'Answer only from available approved website pages, link supporting sources, decline unsupported answers, collect no confidential inputs; no CRM or workflow execution.'})
# Page metadata with original desired canonical candidates kept separate from protected staging's noindex settings.
writecsv('seo/Page_Metadata.csv',[{'PageKey':r['PageKey'],'SEOTitle':r['SEOTitle'],'SEODescription':r['SEODescription'],'CanonicalURL':'','RobotsRequired':'noindex for staging','OGImage':'','LivePublishApproved':'false'}for r in page_rows])
schema=[]
for k in page_rows[0]:schema.append({'csv_column':k,'suggested_framer_type':'Formatted Text'if k=='Content'else 'Text','required_for_pilot':k in ['Name','Slug','PageKey','Heading','Introduction','Content'],'note':('Map Slug to the collection item slug; do not use as the production path'if k=='Slug'else 'HTML formatted content; confirm CSV importer parses it in the pilot, do not leave raw tags'if k=='Content'else 'Stable internal identity, not visible copy'if k=='PageKey'else 'Map to existing field or new isolated staging collection')})
writejson('mapping/Field_Map.json',{'status':'proposed_not_project_verified','target':'new isolated Quadra Review Pages collection or compatible duplicated existing collection','actual_collection_id':None,'staging_template_path':'/review/:slug (proposed, builder must create)','columns':schema,'references':'No reference fields imported by delimiter guess. Parent/related maps are separate and must be bound to actual collection IDs/slugs after pilot.','static_pages':'Static_Page_Modules.json needs component mapping; CSV does not build navigation, forms, Compass or full layout.'})
# Mandatory content/data integrity checks, not a claim of actual Framer test.
slugs=[r['Slug']for r in page_rows];assert len(slugs)==len(set(slugs));assert all(re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*',s)for s in slugs)
for row in page_rows:
 soup=BeautifulSoup(row['Content'],'html.parser')
 assert not soup.find(['script','iframe','form','input'])
 assert not soup.find('h1') # template binds the single H1 from Heading
 for tag in soup.find_all(True):assert not any(k.lower().startswith('on')for k in tag.attrs)
 for a in soup.find_all('a',href=True):assert a['href'].startswith('/review/')or a['href'].startswith('https://www.quadrasystems.net/')
 assert row['Heading'] and row['Introduction']
# No credential gating flags, old unresolved D notes, customer sample records or sources inside public import body.
for row in page_rows:assert not re.search(r'\[VERIFY\]|D-0[1-6]|source_sha256|needs_owner_confirmation',row['Content'])
manifest={'version':'0.5-staging-prep','generated_on':'2026-11-02','source_master_version':D['version'],'source_master_sha256':hashlib.sha256((R/'content.json').read_bytes()).hexdigest(),'actual_framer_project_inspected':False,'actual_import_tested':False,'site_created_or_published':False,'production_approved':False,'export_scope':'Review-copy records for private staging; placeholders, disputed portfolio pages, source notes and case records withheld from native import','counts':{'cms_pages':len(page_rows),'pilot_pages':len(pilot),'static_pages':len(static),'sections':len(module_rows),'cards':len(card_rows),'link_mappings_required':len(unique),'withheld_pages':sum(r['ExportDisposition']=='withheld_from_import'for r in gate_rows),'case_records':0},'formats':['UTF-8 BOM CSV','JSON','HTML formatted text in Content cells','plain Markdown copy fallback'], 'locale':'English; source conventions retained pending editorial consistency pass','readme':'START_HERE.md','field_map':'mapping/Field_Map.json'}
writejson('manifest.json',manifest)
writejson('QA.json',{'status':'pass_preflight_only','csv_round_trip':True,'unique_slugs':True,'rich_text_safety':True,'master_preserved':True,'source_documents_modified':False,'cases_exported':0,'live_site_changed':False,'framer_import_validation':'not performed - project/schema not supplied','missing_staging_links':'Explicit unresolved mapping list; no fabricated final URLs'})
print(json.dumps(manifest,ensure_ascii=False))
