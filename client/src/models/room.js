import { assoc, head, map, mergeRight, omit, prop, values, reduce } from 'ramda'

const DEFAULT = {
  roomId: null,
  name: null,
  connections: {},
  users: {},
  bannedAddresses: new Set(),
  size: null,
  usersCount: 0,
}

const Room = (config = {}) => {
  const state = {
    ...DEFAULT,
    ...config,
  }

  return {
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
    setBannedAddress: address => {
      const bannedAddresses = new Set([...state.bannedAddresses, address])
      return Room({ ...state, bannedAddresses })
    },
    getUser: userId => prop(userId, state.users),
    getUsersData: () => {
      const host = state.host ? assoc(state.host.getId(), state.host, {}) : {}
      return map(
        user => ({
          id: user.getId(),
          name: user.getName(),
          isHost: user.getIsHost(),
          isAdmin: user.getIsAdmin(),
        }),
        mergeRight(state.users, host)
      )
    },
    getUsersCount: () => state.usersCount,
    getSize: () => state.size,
    getConnections: () => values(state.connections),
    getConnection: connectionId => prop(connectionId, state.connections),
    getFirstConnection: () => head(values(state.connections)),
    getBannedAddresses: () => Array.from([...state.bannedAddresses]),
  }
}

export default Room
