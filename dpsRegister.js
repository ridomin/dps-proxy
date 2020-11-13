import { generateSasToken } from './hmac.js'
import fetch from 'node-fetch'

const sleep = (delay) => new Promise(resolve => setTimeout(resolve, delay))

export const register = async (scopeId, deviceId, deviceKey, modelId) => {
  // deviceKey = await createHmac(masterKey, deviceId)
  const base = 'https://global.azure-devices-provisioning.net/'
  const path = `${scopeId}/registrations/${deviceId}`
  const url = `${base}${path}/register?api-version=2019-03-31`
  const token = await generateSasToken(path, deviceKey, 'registration', 3600000)

  const resp = await fetch(url,
    {
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
  if (response && response.message === 'Unauthorized') {
    return response
  } else {
    let status = response.status
    let provResult = {}
    let maxRetries = 10
    while (status === 'assigning' && maxRetries-- > 0) {
      const opid = response.operationId
      const statusUrl = `${base}${path}/operations/${opid}?api-version=2019-03-31`
      console.log(1000 * (10 - maxRetries), statusUrl)
      await sleep(1000 * (10 - maxRetries))
      const resp = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Content-Encoding': 'utf-8',
          Authorization: token
        }
      })
      provResult = await resp.json()
      status = provResult.status
    }
    return provResult
  }
}
