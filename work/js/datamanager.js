class datamanager{
    constructor(game){
		this.game = game;
        this.pendingRequests = new Map();
        this.requestCounter = 0;
        
        // 设置全局回调函数
        window._jsonCallback = (json) => {
            console.log('JSONP 回调被调用，数据:', json);
            // 找到对应的请求并解析
            for (let [id, resolve] of this.pendingRequests) {
                console.log(`解析请求 ${id}`);
                resolve(json);
                this.pendingRequests.delete(id);
                return; // 只处理第一个匹配的请求
            }
            console.warn('JSONP 回调被调用，但没有等待的 resolve 函数');
        };
    }
    async loadJSON(src){
        console.log('开始加载 JSON:', src);
        
        // 为每个请求创建唯一ID
        this.requestCounter++;
        const requestId = this.requestCounter;
        
        let jsonp = document.createElement('script');
        jsonp.src = src;
        
        // 添加错误处理
        jsonp.onerror = (error) => {
            console.error('JSONP 加载失败:', error);
            // 找到对应的请求并解析为null
            for (let [id, resolve] of this.pendingRequests) {
                if (id === requestId) {
                    resolve(null);
                    this.pendingRequests.delete(id);
                    return;
                }
            }
        };
        
        let json = await new Promise((resolve, reject) => {
            // 将请求添加到待处理列表
            this.pendingRequests.set(requestId, resolve);
            
            // 设置超时处理
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    console.error('JSONP 加载超时:', src);
                    this.pendingRequests.delete(requestId);
                    reject(new Error('JSONP 加载超时'));
                }
            }, 10000); // 10秒超时
            
            try {
                document.getElementById('resource').appendChild(jsonp);
            } catch (error) {
                console.error('添加 script 标签失败:', error);
                this.pendingRequests.delete(requestId);
                reject(error);
            }
        });
        
        try {
            document.getElementById('resource').removeChild(jsonp);
        } catch (error) {
            console.warn('移除 script 标签失败:', error);
        }
        
        console.log('数据读取完成:', json);
        return json;
    }
	async loadImg(src){
		console.log('开始加载图片:', src);
		let img = await new Promise((resolve, reject) => {
			let img = new Image();
			img.onload = () => {
				console.log('图片加载成功:', src);
				resolve(img);
			};
			img.onerror = (error) => {
				console.error('图片加载失败:', src, error);
				reject(new Error(`图片加载失败: ${src}`));
			};
			img.src = src;
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