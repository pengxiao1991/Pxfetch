# Pxfetch
类似$.ajax的、手感优秀的ajax插件


## Pxfetch

使用fetch api来实现类似于jquery的ajax的全局插件（当浏览器不支持fetch api时，默认使用ajax），为了贴近使用ajax的用户习惯，该插件大部分方法参数格式与jquery的ajax一模一样，暂时只支持返回json数据，建议使用import导入使用。（因为使用了较多es6语法，建议使用babel）
```javascript
import myfetch from Pxfetch;
```
### 核心方法：myfetch.pxfetch(settings)  返回一个xhr对象，可用来中止xhr请求

settings是一个对象，暂时有url、type、data、success、error、complete、suspensibility(是否可以中止xhr请求)属性，**与ajax()的参数极其类似**
```javascript
myfetch.pxfetch({
    type: 'method',
    url: 'url',
    data: 'data',
    suspensibility: false,
    success: (responseJson) => {
        
    }
});
```

#### 1. data

data属性可以是一个映射，比如 {key1: 'value1', key2: 'value2'} 或者一个FormData对象

#### 2. success:function(responseJson){}

自定义的成功回调函数，参数为返回后的JSON数据

#### 3. error:function(responsePromise){}

自定义的错误回调函数，参数为返回的Promise数据，如（下同）：
```javascript
{
    body: ReadableStream
    bodyUsed: false,
    headers: Headers,
    ok: false,
    redirected: false,
    status: 404,
    statusText: "Not Found",
    type: "cors",
    url: "http://adminipd.meizu.com/adminapi/admin/appevent/list.do2?page=1&size=100"
}
```

#### 3. complete:function(responsePromise){}

自定义的请求完结的最终回调函数，参数为返回的Promise数据

### 全局方法

对所有请求进行统一处理，暂时有fetchPrefilter和fetchSuccess，类似于ajax的ajaxPrefilter和ajaxSuccess，只是回调参数略有不同

#### 1. fetchPrefilter(fn)

全局的预过滤函数，**回调函数fn的参数只有一个**，是pxfetch方法中传入的参数，可以对其进行修改
```javascript
myfetch.fetchPrefilter((options) => {
    if (!/^http/.test(options.url)) {
        options.url = 'http://adminipd.meizu.com/adminapi/admin' + options.url;                    
    }   
});
```
#### 2. fetchSuccess(fn)

全局的请求成功函数，**回调函数fn的参数只有一个**，是服务端返回的json数据
```javascript
myfetch.fetchSuccess((data) => {
    if (data.code == 401) {     // 未登录
        location.assign('https://login.flyme.cn/login/login.html?appuri=http://adminipd.meizu.com/adminapi/loginout/login.do&useruri=' + location.href);
    } else if (data.code != 200) {
        this.alert.show = true;
        this.alert.title = data.code;
        this.alert.content = data.message;
        this.alert.type = 'danger';
    }   
});
```
#### 3. abortAll()

全局的中止所有请求方法
```javascript
myfetch.abortAll();

