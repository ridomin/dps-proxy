import crypto from 'crypto'

export const createHmac = async (key, msg) => {
  const hmac = crypto.createHmac('sha256', Buffer.from(key, 'base64'))
  hmac.update(msg)
  return hmac.digest('base64')
}

export/**
   * @param {string} resourceUri
   * @param {string} signingKey
   * @param {string | null} policyName
   * @param {number} expiresInMins
   * @returns {Promise<string>}
   */
async function generateSasToken (resourceUri, signingKey, policyName, expiresInMins) {
  resourceUri = encodeURIComponent(resourceUri)
  let expires = (Date.now() / 1000) + expiresInMins * 60
  expires = Math.ceil(expires)
  const toSign = resourceUri + '\n' + expires
  const hmac = await createHmac(signingKey, toSign)
  const base64UriEncoded = encodeURIComponent(hmac)
  let token = 'SharedAccessSignature sr=' + resourceUri + '&sig=' + base64UriEncoded + '&se=' + expires
  if (policyName) token += '&skn=' + policyName
  return token
}
