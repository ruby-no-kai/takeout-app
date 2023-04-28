module OidcSigningKey
  def self.pkey
    key = Rails.configuration.x.oidc.signing_key
    raise "no config.x.oidc.signing_key" unless key
    raise "should be RSA key" unless key.is_a?(OpenSSL::PKey::RSA)
    key
  end

  def self.kid
    @kid ||= "to1x#{hash}"
  end

  def self.hash
    @hash ||= OpenSSL::Digest.hexdigest('sha256', pkey.public_key.to_der)
  end

  def self.public_jwk
    @jwk ||= {
      kid: kid,
      kty: 'RSA',
      use: "sig",
      alg: "RS256",
      n: Base64.urlsafe_encode64(pkey.public_key.n.to_s(2), padding: false),
      e: Base64.urlsafe_encode64(pkey.public_key.e.to_s(2), padding: false),
    }
  end
end
