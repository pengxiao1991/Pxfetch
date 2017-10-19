/**
 * Created by px单位君 on 2017/8/16.
 * 
 */

let symbol = Symbol();
let globalPrefilter = Symbol();
let globalSuccess = Symbol();
let ServerError = {
	'code':500,
	'message':'内部错误'
};
class PxFetch {
    constructor() {
        this[symbol] = {};
    }
    // 设置全局过滤函数
    static fetchPrefilter(func) {
       // 静态方法中的this相当于类PxFetch
        this[globalPrefilter] = func;            

    }
    // 设置全局成功函数
    static fetchSuccess(func) {
        this[globalSuccess] = func;

    }
    
    fetch(params) {
       
        // 存储参数方便进行过滤操作
        this[symbol] = params;
        // 请求之前进行全局过滤,this.constructor相当于类PxFetch
        if (this.constructor[globalPrefilter]) {
            if( this.constructor[globalPrefilter](this[symbol]) ){
                //返回true，表示中断请求
                return
            }
        }
        // 进行自定义过滤操作
        if (this[symbol].beforeSend) {
            this[symbol].beforeSend(this[symbol]);
        }
        let type = this[symbol].type ? this[symbol].type : 'GET',
            url = this[symbol].url,
            data = this[symbol].data,
            complete = this[symbol].complete,
            error = this[symbol].error,
            success = this[symbol].success,
            init = {
                credentials: 'include',
            };
        if (type.toUpperCase() == 'GET') {
            // get并且有数据时
            if (data) {
                if(url.indexOf('?')>0){
                //if (url.includes('?')) {
                    url += '&';                                        
                } else {
                    url += '?';                    
                }
                for (let item of Object.keys(data)) {
                    url += (item + '=' + data[item] + '&');
                }
                url = url.slice(0, url.length - 1);
            }
            init.method = 'GET';
            
        } else {
            init.method = type.toUpperCase();  
            if (data) {
                 if (data.constructor.name != 'FormData') {
                    init.body = new FormData();            
                    for (let key of Object.keys(data)) {
						init.body.append(key, data[key]);
                    }
                } else {
                    init.body = data;
                }
            }
            
                     
        }
        let tmpPro = fetch(url, init);
        // 先进行全局操作
        tmpPro.then((response) => {
            let clone = response.clone();
            if (response.ok) {
                response.json()
                .then((data) => {
                    // 执行全局成功函数
                    if (this.constructor[globalSuccess]) {
						this.constructor[globalSuccess](data,this[symbol]);
                    }
                })
            } else {
                //if(response.status == 401){
				if(response.status != 200){
					// 执行全局成功函数
					if (this.constructor[globalSuccess]) {
						this.constructor[globalSuccess](response,this[symbol]);
					}
                }
                // 执行全局失败函数
                
            }
            
            return clone
            
        })
        .then((response) => {
            let clone = response.clone(); 
            if (response.ok) {
                response.json()
                .then((data) => {
                    if (success) {
                        success(data);
                    }
                });
            } else {
            // 执行自定义错误函数                
                if (error) {
                    error(response);
                }
                //兼容服务端，不可处理的错误，如 http响应返回，错误
                else {
                    success(ServerError)
                }
            }
            return clone;
        })
        // 执行自定义complete函数
        .then((response) => {
            if (complete) {
                complete(response);
            }
        });
        // 返回改xhr对象
        return tmpPro.xhr;
    }
    // 静态函数生成一个只引用一次的PxFetch实例化对象
    static pxFetch(params) {
       return new PxFetch().fetch(params);
    }
    
}

module.exports = PxFetch;


