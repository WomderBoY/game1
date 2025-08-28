class datamanager{
    constructor(game){
		this.game = game;
        window._jsonCallback = (json) => {
            if (this.resolve) this.resolve(json);
        };
    }
    async loadJSON(src){
        let jsonp = document.createElement('script');
        jsonp.src = src;
        let json = await new Promise(resolve => {
            this.resolve = resolve;
            document.getElementById('resource').appendChild(jsonp);
        });
        document.getElementById('resource').removeChild(jsonp);
        return json;
    }
	async loadImg(src){
		let img=await new Promise(resolve=>{
			let img=new Image();
			img.src=src;
			img.onload=()=>resolve(img);
		});
		return img;
	}
	async loadSpritesheet(src){
		let json=await this.loadJSON(src);
		let imgsrc=src.split('/');
		imgsrc[imgsrc.length-1]=json.meta.image;
		imgsrc=imgsrc.join('/');
		let img=await this.loadImg(imgsrc);
		
		return new Spritesheet(this.game, json,img);;
	}
}