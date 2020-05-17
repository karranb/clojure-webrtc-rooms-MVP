import { TITLES } from '_constants'
import SignInScreen from '_views/signin'

const SigninController = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  
  const sendGetId = () => {
    const data = {
      title: TITLES.GET_ID,
    }
    sendSocketMessage(data)
  }
  
  const sendSetName = name => {
    stateManager.updateUser(user => user.setName(name))
    sendGetId()
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.GET_ID:
        stateManager.updateUser(user => user.setId(parsedData.id))
        stateManager.webStateMachineSend('CONFIRM')
        return
    }
  }

  setSocketListener(onMessage)

  SignInScreen({ $game, sendSetName })
}

export default SigninController
