// import Button from "./components/Button/Button.jsx"
import Card from "./components/Card.jsx"
import UserGreeting from "./components/UserGreeting.jsx"

function App() {

  return(
    <>
    <UserGreeting isLoggedIn={true} username="User"/>
     <Card name="Nayan Verma" description="I do cool stuff, every hour to make my food digest. This is the key to Crazyness."/>
     <Card name="Card Two"/>
     <Card name="Card Three"/>
     <Card />
    </>
  )
  
}

export default App
