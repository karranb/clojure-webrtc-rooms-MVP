import { SOCKET_URL } from '_constants'

const Socket = (state = {}) => {
  const socket = state.socket || new WebSocket(SOCKET_URL)

  const sendMessage = data => {
    socket.send(JSON.stringify(data))
  }

  const setListener = onMessage => {
    socket.onmessage = onMessage
    return Socket({ socket })
  }

  return { socket, sendMessage, setListener }
}

export default Socket
