// Drop Down Component

import "beercss";

export default function DropDown(props) {
    const isPlaceholder = !props.value || props.value === "";
    
    return(
        <div className="field label suffix border">
            <select 
                value={props.value} 
                onChange={props.onChange}
                className={isPlaceholder ? "placeholder-text" : "selected-text"}
            >
                <option value="" disabled>{props.placeholder || props.label}</option>
                <option>{props.itemone}</option>
                <option>{props.itemtwo}</option>
                <option>{props.itemthree}</option>
                <option>{props.itemfour}</option>
            </select>
            <label>{props.label}</label>
            <i>arrow_drop_down</i>
        </div>
    )
}