// Chime SDK polyfill for AWS SDK JS v3 around SigV4
// https://github.com/aws/amazon-chime-sdk-js/blob/a427be724151767fe9429a01ac3a0f39532d57b9/src/sigv4/DefaultSigV4.ts#L7

import type SigV4 from "amazon-chime-sdk-js/build/sigv4/SigV4";
import Versioning from "amazon-chime-sdk-js/build/versioning/Versioning";

import { Credentials, HttpRequest, QueryParameterBag } from "@aws-sdk/types";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";

import { formatUrl } from "@aws-sdk/util-format-url";

export class ChimeSigV4Null implements SigV4 {
  provider: SignatureV4;

  constructor(credentials: Credentials) {
    this.provider = new SignatureV4({
      credentials: credentials,
      region: "us-east-1",
      service: "chime",
      sha256: Sha256,
      applyChecksum: false,
    });
  }

  signURL(
    _method: string,
    _scheme: string,
    _serviceName: string,
    _hostname: string,
    _path: string,
    _payload: string,
    _queryParams: Map<string, string[]> | null,
  ): string {
    throw "wut?";
  }

  async signURL2(
    method: string,
    scheme: string,
    serviceName: string,
    hostname: string,
    path: string,
    _payload: string,
    queryParams: Map<string, string[]> | null,
  ): Promise<string> {
    const query: QueryParameterBag = {};
    if (queryParams) {
      for (const [k, vs] of queryParams.entries()) {
        const q: string[] = [];
        vs.sort().forEach((v) => q.push(v));
        query[k] = q;
      }
    }
    query[Versioning.X_AMZN_VERSION] = [`${Versioning.sdkVersion}+chime-monkeypatch-for-aws-sdk-js-v3`];
    query[Versioning.X_AMZN_USER_AGENT] = [Versioning.sdkUserAgentLowResolution];
    //console.log("unsignedQuery", query);

    const req: HttpRequest = {
      headers: { host: hostname.toLowerCase() },
      hostname,
      method,
      path,
      protocol: scheme,
      query,
    };
    const signedReq = await this.provider.presign(req, { expiresIn: 10, signingService: serviceName });
    //console.log("signedReq", signedReq);

    const signedUrl = formatUrl(signedReq);
    return signedUrl;
  }
}
