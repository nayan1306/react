import styles from './Button.module.css'

function Button(){
    const showAlert = () => alert("Wow what a click 🔥");
    return(
        <button className={styles.button1} onClick={showAlert}>Launch 🚀</button>
    )
}

export default Button
