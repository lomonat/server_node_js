var ipapi = require('./lib/ip-api');
module.exports.getDomainOrIPDetails = function(domainOrip,reponseType,callback) {
 ipapi.fireRequest(domainOrip,reponseType,function(err,result){

 	if(err)
 	{
       callback(err,null);
 	}else
 	{
       callback(null,result);
 	}

 });
};
