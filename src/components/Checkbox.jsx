// Custom Checkbox Component
import "../App.css";

export default function Checkbox({ checked, onChange, label }) {
  return (
    <div className="card-checkbox" onClick={onChange} tabIndex={0} role="checkbox" aria-checked={checked} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', margin: 0, cursor: 'pointer' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, minWidth: 18, minHeight: 18, borderRadius: 4, border: checked ? '1.5px solid #7B2CBF' : '1px solid #ccc', background: checked ? '#ede3fa' : '#fff', transition: 'all 0.16s', boxShadow: checked ? '0 1px 2px #7B2CBF0A' : 'none', marginRight: 0, flexShrink: 0, position: 'relative', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={checked}
            tabIndex={-1}
            readOnly
            style={{
              opacity: 0,
              width: 18,
              height: 18,
              position: 'absolute',
              margin: 0,
              cursor: 'pointer',
            }}
          />
          {checked && (
            <svg width="10" height="10" viewBox="0 0 20 20" fill="none" style={{ display: 'block', pointerEvents: 'none' }}>
              <polyline
                points="4,11 9,16 16,5"
                style={{
                  fill: 'none',
                  stroke: '#7B2CBF',
                  strokeWidth: 1.7,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                }}
              />
            </svg>
          )}
        </span>
        <span className="criteria-label-text" style={{ flex: 1, wordBreak: 'break-word', cursor: 'pointer' }}>{label}</span>
      </div>
    </div>
  );
}