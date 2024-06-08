import{g as C,a as W,i as y,c as $,b as j,s as I,S as ot,t as N,F as vt,M as st,d as _t,e as Mt,o as bt,f as $t,r as St,h as Et}from"./web.Bkdo5IoC.js";function w(e){return Array.isArray?Array.isArray(e):ut(e)==="[object Array]"}const It=1/0;function wt(e){if(typeof e=="string")return e;let t=e+"";return t=="0"&&1/e==-It?"-0":t}function kt(e){return e==null?"":wt(e)}function S(e){return typeof e=="string"}function lt(e){return typeof e=="number"}function At(e){return e===!0||e===!1||Lt(e)&&ut(e)=="[object Boolean]"}function ht(e){return typeof e=="object"}function Lt(e){return ht(e)&&e!==null}function v(e){return e!=null}function G(e){return!e.trim().length}function ut(e){return e==null?e===void 0?"[object Undefined]":"[object Null]":Object.prototype.toString.call(e)}const Rt="Incorrect 'index' type",Ct=e=>`Invalid value for key ${e}`,Nt=e=>`Pattern length exceeds max of ${e}.`,Ot=e=>`Missing ${e} property in key`,Pt=e=>`Property 'weight' in key '${e}' must be a positive integer`,rt=Object.prototype.hasOwnProperty;class Tt{constructor(t){this._keys=[],this._keyMap={};let s=0;t.forEach(r=>{let n=dt(r);this._keys.push(n),this._keyMap[n.id]=n,s+=n.weight}),this._keys.forEach(r=>{r.weight/=s})}get(t){return this._keyMap[t]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}}function dt(e){let t=null,s=null,r=null,n=1,i=null;if(S(e)||w(e))r=e,t=nt(e),s=V(e);else{if(!rt.call(e,"name"))throw new Error(Ot("name"));const c=e.name;if(r=c,rt.call(e,"weight")&&(n=e.weight,n<=0))throw new Error(Pt(c));t=nt(c),s=V(c),i=e.getFn}return{path:t,id:s,weight:n,src:r,getFn:i}}function nt(e){return w(e)?e:e.split(".")}function V(e){return w(e)?e.join("."):e}function Ft(e,t){let s=[],r=!1;const n=(i,c,a)=>{if(v(i))if(!c[a])s.push(i);else{let l=c[a];const o=i[l];if(!v(o))return;if(a===c.length-1&&(S(o)||lt(o)||At(o)))s.push(kt(o));else if(w(o)){r=!0;for(let h=0,u=o.length;h<u;h+=1)n(o[h],c,a+1)}else c.length&&n(o,c,a+1)}};return n(e,S(t)?t.split("."):t,0),r?s:s[0]}const jt={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},Dt={isCaseSensitive:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(e,t)=>e.score===t.score?e.idx<t.idx?-1:1:e.score<t.score?-1:1},Kt={location:0,threshold:.6,distance:100},Ut={useExtendedSearch:!1,getFn:Ft,ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1};var g={...Dt,...jt,...Kt,...Ut};const Wt=/[^ ]+/g;function zt(e=1,t=3){const s=new Map,r=Math.pow(10,t);return{get(n){const i=n.match(Wt).length;if(s.has(i))return s.get(i);const c=1/Math.pow(i,.5*e),a=parseFloat(Math.round(c*r)/r);return s.set(i,a),a},clear(){s.clear()}}}class q{constructor({getFn:t=g.getFn,fieldNormWeight:s=g.fieldNormWeight}={}){this.norm=zt(s,3),this.getFn=t,this.isCreated=!1,this.setIndexRecords()}setSources(t=[]){this.docs=t}setIndexRecords(t=[]){this.records=t}setKeys(t=[]){this.keys=t,this._keysMap={},t.forEach((s,r)=>{this._keysMap[s.id]=r})}create(){this.isCreated||!this.docs.length||(this.isCreated=!0,S(this.docs[0])?this.docs.forEach((t,s)=>{this._addString(t,s)}):this.docs.forEach((t,s)=>{this._addObject(t,s)}),this.norm.clear())}add(t){const s=this.size();S(t)?this._addString(t,s):this._addObject(t,s)}removeAt(t){this.records.splice(t,1);for(let s=t,r=this.size();s<r;s+=1)this.records[s].i-=1}getValueForItemAtKeyId(t,s){return t[this._keysMap[s]]}size(){return this.records.length}_addString(t,s){if(!v(t)||G(t))return;let r={v:t,i:s,n:this.norm.get(t)};this.records.push(r)}_addObject(t,s){let r={i:s,$:{}};this.keys.forEach((n,i)=>{let c=n.getFn?n.getFn(t):this.getFn(t,n.path);if(v(c)){if(w(c)){let a=[];const l=[{nestedArrIndex:-1,value:c}];for(;l.length;){const{nestedArrIndex:o,value:h}=l.pop();if(v(h))if(S(h)&&!G(h)){let u={v:h,i:o,n:this.norm.get(h)};a.push(u)}else w(h)&&h.forEach((u,d)=>{l.push({nestedArrIndex:d,value:u})})}r.$[i]=a}else if(S(c)&&!G(c)){let a={v:c,n:this.norm.get(c)};r.$[i]=a}}}),this.records.push(r)}toJSON(){return{keys:this.keys,records:this.records}}}function gt(e,t,{getFn:s=g.getFn,fieldNormWeight:r=g.fieldNormWeight}={}){const n=new q({getFn:s,fieldNormWeight:r});return n.setKeys(e.map(dt)),n.setSources(t),n.create(),n}function Bt(e,{getFn:t=g.getFn,fieldNormWeight:s=g.fieldNormWeight}={}){const{keys:r,records:n}=e,i=new q({getFn:t,fieldNormWeight:s});return i.setKeys(r),i.setIndexRecords(n),i}function U(e,{errors:t=0,currentLocation:s=0,expectedLocation:r=0,distance:n=g.distance,ignoreLocation:i=g.ignoreLocation}={}){const c=t/e.length;if(i)return c;const a=Math.abs(r-s);return n?c+a/n:a?1:c}function Ht(e=[],t=g.minMatchCharLength){let s=[],r=-1,n=-1,i=0;for(let c=e.length;i<c;i+=1){let a=e[i];a&&r===-1?r=i:!a&&r!==-1&&(n=i-1,n-r+1>=t&&s.push([r,n]),r=-1)}return e[i-1]&&i-r>=t&&s.push([r,i-1]),s}const P=32;function Gt(e,t,s,{location:r=g.location,distance:n=g.distance,threshold:i=g.threshold,findAllMatches:c=g.findAllMatches,minMatchCharLength:a=g.minMatchCharLength,includeMatches:l=g.includeMatches,ignoreLocation:o=g.ignoreLocation}={}){if(t.length>P)throw new Error(Nt(P));const h=t.length,u=e.length,d=Math.max(0,Math.min(r,u));let f=i,m=d;const x=a>1||l,_=x?Array(u):[];let p;for(;(p=e.indexOf(t,m))>-1;){let M=U(t,{currentLocation:p,expectedLocation:d,distance:n,ignoreLocation:o});if(f=Math.min(M,f),m=p+h,x){let A=0;for(;A<h;)_[p+A]=1,A+=1}}m=-1;let k=[],E=1,D=h+u;const yt=1<<h-1;for(let M=0;M<h;M+=1){let A=0,L=D;for(;A<L;)U(t,{errors:M,currentLocation:d+L,expectedLocation:d,distance:n,ignoreLocation:o})<=f?A=L:D=L,L=Math.floor((D-A)/2+A);D=L;let tt=Math.max(1,d-L+1),H=c?u:Math.min(d+L,u)+h,F=Array(H+2);F[H+1]=(1<<M)-1;for(let b=H;b>=tt;b-=1){let K=b-1,et=s[e.charAt(K)];if(x&&(_[K]=+!!et),F[b]=(F[b+1]<<1|1)&et,M&&(F[b]|=(k[b+1]|k[b])<<1|1|k[b+1]),F[b]&yt&&(E=U(t,{errors:M,currentLocation:K,expectedLocation:d,distance:n,ignoreLocation:o}),E<=f)){if(f=E,m=K,m<=d)break;tt=Math.max(1,2*d-m)}}if(U(t,{errors:M+1,currentLocation:d,expectedLocation:d,distance:n,ignoreLocation:o})>f)break;k=F}const B={isMatch:m>=0,score:Math.max(.001,E)};if(x){const M=Ht(_,a);M.length?l&&(B.indices=M):B.isMatch=!1}return B}function Vt(e){let t={};for(let s=0,r=e.length;s<r;s+=1){const n=e.charAt(s);t[n]=(t[n]||0)|1<<r-s-1}return t}class ft{constructor(t,{location:s=g.location,threshold:r=g.threshold,distance:n=g.distance,includeMatches:i=g.includeMatches,findAllMatches:c=g.findAllMatches,minMatchCharLength:a=g.minMatchCharLength,isCaseSensitive:l=g.isCaseSensitive,ignoreLocation:o=g.ignoreLocation}={}){if(this.options={location:s,threshold:r,distance:n,includeMatches:i,findAllMatches:c,minMatchCharLength:a,isCaseSensitive:l,ignoreLocation:o},this.pattern=l?t:t.toLowerCase(),this.chunks=[],!this.pattern.length)return;const h=(d,f)=>{this.chunks.push({pattern:d,alphabet:Vt(d),startIndex:f})},u=this.pattern.length;if(u>P){let d=0;const f=u%P,m=u-f;for(;d<m;)h(this.pattern.substr(d,P),d),d+=P;if(f){const x=u-P;h(this.pattern.substr(x),x)}}else h(this.pattern,0)}searchIn(t){const{isCaseSensitive:s,includeMatches:r}=this.options;if(s||(t=t.toLowerCase()),this.pattern===t){let m={isMatch:!0,score:0};return r&&(m.indices=[[0,t.length-1]]),m}const{location:n,distance:i,threshold:c,findAllMatches:a,minMatchCharLength:l,ignoreLocation:o}=this.options;let h=[],u=0,d=!1;this.chunks.forEach(({pattern:m,alphabet:x,startIndex:_})=>{const{isMatch:p,score:k,indices:E}=Gt(t,m,x,{location:n+_,distance:i,threshold:c,findAllMatches:a,minMatchCharLength:l,includeMatches:r,ignoreLocation:o});p&&(d=!0),u+=k,p&&E&&(h=[...h,...E])});let f={isMatch:d,score:d?u/this.chunks.length:1};return d&&r&&(f.indices=h),f}}class O{constructor(t){this.pattern=t}static isMultiMatch(t){return it(t,this.multiRegex)}static isSingleMatch(t){return it(t,this.singleRegex)}search(){}}function it(e,t){const s=e.match(t);return s?s[1]:null}class Yt extends O{constructor(t){super(t)}static get type(){return"exact"}static get multiRegex(){return/^="(.*)"$/}static get singleRegex(){return/^=(.*)$/}search(t){const s=t===this.pattern;return{isMatch:s,score:s?0:1,indices:[0,this.pattern.length-1]}}}class Qt extends O{constructor(t){super(t)}static get type(){return"inverse-exact"}static get multiRegex(){return/^!"(.*)"$/}static get singleRegex(){return/^!(.*)$/}search(t){const r=t.indexOf(this.pattern)===-1;return{isMatch:r,score:r?0:1,indices:[0,t.length-1]}}}class Xt extends O{constructor(t){super(t)}static get type(){return"prefix-exact"}static get multiRegex(){return/^\^"(.*)"$/}static get singleRegex(){return/^\^(.*)$/}search(t){const s=t.startsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,this.pattern.length-1]}}}class Jt extends O{constructor(t){super(t)}static get type(){return"inverse-prefix-exact"}static get multiRegex(){return/^!\^"(.*)"$/}static get singleRegex(){return/^!\^(.*)$/}search(t){const s=!t.startsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,t.length-1]}}}class Zt extends O{constructor(t){super(t)}static get type(){return"suffix-exact"}static get multiRegex(){return/^"(.*)"\$$/}static get singleRegex(){return/^(.*)\$$/}search(t){const s=t.endsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[t.length-this.pattern.length,t.length-1]}}}class qt extends O{constructor(t){super(t)}static get type(){return"inverse-suffix-exact"}static get multiRegex(){return/^!"(.*)"\$$/}static get singleRegex(){return/^!(.*)\$$/}search(t){const s=!t.endsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,t.length-1]}}}class mt extends O{constructor(t,{location:s=g.location,threshold:r=g.threshold,distance:n=g.distance,includeMatches:i=g.includeMatches,findAllMatches:c=g.findAllMatches,minMatchCharLength:a=g.minMatchCharLength,isCaseSensitive:l=g.isCaseSensitive,ignoreLocation:o=g.ignoreLocation}={}){super(t),this._bitapSearch=new ft(t,{location:s,threshold:r,distance:n,includeMatches:i,findAllMatches:c,minMatchCharLength:a,isCaseSensitive:l,ignoreLocation:o})}static get type(){return"fuzzy"}static get multiRegex(){return/^"(.*)"$/}static get singleRegex(){return/^(.*)$/}search(t){return this._bitapSearch.searchIn(t)}}class xt extends O{constructor(t){super(t)}static get type(){return"include"}static get multiRegex(){return/^'"(.*)"$/}static get singleRegex(){return/^'(.*)$/}search(t){let s=0,r;const n=[],i=this.pattern.length;for(;(r=t.indexOf(this.pattern,s))>-1;)s=r+i,n.push([r,s-1]);const c=!!n.length;return{isMatch:c,score:c?0:1,indices:n}}}const Y=[Yt,xt,Xt,Jt,qt,Zt,Qt,mt],ct=Y.length,te=/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,ee="|";function se(e,t={}){return e.split(ee).map(s=>{let r=s.trim().split(te).filter(i=>i&&!!i.trim()),n=[];for(let i=0,c=r.length;i<c;i+=1){const a=r[i];let l=!1,o=-1;for(;!l&&++o<ct;){const h=Y[o];let u=h.isMultiMatch(a);u&&(n.push(new h(u,t)),l=!0)}if(!l)for(o=-1;++o<ct;){const h=Y[o];let u=h.isSingleMatch(a);if(u){n.push(new h(u,t));break}}}return n})}const re=new Set([mt.type,xt.type]);class ne{constructor(t,{isCaseSensitive:s=g.isCaseSensitive,includeMatches:r=g.includeMatches,minMatchCharLength:n=g.minMatchCharLength,ignoreLocation:i=g.ignoreLocation,findAllMatches:c=g.findAllMatches,location:a=g.location,threshold:l=g.threshold,distance:o=g.distance}={}){this.query=null,this.options={isCaseSensitive:s,includeMatches:r,minMatchCharLength:n,findAllMatches:c,ignoreLocation:i,location:a,threshold:l,distance:o},this.pattern=s?t:t.toLowerCase(),this.query=se(this.pattern,this.options)}static condition(t,s){return s.useExtendedSearch}searchIn(t){const s=this.query;if(!s)return{isMatch:!1,score:1};const{includeMatches:r,isCaseSensitive:n}=this.options;t=n?t:t.toLowerCase();let i=0,c=[],a=0;for(let l=0,o=s.length;l<o;l+=1){const h=s[l];c.length=0,i=0;for(let u=0,d=h.length;u<d;u+=1){const f=h[u],{isMatch:m,indices:x,score:_}=f.search(t);if(m){if(i+=1,a+=_,r){const p=f.constructor.type;re.has(p)?c=[...c,...x]:c.push(x)}}else{a=0,i=0,c.length=0;break}}if(i){let u={isMatch:!0,score:a/i};return r&&(u.indices=c),u}}return{isMatch:!1,score:1}}}const Q=[];function ie(...e){Q.push(...e)}function X(e,t){for(let s=0,r=Q.length;s<r;s+=1){let n=Q[s];if(n.condition(e,t))return new n(e,t)}return new ft(e,t)}const z={AND:"$and",OR:"$or"},J={PATH:"$path",PATTERN:"$val"},Z=e=>!!(e[z.AND]||e[z.OR]),ce=e=>!!e[J.PATH],ae=e=>!w(e)&&ht(e)&&!Z(e),at=e=>({[z.AND]:Object.keys(e).map(t=>({[t]:e[t]}))});function pt(e,t,{auto:s=!0}={}){const r=n=>{let i=Object.keys(n);const c=ce(n);if(!c&&i.length>1&&!Z(n))return r(at(n));if(ae(n)){const l=c?n[J.PATH]:i[0],o=c?n[J.PATTERN]:n[l];if(!S(o))throw new Error(Ct(l));const h={keyId:V(l),pattern:o};return s&&(h.searcher=X(o,t)),h}let a={children:[],operator:i[0]};return i.forEach(l=>{const o=n[l];w(o)&&o.forEach(h=>{a.children.push(r(h))})}),a};return Z(e)||(e=at(e)),r(e)}function oe(e,{ignoreFieldNorm:t=g.ignoreFieldNorm}){e.forEach(s=>{let r=1;s.matches.forEach(({key:n,norm:i,score:c})=>{const a=n?n.weight:null;r*=Math.pow(c===0&&a?Number.EPSILON:c,(a||1)*(t?1:i))}),s.score=r})}function le(e,t){const s=e.matches;t.matches=[],v(s)&&s.forEach(r=>{if(!v(r.indices)||!r.indices.length)return;const{indices:n,value:i}=r;let c={indices:n,value:i};r.key&&(c.key=r.key.src),r.idx>-1&&(c.refIndex=r.idx),t.matches.push(c)})}function he(e,t){t.score=e.score}function ue(e,t,{includeMatches:s=g.includeMatches,includeScore:r=g.includeScore}={}){const n=[];return s&&n.push(le),r&&n.push(he),e.map(i=>{const{idx:c}=i,a={item:t[c],refIndex:c};return n.length&&n.forEach(l=>{l(i,a)}),a})}class T{constructor(t,s={},r){this.options={...g,...s},this.options.useExtendedSearch,this._keyStore=new Tt(this.options.keys),this.setCollection(t,r)}setCollection(t,s){if(this._docs=t,s&&!(s instanceof q))throw new Error(Rt);this._myIndex=s||gt(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight})}add(t){v(t)&&(this._docs.push(t),this._myIndex.add(t))}remove(t=()=>!1){const s=[];for(let r=0,n=this._docs.length;r<n;r+=1){const i=this._docs[r];t(i,r)&&(this.removeAt(r),r-=1,n-=1,s.push(i))}return s}removeAt(t){this._docs.splice(t,1),this._myIndex.removeAt(t)}getIndex(){return this._myIndex}search(t,{limit:s=-1}={}){const{includeMatches:r,includeScore:n,shouldSort:i,sortFn:c,ignoreFieldNorm:a}=this.options;let l=S(t)?S(this._docs[0])?this._searchStringList(t):this._searchObjectList(t):this._searchLogical(t);return oe(l,{ignoreFieldNorm:a}),i&&l.sort(c),lt(s)&&s>-1&&(l=l.slice(0,s)),ue(l,this._docs,{includeMatches:r,includeScore:n})}_searchStringList(t){const s=X(t,this.options),{records:r}=this._myIndex,n=[];return r.forEach(({v:i,i:c,n:a})=>{if(!v(i))return;const{isMatch:l,score:o,indices:h}=s.searchIn(i);l&&n.push({item:i,idx:c,matches:[{score:o,value:i,norm:a,indices:h}]})}),n}_searchLogical(t){const s=pt(t,this.options),r=(a,l,o)=>{if(!a.children){const{keyId:u,searcher:d}=a,f=this._findMatches({key:this._keyStore.get(u),value:this._myIndex.getValueForItemAtKeyId(l,u),searcher:d});return f&&f.length?[{idx:o,item:l,matches:f}]:[]}const h=[];for(let u=0,d=a.children.length;u<d;u+=1){const f=a.children[u],m=r(f,l,o);if(m.length)h.push(...m);else if(a.operator===z.AND)return[]}return h},n=this._myIndex.records,i={},c=[];return n.forEach(({$:a,i:l})=>{if(v(a)){let o=r(s,a,l);o.length&&(i[l]||(i[l]={idx:l,item:a,matches:[]},c.push(i[l])),o.forEach(({matches:h})=>{i[l].matches.push(...h)}))}}),c}_searchObjectList(t){const s=X(t,this.options),{keys:r,records:n}=this._myIndex,i=[];return n.forEach(({$:c,i:a})=>{if(!v(c))return;let l=[];r.forEach((o,h)=>{l.push(...this._findMatches({key:o,value:c[h],searcher:s}))}),l.length&&i.push({idx:a,item:c,matches:l})}),i}_findMatches({key:t,value:s,searcher:r}){if(!v(s))return[];let n=[];if(w(s))s.forEach(({v:i,i:c,n:a})=>{if(!v(i))return;const{isMatch:l,score:o,indices:h}=r.searchIn(i);l&&n.push({score:o,key:t,value:i,idx:c,norm:a,indices:h})});else{const{v:i,n:c}=s,{isMatch:a,score:l,indices:o}=r.searchIn(i);a&&n.push({score:l,key:t,value:i,norm:c,indices:o})}return n}}T.version="7.0.0";T.createIndex=gt;T.parseIndex=Bt;T.config=g;T.parseQuery=pt;ie(ne);const R={site:{url:"https://fjall-rs.github.io",baseUrl:"",title:"fjall-rs",description:"Organizing data in Rust"},layout:{pageSize:5,postListStyle:"compact_list",landingPage:{showRecentPosts:!0},topbar:{links:[["Posts","/posts"],["Tags","/tags"]],showThemeSwitch:!0,showRssFeed:!0},footer:{showPoweredBy:!0}},post:{showReadingProgress:!0,readingTime:{enabled:!0,speed:200}}};var de=N('<ul class="mt-2 flex-wrap text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2">'),ge=N('<div class="flex flex-col border-2 border-gray-100 dark:border-transparent dark:bg-gray-900 rounded-lg truncate"><a><div class="bg-sky-500/10 object-cover aspect-2 rounded-lg hover:brightness-80 transition-all bg-cover"></div></a><div class="flex flex-col gap-1 p-2 truncate"><div class="flex truncate"><a class="text-xl truncate dark:text-gray-200 transition-all hover:text-sky-500"></a></div><div class="text-xs italic text-gray-500 dark:text-gray-400"></div><div class="mt-2 text-sm text-gray-600 dark:text-gray-300 truncate"></div><!$><!/>'),fe=N('<li class="mb-2 transition-all hover:translate-y-[-1px] hover:brightness-90"><a class="transition-all hover:dark:bg-sky-800/30 rounded p-2">#<!$><!/>');function me(e){return(()=>{var t=C(ge),s=t.firstChild,r=s.firstChild,n=s.nextSibling,i=n.firstChild,c=i.firstChild,a=i.nextSibling,l=a.nextSibling,o=l.nextSibling,[h,u]=W(o.nextSibling);return y(c,()=>e.title),y(a,()=>new Intl.DateTimeFormat("en",{dateStyle:"medium"}).format(e.date)),y(l,()=>e.description),y(n,$(ot,{get when(){return e.tags?.length>0},get children(){var d=C(de);return y(d,()=>e.tags.map(f=>(()=>{var m=C(fe),x=m.firstChild,_=x.firstChild,p=_.nextSibling,[k,E]=W(p.nextSibling);return y(x,f,k,E),j(()=>I(x,"href",`${R.site.baseUrl}/tag/${f}`)),m})())),d}}),h,u),j(d=>{var f=`${R.site.baseUrl}/post/${e.slug}`,m=e.title,x=e.image?`url(${R.site.baseUrl+e.image})`:void 0,_=`${R.site.baseUrl}/post/${e.slug}`,p=e.title;return f!==d.e&&I(s,"href",d.e=f),m!==d.t&&I(s,"aria-label",d.t=m),x!==d.a&&((d.a=x)!=null?r.style.setProperty("background-image",x):r.style.removeProperty("background-image")),_!==d.o&&I(c,"href",d.o=_),p!==d.i&&I(c,"aria-label",d.i=p),d},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),t})()}var xe=N('<div class="grid sm:grid-cols-2 gap-3">');function pe(e){return(()=>{var t=C(xe);return y(t,$(vt,{get each(){return e.items},children:s=>$(me,s)})),t})()}var ye=N('<a class="shrink-0 hover:brightness-80 transition-all text-lg font-medium text-sky-700 dark:text-sky-300 truncate"><div class="bg-sky-500/10 object-cover w-[100px] h-full aspect-2 rounded-lg hover:brightness-80 transition-all bg-cover">'),ve=N('<div class="flex gap-4"><!$><!/><div class=truncate><a class="hover:brightness-80 transition-all text-lg font-medium text-sky-700 dark:text-sky-300 truncate"></a><div class=text-sm></div><div class=dark:text-gray-300>'),_e=N('<div class="flex flex-col gap-5">');function Me(e){return(()=>{var t=C(ve),s=t.firstChild,[r,n]=W(s.nextSibling),i=r.nextSibling,c=i.firstChild,a=c.nextSibling,l=a.nextSibling;return y(t,$(ot,{get when(){return e.showImage},get children(){var o=C(ye),h=o.firstChild;return j(u=>{var d=`${R.site.baseUrl}/post/${e.slug}`,f=e.title,m=e.image?`url(${R.site.baseUrl+e.image})`:void 0;return d!==u.e&&I(o,"href",u.e=d),f!==u.t&&I(o,"aria-label",u.t=f),m!==u.a&&((u.a=m)!=null?h.style.setProperty("background-image",m):h.style.removeProperty("background-image")),u},{e:void 0,t:void 0,a:void 0}),o}}),r,n),y(c,()=>e.title),y(a,()=>new Intl.DateTimeFormat("en",{dateStyle:"medium"}).format(e.date)),y(l,()=>e.description),j(o=>{var h=`${R.site.baseUrl}/post/${e.slug}`,u=e.title;return h!==o.e&&I(c,"href",o.e=h),u!==o.t&&I(c,"aria-label",o.t=u),o},{e:void 0,t:void 0}),t})()}function be(e){return $(_t,{get children(){return[$(st,{get when(){return e.listStyle==="cards"},get children(){return $(pe,{get items(){return e.items}})}}),$(st,{when:!0,get children(){var t=C(_e);return y(t,()=>e.items.map(s=>$(Me,{get date(){return s.date},get description(){return s.description},get slug(){return s.slug},get title(){return s.title},get image(){return e.listStyle==="list"?s.image:void 0},get showImage(){return e.listStyle==="list"},get tags(){return s.tags}}))),t}})]}})}var $e=N('<div class="flex flex-col gap-5"><input type=text class="border-2 dark:border-transparent dark:bg-gray-800 px-4 py-3 rounded-lg w-full outline-none focus:border-sky-500 transition-all dark:text-gray-200"placeholder="Enter search query"><!$><!/>');function Ie(e){let t;bt(()=>{t=new T(e.items,{keys:["slug","title","description","body"]},T.parseIndex(e.index))});const[s,r]=$t(""),n=()=>{const i=s();return i?t?.search(i)?.map(c=>c.item)??[]:e.items.slice(0,20)};return(()=>{var i=C($e),c=i.firstChild,a=c.nextSibling,[l,o]=W(a.nextSibling);return c.$$input=h=>r(h.currentTarget.value),y(i,$(be,{get items(){return n()},get listStyle(){return R.layout.postListStyle}}),l,o),j(()=>Et(c,"value",s())),St(),i})()}Mt(["input"]);export{Ie as default};
