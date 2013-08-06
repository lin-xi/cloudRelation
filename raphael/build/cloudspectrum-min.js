var _uuid=0,_instance;function CloudSpectrum(a){this.cfg=this.merge({node:"",width:600,height:400,mode:"edit"},a);this.eventHandlers=[];this.cache={};this._init()}
CloudSpectrum.prototype={constructor:CloudSpectrum,_init:function(){var a=this,c=a.cfg,b=c.width,f=c.height;node=a.dom().query(c.node);node.width(b);node.height(f);var e="cloudSpectrum-"+a._guid(),g="uic-container-"+a._guid();"edit"==c.mode?(node.css("position","relative"),node.html('<div id="'+g+'" class="ui-cloudSpectrum" style="width:'+b+"px; height:"+f+'px; overflow:auto"><div id="'+e+'"></div></div><div id="cp-preview-panel"></div><div id="cp-preview-btn">预览</div>'),a.paper=Raphael(e,2*b,2*f),
a.paper.clear(),a.cache.center={x:b,y:f},e=a.dom().query("#"+g),e.get(0).scrollTop=f/2,e.get(0).scrollLeft=b/2,a.paper.rect(b/2,f/2,b,f,10).attr({stroke:"#666"})):(node.html('<div id="'+g+'" class="ui-cloudSpectrum" style="width:'+b+"px; height:"+f+'px; overflow:hidden"><div id="'+e+'"></div></div>'),a.paper=Raphael(e,b,f),a.cache.center={x:b/2,y:f/2});Raphael.fn.connection=function(b,f,h){var c;b.line&&(b.from&&b.to)&&(c=b,b=c.from,f=c.to);var e=b.getBBox(),g=f.getBBox(),k=[{x:e.x+e.width/2,y:e.y+
e.height/2},{x:g.x+g.width/2,y:g.y+g.height/2},{x:g.x+g.width/2,y:g.y+g.height/2}],e=(k[1].x+k[0].x)/2,g=(k[1].y+k[0].y)/2,k=["M",k[0].x,k[0].y,"L",k[1].x,k[1].y].join();if(c&&c.line)c.line.toBack().attr({path:k}),c.lineNode.attr({x:e,y:g,cx:e,cy:g});else return{line:this.path(k).toBack().attr({stroke:"#C6D9EC","stroke-width":"2px",fill:"none"}),from:b,to:f,lineNode:a.paper.set().push(this.circle(e,g,8).attr({fill:"#BED8EC",stroke:"#C6D9EC"}),this.text(e,g,"?").attr({stroke:"#fff",cursor:"pointer"})),
lineOpt:h}};if("edit"==c.mode){var l=1,m=a.dom().query("#cp-preview-btn");m.bind("click",function(){var c=a.dom().query("#cp-preview-panel");l?(c.show(),m.html("编辑"),c.html(""),_instance&&(new CloudSpectrum({node:"#cp-preview-panel",width:b,height:f,mode:"view"})).render(_instance.preview()),l=0):(c.hide(),c.html(""),m.html("预览"),l=1)})}},render:function(a){var c,b;function f(){if(this.data("setIndex")&&void 0!=this.data("dataIndex")){D=s[this.data("setIndex")];E=v[this.data("dataIndex")];var w=D.getBBox();
b=c=void 0;B=!0;c=w.x+w.width/2;b=w.y+w.height/2}}function e(w,I){if(B){var d=c+w,a=b+I,f;if(!F){a<n&&(a=n);a>2*k.h-n&&(a=2*k.h-n);d<n&&(d=n);d>2*k.w-n&&(d=2*k.w-n);f={x:d,y:a,cx:d,cy:a};D.attr(f);E.theta=Raphael.rad(Raphael.angle(d,a,k.center.x,k.center.y));E.radius=h._computeLength(k.center.x,k.center.y,d,a);F=!0;for(d=z.length;d--;)p.connection(z[d]);p.safari();setTimeout(function(){F=!1},40)}}}function g(){B&&(B=!1)}function l(b,a,d){d=x[b.id];if(0<a.length)for(var c=0;c<a.length;c++)if(a[c]){var f=
a[c],e=f.id;z.push(p.connection(s[d.index],s[x[e].index],{pid:b.id,id:e}));l(f,f.childNodes)}}function m(b,a){if(a.length){var d=a.length;h._getAverageWeight(a);if(void 0!==b.theta){var c=Math.PI/d;2==y&&(c=Math.PI/10);3==y&&c>Math.PI/24&&(c=Math.PI/24);for(var f=c*(d-1)/2-b.theta,e=0;e<d;e++)A(a[e],b,3.5*y*n,-f+e*c)}else for(c=2*Math.PI/d,e=0;e<d;e++)A(a[e],b,3.5*y*n,e*c)}}function A(b,a,d,c){if(!x[b.id]){var e=v.length,f=h.shapes.length;a="edit"==u.mode?h._polarToXY(a,d,c):h._polarToXY(a,b.radius*
n,b.theta);var g;g="edit"==u.mode?r("3",a,n).attr({fill:b.color,stroke:b.color}).data("setIndex",f):r(b.shape+"",a,n).attr({fill:b.color,stroke:b.color}).data("setIndex",f);s.push(p.set().push(g,p.text(a[0],a[1],b.name).attr(H).data("setIndex",f).data("dataIndex",e)));x[b.id]={x:a[0],y:a[1],theta:c,index:f};b.theta=c;b.radius=d/n;v.push(h.clone(b))}}function r(b,a,d){switch(b){case "1":d=p.rect(a[0]-d,a[1]-d,2*d,2*d);break;case "2":d=p.ellipse(a[0],a[1],d,0.6*d);break;case "3":d=p.circle(a[0],a[1],
d);break;case "4":b=a[0];a=a[1];var c=d*Math.cos(36*Math.PI/180),e=d*Math.sin(36*Math.PI/180),f=d*Math.cos(18*Math.PI/180),h=d*Math.sin(18*Math.PI/180);d=["M",b-e,a+c,"L",b+e,a+c,"L",b+f,a-h,"L",b,a-d,"L",b-f,a-h].join(" ");d=p.path(d);break;case "5":b=a[0];a=a[1];c=d*Math.cos(Math.PI/3);e=d*Math.sin(Math.PI/3);d=["M",b-e,a+c,"L",b+e,a+c,"L",b,a-d].join(" ");d=p.path(d);break;case "6":b=a[0];a=a[1];c=d*Math.cos(Math.PI/6);e=d*Math.sin(Math.PI/6);d=["M",b-e,a+c,"L",b+e,a+c,"L",b+d,a,"L",b+e,a-c,"L",
b-e,a-c,"L",b-d,a].join(" ");d=p.path(d);break;case "7":d=p.rect(a[0]-d,a[1]-d,2*d,2*d,10);break;default:d=p.circle(a[0],a[1],d)}return d}var h=this,u=h.cfg;h.dom();var p=h.paper;h.connections=[];h.shapes=[];h.flatData=[];h.data=a;h.cache.w=u.width;h.cache.h=u.height;h.objects={};var s=h.shapes,k=h.cache,x=h.objects,v=h.flatData,H={fill:"#fff","font-size":"14px","font-weight":"400"},q=Math.round(Math.max(k.w,k.h)/6),n=Math.round(q/4);h.circleRadius=n;var q=[],t=[],y=1;q.push(a);(function(b){for(var a=
0;0<b.length;){var d=b.shift();if(d)if(0==d.parent){var c=k.center.x,e=k.center.y,f=h.shapes.length,g=r(d.shape+"",[c,e],1.2*n);g.attr({fill:d.color,stroke:d.color}).data("setIndex",f);s.push(p.set().push(g,p.text(c,e,d.name).attr(H).data("setIndex",f).data("dataIndex",f)));x[d.id]={x:c,y:e,theta:0,index:0};d.theta=0;d.radius=0;v.push(h.clone(d));0<d.childNodes.length&&t.push(d.childNodes.length);m({x:c,y:e},d.childNodes);b=b.concat(d.childNodes);y++}else c=x[d.id],a==t[0]?(t.shift(),a=0,y++,t.push(d.childNodes.length)):
t[1]=t[1]?t[1]+d.childNodes.length:d.childNodes.length,m(c,d.childNodes),b=b.concat(d.childNodes),a++}})(q);for(var B=!1,D,E,F=!1,q=0,G=s.length;q<G;q++){Raphael.getColor();var C=s[q];C.attr({cursor:"pointer"});"edit"==u.mode&&(C.attr({cursor:"move"}),C.drag(e,f,g));(function(b){b.mouseover(function(){b.stop().animate({transform:"s1.2 1.2"},500,"backOut")}).mouseout(function(){b.stop().animate({transform:""},500,"backOut")});"view"==u.mode?b.click(function(b){var a=this.data("dataIndex");void 0!=
a&&h._publish("nodeClick",{x:b.pageX,y:b.pageY,id:v[a].id})}):b.dblclick(function(b){var a=this.data("dataIndex");void 0!=a&&h._publish("nodeClick",{x:b.pageX,y:b.pageY,id:v[a].id})})})(C)}var z=[];l(a,a.childNodes);q=0;for(G=z.length;q<G;q++)a=z[q],function(b,a){b&&(b.mouseover(function(){b.stop().animate({transform:"s1.2 1.2"},500,"backOut")}).mouseout(function(){b.stop().animate({transform:""},500,"backOut")}),b.click(function(b){h._publish("relationClick",{x:b.pageX,y:b.pageY,id:a.id,parentId:a.pid})}))}(a.lineNode,
a.lineOpt)},save:function(){for(var a=[],c=this.flatData.length-1;0<=c;c--)a.push(this.flatData[c]);return a},preview:function(){function a(c){for(var e=0,g=c.length;e<g;e++)for(var l=c[e],m=0;m<b.length;m++)l.id==b[m].id&&(l.theta=b[m].theta,l.radius=b[m].radius),a(l.childNodes)}var c=this.data,b=this.flatData;a([c]);return c},on:function(a,c){this.eventHandlers[a]=c},_publish:function(a,c){var b=this.eventHandlers;b[a]&&b[a].call(null,c)},_guid:function(){return++_uuid},_polarToXY:function(a,c,
b){a=this.cache;return[a.center.x+c*Math.cos(b),a.center.y+c*Math.sin(b)]},_computeLength:function(a,c,b,f){var e=this.circleRadius;return Math.sqrt((a-b)*(a-b)+(c-f)*(c-f))/e},_getAverageWeight:function(a){if(!a.length)return 0;for(var c=0,b=0,f=a.length;b<f;b++)c+=a[b].weight;return c/a.length},merge:function(a,c){return c},clone:function(a){var c={},b;for(b in a)"[object Array]"==Object.prototype.toString.call(a[b])?c[b]=[]:c[b]=a[b];return c},util:{substitute:function(a,c){return"[object String]"!==
Object.prototype.toString.call(a)?"":"[object Object]"===Object.prototype.toString.call(c)&&"isPrototypeOf"in c?a.replace(/\{([^{}]+)\}/g,function(b,a){var e=c[a];return void 0!==e?""+e:""}):a}},dom:function(){function a(){this.elements=[];this.handlers={}}function c(){this.handlers={}}a.prototype={constructor:a,_events:[],query:function(b,a){var c;if("string"==typeof b)if(c=b,"#"==c.slice(0,1))c=document.getElementById(c.slice(1)),this.elements.push(c);else if(document.querySelectorAll)this.elements.concat(document.querySelectorAll(c,
a.elements));else for(var g=document.body.getElementsByTagName("*"),l=0,m=g.length;l<m;l++)-1!=c.indexOf(g[l].className)&&this.elements.push(g[l]);else this.elements.push(this);return this},get:function(b){return b<this.elements.length?this.elements[b]:null},each:function(b){for(var a=0,c=this.elements.length;a<c;a++)b.call(this,this.elements[a],a);return this},css:function(b,a){if(a)this.each(function(c){c.style[b]=a});else return this.elements[0].style[b]},width:function(b){return b?(this.elements[0].style.width=
b+"px",this):this.elements[0].offsetWidth},height:function(b){return b?(this.elements[0].style.height=b+"px",this):this.elements[0].offsetHeight},html:function(b){this.elements[0].innerHTML=b},show:function(){this.each(function(b){b.style.display="block"})},hide:function(){this.each(function(b){b.style.display="none"})},ua:{ie:0>navigator.userAgent.indexOf("IE")?!1:!0,firefox:0>navigator.userAgent.indexOf("Firefox")?!1:!0,chrome:0>navigator.userAgent.indexOf("Chrome")?!1:!0},bind:function(b,a){function c(a){a=
a||window.event;var e=new g(a);e.type=a.type;e.target=a.target||a.srcElement;e.pageX=a.clientX||a.pageX;e.pageY=a.clientY||a.pageY;e.button=a.button&1?1:a.button&2?3:a.button&4?2:0;l._events[b].call(l,e)}function g(a){this.eve=a}var l=this;this._events[b]=a;for(var m=0,A=this.elements.length;m<A;m++){var r=this.elements[m];r.addEventListener?r.addEventListener(b,c,!1):element.attachEvent&&r.attachEvent("on"+b,c)}return this},triggle:function(a,c){this.each(this._elements,function(e,g){g.fireEvent?
g.fireEvent(a,c):g.dispatchEvent(event)&&g.dispatchEvent(a,c)})}};c.prototype={constructor:c,on:function(a,c){this.handlers[a]=[]},fire:function(){event.target||(event.target=this);if(this.handlers[event.type instanceof Array])for(var a=this.handlers[event.type],c=0,e=a.length;c<e;c++)a[c](event)},removeHandler:function(a,c){if(this.handlers[a]instanceof Array)for(var e=this.handlers[a],g=0;g<len&&e[g]!==c;g++)e.splice(g,1)}};return new a}};