import { useNavigate } from '@tanstack/react-router';
import '../App.css';
// import LowRiskButton from "./LowRiskButton.jsx";
// import HighRiskButton from "./HighRiskButton.jsx";

const HeartScoreButton = ({ heartScore, heartScoreCalculated, heartScoreRef, onAction }) => {
    const navigate = useNavigate();

    // Determine color for Heart Score box and button
    let scoreColor = '#7B2CBF'; // default purple
    let scoreBg = '#f8f4ff';
    let buttonBg = '#E2B93B';
    let buttonText = 'Moderate Risk';
    let buttonIcon = '⚠️';
    if (heartScore < 4) {
        scoreColor = '#219653'; // green
        scoreBg = '#219653';
        buttonBg = '#219653';
        buttonText = 'Low Risk';
        buttonIcon = '✓';
    } else if (heartScore >= 4 && heartScore < 7) {
        scoreColor = '#E2B93B'; // yellow
        scoreBg = '#E2B93B';
        buttonBg = '#E2B93B';
        buttonText = 'Moderate Risk';
        buttonIcon = '⚠️';
    } else if (heartScore >= 7) {
        scoreColor = '#D7263D'; // red
        scoreBg = '#D7263D';
        buttonBg = '#D7263D';
        buttonText = 'High Risk';
        buttonIcon = '⚠️';
    }

    return (
        <div ref={heartScoreRef} style={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 32
        }}>
            {!heartScoreCalculated ? (
                <button
                    className="btn-standard"
                    style={{
                        background: '#1976d2',
                        color: '#fff',
                        boxShadow: '0 2px 12px rgba(25, 118, 210, 0.15)',
                        animation: 'heartPulse 1.5s infinite',
                        width: '100%',
                        maxWidth: '300px',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                    onClick={() => navigate({ to: '/heart-score' })}
                    onMouseEnter={(e) => {
                        e.target.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.boxShadow = '0 2px 12px rgba(25, 118, 210, 0.15)';
                    }}
                >
                    <span style={{ fontSize: '1.2em', animation: 'iconBounce 1.5s infinite' }}>❤️</span>
                    Calculate HEART Score
                </button>
            ) : (
                <div style={{
                    background: scoreBg,
                    color: '#fff',
                    borderRadius: 16,
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    padding: '24px 0 0 0',
                    minHeight: '120px',
                    width: '100%',
                    maxWidth: '340px',
                    boxShadow: `0 2px 12px ${scoreColor}22`,
                    border: `2px solid ${scoreColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 8,
                    transition: 'all 0.2s ease-in-out',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    marginBottom: 24
                }}>
                    <div style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1, color: '#fff' }}>{heartScore}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 500, color: '#fff', marginTop: 2, marginBottom: 8 }}>HEART Score</div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <button
                            className="btn-standard"
                            style={{
                                background: buttonBg,
                                color: '#fff',
                                border: `2px solid #fff`,
                                borderRadius: '12px',
                                padding: '16px 0',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                width: '92%',
                                margin: '0 auto 16px auto',
                                cursor: 'pointer',
                                boxShadow: '0 4px 18px 0 rgba(0,0,0,0.13)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                transition: 'all 0.2s',
                                outline: 'none',
                            }}
                            onClick={onAction ? onAction : () => {}}
                            onMouseEnter={e => {
                                e.target.style.boxShadow = '0 8px 24px 0 rgba(0,0,0,0.18)';
                                e.target.style.filter = 'brightness(0.95)';
                            }}
                            onMouseLeave={e => {
                                e.target.style.boxShadow = '0 4px 18px 0 rgba(0,0,0,0.13)';
                                e.target.style.filter = 'none';
                            }}
                        >
                            <span style={{ fontSize: '1.3em', animation: 'iconBounce 1.5s infinite' }}>{buttonIcon}</span>
                            {buttonText}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeartScoreButton; 