import styles from './Button.module.css'

function Button(){
    // const showAlert = () => alert("Wow what a click 🔥");
    const changeText = (e) => e.target.textContent = "Launched 🌌"
    return(
        <button className={styles.button1} onClick={changeText}>Launch 🚀</button>
    )
}

export default Button
