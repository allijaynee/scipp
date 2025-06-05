import { riskStyles } from './riskStyles.js';

const RiskButton = ({ risk = 'moderate', children, onClick, style = {}, containerStyle = {}, ...props }) => {
  const s = riskStyles[risk];
  return (
    <div className="btn-container" style={{ 
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '16px',
      ...containerStyle 
    }}>
      <button
        className="btn-standard"
        style={{
          background: s.bg,
          color: s.text,
          border: `2px solid #fff`,
          borderRadius: 12,
          padding: '16px 0',
          fontSize: '1.1rem',
          fontWeight: 700,
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
          cursor: 'pointer',
          boxShadow: s.shadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'all 0.2s',
          outline: 'none',
          ...style,
        }}
        onClick={onClick}
        onMouseEnter={e => {
          e.target.style.boxShadow = '0 8px 24px 0 rgba(0,0,0,0.18)';
          e.target.style.filter = 'brightness(0.95)';
        }}
        onMouseLeave={e => {
          e.target.style.boxShadow = s.shadow;
          e.target.style.filter = 'none';
        }}
        {...props}
      >
        <span style={{ fontSize: '1.3em', animation: 'iconBounce 1.5s infinite', color: s.iconColor }}>{s.icon}</span>
        {children || (risk === 'low' ? 'Low Risk' : risk === 'high' ? 'High Risk' : 'Moderate Risk')}
      </button>
    </div>
  );
};

export default RiskButton; 