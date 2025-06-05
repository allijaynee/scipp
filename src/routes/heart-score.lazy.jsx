// HEART or HEAR score page

import { useState, useRef, useEffect } from "react";
import "../App.css";

import SectionHeader from "../components/SectionHeader.jsx";

import { useForm } from "../FormContext.jsx";
import { createLazyFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { riskStyles } from '../components/riskStyles.js';

export const Route = createLazyFileRoute('/heart-score')({
  component: HeartScore
})

function HeartScore() {
  const { formData, setFormData, resetFormData } = useForm();
  const navigate = useNavigate();

  // to handle the risk checkboxes
  const riskFactorLabels = [
    "Hypertension",
    "Diabetes Mellitus",
    "Obstructive CAD",
    "Non-Obstructive CAD",
    "Smoking History (>3mo Usage)",
    "Hypercholesterolemia",
    "Family History of CVD",
    "Obesity (BMI > 30 kg/m2)",
    "Peripheral Arterial Disease",
    "History of Atherosclerotic Disease",
  ];
  const items = riskFactorLabels.map(label => ({
    label,
    checked: formData.riskFactors?.includes(label)
  }));

  const handleRisk = (index) => {
    const label = riskFactorLabels[index];
    let updated;
    if (formData.riskFactors?.includes(label)) {
      updated = formData.riskFactors.filter(l => l !== label);
    } else {
      updated = [...(formData.riskFactors || []), label];
    }
    setFormData(prev => ({ ...prev, riskFactors: updated }));
  }
  const checkedCount = formData.riskFactors?.length || 0;

  const handleSegChange = (value) => {
    setFormData((prev) => ({ ...prev, history: value }));
  };

  // Add a handler for the Done button
  const handleDone = () => {
    setFormData(prev => ({ ...prev, heartScoreCalculated: true, heartScore }));
    navigate({ to: '/acute-one' });
  };

  // High suspicion features
  const highSuspicionFeatures = [
    "Retrosternal pain or pressure",
    "Radiation to jaw, left shoulder, or arms",
    "Duration 5-15 minutes",
    "Initiated by exercise, cold, or emotion",
    "Perspiration during symptoms", 
    "Nausea or vomiting",
    "Relief with nitrates within minutes",
    "Patient recognizes symptoms as similar to previous cardiac event"
  ];

  // Low suspicion features
  const lowSuspicionFeatures = [
    "Well localized pain",
    "Sharp pain", 
    "Non-exertional pain",
    "No diaphoresis",
    "No nausea or vomiting",
    "Reproducible with palpation"
  ];

  // State for collapsible panels
  const [highSuspicionExpanded, setHighSuspicionExpanded] = useState(false);
  const [lowSuspicionExpanded, setLowSuspicionExpanded] = useState(false);

  // Collapsible Panel Component
  const CollapsiblePanel = ({ title, features, isExpanded, onToggle }) => {
    const visibleFeatures = isExpanded ? features : features.slice(0, 3);
    
    return (
      <div 
        onClick={onToggle}
        style={{ 
          border: `2px solid ${isExpanded ? '#7B2CBF' : '#e0e0e0'}`, 
          borderRadius: '12px', 
          marginBottom: '16px',
          overflow: 'hidden',
          backgroundColor: isExpanded ? '#f8f4ff' : '#f0ebff',
          transition: 'all 0.2s ease-in-out',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          cursor: 'pointer'
        }}
      >
        <div style={{ 
          padding: '16px 20px', 
          backgroundColor: 'transparent',
          fontSize: '1rem',
          fontWeight: '600',
          color: isExpanded ? '#7B2CBF' : '#333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease-in-out',
          userSelect: 'none'
        }}>
          <span>{title}</span>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: `2px solid ${isExpanded ? '#7B2CBF' : '#ccc'}`,
            backgroundColor: isExpanded ? '#7B2CBF' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease-in-out'
          }}>
            <span style={{
              fontSize: '0.7rem',
              color: isExpanded ? '#fff' : '#666',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease-in-out',
              fontWeight: 'bold'
            }}>
              ▼
            </span>
          </div>
        </div>
        
        <div style={{ 
          maxHeight: isExpanded ? '500px' : '180px',
          overflow: 'hidden',
          transition: 'max-height 0.4s ease-in-out'
        }}>
          {isExpanded && (
            <div style={{
              height: '1px',
              backgroundColor: '#7B2CBF',
              margin: '0 20px',
              opacity: 0.3
            }} />
          )}
          
          <div style={{ 
            padding: '16px 20px',
            paddingTop: isExpanded ? '16px' : '16px',
            paddingBottom: isExpanded ? '20px' : '20px'
          }}>
            {visibleFeatures.map((feature, index) => (
              <div key={index} style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: index === visibleFeatures.length - 1 ? 0 : '12px',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                color: '#555'
              }}>
                <span style={{ 
                  color: '#7B2CBF',
                  marginRight: '12px',
                  marginTop: '2px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  •
                </span>
                <span>{feature}</span>
              </div>
            ))}
            
            {!isExpanded && features.length > 3 && (
              <div style={{
                marginTop: '16px',
                textAlign: 'center'
              }}>
                <span style={{
                  color: '#7B2CBF',
                  fontSize: '0.75rem',
                  fontWeight: '400',
                  fontStyle: 'italic'
                }}>
                  Read More
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // determine points for each thing in heart score
  // history, ekg, age, riskfactor, trop
  // H 
  let historyPoints = 0;
  if (formData.history == "Low") {
      historyPoints = 0;
  } else if (formData.history == "Medium") {
      historyPoints = 1;
  } else if (formData.history == "High") {
      historyPoints = 2;
  }
  
  // E
  let ecgPoints = 0;
  if (formData.ecg === "Option 1: Normal ECG") {
    ecgPoints = 0;
  } else if (formData.ecg === "Option 2: Non-specific repolarization abnormalities") {
    ecgPoints = 1;
  } else if (formData.ecg === "Option 3: ST segment depressions (not due to LBBB/LVH)") {
    ecgPoints = 2;
  }

  // A
  let agePoints = 0;
  if (formData.age < 45) {
        agePoints = 0;
    } else if (formData.age >= 45 && formData.age <= 60) {
        agePoints = 1;
    } else if (formData.age > 60) {
        agePoints = 2;
  }

  // R
  let riskPoints = 0;
  if (checkedCount == 0) {
        riskPoints = 0;
    } else if (checkedCount == 1 || checkedCount == 2) {
        riskPoints = 1;
    } else if (checkedCount >= 3) {
        riskPoints = 2;
    }

  // T
  let tropPoints = 0; 
  let trop;
  if (formData.tropType === "hs") {
    tropPoints = 0; // HEAR score if hs trop used 
    trop = "N/A";
  } else { // tropType is I/T
      trop = Math.max(formData.tropZero, formData.tropThree);
      if (trop < 0.04) {
        tropPoints = 0;
    } else if (trop >= 0.04 && trop <= 0.08) {
        tropPoints = 1;
    } else if (trop >= 0.08) {
        tropPoints = 2;
    }
  }

  let heartScore = historyPoints + ecgPoints + agePoints + riskPoints + tropPoints;
  
  // Determine risk style for Heart Score card
  let riskLevel = 'moderate';
  if (heartScore < 4) riskLevel = 'low';
  else if (heartScore >= 7) riskLevel = 'high';
  const s = riskStyles[riskLevel];

  const heartScoreRef = useRef(null);
  useEffect(() => {
    if (heartScoreRef.current) {
      heartScoreRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return(
    <div className="card-container">
      <div className="card">
        <header className="card-header">
          <Link to="/" onClick={resetFormData} style={{ textDecoration: 'none' }}>
            <h1>SCiPP Chest Pain Pathway</h1>
          </Link>
        </header>

        <div ref={heartScoreRef} className="card-section">
          <SectionHeader>HEART Score Calculation</SectionHeader>

          {/* Patient Summary */}
          {(formData.age || (formData.tropType === "it" && trop && trop !== "N/A")) && (
            <div className="card-section" style={{ 
              background: '#f8f9fa', 
              borderRadius: '12px', 
              padding: '16px 20px', 
              border: '1px solid #e8e8e8'
            }}>
              <div style={{ 
                color: '#666', 
                fontSize: '0.8rem', 
                marginBottom: 12, 
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Patient Summary
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {formData.age && (
                  <div style={{ minWidth: '120px' }}>
                    <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: 4 }}>Age</div>
                    <div style={{ color: '#7B2CBF', fontWeight: 'bold', fontSize: '1.1rem' }}>{formData.age} years</div>
                  </div>
                )}
                {formData.tropType === "it" && trop && trop !== "N/A" && (
                  <div style={{ minWidth: '120px' }}>
                    <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: 4 }}>Troponin I/T</div>
                    <div style={{ color: '#7B2CBF', fontWeight: 'bold', fontSize: '1.1rem' }}>{trop} ng/mL</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <hr className="card-divider" />
        
        <div className="card-section">
          <SectionHeader>Suspicion Level from Patient History</SectionHeader>
          <div style={{ marginTop: 20 }}>
            <div className="suspicion-panels-row">
              <CollapsiblePanel 
                title="High-Suspicion Features"
                features={highSuspicionFeatures}
                isExpanded={highSuspicionExpanded}
                onToggle={() => setHighSuspicionExpanded(!highSuspicionExpanded)}
              />
              <CollapsiblePanel 
                title="Low-Suspicion Features"
                features={lowSuspicionFeatures}
                isExpanded={lowSuspicionExpanded}
                onToggle={() => setLowSuspicionExpanded(!lowSuspicionExpanded)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: '16px', marginBottom: '32px' }}>
              <div style={{ width: '100%' }}>
                <label style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: 12, display: 'block', color: '#666', textAlign: 'center' }}>
                  Select Suspicion Level
                </label>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', width: '100%' }}>
                  <div 
                    onClick={() => handleSegChange("Low")}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      border: `2px solid ${formData.history === "Low" ? '#7B2CBF' : '#e0e0e0'}`,
                      borderRadius: '12px',
                      backgroundColor: formData.history === "Low" ? '#f8f4ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: `2px solid ${formData.history === "Low" ? '#7B2CBF' : '#ccc'}`,
                      backgroundColor: formData.history === "Low" ? '#7B2CBF' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {formData.history === "Low" && (
                        <div style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: '#fff'
                        }} />
                      )}
                    </div>
                    <div>
                      <div style={{ 
                        color: formData.history === "Low" ? '#7B2CBF' : '#222',
                        fontWeight: formData.history === "Low" ? 'bold' : 'normal',
                        fontSize: '0.85rem',
                        marginBottom: '2px'
                      }}>
                        Low
                      </div>
                      <div style={{ 
                        color: '#666',
                        fontSize: '0.7rem',
                        lineHeight: '1.2'
                      }}>
                        Slightly suspicious
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleSegChange("Medium")}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      border: `2px solid ${formData.history === "Medium" ? '#7B2CBF' : '#e0e0e0'}`,
                      borderRadius: '12px',
                      backgroundColor: formData.history === "Medium" ? '#f8f4ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: `2px solid ${formData.history === "Medium" ? '#7B2CBF' : '#ccc'}`,
                      backgroundColor: formData.history === "Medium" ? '#7B2CBF' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {formData.history === "Medium" && (
                        <div style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: '#fff'
                        }} />
                      )}
                    </div>
                    <div>
                      <div style={{ 
                        color: formData.history === "Medium" ? '#7B2CBF' : '#222',
                        fontWeight: formData.history === "Medium" ? 'bold' : 'normal',
                        fontSize: '0.85rem',
                        marginBottom: '2px'
                      }}>
                        Medium
                      </div>
                      <div style={{ 
                        color: '#666',
                        fontSize: '0.7rem',
                        lineHeight: '1.2'
                      }}>
                        Moderately suspicious
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => handleSegChange("High")}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      border: `2px solid ${formData.history === "High" ? '#7B2CBF' : '#e0e0e0'}`,
                      borderRadius: '12px',
                      backgroundColor: formData.history === "High" ? '#f8f4ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: `2px solid ${formData.history === "High" ? '#7B2CBF' : '#ccc'}`,
                      backgroundColor: formData.history === "High" ? '#7B2CBF' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {formData.history === "High" && (
                        <div style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: '#fff'
                        }} />
                      )}
                    </div>
                    <div>
                      <div style={{ 
                        color: formData.history === "High" ? '#7B2CBF' : '#222',
                        fontWeight: formData.history === "High" ? 'bold' : 'normal',
                        fontSize: '0.85rem',
                        marginBottom: '2px'
                      }}>
                        High
                      </div>
                      <div style={{ 
                        color: '#666',
                        fontSize: '0.7rem',
                        lineHeight: '1.2'
                      }}>
                        Highly suspicious
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="card-divider" />

        {/* Risk Factors Section */}
        <div className="card-section">
          <SectionHeader>Risk Factors</SectionHeader>
          <div style={{ 
            marginTop: 16, 
            marginBottom: 24, 
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ 
              margin: 0,
              fontSize: '0.85rem',
              color: '#666',
              lineHeight: '1.4'
            }}>
              Select all risk factors that apply to this patient. You can select multiple options by clicking on them.
            </p>
          </div>
          <div style={{ marginTop: 20, marginBottom: 32 }}>
            {/* Only show tags for risk factors on all devices */}
            <div className="risk-tags" style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '6px',
              padding: '2px'
            }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleRisk(idx)}
                  className="card-tag"
                  style={{
                    backgroundColor: item.checked ? '#7B2CBF' : '#f0f0f0',
                    color: item.checked ? '#fff' : '#333',
                    borderColor: item.checked ? '#7B2CBF' : '#ddd',
                  }}
                >
                  <span>{item.label}</span>
                  {item.checked && (
                    <span style={{
                      fontSize: '0.65rem',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      width: '14px',
                      height: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      ×
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heart Score Result */}
        <div className="card-section" style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            background: s.bg, 
            border: `2px solid ${s.border}`,
            borderRadius: '16px', 
            padding: '24px 0',
            minHeight: '80px',
            width: '100%',
            maxWidth: '340px',
            boxShadow: s.shadow,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            transition: 'all 0.2s ease-in-out',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1, color: s.text }}>{heartScore}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 500, color: s.text, marginTop: 2 }}>HEART Score</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-section" style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleDone}
            className="card-button card-hover"
            style={{
              background: 'linear-gradient(135deg, #7B2CBF 0%, #9D4EDD 100%)',
              color: '#fff',
              boxShadow: '0 6px 20px rgba(123, 44, 191, 0.3)',
              maxWidth: '340px',
            }}
          >
            Complete HEART Score
          </button>
        </div>
      </div>
    </div>
  )
}
