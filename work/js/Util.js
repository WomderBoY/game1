class Vector{
	constructor(x=0,y=0){
		if(arguments[0] instanceof Vector){
			this.x=arguments[0].x;
			this.y=arguments[0].y;
		}else{
			this.x=x;
			this.y=y;
		}
	}
	set(v){
		if(arguments.length==2){
			this.x=arguments[0];
			this.y=arguments[1];
		}else{
			this.x=v.x;
			this.y=v.y;
		}
		return this;
	}
	add(v){
		if(arguments.length==2){
			return new Vector(this.x+arguments[0],this.y+arguments[1]);
		}else{
			return new Vector(this.x+v.x,this.y+v.y);
		}
	}
	addEqual(v){
		if(arguments.length==2){
			this.x+=arguments[0];
			this.y+=arguments[1];
		}else{
			this.x+=v.x;
			this.y+=v.y;
		}
		return this;
	}
	sub(v){
		if(arguments.length==2){
			return new Vector(this.x-arguments[0],this.y-arguments[1]);
		}else{
			return new Vector(this.x-v.x,this.y-v.y);
		}
	}
	subEqual(v){
		if(arguments.length==2){
			this.x-=arguments[0];
			this.y-=arguments[1];
		}else{
			this.x-=v.x;
			this.y-=v.y;
		}
		return this;
	}
	mul(v){
		if(arguments.length==2){
			return new Vector(this.x*arguments[0],this.y*arguments[1]);
		}else{
			return new Vector(this.x*v.x,this.y*v.y);
		}
	}
	mulEqual(v){
		if(arguments.length==2){
			this.x*=arguments[0];
			this.y*=arguments[1];
		}else{
			this.x*=v.x;
			this.y*=v.y;
		}
		return this;
	}
	round(){
		return new Vector(Math.round(this.x),Math.round(this.y));
	}
}

class Shape{
	static DIR={'RB':0,'RT':1,'LB':2,'LT':3};
	constructor(x=0,y=0){
		if(arguments[0] instanceof Vector){
			this.position=arguments[0];
		}else{
			this.position=new Vector(x,y);
		}
	}
}

class Rect extends Shape{
	constructor(x,y,w,h){
		let v=[];
		for(let i=0;i<arguments.length;i++){
			if(arguments[i] instanceof Vector){
				v.push(arguments[i]);
			}else{
				v.push(new Vector(arguments[i],arguments[++i]));
			}
		}
		super(v[0]);
		this.size=v[1].x===null?null:v[1];
	}
	getVertex(dir){
		let pos=this.position;
		let size=this.size;
		let vert=[];
		switch(dir||0){
			case Shape.DIR.RB:
			vert.push(pos.add(size.x,0));
			vert.push(pos.add(0,size.y));
			break;
			case Shape.DIR.RT:
			vert.push(pos.add(size));
			vert.push(pos);
			break;
			case Shape.DIR.LB:
			vert.push(pos);
			vert.push(pos.add(size));
			break;
			case Shape.DIR.LT:
			vert.push(pos.add(0,size.y));
			vert.push(pos.add(size.x,0));
			break;
		}
		return vert;
	}
	containsRect(rect){
		if(this.size===null||rect.size===null)return false;
		let vert=this.getVertex(Shape.DIR.RB);
		let vert2=rect.getVertex(Shape.DIR.RB);
		return vert[0].x>vert2[1].x&&vert2[0].x>vert[1].x&&
			vert[0].y<vert2[1].y&&vert2[0].y<vert[1].y;
	}
}

window.delay=function(ms){
	return new Promise(resolve=>{
		setTimeout(()=>resolve(),ms);
	});
}

window.KEYMAP={
	1:'LB',
	2:'RB',
	3:'Ctrl-Break',
	4:'MB',
	8:'Backspace',
	9:'Tab',
	12:'Clear',
	13:'Enter',
	16:'Shift',
	17:'Ctrl',
	18:'Alt',
	19:'Pause',
	20:'Caps Lock',
	27:'Esc',
	32:'Space',
	33:'Page Up',
	34:'Page Down',
	35:'End',
	36:'Home',
	37:'Left',
	38:'Up',
	39:'Right',
	40:'Down',
	41:'Select',
	42:'Print',
	43:'Execute',
	44:'Print Screen',
	45:'Insert',
	46:'Delete',
	47:'Help',
	48:'0',
	49:'1',
	50:'2',
	51:'3',
	52:'4',
	53:'5',
	54:'6',
	55:'7',
	56:'8',
	57:'9',
	65:'A',
	66:'B',
	67:'C',
	68:'D',
	69:'E',
	70:'F',
	71:'G',
	72:'H',
	73:'I',
	74:'J',
	75:'K',
	76:'L',
	77:'M',
	78:'N',
	79:'O',
	80:'P',
	81:'Q',
	82:'R',
	83:'S',
	84:'T',
	85:'U',
	86:'V',
	87:'W',
	88:'X',
	89:'Y',
	90:'Z',
	91:'LWin',
	92:'RWin',
	93:'Apps',
	95:'Sleep',
	96:'NUMPAD0',
	97:'NUMPAD1',
	98:'NUMPAD2',
	99:'NUMPAD3',
	100:'NUMPAD4',
	101:'NUMPAD5',
	102:'NUMPAD6',
	103:'NUMPAD7',
	104:'NUMPAD8',
	105:'NUMPAD9',
	106:'Mul',
	107:'Add',
	108:'Sep',
	109:'Sub',
	110:'Dec',
	111:'Div',
	112:'F1',
	113:'F2',
	114:'F3',
	115:'F4',
	116:'F5',
	117:'F6',
	118:'F7',
	119:'F8',
	120:'F9',
	121:'F10',
	122:'F11',
	123:'F12',
	124:'F13',
	125:'F14',
	126:'F15',
	127:'F16',
	128:'F17',
	129:'F18',
	130:'F19',
	131:'F20',
	132:'F21',
	133:'F22',
	134:'F23',
	135:'F24',
	144:'Num Lock',
	145:'Scroll Lock',
	160:'LShift',
	161:'RShift',
	162:'LCtrl',
	163:'RCtrl',
	164:'LAlt',
	165:'RAlt',
}