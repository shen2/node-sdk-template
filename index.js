var querystring = require('querystring'),
	_ = require('underscore'),
	request = require('request');

var SDK = function(config) {
    if (!config) return false;
    this.config = config;
};

SDK.prototype.accessTokenUrl = function(){
	return '{{access_token_url}}';
};

/**
 * 使用code换取access_token与用户ID
 */
SDK.prototype.auth = function(code, callback) {
    if (!code)
    	return callback(new Error('code required'));
    if (typeof(code) !== 'string')
    	return callback(new Error('code must be string'));
    
    request.post(this.accessTokenUrl(), {
	    	form : {
	    		code: code,
	    		client_id : this.config.app_key,
	    		client_secret : this.config.app_secret
	    	},
	    	json : true
	    }, function(err, response, body){
	        if (err)
	        	return callback(err);
	        
	        if (response.body.error_code)
	        	return callback(new Error(response.body.errorMessage), response.body);
	        
	        return callback(err, response.body);
	    });
};

SDK.prototype.getClient = function(access_token){
	var client = new SDK.Client(access_token, this.config.app_key);
	
	return client;
};

/**
 * 构造一个SDK.Client实例
 * SDK.Client用于在拥有access token的情况下访问API接口
 */
SDK.Client = function(access_token, app_key){
	this.access_token = access_token;
	this.app_key = app_key;
};

SDK.Client.prototype.apiUrl = function(path){
	return '{{api_endpoint}}' + path;
};

SDK.Client.prototype.get = function(path, data, callback){
	var url = this.apiUrl(path);
		params = _.extend({
			app_key		: this.app_key,
			format		: 'json',
			access_token: this.access_token,
		}, data);
	
	url += '?' + querystring.stringify(params);
	
	request.get(url, {json : true}, callback);
};

SDK.Client.prototype.post = function(path, data, callback){
	var url = this.apiUrl(path),
		params = _.extend({
			app_key		: this.app_key,
			format		: 'json',
			access_token: this.access_token,
		}, data);
	
	request.post(url, {json : true, form:params}, callback);
};

module.exports = SDK;
