import AWS from 'aws-sdk';
import elasticsearch from 'elasticsearch';
import HttpConnector from 'elasticsearch/src/lib/connectors/http';

const AwsHttpConnectorFabric = (awsConfig, endpoint, hostName) => {
  return class AwsHttpConnector extends HttpConnector {
    constructor(host, config) {
      super(host, config);

      this._request = HttpConnector.prototype.request.bind(this);
      this.request = this.request.bind(this);
    }

    request(params, cb) {
      params = params || {};
      params.method = params.method || 'POST';

      let promise = new Promise((resolve, reject) => {

        awsConfig.getCredentials((err) => {
          if (err) {
            reject(err);
            return;
          }

          let awsReq = new AWS.HttpRequest(new AWS.Endpoint(endpoint));
          awsReq.method = params.method;
          awsReq.path = params.path;
          awsReq.region = awsConfig.region;
          awsReq.body = typeof params.body === 'string' ? params.body : JSON.stringify(params.body);

          awsReq.headers = {
            Host: hostName,
            "presigned-expires": false
          };

          let signer = new AWS.Signers.V4(awsReq, 'es');
          signer.addAuthorization(awsConfig.credentials, new Date());
          params.headers['X-Amz-Date'] = awsReq.headers['X-Amz-Date'];
          params.headers['Authorization'] = awsReq.headers['Authorization'];

          if (awsReq.headers['x-amz-security-token']) {
            params.headers['x-amz-security-token'] = awsReq.headers['x-amz-security-token'];
          }

          // console.log(params);

          resolve(this._request(params, cb));
        });

      });

      return function () {
        promise.then((requestAbort) => requestAbort()).catch(() => {});
      };
    }
  };
};

export default class AwsEsClient extends elasticsearch.Client {
  constructor(config, esNode, region, accessKeyId, secretAccessKey, useSSL = true) {
    let hostName = `${esNode}.${region}.es.amazonaws.com`;
    let port = useSSL ? 443 : 80;
    let endpoint = `http${useSSL ? 's' : ''}://${hostName}:${port}`;

    let awsConfig = new AWS.Config({
      credentials: new AWS.Credentials(accessKeyId, secretAccessKey),
      region: region,
    });

    super(
      Object.assign(
        {},
        config,
        {
          host: endpoint,
          connectionClass: AwsHttpConnectorFabric(awsConfig, endpoint, hostName),
        }
      )
    );
  }
};

export class AwsEsPublicClient extends elasticsearch.Client {
  constructor(config, esNode, region, useSSL = true) {
    let hostName = `${esNode}.${region}.es.amazonaws.com`;
    let port = useSSL ? 443 : 80;
    let endpoint = `http${useSSL ? 's' : ''}://${hostName}:${port}`;

    super(
      Object.assign(
        {},
        config,
        {
          host: endpoint,
        }
      )
    );
  }
};
