import { useState } from "react";

function OnChange(){
    const [name,setName] = useState("Default Text");

    function handelNameChange(event){
        setName(event.target.value)
    }
    return(
        <div>
            <h2>On Change</h2>
            <input type="text" value={name} onChange={handelNameChange}/>
            <p>Text :{name}</p>
        </div>
    )
}

export default OnChange;