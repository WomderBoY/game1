class InputManager{
	constructor(){
		this.buffer=[];
		this.config=JSON.parse(localStorage.getItem('BITeli-config'));
		document.addEventListener('keydown',this.onKeydown.bind(this));
		document.addEventListener('keyup',this.onKeyup.bind(this));
	}
	getRecentInput(){
		let filter;
		switch(typeof arguments[0]){
			case 'number':
			filter=e=>e.keyCode==arguments[0];
			break;
			case 'string':
			filter=e=>KEYMAP[e.keyCode]==arguments[0];
			break;
			default:
			filter=arguments[0];
			break;
		}
		for(let i=this.buffer.length-1;i>=0;i--){
			if(filter(this.buffer[i])){
				return this.buffer[i];
			}
		}
		return false;
	}
	getMoveX(){
		let l=this.config.Left;
		let r=this.config.Right;
		let move=this.getRecentInput(e=>{
			return [l,r].indexOf(KEYMAP[e.keyCode])!=-1;
		});
		if(!move)return 0;
		return KEYMAP[move.keyCode]==l?-1:1;
	}
	getMoveY(){
		let u=this.config.Up;
		let d=this.config.Down;
		let move=this.getRecentInput(e=>{
			return [u,d].indexOf(KEYMAP[e.keyCode])!=-1;
		});
		if(!move)return 0;
		return KEYMAP[move.keyCode]==u?-1:1;
	}
	getJump(){
		return this.getRecentInput(this.config.Jump);
	}
	getDash(){
		return this.getRecentInput(this.config.Dash);
	}
	getInteraction(){
		return this.getRecentInput(this.config.Interact);
	}
	takeRecentInput(){
		let filter;
		switch(typeof arguments[0]){
			case 'number':
			filter=e=>e.keyCode==arguments[0];
			break;
			case 'string':
			filter=e=>KEYMAP[e.keyCode]==arguments[0];
			break;
			default:
			filter=arguments[0];
			break;
		}
		for(let i=this.buffer.length-1;i>=0;i--){
			if(filter(this.buffer[i])){
				return this.buffer.splice(i,1)[0];
			}
		}
		return false;
	}
	takeEnter(){
		return this.takeRecentInput(this.config.Enter);
	}
	waitInput(){
		let filter;
		switch(typeof arguments[0]){
			case 'number':
			filter=e=>e.keyCode==arguments[0];
			break;
			case 'string':
			filter=e=>KEYMAP[e.keyCode]==arguments[0];
			break;
			default:
			filter=arguments[0];
			break;
		}
		return new Promise(resolve=>{
			let handler=e=>{
				if(game.status=='pause')return;
				if(filter(e)){
					resolve(e);
					document.removeEventListener('keydown',handler);
				}
			}
			document.addEventListener('keydown',handler);
		});
	}
	async waitEnter(){
		await this.waitInput(this.config.Enter);
	}
	onKeydown(event){
		if(game.status=='pause')return;
		let input={
			'keyCode':event.keyCode,
			'timeStamp':game.gameFrame
		}
		if(this.buffer.findIndex(e=>e.keyCode==input.keyCode)==-1){
			this.buffer.push(input);
		}
	}
	onKeyup(event){
		let i=this.buffer.findIndex(e=>e.keyCode==event.keyCode);
		if(i!=-1){
			this.buffer.splice(i,1);
		}
	}
}
