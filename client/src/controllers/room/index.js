import RoomScreen from '_views/room'
import ClientController from './client'
import HostController from './host'

const RoomController = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  const Controller = stateManager.getUser().getIsHost() ? HostController : ClientController
  Controller({ $game, stateManager, sendSocketMessage, setSocketListener })
}

export default RoomController
