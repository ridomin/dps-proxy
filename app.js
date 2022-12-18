import express from 'express'
import { register } from './dpsRegister.js'
const app = express()
const port = 3000

// http://localhost:3000/register?scopeId=0ne0083E236&deviceId=dev01&deviceKey=MitioajcTQN4yMLVBTfIAN1omGtZP3knqEoE8yZ4I5c=&modelId=dtmi:Advantech:AIIS_3410P;1

app.get('/register', async (req, res) => {
  const scopeId = req.query.scopeId
  const deviceId = req.query.deviceId
  const deviceKey = req.query.deviceKey
  const modelId = req.query.modelId

  console.log(deviceId, deviceKey)
  if (scopeId && deviceId && deviceKey && modelId) {
    const result = await register(scopeId, deviceId, deviceKey, modelId)
    res.json(result)
    res.end()
  } else {
    res.text('invalid params')
    res.end()
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
