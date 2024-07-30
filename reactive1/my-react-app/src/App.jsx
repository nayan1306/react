
import Card from "./components/Card.jsx";
import UserGreeting from "./components/UserGreeting.jsx";
import List from "./components/List/List.jsx";
import Button from "./components/Button/Button.jsx"
import Counter  from "./components/Counter/Counter.jsx";

function App() {
  const movies = [
    { id: 1, name: "Cars", rating: 9 },
    { id: 2, name: "Inception", rating: 8 },
    { id: 3, name: "The Matrix", rating: 9 },
    { id: 4, name: "Toy Story", rating: 8 },
    { id: 5, name: "The Godfather", rating: 10 },
    { id: 6, name: "Pulp Fiction", rating: 9 },
    { id: 7, name: "The Dark Knight", rating: 10 },
    { id: 8, name: "Forrest Gump", rating: 9 },
    { id: 9, name: "The Shawshank Redemption", rating: 10 },
    { id: 10, name: "Star Wars", rating: 8 }
  ];

  return (
    <>
      <UserGreeting isLoggedIn={true} username="User"/>
      <Card name="Nayan Verma" description="I do cool stuff, every hour to make my food digest. This is the key to Crazyness."/>
      <Card name="Card Two"/>
      <Card name="Card Three"/>
      <Card name="Anonymous"/>
      <hr />
      <Button/>
      <hr />
      <Counter/>
      <hr />
      <List items={movies} category="🎬 Movies"/>
    </>
  );
}

export default App;
