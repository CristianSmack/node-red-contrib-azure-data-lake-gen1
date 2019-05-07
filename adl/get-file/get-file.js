module.exports = function (RED) {
    var request = require('request');
    function retrieveFile(node,config,msg){
        request({
            uri:"https://"+config.storename+".azuredatalakestore.net/webhdfs/v1/"+config.filepath+"?op=OPEN&read=true",
            method: "GET",
            headers: {
                "Authorization": "Bearer "+node.context().token.access_token
            }
        }, (error,res) => {
            if (!error && res.statusCode == 200) {
                msg.payload = res.body
                node.send(msg)
                node.status({fill:"green",shape:"ring",text:"finished"});
                //Now we have to get the file

            } else {
                node.error("the file doesn't exist")
                node.status({fill:"green",shape:"ring",text:"finished"});

            }
        });
    }


    function ADLGetFile(config) {
        const querystring = require('querystring');

        RED.nodes.createNode(this, config);
        var node = this;
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);

        if (this.server) {
            this.on('input', function (msg) {
                this.status({fill:"blue",shape:"ring",text:"sending"});
                var sendRequest = true;
                if(this.context().token){
                    console.log(this.context().token)
                    console.log(this.context().token.expires_on)
                    console.log(Date.now())
                    if(this.context().token.expires_on>Date.now())
                        sendRequest=false;
                }
                
                if(sendRequest){
                    var postData = querystring.stringify({
                        'grant_type': "client_credentials",
                        'resource': 'https://management.core.windows.net/',
                        'client_id': this.server.application_id,
                        'client_secret': this.server.auth_key
                    })
                    
                    request({
                        uri: "https://login.microsoftonline.com/" + this.server.tenant_id + "/oauth2/token",
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': postData.length
                        },
                        body: postData
                    }, (error,res) => {

                        if (!error && res.statusCode == 200) {
                            msg.payload = JSON.parse(res.body)
                            this.context().token = JSON.parse(res.body)
                            this.status({fill:"green",shape:"ring",text:"finished"});
                            //Now we have to get the file
                            retrieveFile(this,config,msg)
    
                        } else {
    
                            this.error(error)
                            this.status({fill:"green",shape:"ring",text:"finished"});
    
                        }
                    });
                } else{
                    // Get the file
                    retrieveFile(node,config,msg)
                }

             
            });
        } else {
            
            this.error("Configure the conecction with Azure Data Lake, please")
            this.status({fill:"red",shape:"ring",text:"error"});
        }
    }
    RED.nodes.registerType("datalake-get-file", ADLGetFile);

}