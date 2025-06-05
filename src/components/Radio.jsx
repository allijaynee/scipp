// Radio Button Component

import "beercss";

export default function Radio(props) {
    return (
        <label className="radio">
          <input
            type="radio"
            value={props.value}
            name={props.name}
            checked={props.selected} 
            onChange={props.onChange}  
            disabled={props.disabled}           
          />
          <span>{props.label}</span>
        </label>
      );
}
