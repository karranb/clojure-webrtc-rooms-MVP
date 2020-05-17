const DEFAULT = {
  roomId: null,
  name: null,
  connections: {},
  users: {},
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
      const connections = {
        ...state.connections,
        [connection.getId()]: connection,
      }
      return Room({ ...state, connections })
    },
    setUser: (user) => {
      const users = {
        ...state.users,
        [user.getId()]: user,
      }
      return Room({ ...state, users })
    },
    getUser: userId => state.users[userId],
    getUsers: () => {
      const host = state.host ? {
        [state.host.getId()] : {
          id: state.host.getId(),
          name: state.host.getName(),
        }
      } : {}
      return {
        ...host,
        ...Object.values(state.users).reduce((acc, user) => ({
          ...acc,
          [user.getId()]: {
            id: user.getId(),
            name: user.getName(),
          }
        }), {})
      }
    },
    getConnections: () => Object.values(state.connections),
    getConnection: connectionId => state.connections[connectionId],
  }
}

export default Room
