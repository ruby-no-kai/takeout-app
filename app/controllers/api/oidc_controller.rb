# Dumb OIDC implementation. Returns JWK set and metadata for AWS IAM consumption.
class Api::OidcController < Api::ApplicationController
  def show_configuration
    expires_in(60, public: true, 's-maxage': 86400*365)
    render(json: {
      issuer: "https://#{request.host}",
      jwks_uri: "https://#{request.host}/api/oidc/jwks",
      response_types_supported: ["id_token"],
      subject_types_supported: ["public"],
      claims_supported: ["iss","aud","sub","jti","iat","nbf","exp"],
      id_token_signing_alg_values_supported:["RS256"],
    })
  end

  def show_jwks
    expires_in(60, public: true, 's-maxage': 86400*365)
    render(json: {
      keys: [
        OidcSigningKey.public_jwk,
      ],
    })
  end
end
