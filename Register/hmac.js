const crypto = require('crypto')

const createHmac = async (key, msg) => {
  console.log('key', key)
  console.log('toSign', msg)
  const hmac = crypto.createHmac('sha256', Buffer.from(key, 'base64'))
  hmac.update(msg)
  return hmac.digest('base64')
}

const generateSasToken = async (resourceUri, signingKey, policyName, expiresInMins) => {
  resourceUri = encodeURIComponent(resourceUri)
  let expires = (Date.now() / 1000) + expiresInMins * 60
  expires = Math.ceil(expires)
  const toSign = resourceUri + '\n' + expires
  const hmac = await createHmac(signingKey, toSign)
  console.log('hmac', hmac)
  const base64UriEncoded = encodeURIComponent(hmac)
  let token = 'SharedAccessSignature sr=' + resourceUri + '&sig=' + base64UriEncoded + '&se=' + expires
  if (policyName) token += '&skn=' + policyName
  return token
}

module.exports = { generateSasToken, createHmac }
