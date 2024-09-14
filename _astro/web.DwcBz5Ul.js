const u={context:void 0,registry:void 0,effects:void 0,done:!1,getContextId(){return X(this.context.count)},getNextContextId(){return X(this.context.count++)}};function X(e){const t=String(e),n=t.length-1;return u.context.id+(n?String.fromCharCode(96+n):"")+t}function N(e){u.context=e}function we(){return{...u.context,id:u.getNextContextId(),count:0}}const xe=(e,t)=>e===t,be=Symbol("solid-track"),P={equals:xe};let ne=ce;const T=1,B=2,se={owned:null,cleanups:null,context:null,owner:null};var h=null;let R=null,Ae=null,g=null,y=null,S=null,D=0;function M(e,t){const n=g,s=h,i=e.length===0,r=t===void 0?s:t,l=i?se:{owned:null,cleanups:null,context:r?r.context:null,owner:r},o=i?e:()=>e(()=>C(()=>V(l)));h=l,g=null;try{return L(o,!0)}finally{g=n,h=s}}function G(e,t){t=t?Object.assign({},P,t):P;const n={value:e,observers:null,observerSlots:null,comparator:t.equals||void 0},s=i=>(typeof i=="function"&&(i=i(n.value)),ue(n,i));return[fe.bind(n),s]}function j(e,t,n){const s=Q(e,t,!1,T);F(s)}function Se(e,t,n){ne=ke;const s=Q(e,t,!1,T),i=Y&&le(Y);i&&(s.suspense=i),s.user=!0,S?S.push(s):F(s)}function m(e,t,n){n=n?Object.assign({},P,n):P;const s=Q(e,t,!0,0);return s.observers=null,s.observerSlots=null,s.comparator=n.equals||void 0,F(s),fe.bind(s)}function C(e){if(g===null)return e();const t=g;g=null;try{return e()}finally{g=t}}function Ye(e){Se(()=>C(e))}function ie(e){return h===null||(h.cleanups===null?h.cleanups=[e]:h.cleanups.push(e)),e}function Ce(){return h}function ve(e){S.push.apply(S,e),e.length=0}function re(e,t){const n=Symbol("context");return{id:n,Provider:Ne(n),defaultValue:e}}function le(e){let t;return h&&h.context&&(t=h.context[e.id])!==void 0?t:e.defaultValue}function oe(e){const t=m(e),n=m(()=>K(t()));return n.toArray=()=>{const s=n();return Array.isArray(s)?s:s!=null?[s]:[]},n}let Y;function me(){return Y||(Y=re())}function fe(){if(this.sources&&this.state)if(this.state===T)F(this);else{const e=y;y=null,L(()=>U(this),!1),y=e}if(g){const e=this.observers?this.observers.length:0;g.sources?(g.sources.push(this),g.sourceSlots.push(e)):(g.sources=[this],g.sourceSlots=[e]),this.observers?(this.observers.push(g),this.observerSlots.push(g.sources.length-1)):(this.observers=[g],this.observerSlots=[g.sources.length-1])}return this.value}function ue(e,t,n){let s=e.value;return(!e.comparator||!e.comparator(s,t))&&(e.value=t,e.observers&&e.observers.length&&L(()=>{for(let i=0;i<e.observers.length;i+=1){const r=e.observers[i],l=R&&R.running;l&&R.disposed.has(r),(l?!r.tState:!r.state)&&(r.pure?y.push(r):S.push(r),r.observers&&ae(r)),l||(r.state=T)}if(y.length>1e6)throw y=[],new Error},!1)),t}function F(e){if(!e.fn)return;V(e);const t=D;Ee(e,e.value,t)}function Ee(e,t,n){let s;const i=h,r=g;g=h=e;try{s=e.fn(t)}catch(l){return e.pure&&(e.state=T,e.owned&&e.owned.forEach(V),e.owned=null),e.updatedAt=n+1,de(l)}finally{g=r,h=i}(!e.updatedAt||e.updatedAt<=n)&&(e.updatedAt!=null&&"observers"in e?ue(e,s):e.value=s,e.updatedAt=n)}function Q(e,t,n,s=T,i){const r={fn:e,state:s,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:t,owner:h,context:h?h.context:null,pure:n};return h===null||h!==se&&(h.owned?h.owned.push(r):h.owned=[r]),r}function O(e){if(e.state===0)return;if(e.state===B)return U(e);if(e.suspense&&C(e.suspense.inFallback))return e.suspense.effects.push(e);const t=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<D);)e.state&&t.push(e);for(let n=t.length-1;n>=0;n--)if(e=t[n],e.state===T)F(e);else if(e.state===B){const s=y;y=null,L(()=>U(e,t[0]),!1),y=s}}function L(e,t){if(y)return e();let n=!1;t||(y=[]),S?n=!0:S=[],D++;try{const s=e();return $e(n),s}catch(s){n||(S=null),y=null,de(s)}}function $e(e){if(y&&(ce(y),y=null),e)return;const t=S;S=null,t.length&&L(()=>ne(t),!1)}function ce(e){for(let t=0;t<e.length;t++)O(e[t])}function ke(e){let t,n=0;for(t=0;t<e.length;t++){const s=e[t];s.user?e[n++]=s:O(s)}if(u.context){if(u.count){u.effects||(u.effects=[]),u.effects.push(...e.slice(0,n));return}N()}for(u.effects&&(u.done||!u.count)&&(e=[...u.effects,...e],n+=u.effects.length,delete u.effects),t=0;t<n;t++)O(e[t])}function U(e,t){e.state=0;for(let n=0;n<e.sources.length;n+=1){const s=e.sources[n];if(s.sources){const i=s.state;i===T?s!==t&&(!s.updatedAt||s.updatedAt<D)&&O(s):i===B&&U(s,t)}}}function ae(e){for(let t=0;t<e.observers.length;t+=1){const n=e.observers[t];n.state||(n.state=B,n.pure?y.push(n):S.push(n),n.observers&&ae(n))}}function V(e){let t;if(e.sources)for(;e.sources.length;){const n=e.sources.pop(),s=e.sourceSlots.pop(),i=n.observers;if(i&&i.length){const r=i.pop(),l=n.observerSlots.pop();s<i.length&&(r.sourceSlots[l]=s,i[s]=r,n.observerSlots[s]=l)}}if(e.owned){for(t=e.owned.length-1;t>=0;t--)V(e.owned[t]);e.owned=null}if(e.cleanups){for(t=e.cleanups.length-1;t>=0;t--)e.cleanups[t]();e.cleanups=null}e.state=0}function Te(e){return e instanceof Error?e:new Error(typeof e=="string"?e:"Unknown error",{cause:e})}function de(e,t=h){throw Te(e)}function K(e){if(typeof e=="function"&&!e.length)return K(e());if(Array.isArray(e)){const t=[];for(let n=0;n<e.length;n++){const s=K(e[n]);Array.isArray(s)?t.push.apply(t,s):t.push(s)}return t}return e}function Ne(e,t){return function(s){let i;return j(()=>i=C(()=>(h.context={...h.context,[e]:s.value},oe(()=>s.children))),void 0),i}}const He=Symbol("fallback");function J(e){for(let t=0;t<e.length;t++)e[t]()}function Ie(e,t,n={}){let s=[],i=[],r=[],l=0,o=t.length>1?[]:null;return ie(()=>J(r)),()=>{let f=e()||[],d=f.length,a,c;return f[be],C(()=>{let p,b,w,k,v,x,A,$,H;if(d===0)l!==0&&(J(r),r=[],s=[],i=[],l=0,o&&(o=[])),n.fallback&&(s=[He],i[0]=M(ye=>(r[0]=ye,n.fallback())),l=1);else if(l===0){for(i=new Array(d),c=0;c<d;c++)s[c]=f[c],i[c]=M(E);l=d}else{for(w=new Array(d),k=new Array(d),o&&(v=new Array(d)),x=0,A=Math.min(l,d);x<A&&s[x]===f[x];x++);for(A=l-1,$=d-1;A>=x&&$>=x&&s[A]===f[$];A--,$--)w[$]=i[A],k[$]=r[A],o&&(v[$]=o[A]);for(p=new Map,b=new Array($+1),c=$;c>=x;c--)H=f[c],a=p.get(H),b[c]=a===void 0?-1:a,p.set(H,c);for(a=x;a<=A;a++)H=s[a],c=p.get(H),c!==void 0&&c!==-1?(w[c]=i[a],k[c]=r[a],o&&(v[c]=o[a]),c=b[c],p.set(H,c)):r[a]();for(c=x;c<d;c++)c in w?(i[c]=w[c],r[c]=k[c],o&&(o[c]=v[c],o[c](c))):i[c]=M(E);i=i.slice(0,l=d),s=f.slice(0)}return i});function E(p){if(r[c]=p,o){const[b,w]=G(c);return o[c]=w,t(f[c],b)}return t(f[c])}}}let he=!1;function Me(){he=!0}function Fe(e,t){if(he&&u.context){const n=u.context;N(we());const s=C(()=>e(t||{}));return N(n),s}return C(()=>e(t||{}))}const ge=e=>`Stale read from <${e}>.`;function Oe(e){const t="fallback"in e&&{fallback:()=>e.fallback};return m(Ie(()=>e.each,e.children,t||void 0))}function Ue(e){const t=e.keyed,n=m(()=>e.when,void 0,{equals:(s,i)=>t?s===i:!s==!i});return m(()=>{const s=n();if(s){const i=e.children;return typeof i=="function"&&i.length>0?C(()=>i(t?s:()=>{if(!C(n))throw ge("Show");return e.when})):i}return e.fallback},void 0,void 0)}function qe(e){let t=!1;const n=(r,l)=>(t?r[1]===l[1]:!r[1]==!l[1])&&r[2]===l[2],s=oe(()=>e.children),i=m(()=>{let r=s();Array.isArray(r)||(r=[r]);for(let l=0;l<r.length;l++){const o=r[l].when;if(o)return t=!!r[l].keyed,[l,o,r[l]]}return[-1]},void 0,{equals:n});return m(()=>{const[r,l,o]=i();if(r<0)return e.fallback;const f=o.children;return typeof f=="function"&&f.length>0?C(()=>f(t?l:()=>{if(C(i)[0]!==r)throw ge("Match");return o.when})):f},void 0,void 0)}function De(e){return e}const Le=re();function Ve(e){let t=0,n,s,i,r,l;const[o,f]=G(!1),d=me(),a={increment:()=>{++t===1&&f(!0)},decrement:()=>{--t===0&&f(!1)},inFallback:o,effects:[],resolved:!1},c=Ce();if(u.context&&u.load){const b=u.getContextId();let w=u.load(b);if(w&&(typeof w!="object"||w.status!=="success"?i=w:u.gather(b)),i&&i!=="$$f"){const[k,v]=G(void 0,{equals:!1});r=k,i.then(()=>{if(u.done)return v();u.gather(b),N(s),v(),N()},x=>{l=x,v()})}}const E=le(Le);E&&(n=E.register(a.inFallback));let p;return ie(()=>p&&p()),Fe(d.Provider,{value:a,get children(){return m(()=>{if(l)throw l;if(s=u.context,r)return r(),r=void 0;s&&i==="$$f"&&N();const b=m(()=>e.children);return m(w=>{const k=a.inFallback(),{showContent:v=!0,showFallback:x=!0}=n?n():{};if((!k||i&&i!=="$$f")&&v)return a.resolved=!0,p&&p(),p=s=i=void 0,ve(a.effects),b();if(x)return p?w:M(A=>(p=A,s&&(N({id:s.id+"F",count:0}),s=void 0),e.fallback),c)})})}})}function _e(e,t,n){let s=n.length,i=t.length,r=s,l=0,o=0,f=t[i-1].nextSibling,d=null;for(;l<i||o<r;){if(t[l]===n[o]){l++,o++;continue}for(;t[i-1]===n[r-1];)i--,r--;if(i===l){const a=r<s?o?n[o-1].nextSibling:n[r-o]:f;for(;o<r;)e.insertBefore(n[o++],a)}else if(r===o)for(;l<i;)(!d||!d.has(t[l]))&&t[l].remove(),l++;else if(t[l]===n[r-1]&&n[o]===t[i-1]){const a=t[--i].nextSibling;e.insertBefore(n[o++],t[l++].nextSibling),e.insertBefore(n[--r],a),t[i]=n[r]}else{if(!d){d=new Map;let c=o;for(;c<r;)d.set(n[c],c++)}const a=d.get(t[l]);if(a!=null)if(o<a&&a<r){let c=l,E=1,p;for(;++c<i&&c<r&&!((p=d.get(t[c]))==null||p!==a+E);)E++;if(E>a-o){const b=t[l];for(;o<a;)e.insertBefore(n[o++],b)}else e.replaceChild(n[o++],t[l++])}else l++;else t[l++].remove()}}}const Z="_$DX_DELEGATE";function z(e,t,n,s={}){let i;return M(r=>{i=r,t===document?e():Pe(t,e(),t.firstChild?null:void 0,n)},s.owner),()=>{i(),t.textContent=""}}function Re(e,t,n){let s;const i=()=>{const l=document.createElement("template");return l.innerHTML=e,l.content.firstChild},r=()=>(s||(s=i())).cloneNode(!0);return r.cloneNode=r,r}function Ge(e,t=window.document){const n=t[Z]||(t[Z]=new Set);for(let s=0,i=e.length;s<i;s++){const r=e[s];n.has(r)||(n.add(r),t.addEventListener(r,pe))}}function Ke(e,t,n){_(e)||(e[t]=n)}function We(e,t,n){_(e)||(n==null?e.removeAttribute(t):e.setAttribute(t,n))}function Pe(e,t,n,s){if(n!==void 0&&!s&&(s=[]),typeof t!="function")return q(e,t,s,n);j(i=>q(e,t(),i,n),s)}function Be(e,t,n={}){if(globalThis._$HY.done)return z(e,t,[...t.childNodes],n);u.completed=globalThis._$HY.completed,u.events=globalThis._$HY.events,u.load=s=>globalThis._$HY.r[s],u.has=s=>s in globalThis._$HY.r,u.gather=s=>te(t,s),u.registry=new Map,u.context={id:n.renderId||"",count:0};try{return te(t,n.renderId),z(e,t,[...t.childNodes],n)}finally{u.context=null}}function Qe(e){let t,n;return!_()||!(t=u.registry.get(n=je()))?e():(u.completed&&u.completed.add(t),u.registry.delete(n),t)}function Xe(e){let t=e,n=0,s=[];if(_(e))for(;t;){if(t.nodeType===8){const i=t.nodeValue;if(i==="$")n++;else if(i==="/"){if(n===0)return[t,s];n--}}s.push(t),t=t.nextSibling}return[t,s]}function Je(){u.events&&!u.events.queued&&(queueMicrotask(()=>{const{completed:e,events:t}=u;for(t.queued=!1;t.length;){const[n,s]=t[0];if(!e.has(n))return;t.shift(),pe(s)}u.done&&(u.events=_$HY.events=null,u.completed=_$HY.completed=null)}),u.events.queued=!0)}function _(e){return!!u.context&&!u.done&&(!e||e.isConnected)}function pe(e){if(u.registry&&u.events&&u.events.find(([s,i])=>i===e))return;const t=`$$${e.type}`;let n=e.composedPath&&e.composedPath()[0]||e.target;for(e.target!==n&&Object.defineProperty(e,"target",{configurable:!0,value:n}),Object.defineProperty(e,"currentTarget",{configurable:!0,get(){return n||document}}),u.registry&&!u.done&&(u.done=_$HY.done=!0);n;){const s=n[t];if(s&&!n.disabled){const i=n[`${t}Data`];if(i!==void 0?s.call(n,i,e):s.call(n,e),e.cancelBubble)return}n=n._$host||n.parentNode||n.host}}function q(e,t,n,s,i){const r=_(e);if(r){!n&&(n=[...e.childNodes]);let f=[];for(let d=0;d<n.length;d++){const a=n[d];a.nodeType===8&&a.data.slice(0,2)==="!$"?a.remove():f.push(a)}n=f}for(;typeof n=="function";)n=n();if(t===n)return n;const l=typeof t,o=s!==void 0;if(e=o&&n[0]&&n[0].parentNode||e,l==="string"||l==="number"){if(r||l==="number"&&(t=t.toString(),t===n))return n;if(o){let f=n[0];f&&f.nodeType===3?f.data!==t&&(f.data=t):f=document.createTextNode(t),n=I(e,n,s,f)}else n!==""&&typeof n=="string"?n=e.firstChild.data=t:n=e.textContent=t}else if(t==null||l==="boolean"){if(r)return n;n=I(e,n,s)}else{if(l==="function")return j(()=>{let f=t();for(;typeof f=="function";)f=f();n=q(e,f,n,s)}),()=>n;if(Array.isArray(t)){const f=[],d=n&&Array.isArray(n);if(W(f,t,n,i))return j(()=>n=q(e,f,n,s,!0)),()=>n;if(r){if(!f.length)return n;if(s===void 0)return n=[...e.childNodes];let a=f[0];if(a.parentNode!==e)return n;const c=[a];for(;(a=a.nextSibling)!==s;)c.push(a);return n=c}if(f.length===0){if(n=I(e,n,s),o)return n}else d?n.length===0?ee(e,f,s):_e(e,n,f):(n&&I(e),ee(e,f));n=f}else if(t.nodeType){if(r&&t.parentNode)return n=o?[t]:t;if(Array.isArray(n)){if(o)return n=I(e,n,s,t);I(e,n,null,t)}else n==null||n===""||!e.firstChild?e.appendChild(t):e.replaceChild(t,e.firstChild);n=t}}return n}function W(e,t,n,s){let i=!1;for(let r=0,l=t.length;r<l;r++){let o=t[r],f=n&&n[e.length],d;if(!(o==null||o===!0||o===!1))if((d=typeof o)=="object"&&o.nodeType)e.push(o);else if(Array.isArray(o))i=W(e,o,f)||i;else if(d==="function")if(s){for(;typeof o=="function";)o=o();i=W(e,Array.isArray(o)?o:[o],Array.isArray(f)?f:[f])||i}else e.push(o),i=!0;else{const a=String(o);f&&f.nodeType===3&&f.data===a?e.push(f):e.push(document.createTextNode(a))}}return i}function ee(e,t,n=null){for(let s=0,i=t.length;s<i;s++)e.insertBefore(t[s],n)}function I(e,t,n,s){if(n===void 0)return e.textContent="";const i=s||document.createTextNode("");if(t.length){let r=!1;for(let l=t.length-1;l>=0;l--){const o=t[l];if(i!==o){const f=o.parentNode===e;!r&&!l?f?e.replaceChild(i,o):e.insertBefore(i,n):f&&o.remove()}else r=!0}}else e.insertBefore(i,n);return[i]}function te(e,t){const n=e.querySelectorAll("*[data-hk]");for(let s=0;s<n.length;s++){const i=n[s],r=i.getAttribute("data-hk");(!t||r.startsWith(t))&&!u.registry.has(r)&&u.registry.set(r,i)}}function je(){return u.getNextContextId()}const Ze=(...e)=>(Me(),Be(...e));export{Oe as F,De as M,Ue as S,Xe as a,j as b,Fe as c,qe as d,Ge as e,G as f,Qe as g,Ke as h,Pe as i,Ze as j,z as k,Ve as l,Ye as o,Je as r,We as s,Re as t};
