const { generateSasToken } = require('./hmac')
const { fetch } = require('node-fetch')

module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.')

  const scopeId = req.query.scopeId
  const deviceId = req.query.deviceId
  const deviceKey = req.query.deviceKey
  const modelId = req.query.modelId

  if (scopeId && deviceId && deviceKey && modelId) {
    const base = 'https://global.azure-devices-provisioning.net/'
    const path = `${scopeId}/registrations/${deviceId}`
    const url = `${base}${path}/register?api-version=2019-03-31`
    const token = await generateSasToken(path, deviceKey, 'registration', 3600000)
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'utf-8',
        Authorization: token
      },
      body: JSON.stringify({ registrationId: deviceId, payload: { modelId } })
    }
    )
    const response = await resp.json()
    console.log(response)
    if (response && response.status && response.status === 'assigning') {
      setTimeout(async () => {
        const opid = response.operationId
        const statusUrl = `${base}${path}/operations/${opid}?api-version=2019-03-31`
        const resp = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Content-Encoding': 'utf-8',
            Authorization: token
          }
        })
        const provResult = await resp.json()
        console.log(provResult)
        context.res = {
          // status: 200, /* Defaults to 200 */
          body: provResult
        }
      }, 2000)
    }
  } else {
    context.res = {
      status: 500,
      body: 'invalid params'
    }
  }
}
