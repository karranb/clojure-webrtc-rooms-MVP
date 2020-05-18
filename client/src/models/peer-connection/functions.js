import { v4 as uuidv4 } from 'uuid'

import { WEBRTC_SERVER, TITLES } from '_constants'
import PeerConnection from '.'

const server = { urls: WEBRTC_SERVER }

const DEFAULT = () => ({
  pc: new RTCPeerConnection({ iceServers: [server] }),
  id: uuidv4(),
  roomId: null,
  sendSocketMessage: null,
  connection: null,
})

const functionsWrapper = (config = {}) => {
  const state = {
    ...DEFAULT(),
    ...config,
  }
  const { pc, id, sendSocketMessage, onMessage, onOpen, onClose, onReceiveRequest, mutablesFunctions } = state
  const { getChannel, getUserId, setAddress, setChannel } = mutablesFunctions

  const updateOnOpen = fn => {
    const channel = getChannel()
    if (channel) {
      channel.onopen = () => {
        console.log('Channel Opened')
        fn()
      }
    }
    return functionsWrapper({ ...state, onOpen: fn })
  }

  const updateOnMessage = fn => {
    const channel = getChannel()
    if (channel) {
      channel.onmessage = e => {
        fn(e)
      }
    }
    return functionsWrapper({ ...state, onMessage: fn })
  }

  const updateOnClose = fn => 
   functionsWrapper({ ...state, onClose: fn })

  const updateOnReceiveRequest = fn => 
   functionsWrapper({ ...state, onReceiveRequest: fn })

  pc.ondatachannel = ({ channel: _channel }) => {
    setChannel(_channel)

    return functionsWrapper({ ...state })
      .updateOnMessage(onMessage)
      .updateOnOpen(onOpen)
      .updateOnClose(onClose)
  }

  pc.oniceconnectionstatechange = e => {
    if (pc.iceConnectionState === 'disconnected') {
      const data = {
        title: TITLES.CONNECTION_CLOSED,
        connectionId: id,
        roomId: state.roomId,
      }
      sendSocketMessage(data)
      if (onClose) {
        onClose(getUserId(), id)
      }
    }
  }

  const newChannelRequest = roomId => {
    setChannel(pc.createDataChannel('chat'))

    pc.createOffer()
      .then(d => pc.setLocalDescription(d))
      .catch(console.log)

    pc.onicecandidate = e => {
      if (e.candidate) return
      sendSocketMessage({
        title: 'CONNECTION-REQUEST',
        offer: pc.localDescription.sdp,
        roomId,
        connectionId: id,
      })
    }
    return functionsWrapper({ ...state, pc })
      .updateOnMessage(onMessage)
      .updateOnOpen(onOpen)
  }

  const setChannelResponse = answer => {
    const desc = new RTCSessionDescription({ type: 'answer', sdp: answer })
    pc.setRemoteDescription(desc).catch(console.log)
    return functionsWrapper({ ...state, pc })
  }

  const newChannelResponse = (offer, _id) => {
    const desc = new RTCSessionDescription({ type: 'offer', sdp: offer })

    pc.setRemoteDescription(desc)
      .then(() => pc.createAnswer())
      .then(d => pc.setLocalDescription(d))
      .catch(console.log)

    pc.onicecandidate = e => {
      if (e.candidate) {
        if (onReceiveRequest) {
          onReceiveRequest(e.candidate.address)
        }
        return
      }
      const data = {
        title: TITLES.CONNECTION_ANSWER,
        answer: pc.localDescription.sdp,
        connectionId: _id,
      }
      sendSocketMessage(data)
    }
    return functionsWrapper({ ...state, pc, id: _id })
  }

  const getId = () => id

  const close = () => { 
    pc.close()
    return functionsWrapper({ ...state })
  }

  const sendPeerMessage = (title, messageObject = {}) => {
    getChannel().send(JSON.stringify({ title, ...messageObject }))
    return functionsWrapper({ ...state })
  }

  return {
    ...mutablesFunctions,
    close,
    getId,
    newChannelRequest,
    newChannelResponse,
    sendPeerMessage,
    setChannelResponse,
    updateOnClose,
    updateOnMessage,
    updateOnOpen,
    updateOnReceiveRequest,
  }
}

export default functionsWrapper
