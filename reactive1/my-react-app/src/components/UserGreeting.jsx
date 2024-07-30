import PropTypes from "prop-types"

function UserGreeting(props){
    return(
        props.isLoggedIn ? <h2>👋🏻 {props.username}</h2> : <h2>🥺 Please Log in</h2>
    );
}

UserGreeting.propTypes = {
    isLoggedIn: PropTypes.bool,
    username: PropTypes.string,

}

export default UserGreeting