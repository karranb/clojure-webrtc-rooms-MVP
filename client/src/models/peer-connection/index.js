import functionsWrapper from './functions'

const PeerConnection = (config = {}) => {

  let channel = null
  let userId = null
  let address = null

  const mutablesFunctions = ({
    getChannel: () => channel,
    setChannel: _channel => {
      channel = _channel
    },
    getUserId: () => userId,
    setUserId: _userId => {
      userId = _userId
    },
    getAddress: () => address,
    setAddress: _address => {
      address = _address
    },
  })


  return functionsWrapper({ ...config, mutablesFunctions })
}

export default PeerConnection
