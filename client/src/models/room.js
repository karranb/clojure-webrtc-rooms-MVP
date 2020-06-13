import { TITLES } from '_constants'
import { assoc, head, map, omit, prop, values, reduce } from 'ramda'

const DEFAULT = {
  roomId: null,
  name: null,
  connections: {},
  users: {},
  bannedAddresses: new Set(),
  size: null,
  publicInfo: {},
  privateInfo: {},
}

const Room = config => {
  const state = {
    ...DEFAULT,
    ...config,
  }

  const functions = {
    getBannedAddresses: () => Array.from([...state.bannedAddresses]),
    getConnection: connectionId => prop(connectionId, state.connections),
    getConnections: () => values(state.connections),
    getHostConnection: () => head(values(state.connections)),
    getId: () => state.roomId,
    getName: () => state.name,
    getSize: () => state.size,
    getState: () => state,
    getPublicInfo: () => state.publicInfo,
    getPrivateInfo: () => state.privateInfo,
    getUser: userId => prop(userId, state.users),
    getUsersData: () =>
      map(
        user => ({
          id: user.getId(),
          name: user.getName(),
          isHost: user.getIsHost(),
          isAdmin: user.getIsAdmin(),
        }),
        state.users
      ),
    removeConnection: connectionId => {
      const connections = omit([connectionId], state.connections)
      return Room({ ...state, connections })
    },
    removeUser: userId => {
      const users = omit([userId], state.users)
      return Room({ ...state, users })
    },
    setBannedAddress: address => {
      const bannedAddresses = new Set([...state.bannedAddresses, address])
      return Room({ ...state, bannedAddresses })
    },
    setConnection: connection => {
      const connections = assoc(connection.getState().id, connection, state.connections)
      return Room({ ...state, connections })
    },
    setId: roomId => Room({ ...state, roomId }),
    setPrivateInfo: newInfo =>
      Room({
        ...state,
        privateInfo: {
          ...state.privateInfo,
          ...newInfo,
        },
      }),
    setName: name => Room({ ...state, name }),
    setPublicInfo: newInfo => {
      const publicInfo = {
        ...state.publicInfo,
        ...newInfo,
      }
      state.sendSocketMessage({
        title: TITLES.UPDATE_ROOM,
        publicInfo,
      })
      return Room({
        ...state,
        publicInfo,
      })
    },
    setUser: user => {
      const users = assoc(user.getId(), user, state.users)
      return Room({ ...state, users })
    },
    setUsers: usersList => {
      const users = reduce((acc, user) => assoc(user.getId(), user, acc), {}, usersList)
      return Room({ ...state, users })
    },
  }

  return state.isHost
    ? omit(['getHostConnection', 'setUsers'], functions)
    : omit(['getConnection', 'getConnections', 'getBannedAddresses', 'removeConnection'], functions)
}

export default Room
