// User Input Component

import "beercss";

export default function Input(props) {
    return(
        <div className="field label border">
            <input 
            type= "number"
            step="any"
            value = {props.value}
            onChange={props.onChange} 
            disabled={props.disabled}
            placeholder={props.placeholder}
            />
            <label>{props.label || "Value"}</label>
        </div>
    )
}