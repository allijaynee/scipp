// Segmented Button Component

import "beercss";

export default function SegmentedButton(props) {
  return (
    <nav className="no-space">
      <button 
      className={`border left-round ${props.selected === "Low" ? "fill" : ""}`}
      onClick={() => props.onChange("Low")}
      >
        <span>Low</span>
      </button>

      <button 
      className={`border no-round ${props.selected === "Medium" ? "fill" : ""}`}
      onClick={() => props.onChange("Medium")}
      >
        <span>Medium</span>
      </button>

      <button 
      className={`border right-round ${props.selected === "High" ? "fill" : ""}`}
      onClick={() => props.onChange("High")}
      >
        <span>High</span>
      </button>
    </nav>
  );
}
