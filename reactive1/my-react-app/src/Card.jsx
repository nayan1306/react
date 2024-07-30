import profilePic from './assets/profile_demo.jpeg'

function Card(){
    return(
        <div className="profilecard">
            <img className='card-img' src={profilePic} alt="Profile Picture" />
            <h3>Nayan Verma</h3>
            <p>I make cool ML AI stuff then to I am doing this all.</p>
        </div>
    )
}

export default Card
