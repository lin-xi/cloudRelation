var _uuid = 0, _instance;

function CloudSpectrum(opt) {
	'use strict';
	var _DEFAULT = {
		node: '',
		width: 600,
		height: 400,
		mode: 'edit'
	};
	this.cfg = this.merge(_DEFAULT, opt);
	this.eventHandlers = [];
	this.cache = {};
	this._init();
}

CloudSpectrum.prototype = {
	constructor: CloudSpectrum,
	_init: function(){
		var self = this, cfg = self.cfg, w=cfg.width, h=cfg.height;
		node = self.dom().query(cfg.node);
		node.width(w);
		node.height(h);
		var divId = 'cloudSpectrum-'+self._guid(), containerId = 'uic-container-'+self._guid();

		if(cfg.mode == 'edit'){
			node.css('position', 'relative');
			node.html('<div id="'+containerId+'" class="ui-cloudSpectrum" style="width:'+w+'px; height:'+h+'px; overflow:auto"><div id="'+divId+'"></div></div><div id="cp-preview-panel"></div><div id="cp-preview-btn">预览</div>');
			self.paper = Raphael(divId, w*2, h*2);
			self.paper.clear();
			self.cache.center = {x: w, y: h};
			var uic = self.dom().query('#'+containerId);
			uic.get(0).scrollTop = h/2;
			uic.get(0).scrollLeft = w/2;

			self.paper.rect(w/2, h/2, w, h, 10).attr({'stroke': "#666"});
		}else{
			node.html('<div id="'+containerId+'" class="ui-cloudSpectrum" style="width:'+w+'px; height:'+h+'px; overflow:hidden"><div id="'+divId+'"></div></div>');
			self.paper = Raphael(divId, w, h);
			self.cache.center = {x: w/2, y: h/2};
		}
		
        //Rapheal插件扩展
		Raphael.fn.connection = function (obj1, obj2, nodeOption) {
			var line;
			if (obj1.line && obj1.from && obj1.to) {
				line = obj1;
				obj1 = line.from;
				obj2 = line.to;
			}
			var bb1 = obj1.getBBox(),
				bb2 = obj2.getBBox(),
				po = [{x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height / 2},
					  {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height / 2},
					  {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height / 2}],
				poc = {x: (po[1].x + po[0].x)/2, y: (po[1].y + po[0].y)/2};
			//var path = ["M", x1.toFixed(3), y1.toFixed(3), "L", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
			var path = ["M", po[0].x, po[0].y, "L", po[1].x, po[1].y].join(",");
			if (line && line.line) {
				line.line.toBack().attr({path: path});
				line.lineNode.attr({x: poc.x, y:poc.y, cx: poc.x, cy: poc.y});
			} else {
				var color = typeof line == "string" ? line : "#000";
				return {
					line: this.path(path).toBack().attr({'stroke': '#C6D9EC', 'stroke-width': '2px', fill: "none"}),
					from: obj1,
					to: obj2,
					lineNode: self.paper.set().push(this.circle(poc.x, poc.y, 8).attr({fill: '#BED8EC', stroke: '#C6D9EC'}), this.text(poc.x, poc.y, '?').attr({stroke: '#fff', cursor: 'pointer'})),
					lineOpt: nodeOption
				};
			}
		};

		if(cfg.mode == 'edit'){
			var display = 1;
			var btn = self.dom().query('#cp-preview-btn');
			btn.bind('click', function(){
				var panel = self.dom().query('#cp-preview-panel');
				if(display){
					panel.show();
					btn.html('编辑');
					panel.html('');
					if(_instance){
						var pIns = new CloudSpectrum({node: '#cp-preview-panel', width:w, height:h, mode: 'view'});
	    				pIns.render(_instance.preview());
					}
					display = 0;
				}else{
					panel.hide();
					panel.html('');
					btn.html('预览');
					display = 1;
				}
			});
		}
	},

	render: function(data){
		var self = this, cfg = self.cfg, dom = self.dom(), r = self.paper;
		self.connections = [],
        self.shapes = [];      //svg形状集合
        self.flatData = [];    //平面数据(非树状)
        self.data = data;
        
        self.cache.w = cfg.width;  //画布宽
        self.cache.h = cfg.height;  //画布高

        self.objects = {}; //所有元素缓存

		var shapes = self.shapes, cache = self.cache,
			objs = self.objects, flatData = self.flatData;

		//样式
		var CENTER_STYLE = {'fill': '#5782C2', 'stroke': '#5782C2'},
			TEXT_STYLE = {'fill': '#fff', 'font-size': '14px', 'font-weight': '400'};

		//极径
		var min = Math.round(Math.max(cache.w, cache.h)/6), circleRadius = Math.round(min/4);
		self.circleRadius = circleRadius;
		var _stack = [], levelStack=[], level=1;
		_stack.push(data);
		draw(_stack); //绘制

		var ms=false, tar, mar, tardata, delay = false;
		function dragger() {
			if(this.data('setIndex') && this.data('dataIndex') != undefined){
				tar = shapes[this.data('setIndex')];
				tardata = flatData[this.data('dataIndex')];
				var btar = tar.getBBox();
				mar = {};
				ms = true;
				mar.ox = btar.x;
				mar.oy = btar.y;
				mar.cox = btar.x + btar.width / 2;
				mar.coy = btar.y + btar.height / 2;
			}
		}
		function move(dx, dy){
			if(ms){
				var finalx = mar.cox + dx, finaly = mar.coy + dy, att;
				if(!delay){

					finaly<circleRadius && (finaly=circleRadius);
					finaly>(cache.h*2-circleRadius) && (finaly=cache.h*2-circleRadius);
					finalx<circleRadius && (finalx=circleRadius);
					finalx>(cache.w*2-circleRadius) && (finalx=cache.w*2-circleRadius);

					att = {'x': finalx, 'y': finaly, 'cx': finalx, 'cy': finaly};
					tar.attr(att);
					tardata.theta = Raphael.rad(Raphael.angle(finalx, finaly, cache.center.x, cache.center.y));
					tardata.radius = self._computeLength(cache.center.x, cache.center.y, finalx, finaly);

					delay = true;
					for (var i = connections.length; i--;) {
						r.connection(connections[i]);
					}
					r.safari();

					setTimeout(function(){
						delay = false;
					}, 40);
				}
			}
        }
        function up(){
			if(ms){
				ms = false;
			}
        }
		for(var i = 0, ii = shapes.length; i < ii; i++) {
			var color = Raphael.getColor();
			var s = shapes[i];
			s.attr({cursor: "pointer"});
			if(cfg.mode == 'edit'){
				s.attr({cursor: "move"});
				s.drag(move, dragger, up); //拖动
			}
			(function(sha){
				sha.mouseover(function () {
					sha.stop().animate({transform: "s1.2 1.2"}, 500, "backOut");
				}).mouseout(function () {
					sha.stop().animate({transform: ""}, 500, "backOut");
				});

				if(cfg.mode == 'view'){
					sha.click(function(e){
						var di = this.data('dataIndex');
						if(di != undefined){
							var o = flatData[di];
							o.x = e.pageX;
							o.y = e.pageY;
							self._publish('nodeClick', {x: e.pageX, y:e.pageY, id: o.id, name: o.name});
						}
					});
				}else{
					sha.dblclick(function(e){
						var di = this.data('dataIndex');
						if(di != undefined){
							var o = flatData[di];
							o.x = e.pageX;
							o.y = e.pageY;
							self._publish('nodeClick', {x: e.pageX, y:e.pageY, id: o.id, name: o.name});
						}
					});
				}
			})(s);
		}

        var connections = [];
        connect(data, data.childNodes);
        function connect(parent, children, pc){
        	var pobj = objs[parent.id];
        	if(children.length > 0){
        		for(var i=0; i<children.length; i++){
        			if(children[i]){
	        			var child = children[i], id = child.id, obj = objs[id];
	        			connections.push(r.connection(shapes[pobj.index], shapes[obj.index], {pid: parent.id, pname: parent.name, id:id, name: child.name}));

	        			connect(child, child.childNodes);
        			}
        		}
        	}
        }

        for (var i = 0, ii = connections.length; i < ii; i++) {
			var cs = connections[i];
			(function(cln, opt){
				if(cln){
					cln.mouseover(function () {
						cln.stop().animate({'transform': "s1.2 1.2"}, 500, "backOut");
					}).mouseout(function () {
						cln.stop().animate({'transform': ""}, 500, "backOut");
					});
					cln.click(function(e){
						var clickX = e.pageX;
						var clickY = e.pageY;
						self._publish('relationClick', {x: clickX, y:clickY, id: opt.id, name: opt.name, parentId: opt.pid, parentName: opt.pname});
					});
				}
			})(cs.lineNode, cs.lineOpt);
		}

		/**
		 * 遍历绘制节点
		 *@param 栈(先进后出)
		 */
		function draw(stack){
			var pc = 0;
			while(stack.length>0){
				var node = stack.shift();
				if(node){
					if(node.parent == 0){
						//根节点
						var x = cache.center.x, y = cache.center.y;
						//中心点
						var idx = self.shapes.length;
						var sha = drawShape(node.shape+'', [x, y], circleRadius*1.2);
						sha.attr({'fill': node.color, 'stroke': node.color}).data('setIndex', idx);
						shapes.push(r.set().push(sha, r.text(x, y, node.name).attr(TEXT_STYLE).data('setIndex', idx).data('dataIndex', idx)));
						objs[node.id] = {'x': x, 'y': y, 'theta':0, 'index':0};
						node.theta = 0;
						node.radius = 0;
						flatData.push(self.clone(node));
						//第一层节点
						if(node.childNodes.length > 0){
							levelStack.push(node.childNodes.length);
						}
						drawChildNode({x: x, y: y}, node.childNodes);
						stack = stack.concat(node.childNodes);
						level++;
					}else{
						var pos = objs[node.id];
						//var x = pos.x, y = pos.y;
						//var rad = Math.round(circleRadius), idx = self.shapes.length;
						if(pc == levelStack[0]){
							levelStack.shift();
							pc = 0;
							level++;
							levelStack.push(node.childNodes.length);
						} else {
							if(levelStack[1]){
								levelStack[1] = levelStack[1] + node.childNodes.length;
							}else{
								levelStack[1] = node.childNodes.length;
							}
						}
						drawChildNode(pos, node.childNodes);
						stack = stack.concat(node.childNodes);
						pc++;
					}
				}
			}
		}

		/**
		 * 绘制子节点
		 *@param pos 父节点位置对象,x,y坐标和极角
		 *@param chidren 子节点数组
		 *@param angle 极角
		 */
		function drawChildNode(pos, children){
			if(!children.length){
				return;
			}
			var len = children.length, averWeight = self._getAverageWeight(children);
			if(pos.theta !== undefined){
				//var averAngle = Math.atan(circleRadius*2.2/polarRadius);
				//var averAngle = Math.PI/6;
				//var a0 = Math.PI/2 - averAngle*(len-1)/2 - pos.theta;

				var averAngle = Math.PI/len;
				if(level == 2){
					averAngle = Math.PI/10;
				}
				if(level == 3){
					if(averAngle>Math.PI/24){
						averAngle = Math.PI/24;
					}
				}
				var a0 = averAngle*(len-1)/2 - pos.theta;
				//var rad =polarRadius + cache.level*circleRadius;
				for(var i=0; i<len; i++){
					//var rad =polarRadius*children[i].weight/averWeight;
					drawSingleNode(children[i], pos, (level*3.5)*circleRadius, -a0+i*averAngle);
				}
			}else{
				//第一层子节点场合
				var averAngle = 2*Math.PI/len;
				for(var i=0; i<len; i++){
					//var rad =polarRadius*children[i].weight/averWeight;
					drawSingleNode(children[i], pos, (level*3.5)*circleRadius, i*averAngle);
				}
			}
		}

		/**
		 * 绘制单个节点
		 *@param pos 父节点位置对象
		 *@param rad 极径
		 *@param angle 极角
		 */
		function drawSingleNode(node, pos, rad, angle){
			if(objs[node.id]){
				return;
			}
			var index = flatData.length;
			var p, idx = self.shapes.length;
			if(cfg.mode == 'edit'){
				p = self._polarToXY(pos, rad, angle);
			}else{
				p = self._polarToXY(pos, node.radius*circleRadius, node.theta);
			}
			var nodeShape;
			if(cfg.mode == 'edit'){
				nodeShape = drawShape('3', p, circleRadius).attr({'fill': node.color, 'stroke': node.color}).data('setIndex', idx);
			}else{
				nodeShape = drawShape(node.shape+'', p, circleRadius).attr({'fill': node.color, 'stroke': node.color}).data('setIndex', idx);
			}
			shapes.push(r.set().push(nodeShape, r.text(p[0], p[1], node.name).attr(TEXT_STYLE).data('setIndex', idx).data('dataIndex', index)));
			objs[node.id] = {'x': p[0], 'y': p[1], 'theta': angle, 'index': idx};
			node.theta = angle;
			node.radius = rad/circleRadius;
			flatData.push(self.clone(node));
		}

		function drawShape(shapeType, p, circleRadius){
			var shape;
			switch(shapeType){
				case '1':
					shape = r.rect(p[0]-circleRadius, p[1]-circleRadius, circleRadius*2, circleRadius*2);
				break;
				case '2':
					shape = r.ellipse(p[0], p[1], circleRadius, circleRadius*0.6);
				break;
				case '3':
					shape = r.circle(p[0], p[1], circleRadius);
				break;
				case '4':
					shape = drawPentagonal(p[0], p[1], circleRadius);
				break;
				case '5':
					shape = drawTriangle(p[0], p[1], circleRadius);
				break;
				case '6':
					shape = drawHexagon(p[0], p[1], circleRadius);
				break;
				case '7':
					shape = r.rect(p[0]-circleRadius, p[1]-circleRadius, circleRadius*2, circleRadius*2, 10);
				break;
				default:
					shape = r.circle(p[0], p[1], circleRadius);
				break;
			};
			return shape;
		}

		//三角形
		function drawTriangle(x, y, rad){
			var cos = rad*Math.cos(Math.PI/3), sin = rad*Math.sin(Math.PI/3);
			var x1 = x-sin, y1 = y+cos,
				x2 = x+sin, y2 = y+cos,
				x3 = x, y3 = y-rad;
			var path = ['M', x1, y1, 'L', x2, y2, 'L', x3, y3].join(' ');
			return r.path(path);
		}
		//五角形
		function drawPentagonal(x, y, rad){
			var cos36 = rad*Math.cos(36*Math.PI/180), sin36 = rad*Math.sin(36*Math.PI/180),
				cos18 = rad*Math.cos(18*Math.PI/180), sin18 = rad*Math.sin(18*Math.PI/180);
			var x1 = x-sin36, y1 = y+cos36,
				x2 = x+sin36, y2 = y+cos36,
				x3 = x+cos18, y3 = y-sin18,
				x4 = x,       y4 = y-rad,
				x5 = x-cos18, y5 = y-sin18;
			var path = ['M', x1, y1, 'L', x2, y2, 'L', x3, y3, 'L', x4, y4, 'L', x5, y5].join(' ');
			return r.path(path);
		}
		//六角形
		function drawHexagon(x, y, rad){
			var cos30 = rad*Math.cos(Math.PI/6), sin30 = rad*Math.sin(Math.PI/6);
			var x1 = x-sin30, y1 = y+cos30,
				x2 = x+sin30, y2 = y+cos30,
				x3 = x+rad,   y3 = y,
				x4 = x+sin30, y4 = y-cos30,
				x5 = x-sin30, y5 = y-cos30,
				x6 = x-rad,   y6 =y;
			var path = ['M', x1, y1, 'L', x2, y2, 'L', x3, y3, 'L', x4, y4, 'L', x5, y5, 'L', x6, y6].join(' ');
			return r.path(path);
		}
	},

	save: function(){
		var self = this, result=[];
		for(var i=self.flatData.length-1; i>=0; i--){
			var item = self.flatData[i];
			result.push(item);
		}
		return result;
	},

	preview: function(){
		var self = this, data=self.data, flatData=self.flatData;
		
		function iterate(nodes){
			for(var i=0, ii=nodes.length; i<ii; i++){
				var cur = nodes[i];
				for(var j=0; j<flatData.length; j++){
					if(cur.id == flatData[j].id){
						cur.theta = flatData[j].theta;
						cur.radius = flatData[j].radius;
					}
					iterate(cur.childNodes);
				}
			}
		}
		iterate([data]);
		return data;
	},

	on: function(type, func){
		var self = this;
		self.eventHandlers[type] = func;
	},

	_publish: function(type, data){
		var self = this, handlers = self.eventHandlers;
		if(handlers[type]){
			handlers[type].call(null, data);
		}
	},

	//generate global unique id
	_guid: function(){
		return ++_uuid;
	},

	//极坐标转直角坐标
	_polarToXY: function(pos, rad, angle){
		var self = this, cfg = self.cfg, cache = self.cache, radis = self.circleRadius;
		//var a = Raphael.angle(x, y, pos.x+radis*Math.cos(angle), pos.y+radis*Math.sin(angle))*Math.PI/180;
		return [cache.center.x+rad*Math.cos(angle), cache.center.y+rad*Math.sin(angle)];
	},

	//计算长度
	_computeLength: function(x1, y1, x2, y2){
		var self = this, radis = self.circleRadius;
		return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))/radis;
	},

	//取得平均权值
	_getAverageWeight: function(arr){
		if(!arr.length) return 0;
		var sum=0;
		for(var i=0, ii=arr.length; i<ii; i++){
			sum += arr[i].weight;
		}
		return sum/arr.length
	},

	//merge
	merge: function(obj1, obj2){
		return obj2;
	},

	clone: function(obj){
		var objClone = new Object();
		for(var key in obj){
        	if (Object.prototype.toString.call(obj[key]) == '[object Array]'){
                objClone[key] = [];
            }else{
                objClone[key] = obj[key];
            }
        }
        return objClone;
    },

	util: {
		substitute: function(str, obj){
			if (!(Object.prototype.toString.call(str) === '[object String]')) {
        		return '';
    		}
		    if(!(Object.prototype.toString.call(obj) === '[object Object]' && 'isPrototypeOf' in obj)) {
		        return str;
		    }
    		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/replace
    		return str.replace(/\{([^{}]+)\}/g, function(match, key) {
        		var value = obj[key];
        		return ( value !== undefined) ? ''+value :'';
    		});
		}
	},

	//dom封装
	dom: function(){
		function Dom(){
			this.elements=[];
			EventTarget.call(this);
		}
		Dom.prototype = {
			constructor: Dom,
			_events: [],
			query: function(selector, parent){
				var element;
				if(typeof arguments[0]=="string"){
					element=arguments[0];
					var prefix=element.slice(0, 1);
					if(prefix == '#'){
						element = document.getElementById(element.slice(1));
						this.elements.push(element); 
					}else{
						if(document.querySelectorAll){
							this.elements.concat(document.querySelectorAll(element, parent.elements));
						} else {
							var es = document.body.getElementsByTagName('*'); 
							for (var i = 0, j = es.length; i < j; i++) { 
								if (element.indexOf(es[i].className) != -1) { 
									this.elements.push(es[i]); 
								} 
							}
						}
					}
				}else{ 
					element=this; 
					this.elements.push(element); 
				}
				return this;
			},
			get: function(index){
				return index < this.elements.length ? this.elements[index] : null;
			},
			each: function(fn){
				for(var i=0,l=this.elements.length;i<l;i++){ 
					fn.call(this, this.elements[i], i); 
				}
				return this;
			},
			css: function(prop,v){
				if(v){
					this.each(function(el){
						el.style[prop]=v; 
					});
				}else{
					return this.elements[0].style[prop];
				}
			},
			width: function(v){
				if(v){
					this.elements[0].style.width = v+'px';
					return this;
				}else{
					return this.elements[0].offsetWidth;
				}
			},
			height: function(v){
				if(v){
					this.elements[0].style.height = v+'px';
					return this;
				}else{
					return this.elements[0].offsetHeight;
				}
			},
			html: function(ele){
				this.elements[0].innerHTML = ele;
			},
			show: function(){
				this.each(function(el){
					el.style.display = 'block'; 
				});
			},
			hide: function(){
				this.each(function(el){
					el.style.display = 'none'; 
				});
			},
			ua: {
				ie: navigator.userAgent.indexOf("IE") < 0 ? false : true,
				firefox: navigator.userAgent.indexOf("Firefox") < 0 ? false : true,
				chrome: navigator.userAgent.indexOf("Chrome") < 0 ? false : true
			},
			bind: function(type, func){
				var me = this;
				this._events[type] = func;
				for(var i=0,l=this.elements.length; i<l; i++){
					var item = this.elements[i];
					if(item.addEventListener){
						item.addEventListener(type, proxyHandler, false);
					} else if (element.attachEvent){
						item.attachEvent('on'+type, proxyHandler);
					}
				}
				function proxyHandler(event){
					event = event || window.event;
					var eve = new _Event(event);
					eve.type = event.type;
					eve.target = event.target || event.srcElement;
					eve.pageX = event.clientX || event.pageX;
					eve.pageY = event.clientY || event.pageY;
					eve.button = event.button&1?1:(event.button&2?3:(event.button&4?2:0));
					me._events[type].call(me, eve);
				}
				function _Event(eve){
					this.eve = eve;
				}
				return this;
			},
			triggle: function(type, data){
				this.each(this._elements, function(i, item){
					if(item.fireEvent){
						item.fireEvent(type, data);
					}else if(item.dispatchEvent(event)){
						item.dispatchEvent(type, data);
					}
				});
			}
		};
		function EventTarget(){
			this.handlers = {};
		}
		EventTarget.prototype = {
			constructor: EventTarget, 

			on: function(type, handler){ 
				this.handlers[type] = []; 
			},
			fire: function(){
				if(!event.target){
					event.target = this; 
				}
				if(this.handlers[event.type instanceof Array]){
					var handlers = this.handlers[event.type];
					for(var i = 0, len = handlers.length; i < len; i++){
						handlers[i](event);
					}
				}
			},
			removeHandler: function(type, handler){
				if(this.handlers[type] instanceof Array){
					var handlers = this.handlers[type]; 
					for(var i = 0, le = handlers.length; i < len; i++){
						if(handlers[i] === handler){
							break; 
						}
						handlers.splice(i, 1); 
					}
				}
			}
		};
		return new Dom();
	}

};
