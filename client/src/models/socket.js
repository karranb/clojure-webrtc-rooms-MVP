import { SOCKET_URL } from '_constants'

const Socket = (state = {}) => {
  const _socket = state.socket || new WebSocket(SOCKET_URL)

  const sendMessage = data => {
    _socket.send(JSON.stringify(data))
  }

  const setListener = onMessage => {
    _socket.onmessage = onMessage
    return Socket({ socket: _socket })
  }

  return { socket: _socket, sendMessage, setListener }
}

export default Socket
