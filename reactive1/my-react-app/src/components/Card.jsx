import profilePic from '../assets/profile_demo.jpeg'
import PropTypes from 'prop-types';

function Card(props){
    return(
        <div className="profilecard">
            <img className='card-img' src={profilePic} alt="Profile Picture" />
            <h3 >{props.name}</h3>
            <p className='p-in-card'>{props.description}</p>
        </div>
    )
}

Card.propTypes = {
    name: PropTypes.string,
    description: PropTypes.string,
};

Card.defaultProps = {
    name: "Card Name",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corrupti, harum!"
}



export default Card
