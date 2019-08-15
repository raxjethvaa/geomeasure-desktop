import { Injectable } from '@angular/core';
declare var window;
@Injectable()
export class HttpService {
	electro: any;
	loader: any = false;
	net: any;
	constructor() {
		if (this.isElectron()) {
			this.electro = window.require('electron');

			this.net = window.require('electron').net;

		}
	}
	isElectron = () => {
		return window && window.process && window.process.type;
	}


	makeRequest(petition: any) {

		//	console.log(petition);
		return petition
			.subscribe((res: Response) => {

				return res;
			});

	}
	get(url, header: any) {
		let self = this;
		let chunkedData: any = "";
		return new Promise((resolve, reject) => {
			try {
				self.loader = true;
				// const options = {
				// 	hostname: hostname,
				// 	port: 80,
				// 	path: path,
				// 	method: 'GET',
				// 	headers: header
				// };
				const options = {
					url: url,
					method: 'GET',
					headers: header
				};
				let net = this.electro.remote.net;
				// console.log("this.electro.remote---");
				// console.log(this.electro.remote);
	
				// console.log("this.electro.remote---");
				let request =   net.request(options);
				  request.chunkedEncoding=false
				request.on('response', (response:any) => {
				
					response.on('data', (chunk) => {
				
							chunkedData = chunkedData + `${chunk}`;
							if(self.isValidJson(chunkedData)){
								resolve(JSON.parse(chunkedData));
							}
							console.log("chunkedData---");
							console.log(chunkedData);
					
					});
					response.on('end',function(f){
						console.log("f--------------------->");
						console.log(f);
						console.log("f--------------------->");
						console.log(chunkedData);
						console.log("at the end all goes well");
						return resolve(JSON.parse(chunkedData));
					});
					
				});

				request.end();
			} catch (e) {
				self.loader = null;
				// alert("ffffff");
				console.log("---------errrrrr---------");
				console.log(e);
				console.log("-----------errrrrr---------");
			}
		});


	}
	post(url, header: any,postData:any={}) {
		let self = this;
		let chunkedData: any = "";
		return new Promise((resolve, reject) => {
			try {
				self.loader = true;
				
			let finalData = JSON.stringify(postData);
			console.log("postData-------");
				console.log(finalData);
				console.log(header);
				console.log(url);
				console.log("postData-------");
				const options = {
					url: url,
					method: 'POST',
					headers: header,
					data: finalData
				};
				let net = this.electro.remote.net;
				// console.log("this.electro.remote---");
				// console.log(this.electro.remote);
	
				// console.log("this.electro.remote---");
				let request =   net.request(options);
				request.write(finalData,"utf8",function(datas){
					console.log("--finalData---");
					console.log(datas);
					console.log("---finalData--");
				})
			//	request.setHeader("content-type","application/json");
			//	  request.chunkedEncoding=false;
				  console.log("request---------");
				  console.log(request);
				  console.log("request---------");
				request.on('response', (response:any) => {
					console.log("f---------response------------>");
					
					console.log("f--------------------->");
					console.log(response);
					console.log("at the end all goes well2");
					response.on('data', (chunk) => {
				
							chunkedData = chunkedData + `${chunk}`;
							if(self.isValidJson(chunkedData)){
								resolve(JSON.parse(chunkedData));
							}
							console.log("chunkedData---");
							console.log(chunkedData);
					
					});
					response.on('error', (rs) => {
				
						
						console.log("rs---");
						console.log(rs);
				
				});
					response.on('end',function(f){
						console.log("f--------------------->");
						console.log(f);
						console.log("f--------------------->");
						console.log(chunkedData);
						console.log("at the end all goes well");
						return resolve(JSON.parse(chunkedData));
					});
					
				});
				request.on('finish', (response: any) => {
					console.log('i am finished');
					console.log(response);
					console.log('i am finished');
				})
				request.on('error', (response: any) => {
					console.log('i am error');
					console.log(response);
					console.log('i am error');
				})

				request.end();
			} catch (e) {
				self.loader = null;
				// alert("ffffff");
				console.log("---------errrrrr---------");
				console.log(e);
				console.log("-----------errrrrr---------");
			}
		});


	}
	put(url, header: any,postData:any={}) {
		let self = this;
		let chunkedData: any = "";
		return new Promise((resolve, reject) => {
			try {
				self.loader = true;
				// const options = {
				// 	hostname: hostname,
				// 	port: 80,
				// 	path: path,
				// 	method: 'GET',
				// 	headers: header
				// };
				const options = {
					url: url,
					method: 'PUT',
					headers: header,
					data:postData
				};
				let net = this.electro.remote.net;
				// console.log("this.electro.remote---");
				// console.log(this.electro.remote);
	
				// console.log("this.electro.remote---");
				let request =   net.request(options);
				  request.chunkedEncoding=false
				request.on('response', (response:any) => {
				
                    response.on('data', (chunk) => {
                          chunkedData = chunkedData + `${chunk}`;
                            if (self.isValidJson(chunkedData)) {
                               resolve(JSON.parse(chunkedData));
}
					console.log("chunkedData---");
				   console.log(chunkedData);

					});
					response.on('end',function(f){
						console.log("f--------------------->");
						console.log(f);
						console.log("f--------------------->");
						console.log(chunkedData);
						console.log("at the end all goes well");
						if(self.isValidJson(chunkedData)){
							resolve(JSON.parse(chunkedData));
						}else{
							return resolve((chunkedData));
						}
						
					});
					
				});

				request.end();
			} catch (e) {
				self.loader = null;
				// alert("ffffff");
				console.log("---------errrrrr---------");
				console.log(e);
				console.log("-----------errrrrr---------");
			}
		});


	}
	delete(url, header: any) {
		let self = this;
		let chunkedData: any = "";
		return new Promise((resolve, reject) => {
			try {
				self.loader = true;
			
				const options = {
					url: url,
					method: 'DELETE',
					headers: header
				};
				let net = this.electro.remote.net;
				
				let request =   net.request(options);
				  request.chunkedEncoding=false
				request.on('response', (response:any) => {
				
					response.on('data', (chunk) => {
				
							chunkedData = chunkedData + `${chunk}`;
							if(self.isValidJson(chunkedData)){
								resolve(JSON.parse(chunkedData));
							}
							console.log("chunkedData---");
							console.log(chunkedData);
					
					});
					response.on('end',function(f){
						console.log("f--------------DELETE------->");
						console.log(f);
						console.log("f---------------DELETE------>");
						console.log(chunkedData);
						console.log("at the end all goes well");
						return resolve(JSON.parse(chunkedData));
					});
					
				});

				request.end();
			} catch (e) {
				self.loader = null;
				// alert("ffffff");
				console.log("---------errrrrr---------");
				console.log(e);
				console.log("-----------errrrrr---------");
			}
		});


	}
	isValidJson(text:string){
		if(/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
		replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
		replace(/(?:^|:|,)(?:\s*\[)+/g, ''))){
			return true;
		}else{
			return false;
		}
	}

}