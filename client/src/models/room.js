import { assoc, head, map, mergeRight, omit, prop, values, reduce } from 'ramda'

const DEFAULT = {
  roomId: null,
  name: null,
  connections: {},
  users: {},
  banList: {},
  size: null,
}

const Room = (config = {}) => {
  const state = {
    ...DEFAULT,
    ...config,
  }

  return {
    getHost: () => state.host,
    setHost: host => Room({ ...state, host }),
    setId: roomId => Room({ ...state, roomId }),
    getId: () => state.roomId,
    setName: name => Room({ ...state, name }),
    getName: () => state.name,
    setConnection: connection => {
      const connections = assoc(connection.getId(), connection, state.connections)
      return Room({ ...state, connections })
    },
    removeConnection: connectionId => {
      const connections = omit([connectionId], state.connections)
      return Room({ ...state, connections })
    },
    removeUser: userId => {
      const users = omit([userId], state.users)
      return Room({ ...state, users })
    },
    setUser: user => {
      const users = assoc(user.getId(), user, state.users)
      return Room({ ...state, users })
    },
    setUsers: usersList => {
      const users = reduce((acc, user) => assoc(user.getId(), user, acc), {}, usersList)
      return Room({ ...state, users })
    },
    getUser: userId => prop(userId, state.users),
    getUsers: () => {
      const host = state.host
        ? assoc(state.host.getId(), { id: state.host.getId(), name: state.host.getName() }, {})
        : {}
      const otherUsers = map(user => ({ id: user.getId(), name: user.getName() }), state.users)
      return mergeRight(host, otherUsers)
    },
    getConnections: () => values(state.connections),
    getConnection: connectionId => prop(connectionId, state.connections),
    getFirstConnection: () => head(values(state.connections)),
  }
}

export default Room
