var Flexie=function(x,E){function F(a){if(a)a=a.replace(va,w).replace(wa,w);return a}function h(a,d){var c,b=0,e=a?a.length:P;if(e===P)for(c in a){if(a.hasOwnProperty(c))if(d.call(a[c],c,a[c])===I)break}else for(c=a[0];b<e&&d.call(c,b,c)!==I;c=a[++b]);}function xa(){var a;h(X,function(d,c){if(x[d]&&!a)if(a=eval(c.s.replace("*",d))){Y=d;return false}});return a}function Z(a,d){a="on"+a;var c=x[a];x[a]=typeof x[a]!=="function"?d:function(){c&&c();d()}}function $(a){var d=a.nodeName.toLowerCase();if(a.id)d+=
"#"+a.id;else if(a.FLX_DOM_ID)d+="["+aa+"='"+a.FLX_DOM_ID+"']";return d}function T(a){if(!a.FLX_DOM_ID){U+=1;a.FLX_DOM_ID=U;a.setAttribute(aa,a.FLX_DOM_ID)}}function ya(a){var d=[],c,b,e,f,g,i;a=a.replace(za,w);a=a.replace(/\s?(\{|\:|\})\s?/g,Q);a=a.split(ba);h(a,function(k,l){if(l){c=[l,ba].join(w);if((b=/(\@media[^\{]+\{)?(.*)\{(.*)\}/.exec(c))&&b[3]){e=b[2];f=b[3].split(";");i=[];h(f,function(n,o){g=o.split(":");g.length&&g[1]&&i.push({property:g[0],value:g[1]})});e&&i.length&&d.push({selector:e,
properties:i})}}});return d}function Aa(a){var d,c,b,e,f,g=/\s?,\s?/,i,k,l={},n={};i=function(o,p,m,j){var q={selector:F(o),properties:[]};h(p.properties,function(r,u){q.properties.push({property:F(u.property),value:F(u.value)})});if(m&&j)q[m]=j;return q};k=function(o,p,m,j){var q=m&&j?l[o]:n[o],r;if(q){h(p.properties,function(u,A){h(q.properties,function(J,B){if(A.property===B.property){r=J;return false}});if(r)q.properties[r]=A;else q.properties.push(A)});if(m&&j)q[m]=j}else if(m&&j)l[o]=i(o,p,
m,j);else n[o]=i(o,p,t,t)};h(a,function(o,p){d=F(p.selector).replace(g,",").split(g);h(d,function(m,j){j=F(j);c=p.properties;h(c,function(q,r){b=F(r.property);e=F(r.value);if(b){f=b.replace("box-",w);switch(f){case "display":e==="box"&&k(j,p,t,t);break;case "orient":case "align":case "direction":case "pack":k(j,p,t,t);break;case "flex":case "flex-group":case "ordinal-group":k(j,p,f,e)}}})})});h(n,function(o,p){y.push(p)});h(l,function(o,p){ca.push(p)});return{boxes:y,children:ca}}function da(a,d,
c){var b,e,f=[];h(c,function(g,i){if(i.selector){b=d(i.selector);b=b[0]?b:[b];b[0]&&h(b,function(k,l){if(l.nodeName!==P)switch(l.nodeName.toLowerCase()){case "script":case "style":case "link":break;default:if(l.parentNode===a){T(l);e={};h(i,function(n){e[n]=i[n]});e.match=l;f.push(e)}}})}else{T(i);f.push({match:i,selector:$(i)})}});return f}function Ba(a){h(a,function(d,c){a[d]=c||Ca[d]});return a}function Da(a){var d,c,b,e,f,g,i,k,l,n,o,p,m,j,q={},r,u,A,J="["+R+"]";if(a){h(a.boxes,function(B,C){C.selector=
F(C.selector);d=C.selector;c=C.properties;g=i=k=l=n=t;h(c,function(Ea,G){b=F(G.property);e=F(G.value);if(b){f=b.replace("box-",w);switch(f){case "display":if(e==="box")g=e;break;case "orient":i=e;break;case "align":k=e;break;case "direction":l=e;break;case "pack":n=e}}});o=K;p=o(C.selector);p=p[0]?p:[p];h(p,function(Ea,G){if(G.nodeType){T(G);m=da(G,o,a.children);A=d+" "+J;j={target:G,selector:d,properties:c,children:m,display:g,orient:i,align:k,direction:l,pack:n,nested:A};if(r=q[G.FLX_DOM_ID])h(j,
function(L,N){switch(L){case "selector":if(N&&!RegExp(N).test(r[L]))r[L]+=", "+N;break;case "children":h(j[L],function(Wa,ea){u=I;h(r[L],function(Xa,Fa){if(ea.match.FLX_DOM_ID===Fa.match.FLX_DOM_ID)u=s});u||r[L].push(ea)});break;default:if(N)r[L]=N}});else{q[G.FLX_DOM_ID]=Ba(j);q[G.FLX_DOM_ID].target.setAttribute(R,s)}}})});fa=K(J);y={};h(fa,function(B,C){y[C.FLX_DOM_ID]=q[C.FLX_DOM_ID]});h(y,function(B,C){C.display==="box"&&new z.box(C)})}}function ga(a,d,c){c=c.replace(c.charAt(0),c.charAt(0).toUpperCase());
var b=a["offset"+c]||0;b&&h(d,function(e,f){f=parseFloat(a.currentStyle[f]);isNaN(f)||(b-=f)});return b}function ha(a,d){var c,b,e=a.currentStyle&&a.currentStyle[d],f=a.style;if(!ia.test(e)&&Ga.test(e)){c=f.left;b=a.runtimeStyle.left;a.runtimeStyle.left=a.currentStyle.left;f.left=e||0;e=f.pixelLeft+"px";f.left=c||0;a.runtimeStyle.left=b}return e}function v(a,d,c){if(a!==P){if(x.getComputedStyle)a=x.getComputedStyle(a,t)[d];else if(Ha.test(d)){var b=a&&a.currentStyle?a.currentStyle[d]:0;if(!ia.test(b)){if(b===
"auto"||b==="medium"){switch(d){case "width":b=[ja,ka,la,ma];b=ga(a,b,d);break;case "height":b=[V,na,oa,pa];b=ga(a,b,d);break;default:b=ha(a,d)}a=b}else a=ha(a,d);b=a}a=b}else a=a.currentStyle[d];if(c){a=parseInt(a,10);if(isNaN(a))a=0}return a}}function Ia(a){return a.innerWidth||a.clientWidth}function Ja(a){return a.innerHeight||a.clientHeight}function W(a,d,c,b){var e=[];h(Ka,function(f,g){e.push((b?g:w)+d+":"+(!b?g:w)+c)});a.style.cssText+=e.join(";");return a}function D(a,d,c){h(a&&a[0]?a:[a],
function(b,e){if(e&&e.style)e.style[d]=c?c+"px":w})}function La(a){var d,c;a=a.replace(Ma,function(b,e){return"%"+e}).replace(/\s|\>|\+|\~/g,"%").split(/%/g);d={_id:100,_class:10,_tag:1};c=0;h(a,function(b,e){if(/#/.test(e))c+=d._id;else if(/\.|\[|\:/.test(e))c+=d._class;else if(/[a-zA-Z]+/.test(e))c+=d._tag});return c}function Na(a,d,c){var b=[],e,f=(c?"ordinal":"flex")+"Specificity";h(a,function(g,i){if(!c&&i.flex||c&&i["ordinal-group"]){i[f]=i[f]||La(i.selector);e=I;h(b,function(k,l){if(l.match===
i.match){if(l[f]<i[f])b[k]=i;e=s;return I}});e||b.push(i)}});return b}function S(a,d,c){var b={},e=[],f=0,g;a=Na(a,d,c);h(d,function(i,k){h(a,function(l,n){if(c){g=n["ordinal-group"]||"1";if(n.match===k){n.match.setAttribute("data-ordinal-group",g);b[g]=b[g]||[];b[g].push(n)}}else{g=n.flex||"0";if(n.match===k&&(!n[g]||n[g]&&parseInt(n[g],10)<=1)){f+=parseInt(g,10);b[g]=b[g]||[];b[g].push(n)}}});if(c&&!k.getAttribute("data-ordinal-group")){g="1";k.setAttribute("data-ordinal-group",g);b[g]=b[g]||[];
b[g].push({match:k})}});h(b,function(i){e.push(i)});e.sort(function(i,k){return k-i});return{keys:e,groups:b,total:f}}function Oa(){if(!qa){var a,d,c,b,e=E.body,f=E.documentElement,g;Z("resize",function(){g&&window.clearTimeout(g);g=window.setTimeout(function(){c=x.innerWidth||f.innerWidth||f.clientWidth||e.clientWidth;b=x.innerHeight||f.innerHeight||f.clientHeight||e.clientHeight;if(a!==c||d!==b){z.updateInstance(t,t);a=c;d=b}},250)});qa=s}}function ra(a){var d,c;h(a,function(b,e){d=e.style.width;
c=e.style.height;e.style.cssText=w;e.style.width=d;e.style.height=c})}function O(a,d){var c=[],b,e,f;e=0;for(f=d.length;e<f;e++)if(b=d[e])switch(b.nodeName.toLowerCase()){case "script":case "style":case "link":break;default:if(b.nodeType===1)c.push(b);else if(b.nodeType===3&&(b.isElementContentWhitespace||Pa.test(b.data))){a.removeChild(b);e--}}return c}function sa(a){var d=0;a=a.parentNode;for(var c;a.FLX_DOM_ID;){c=y[a.FLX_DOM_ID];c=S(c.children,O(a,a.childNodes),t);d+=c.total;c=s;a=a.parentNode}return{nested:c,
flex:d}}function Qa(a,d){var c=a.parentNode,b;if(c.FLX_DOM_ID){c=y[c.FLX_DOM_ID];h(c.properties,function(e,f){if(RegExp(d).test(f.property)){b=s;return I}})}return b}function Ra(a){a.flexMatrix&&h(a.children,function(d,c){c.flex=a.flexMatrix[d]});a.ordinalMatrix&&h(a.children,function(d,c){c["ordinal-group"]=a.ordinalMatrix[d]});return a}function Sa(a,d){var c=a.target;if(!c.FLX_DOM_ID)c.FLX_DOM_ID=c.FLX_DOM_ID||++U;if(!a.nodes)a.nodes=O(c,c.childNodes);if(!a.selector){a.selector=$(c);c.setAttribute(R,
s)}if(!a.properties)a.properties=[];if(!a.children)a.children=da(c,K,O(c,c.childNodes));if(!a.nested)a.nested=a.selector+" ["+R+"]";a.target=c;a._instance=d;return a}var z={},U=0,aa="data-flexie-id",R="data-flexie-parent",H,Y,X={NW:{s:"*.Dom.select"},DOMAssistant:{s:"*.$",m:"*.DOMReady"},Prototype:{s:"$$",m:"document.observe",p:"dom:loaded",c:"document"},YAHOO:{s:"*.util.Selector.query",m:"*.util.Event.onDOMReady",c:"*.util.Event"},MooTools:{s:"$$",m:"window.addEvent",p:"domready"},Sizzle:{s:"*"},
jQuery:{s:"*",m:"*(document).ready"},dojo:{s:"*.query",m:"*.addOnLoad"}},K,ia=/^-?\d+(?:px)?$/i,Ga=/^-?\d/,Ha=/width|height|margin|padding|border/,Ta=/(msie) ([\w.]+)/,za=/\t|\n|\r/g,Ua=/^max\-([a-z]+)/,Va=/^https?:\/\//i,va=/^\s\s*/,wa=/\s\s*$/,Pa=/^\s*$/,Ma=/\s?(\#|\.|\[|\:(\:)?[^first\-(line|letter)|before|after]+)/g,w="",ta=" ",Q="$1",ka="paddingRight",na="paddingBottom",ja="paddingLeft",V="paddingTop",ma="borderRightWidth",pa="borderBottomWidth",la="borderLeftWidth",oa="borderTopWidth",ba="}",
Ka=" -o- -moz- -ms- -webkit- -khtml- ".split(ta),Ca={orient:"horizontal",align:"stretch",direction:"inherit",pack:"start"},y=[],ca=[],fa,qa,s=true,I=false,t=null,P,M={IE:function(){var a,d=Ta.exec(x.navigator.userAgent.toLowerCase());if(d)a=parseInt(d[2],10);return a}()},ua;ua=function(){function a(m){return m.replace(k,function(j,q,r){j=r.split(",");h(j,function(u,A){A.replace(l,Q).replace(n,Q).replace(p,Q).replace(o,ta)});return q+j.join(",")})}function d(){if(x.XMLHttpRequest)return new x.XMLHttpRequest;
try{return new x.ActiveXObject("Microsoft.XMLHTTP")}catch(m){return t}}function c(m){var j=d();j.open("GET",m,I);j.send();return j.status===200?j.responseText:w}function b(m,j){if(m){if(Va.test(m))return j.substring(0,j.indexOf("/",8))===m.substring(0,m.indexOf("/",8))?m:t;if(m.charAt(0)==="/")return j.substring(0,j.indexOf("/",8))+m;var q=j.split("?")[0];if(m.charAt(0)!=="?"&&q.charAt(q.length-1)!=="/")q=q.substring(0,q.lastIndexOf("/")+1);return q+m}}function e(m){if(m)return c(m).replace(f,w).replace(g,
function(j,q,r,u,A,J){j=e(b(r||A,m));return J?"@media "+J+" {"+j+"}":j}).replace(i,function(j,q,r,u){r=r||w;return q?j:" url("+r+b(u,m,true)+r+") "});return w}var f=/(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)\s*?/g,g=/@import\s*(?:(?:(?:url\(\s*(['"]?)(.*)\1)\s*\))|(?:(['"])(.*)\3))\s*([^;]*);/g,i=/(behavior\s*?:\s*)?\burl\(\s*(["']?)(?!data:)([^"')]+)\2\s*\)/g,k=/((?:^|(?:\s*})+)(?:\s*@media[^{]+{)?)\s*([^\{]*?[\[:][^{]+)/g,l=/([(\[+~])\s+/g,n=/\s+([)\]+~])/g,o=/\s+/g,p=/^\s*((?:[\S\s]*\S)?)\s*$/;return function(){var m,
j,q;j=E.getElementsByTagName("BASE");var r=j.length>0?j[0].href:E.location.href,u;j=0;for(q=E.styleSheets.length;j<q;j++)if((m=E.styleSheets[j])&&m.href!==t)if(m=b(m.href,r)){u=a(e(m));u=ya(u);u=Aa(u)}Da(u)}}();z.box=function(a){return this.renderModel(a)};z.box.prototype={properties:{boxModel:function(a,d,c){var b,e;a.style.display="block";if(M.IE===8)a.style.overflow="hidden";if(!c.cleared){selectors=c.selector.split(/\s?,\s?/);b=E.styleSheets;b=b[b.length-1];e="padding-top:"+(v(a,V,t)||"0.1px;");
h(selectors,function(f,g){if(b.addRule)if(M.IE<8){a.style.zoom="1";if(M.IE===6)b.addRule(g.replace(/\>|\+|\~/g,""),e+"zoom:1;",0);else M.IE===7&&b.addRule(g,e+"display:inline-block;",0)}else{b.addRule(g,e,0);b.addRule(g+":before","content: '.';display: block;height: 0;overflow: hidden",0);b.addRule(g+":after","content: '.';display: block;height: 0;overflow: hidden;clear:both;",0)}else if(b.insertRule){b.insertRule(g+"{"+e+"}",0);b.insertRule(g+":after{content: '.';display: block;height: 0;overflow: hidden;clear:both;}",
0)}});c.cleared=s}},boxDirection:function(a,d,c){var b;if(c.direction==="reverse"&&!c.reversed||c.direction==="normal"&&c.reversed){d=d.reverse();h(d,function(e,f){a.appendChild(f)});d=K(c.nested);h(d,function(e,f){if((b=y[f.FLX_DOM_ID])&&b.direction==="inherit")b.direction=c.direction});c.reversed=!c.reversed}},boxOrient:function(a,d,c){var b;a={pos:"marginLeft",opp:"marginRight",dim:"width",out:"offsetWidth",func:Ia,pad:[ja,ka,la,ma]};b={pos:"marginTop",opp:"marginBottom",dim:"height",out:"offsetHeight",
func:Ja,pad:[V,na,oa,pa]};H||h(d,function(e,f){f.style[M.IE>=9?"cssFloat":"styleFloat"]="left";if(c.orient==="vertical"||c.orient==="block-axis")f.style.clear="left";if(M.IE===6)f.style.display="inline"});switch(c.orient){case "vertical":case "block-axis":this.props=b;this.anti=a;break;default:this.props=a;this.anti=b}},boxOrdinalGroup:function(a,d,c){var b,e;if(d.length){b=function(f){f=f.keys;h(c.reversed?f:f.reverse(),function(g,i){h(d,function(k,l){i===l.getAttribute("data-ordinal-group")&&a.appendChild(l)})})};
e=S(c.children,d,s);e.keys.length>1&&b(e)}},boxFlex:function(a,d,c){var b=this,e,f,g,i;if(d.length){e=function(k){var l=k.groups,n;h(k.keys,function(o,p){h(l[p],function(m,j){n=t;h(j.properties,function(q,r){if(Ua.test(r.property))n=parseFloat(r.value)});if(!n||j.match[b.props.out]>n)D(j.match,b.props.pos,t)})})};f=function(k){var l=0,n;h(d,function(o,p){l+=v(p,b.props.dim,s);h(b.props.pad,function(m,j){l+=v(p,j,s)});l+=v(p,b.props.pos,s);l+=v(p,b.props.opp,s)});n=a[b.props.out]-l;h(b.props.pad,function(o,
p){n-=v(a,p,s)});return{whitespace:n,ration:n/k.total}};g=function(k,l){var n=k.groups,o,p,m=l.ration,j,q,r;h(k.keys,function(u,A){j=m*A;h(n[A],function(J,B){if(B.match){o=B.match.getAttribute("data-flex");p=B.match.getAttribute("data-specificity");if(!o||p<=B.flexSpecificity){B.match.setAttribute("data-flex",A);B.match.setAttribute("data-specificity",B.flexSpecificity);q=v(B.match,b.props.dim,s);r=Math.max(0,q+j);D(B.match,b.props.dim,r)}}})})};i=S(c.children,d,t);if(i.total){c.hasFlex=s;e(i);c=
f(i);g(i,c)}}},boxAlign:function(a,d,c){var b=this,e,f,g=sa(a);if(!H&&!g.flex&&(c.orient==="vertical"||c.orient==="block-axis")){Qa(a,b.anti.dim)||D(a,b.anti.dim,t);D(d,b.anti.dim,t)}e=a[b.anti.out];h(b.anti.pad,function(i,k){e-=v(a,k,s)});switch(c.align){case "start":break;case "end":h(d,function(i,k){f=e-k[b.anti.out];f-=v(k,b.anti.opp,s);D(k,b.anti.pos,f)});break;case "center":h(d,function(i,k){f=(e-k[b.anti.out])/2;D(k,b.anti.pos,f)});break;default:h(d,function(i,k){switch(k.nodeName.toLowerCase()){case "button":case "input":case "select":break;
default:var l=0;h(b.anti.pad,function(n,o){l+=v(k,o,s);l+=v(a,o,s)});k.style[b.anti.dim]="100%";f=k[b.anti.out]-l;D(k,b.anti.dim,t);f=e;f-=v(k,b.anti.pos,s);h(b.anti.pad,function(n,o){f-=v(k,o,s)});f-=v(k,b.anti.opp,s);f=Math.max(0,f);D(k,b.anti.dim,f)}})}},boxPack:function(a,d,c){var b=this,e=0,f=0,g=0,i,k,l;l=d.length-1;h(d,function(n,o){e+=o[b.props.out];e+=v(o,b.props.pos,s);e+=v(o,b.props.opp,s)});f=v(d[0],b.props.pos,s);i=a[b.props.out]-e;h(b.props.pad,function(n,o){i-=v(a,o,s)});if(i<0)i=Math.max(0,
i);switch(c.pack){case "end":D(d[0],b.props.pos,g+f+i);break;case "center":if(g)g/=2;D(d[0],b.props.pos,g+f+Math.floor(i/2));break;case "justify":c=Math.floor((g+i)/l);l=c*l-i;for(g=d.length-1;g;){f=d[g];k=c;if(l){k++;l++}k=v(f,b.props.pos,s)+k;D(f,b.props.pos,k);g--}}a.style.overflow=""}},setup:function(a,d,c){var b=this,e,f;if(!(!a||!d||!c))if(H&&H.partialSupport){e=S(c.children,d,t);f=sa(a);d=O(a,a.childNodes);b.properties.boxOrient.call(b,a,d,c);if(!e.total||!K(c.nested).length){if(c.align===
"stretch"&&!H.boxAlignStretch&&(!f.nested||!f.flex))b.properties.boxAlign.call(b,a,d,c);c.pack==="justify"&&!H.boxPackJustify&&!e.total&&b.properties.boxPack.call(b,a,d,c)}}else H||h(b.properties,function(g,i){i.call(b,a,O(a,a.childNodes),c)})},trackDOM:function(a){Oa(this,a)},updateModel:function(a){var d=a.target,c=a.nodes;ra(c);if(a.flexMatrix||a.ordinalMatrix)a=Ra(a);this.setup(d,c,a);this.bubbleUp(d,a)},renderModel:function(a){var d=this,c=a.target,b=c.childNodes;if(!c.length&&!b)return false;
a=Sa(a,this);d.updateModel(a);x.setTimeout(function(){d.trackDOM(a)},0);return d},bubbleUp:function(a,d){for(var c,b=d.target.parentNode;b;){if(c=y[b.FLX_DOM_ID]){ra(c.nodes);this.setup(c.target,c.nodes,c)}b=b.parentNode}}};z.updateInstance=function(a,d){var c;if(a)if(c=y[a.FLX_DOM_ID])c._instance.updateModel(c);else c=new z.box(d);else h(y,function(b,e){e._instance.updateModel(e)})};z.getInstance=function(a){return y[a.FLX_DOM_ID]};z.destroyInstance=function(a){var d;d=function(c){c.target.FLX_DOM_ID=
t;c.target.style.cssText=w;h(c.children,function(b,e){e.match.style.cssText=w})};if(a)(a=y[a.FLX_DOM_ID])&&d(a);else{h(y,function(c,b){d(b)});y=[]}};z.flexboxSupport=function(){var a={},d,c=E.createElement("flxbox"),b;c.style.width=c.style.height="100px";c.innerHTML='<b style="margin: 0; padding: 0; display:block; width: 10px; height:50px"></b><b style="margin: 0; padding: 0; display:block; width: 10px; height:50px"></b><b style="margin: 0; padding: 0; display:block; width: 10px; height:50px"></b>';
W(c,"display","box",t);W(c,"box-align","stretch",s);W(c,"box-pack","justify",s);E.body.appendChild(c);d=c.firstChild.offsetHeight;h({boxAlignStretch:function(){return d===100},boxPackJustify:function(){var e=0;h(c.childNodes,function(f,g){e+=g.offsetLeft});return e===135}},function(e,f){b=f();if(!b)a.partialSupport=s;a[e]=b});E.body.removeChild(c);return~c.style.display.indexOf("box")?a:I};z.init=function(){z.flexboxSupported=H=z.flexboxSupport();if((!H||H.partialSupport)&&K)ua()};z.version="1.0.3";
(function(a){Y||(K=xa());var d,c,b;h(X,function(e,f){if(x[e]&&!d&&f.m){d=eval(f.m.replace("*",e));c=f.c?eval(f.c.replace("*",e)):x;b=[];if(d&&c){f.p&&b.push(f.p);b.push(a);d.apply(c,b);return false}}});d||Z("load",a)})(z.init);return z}(this,document);

var Transformie = {
	
	defaults: {
		inlineCSS: '*',
		stylesheets: true,
		track: '*',
		centerOrigin: 'margin' //false, position
	},
	
	toRadian: function(value) {
		if(value.indexOf("deg") != -1) {
			return parseFloat(value,10) * (Math.PI * 2 / 360);
		} else if (value.indexOf("grad") != -1) {
			return parseFloat(value,10) * (Math.PI/200);
		} else {
			return parseFloat(value,10);
		}
	},
	
	getTransformValue: function(style) {
		return style['-webkit-transform']
		|| 	style['webkit-transform'] 
		|| 	style['transform']
		|| 	style.webkitTransform
		||	style['-moz-transform']
		|| 	style['moz-transform'] 
		|| 	style.MozTransform
		|| 	style.mozTransform;
	},
	
	track: function(query) {
		jQuery(query).unbind('propertychange').bind('propertychange', function(e) {
			if(e.originalEvent.propertyName == 'style.webkitTransform' || e.originalEvent.propertyName == 'style.MozTransform' || e.originalEvent.propertyName == 'style.transform')
				Transformie.applyMatrixToElement(Transformie.computeMatrix(Transformie.getTransformValue(this.style)), this);
		});
	},
	
	apply: function(selector) {
		jQuery(selector).each(function() {
			var foundRule = Transformie.getTransformValue(this.style);
			foundRule && Transformie.applyMatrixToElement(Transformie.computeMatrix(foundRule), this);
		});
	},
	
	parseStylesheets: function() {	
		//Loop through all stylesheets and apply initial rules
		for (var i=0; i < document.styleSheets.length; i++) {
			if(document.styleSheets[i].readOnly) continue; // if the stylesheet gives us security issues and is readOnly, exit here
			for (var j=0; j < document.styleSheets[i].rules.length; j++) {
				var foundRule = Transformie.getTransformValue(document.styleSheets[i].rules[j].style);
				foundRule && Transformie.applyMatrixToSelector(Transformie.computeMatrix(foundRule), document.styleSheets[i].rules[j].selectorText);
			};
		};	
		
	},
	
	applyMatrixToSelector: function(matrix, selector) {

		//TODO: Figure what to do with :hover, can't just apply it to found elements
		if(selector.indexOf && selector.indexOf(':hover') != -1)
			return;
		
		jQuery(selector).each(function() {
			Transformie.applyMatrixToElement(matrix, this);
		});
		
	},
	
	applyMatrixToElement: function(matrix, element) {
		
		if(!element.filters["DXImageTransform.Microsoft.Matrix"]) {
			element.style.filter = (element.style.filter ? '' : ' ' ) + "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand')";
			Transformie.track(element); // if an element is being tracked once, it is likely we do something with it later on, so track changes on this one by default
		}

		element.filters["DXImageTransform.Microsoft.Matrix"].M11 = matrix.elements[0][0];
		element.filters["DXImageTransform.Microsoft.Matrix"].M12 = matrix.elements[0][1];
		element.filters["DXImageTransform.Microsoft.Matrix"].M21 = matrix.elements[1][0];
		element.filters["DXImageTransform.Microsoft.Matrix"].M22 = matrix.elements[1][1];
		
		// Since we unfortunately do not have the possibility to use Dx,Dy with sizing method 'auto expand', we need to do
		// something hacky to work around supporting the transform-origin property, either modifying top/left or margins.
		// IE Team: Would be really helpful if you could fix this to work on auto expand, or introduce a sizing method that works like the default, but doesn't clip..
		if(Transformie.defaults.centerOrigin) { //TODO: Add computed borders here to clientWidth/height or find a better prop to look for
			element.style[Transformie.defaults.centerOrigin == 'margin' ? 'marginLeft' : 'left'] = -(element.offsetWidth/2) + (element.clientWidth/2) + "px";
			element.style[Transformie.defaults.centerOrigin == 'margin' ? 'marginTop' : 'top'] = -(element.offsetHeight/2) + (element.clientHeight/2) + "px";
		}
		
	},
	
	computeMatrix: function(ruleValue) {
	
		//Split the webkit functions and loop through them
		var functions = ruleValue.match(/[A-z]+\([^\)]+/g) || [];
		var matrices = [];
		
		for (var k=0; k < functions.length; k++) {
		
			//Prepare the function name and its value
			var func = functions[k].split('(')[0],
				value = functions[k].split('(')[1];
		
			//Now we rotate through the functions and add it to our matrix
			switch(func) {
				case 'matrix': //Attention: Matrix in IE doesn't support e,f = tx,ty = translation
					var values = value.split(',');
					matrices.push($M([
						[values[0],	values[2],	0],
						[values[1],	values[3],	0],
						[0,					0,	1]
					]));
					break;
				case 'rotate':
					var a = Transformie.toRadian(value);
					matrices.push($M([
						[Math.cos(a),	-Math.sin(a),	0],
						[Math.sin(a),	Math.cos(a),	0],
						[0,				0,				1]
					]));
					break;
				case 'scale':
					matrices.push($M([
						[value,	0,		0],
						[0,		value,	0],
						[0,		0,		1]
					]));
					break;
				case 'scaleX':
					matrices.push($M([
						[value,	0,		0],
						[0,		1,		0],
						[0,		0,		1]
					]));
					break;
				case 'scaleY':
					matrices.push($M([
						[1,		0,		0],
						[0,		value,	0],
						[0,		0,		1]
					]));
					break;
				case 'skew':
					var a = Transformie.toRadian(value);
					matrices.push($M([
						[1,				0,	0],
						[Math.tan(a),	1,	0],
						[0,				0,	1]
					]));
				case 'skewX':
					var a = Transformie.toRadian(value);
					matrices.push($M([
						[1,		Math.tan(a),0],
						[0,		1,			0],
						[0,		0,			1]
					]));
					break;
				case 'skewY':
					var a = Transformie.toRadian(value);
					matrices.push($M([
						[1,				0,	0],
						[Math.tan(a),	1,	0],
						[0,				0,	1]
					]));
					break;
			};
			
		};
		
		if(!matrices.length)
			return;
		
		//Calculate the resulting matrix
		var matrix = matrices[0];
		for (var k=0; k < matrices.length; k++) {
			if(matrices[k+1]) matrix = matrix.x(matrices[k+1]);
		};

		return matrix;
		
	}	
};


jQuery(function() {

	if( navigator.userAgent.indexOf("MSIE ") == -1) return;

	// Parsing stylesheets, almost always makes sense
	Transformie.defaults.stylesheets && Transformie.parseStylesheets();

	// if we want to track inline CSS, we're resolving all inline transforms at page launch
	Transformie.inlineCSS && Transformie.apply(Transformie.inlineCSS === true ? '*' : Transformie.inlineCSS);
	
	// we have a dynamic site and we want to track inline style changes on a list of elements
	Transformie.defaults.track && Transformie.track(Transformie.defaults.track);
	
});
