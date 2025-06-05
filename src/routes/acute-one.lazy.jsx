// First acute chest pain pathway page

import { useState, useEffect, useRef } from "react";
import "../App.css"; // CSS for styling
import { useNavigate, Link } from '@tanstack/react-router';

import DropDown from "../components/DropDown.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import HeartScoreButton from "../components/HeartScoreButton.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import AnimatedField from "../components/AnimatedField.jsx";
import LowRiskButton from "../components/LowRiskButton.jsx";
import HighRiskButton from "../components/HighRiskButton.jsx";

import { troponinTests } from "../troponinTests.js";
import { useForm } from "../FormContext.jsx";
import { createLazyFileRoute } from '@tanstack/react-router'
import useIsMobile from '../hooks/useIsMobile.js';

export const Route = createLazyFileRoute("/acute-one")({
    component: AcuteOne
})

const fadeInStyle = {
    opacity: 1,
    transform: 'translateY(0)',
    transition: 'opacity 0.25s cubic-bezier(.4,0,.2,1), transform 0.25s cubic-bezier(.4,0,.2,1)'
};
const fadeOutStyle = {
    opacity: 0,
    transform: 'translateY(12px)',
    pointerEvents: 'none',
    height: 0
};

const fadeInUpStyle = {
    opacity: 1,
    transform: 'translateY(0)',
    transition: 'opacity 0.4s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1)',
    maxHeight: '1000px'
};
const fadeOutDownStyle = {
    opacity: 0,
    transform: 'translateY(16px)',
    transition: 'opacity 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1)',
    maxHeight: '0px',
    overflow: 'hidden',
    pointerEvents: 'none'
};

function AcuteOne() {
    // for all user inputs
    const { formData, setFormData, resetFormData } = useForm();
    
    // saving ranks for troponin
    const [categories, setCategories] = useState({
        tropZero: null,
        tropOne: null,
        tropThree: null
    });

    // risk state
    const [risk, setRisk] = useState(null);
    const [riskSource, setRiskSource] = useState(null);
    const heartScoreRef = useRef(null);

    // for transition animation
    const [isTransitioning, setIsTransitioning] = useState(false);

    const navigate = useNavigate();
    const isMobile = useIsMobile();

    // Required left column fields
    const leftRequiredFilled = !!formData.ecg && !!formData.age && !!formData.duration;

    // Effect to handle scrolling when heart score is calculated
    useEffect(() => {
        if (formData.heartScoreCalculated) {
            // Small delay to ensure the DOM has updated
            setTimeout(() => {
                heartScoreRef.current?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }
    }, [formData.heartScoreCalculated]);

    // handles changes to form data (numeric)
    const handleNumChange = (field) => (e) => {
        const value = e.target.value;
        // Allow decimal numbers with up to 2 decimal places for all numeric inputs
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setFormData((prev) => ({
                ...prev, [field]: value, // updating the previous value for that field
            }));

            // If duration is being changed, recalculate risk for existing troponin values
            if (field === "duration" && formData.tropZero) {
                // Reset risk first
                setRisk(null);
                setRiskSource(null);
                
                // Recalculate risk with new duration
                setTimeout(() => {
                    if (formData.tropType === "it") {
                        // For IT troponin: check if initial < 0.04 and duration > 3
                        const tropValue = parseFloat(formData.tropZero);
                        const newDuration = parseFloat(value);
                        const lowThreshold = 0.04; // IT threshold
                        
                        if (tropValue < lowThreshold && newDuration > 3) {
                            setRisk(1);
                            setRiskSource("tropZero");
                            setCategories((prev) => ({ ...prev, tropZero: 1 }));
                        } else if (tropValue < lowThreshold) {
                            // Very low but duration ≤ 3, no immediate risk
                            setCategories((prev) => ({ ...prev, tropZero: 1 }));
                        }
                    } else if (formData.tropType === "hs") {
                        // For HS troponin: check if initial < threshold and duration > 3
                        const tropValue = parseFloat(formData.tropZero);
                        const newDuration = parseFloat(value);
                        const values = troponinTests[formData.tropTest];
                        if (values) {
                            const lowThreshold = parseFloat(values[0]);
                            
                            if (tropValue < lowThreshold && newDuration > 3) {
                                setRisk(1);
                                setRiskSource("tropZero");
                                setCategories((prev) => ({ ...prev, tropZero: 1 }));
                            } else if (tropValue < lowThreshold) {
                                // Very low but duration ≤ 3, no immediate risk
                                setCategories((prev) => ({ ...prev, tropZero: 1 }));
                            }
                        }
                    }
                }, 0);
            }
        }
    };
    
    // handles to troponin levels & assigns categories 
    const handleTropChange = (field) => (e) => {
        const value = e.target.value;
        // Allow decimal numbers with up to 2 decimal places for all troponin inputs
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setFormData((prev) => ({
                ...prev, [field]: value, // updating the previous value for that field
            }));

            // Reset risk if input is empty
            if (value.trim() === '') {
                setRisk(null);
                setRiskSource(null);
                // Clear subsequent categories when a field becomes empty
                if (field === "tropZero") {
                    setCategories({
                        tropZero: null,
                        tropOne: null,
                        tropThree: null
                    });
                } else if (field === "tropOne") {
                    setCategories((prev) => ({
                        ...prev,
                        tropOne: null,
                        tropThree: null
                    }));
                } else if (field === "tropThree") {
                    setCategories((prev) => ({
                        ...prev,
                        tropThree: null
                    }));
                }
                return;
        }

        let category = null;
        if (formData.tropType === "it") {
            category = checkITTrop(field, value);
        } else if (formData.tropType === "hs") {
            category = checkTrop(field, value);
        }

        if (category !== null) {
            setCategories((prev) => ({ ...prev, [field]: category }));
            }
        }
    };

    // returns categories for hs-troponin levels
    const checkTrop = (field, trop) => {
        const values = troponinTests[formData.tropTest];
        console.log('Checking trop:', { field, trop, values, formData });

        const tropValue = parseFloat(trop);

        // determine which column in the values to use
        // TIME ZERO TROP
        if (field === "tropZero") {
            const lowThreshold = parseFloat(values[0]);
            const highThreshold = parseFloat(values[3]);

            if (tropValue < lowThreshold) {
                if (parseFloat(formData.duration) > 3) {
                    console.log('Setting risk 1 for tropZero');
                    setRisk(1);
                    setRiskSource("tropZero");
                    return 1;
                }
                return 1; // very low
            } else if (tropValue >= lowThreshold && tropValue < highThreshold) {
                console.log('Setting risk null for tropZero intermediate');
                setRisk(null);
                setRiskSource(null);
                return 2; // intermediate
            } else if (tropValue >= highThreshold) {
                console.log('Setting risk 3 for tropZero');
                setRisk(3);
                setRiskSource("tropZero");
                return 3;
            }
        // ONE HOUR TROP delta
        } else if (field === "tropOne" ) {
            const tropValue = parseFloat(trop);
            const initialValue = parseFloat(formData.tropZero);
            const delta = tropValue - initialValue;
            const deltaThreshold = parseFloat(values[2]);
            const highDeltaThreshold = parseFloat(values[4]);

            console.log('=== ONE HOUR CALCULATION DEBUG ===');
            console.log('tropValue:', tropValue);
            console.log('initialValue (formData.tropZero):', initialValue);
            console.log('delta:', delta);
            console.log('deltaThreshold:', deltaThreshold);
            console.log('highDeltaThreshold:', highDeltaThreshold);
            console.log('values array:', values);

            // Calculate what the initial category would be using current values
            const lowThreshold = parseFloat(values[0]);
            const highThreshold = parseFloat(values[3]);
            let initialCategory = null;
            if (initialValue < lowThreshold) {
                initialCategory = 1;
            } else if (initialValue >= lowThreshold && initialValue < highThreshold) {
                initialCategory = 2;
            } else if (initialValue >= highThreshold) {
                initialCategory = 3;
            }

            console.log('Initial category calculated:', initialCategory);
            console.log('Delta < deltaThreshold?', delta < deltaThreshold);

            if (delta < deltaThreshold) {
                if (initialCategory === 1) {
                    console.log('TRIGGERING LOW RISK for tropOne');
                    setRisk(1);
                    setRiskSource("tropOne");
                    return 1;
                }
                console.log('Returning category 2 (intermediate) for tropOne');
                setRisk(null);
                setRiskSource(null);
                return 2;
            } else if (delta >= highDeltaThreshold) {
                console.log('TRIGGERING HIGH RISK for tropOne - delta exceeded threshold');
                setRisk(3);
                setRiskSource("tropOne");
                return 3;
            }
            // Return intermediate for deltas between thresholds
            console.log('Returning category 2 (intermediate) for tropOne - delta between thresholds');
            setRisk(null);
            setRiskSource(null);
            return 2;
        // THREE HOUR TROP delta
        } else if (field === "tropThree") {
            const tropValue = parseFloat(trop);
            const initialValue = parseFloat(formData.tropZero);
            const delta = tropValue - initialValue;
            const deltaThreshold = parseFloat(values[2]);
            const highDeltaThreshold = parseFloat(values[4]);
            const highThreshold = parseFloat(values[3]);

            // Calculate what the initial category would be using current values
            const lowThreshold = parseFloat(values[0]);
            let initialCategory = null;
            if (initialValue < lowThreshold) {
                initialCategory = 1;
            } else if (initialValue >= lowThreshold && initialValue < highThreshold) {
                initialCategory = 2;
            } else if (initialValue >= highThreshold) {
                initialCategory = 3;
            }

            if (delta < deltaThreshold) {
                if (initialCategory === 1) {
                    console.log('Setting risk 1 for tropThree');
                    setRisk(1);
                    setRiskSource("tropThree");
                    return 1;
                }
                setRisk(null);
                setRiskSource(null);
                return 3;
            } else if (delta >= highDeltaThreshold || tropValue >= highThreshold) {
                console.log('Setting risk 3 for tropThree');
                setRisk(3);
                setRiskSource("tropThree");
                return 3;
            }
            // Return category 3 for intermediate deltas to trigger HEART Score
            console.log('Setting category 3 for tropThree intermediate case');
            setRisk(null);
            setRiskSource(null);
            return 3;
        }
    };

    // returns categories for IT-troponin levels
    const checkITTrop = (field, trop) => {
        const values = troponinTests["IT"];
        const tropValue = parseFloat(trop);
        
        const lowThreshold = parseFloat(values[0]);
        const highThreshold = parseFloat(values[3]);

        if (tropValue < lowThreshold) {
            if (field === "tropZero" && parseFloat(formData.duration) > 3) {
                setRisk(1);
                setRiskSource(field);
                return 1;
            } else if (field === "tropThree") {
                // If 3-hour troponin is very low, set low risk
                setRisk(1);
                setRiskSource(field);
                return 1;
            }
            return 1; // very low
        } else if (tropValue >= lowThreshold && tropValue <= highThreshold) {
            setRisk(null);
            setRiskSource(null);
            return 2; // intermediate
        } else if (tropValue > highThreshold) {
            setRisk(3);
            setRiskSource(field);
            return 3;
        }
    }

    // handles ecg selection
    const handleEcgChange = (e) => {
        const value = e.target.value;
        
        if (value === "Option 4: STEMI") {
            setIsTransitioning(true);
            setTimeout(() => {
                setFormData((prev) => ({
                    ...prev,
                    ecg: value,
                    age: "",
                    duration: "",
                    tropTest: "",
                    tropZero: "",
                    tropType: "",
                    tropOne: "",
                    tropThree: ""
                }));
                setCategories({
                    tropZero: null,
                    tropOne: null,
                    tropThree: null
                });
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 300);
            }, 300);
        } else {
            setFormData((prev) => ({...prev, ecg: value,}));
        }
    }

    // handles other non-numeric inputs
    const handleChange = (field) => (e) => {
        const value = e.target.value;
        
        // If changing troponin type, reset all troponin-related data with smooth transition
        if (field === "tropType") {
            // Reset all states immediately for smooth transitions
            setRisk(null);
            setRiskSource(null);
            setCategories({
                tropZero: null,
                tropOne: null,
                tropThree: null
            });
            
            setFormData((prev) => ({ 
                ...prev, 
                [field]: value,
                tropTest: "", // Reset to empty to show placeholder
                tropZero: "",
                tropOne: "",
                tropThree: ""
            }));
        } else if (field === "tropTest") {
            // If changing assay, update it and recalculate risk for existing troponin values
            setFormData((prev) => ({ ...prev, [field]: value }));
            
            // Reset risk and categories first
            setRisk(null);
            setRiskSource(null);
            setCategories({
                tropZero: null,
                tropOne: null,
                tropThree: null
            });
            
            // Recalculate risk for existing troponin values with new assay
            setTimeout(() => {
                // Create a helper function that uses the new assay value
                const checkTropWithNewAssay = (field, tropValue) => {
                    const values = troponinTests[value]; // Use the new assay value
                    console.log('Checking trop with new assay:', { field, tropValue, values, newAssay: value });

                    const parsedTropValue = parseFloat(tropValue);

                    // determine which column in the values to use
                    // TIME ZERO TROP
                    if (field === "tropZero") {
                        const lowThreshold = parseFloat(values[0]);
                        const highThreshold = parseFloat(values[3]);

                        if (parsedTropValue < lowThreshold) {
                            if (parseFloat(formData.duration) > 3) {
                                console.log('Setting risk 1 for tropZero with new assay');
                                setRisk(1);
                                setRiskSource("tropZero");
                                return 1;
                            }
                            return 1; // very low
                        } else if (parsedTropValue >= lowThreshold && parsedTropValue < highThreshold) {
                            console.log('Setting risk null for tropZero intermediate with new assay');
                            setRisk(null);
                            setRiskSource(null);
                            return 2; // intermediate
                        } else if (parsedTropValue >= highThreshold) {
                            console.log('Setting risk 3 for tropZero with new assay');
                            setRisk(3);
                            setRiskSource("tropZero");
                            return 3;
                        }
                    }
                    // TIME ONE TROP
                    else if (field === "tropOne") {
                        const lowThreshold = parseFloat(values[1]);
                        const highThreshold = parseFloat(values[4]);
                        const deltaThreshold = parseFloat(values[6]);

                        if (parsedTropValue < lowThreshold) {
                            // Check delta
                            const tropZeroValue = parseFloat(formData.tropZero);
                            const delta = parsedTropValue - tropZeroValue;
                            if (delta < deltaThreshold) {
                                console.log('Setting risk 1 for tropOne delta with new assay');
                                setRisk(1);
                                setRiskSource(null);
                                return 1;
                            } else {
                                console.log('Setting risk null for tropOne with new assay');
                                setRisk(null);
                                setRiskSource(null);
                                return 2;
                            }
                        } else if (parsedTropValue >= lowThreshold && parsedTropValue < highThreshold) {
                            console.log('Setting risk null for tropOne intermediate with new assay');
                            setRisk(null);
                            setRiskSource(null);
                            return 2; // intermediate
                        } else if (parsedTropValue >= highThreshold) {
                            console.log('Setting risk 3 for tropOne with new assay');
                            setRisk(3);
                            setRiskSource("tropOne");
                            return 3;
                        }
                    }
                    // TIME THREE TROP
                    else if (field === "tropThree") {
                        const lowThreshold = parseFloat(values[2]);
                        const highThreshold = parseFloat(values[5]);

                        if (parsedTropValue < lowThreshold) {
                            console.log('Setting risk 1 for tropThree with new assay');
                            setRisk(1);
                            setRiskSource("tropThree");
                            return 1;
                        } else if (parsedTropValue >= lowThreshold && parsedTropValue < highThreshold) {
                            console.log('Setting risk null for tropThree intermediate with new assay');
                            setRisk(null);
                            setRiskSource(null);
                            return 2; // intermediate
                        } else if (parsedTropValue >= highThreshold) {
                            console.log('Setting risk 3 for tropThree with new assay');
                            setRisk(3);
                            setRiskSource("tropThree");
                            return 3;
                        }
                    }

                    return null;
                };

                if (formData.tropZero) {
                    const category = checkTropWithNewAssay("tropZero", formData.tropZero);
                    if (category !== null) {
                        setCategories((prev) => ({ ...prev, tropZero: category }));
                    }
                }
                if (formData.tropOne) {
                    const category = checkTropWithNewAssay("tropOne", formData.tropOne);
                    if (category !== null) {
                        setCategories((prev) => ({ ...prev, tropOne: category }));
                    }
                }
                if (formData.tropThree) {
                    const category = checkTropWithNewAssay("tropThree", formData.tropThree);
                    if (category !== null) {
                        setCategories((prev) => ({ ...prev, tropThree: category }));
                    }
                }
            }, 0);
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    // --- Dynamic HEART Score Calculation ---
    function calculateHeartScore(formData) {
        // H
        let historyPoints = 0;
        if (formData.history === "Low") historyPoints = 0;
        else if (formData.history === "Medium") historyPoints = 1;
        else if (formData.history === "High") historyPoints = 2;

        // E
        let ecgPoints = 0;
        if (formData.ecg === "Option 1: Normal ECG") ecgPoints = 0;
        else if (formData.ecg === "Option 2: Non-specific repolarization abnormalities") ecgPoints = 1;
        else if (formData.ecg === "Option 3: ST segment depressions (not due to LBBB/LVH)") ecgPoints = 2;

        // A
        let agePoints = 0;
        const age = parseInt(formData.age);
        if (!isNaN(age)) {
            if (age < 45) agePoints = 0;
            else if (age >= 45 && age <= 60) agePoints = 1;
            else if (age > 60) agePoints = 2;
        }

        // R
        let riskPoints = 0;
        const checkedCount = formData.riskFactors?.length || 0;
        if (checkedCount === 0) riskPoints = 0;
        else if (checkedCount === 1 || checkedCount === 2) riskPoints = 1;
        else if (checkedCount >= 3) riskPoints = 2;

        // T
        let tropPoints = 0;
        let trop;
        if (formData.tropType === "hs") {
            tropPoints = 0; // HEAR score if hs trop used
            trop = "N/A";
        } else {
            trop = Math.max(parseFloat(formData.tropZero) || 0, parseFloat(formData.tropThree) || 0);
            if (trop < 0.04) tropPoints = 0;
            else if (trop >= 0.04 && trop <= 0.08) tropPoints = 1;
            else if (trop > 0.08) tropPoints = 2;
        }

        return historyPoints + ecgPoints + agePoints + riskPoints + tropPoints;
    }

    const heartScore = calculateHeartScore(formData);
    let onHeartScoreAction = undefined;
    if (heartScore >= 4 && heartScore < 7) {
        onHeartScoreAction = () => navigate({ to: '/alt-test' });
    }

    return (
        <div className="card-container">
            <div className="card">
                <header className="card-header">
                    <Link to="/" onClick={resetFormData} style={{ textDecoration: 'none' }}>
                        <h1>SCiPP Chest Pain Pathway</h1>
                    </Link>
                </header>
                {formData.ecg === "Option 4: STEMI" ? (
                  <>
                    <div className="card-content-grid">
                      <div className="left-col" style={{ width: '100%' }}>
                        <SectionHeader>ECG</SectionHeader>
                        <div style={{ marginBottom: 24, marginTop: 20 }}>
                          <DropDown 
                              value={formData.ecg} onChange={handleEcgChange}
                              itemone="Option 1: Normal ECG"
                              itemtwo="Option 2: Non-specific repolarization abnormalities"
                              itemthree="Option 3: ST segment depressions (not due to LBBB/LVH)"
                              itemfour="Option 4: STEMI"
                              label={<span style={{ color: '#222' }}>Select ECG Result</span>}
                              placeholder="Select ECG Result"
                              style={{ width: '100%', color: '#111' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="stemi-btn-row">
                      <Button
                        image="warning"
                        text="Use Institution Specific STEMI Protocol"
                        style={{ 
                          backgroundColor: "#ff0000", 
                          color: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          cursor: "pointer",
                          width: '100%',
                          minHeight: '56px',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          transition: "all 0.2s ease-in-out",
                          animation: "pulse 0.7s infinite",
                          boxShadow: "0 2px 12px rgba(255, 0, 0, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px"
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="card-content-grid">
                      <div className="left-col">
                        {/* ECG Section */}
                        <SectionHeader>ECG</SectionHeader>
                        <div style={{ marginBottom: 24, marginTop: 20 }}>
                            <DropDown 
                                value={formData.ecg} onChange={handleEcgChange}
                                itemone="Option 1: Normal ECG"
                                itemtwo="Option 2: Non-specific repolarization abnormalities"
                                itemthree="Option 3: ST segment depressions (not due to LBBB/LVH)"
                                itemfour="Option 4: STEMI"
                                label={<span style={{ color: '#222' }}>Select ECG Result</span>}
                                placeholder="Select ECG Result"
                                style={{ width: '100%', color: '#111' }}
                            />
                        </div>
                        {formData.ecg === "Option 4: STEMI" ? (
                            <div style={{ width: '100%', marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    image="warning"
                                    text="Use Institution Specific STEMI Protocol"
                                    style={{ 
                                        backgroundColor: "#ff0000", 
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        width: '100%',
                                        minHeight: '48px',
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        opacity: isTransitioning ? 0 : 1,
                                        transition: "all 0.2s ease-in-out",
                                        animation: "pulse 0.7s infinite",
                                        boxShadow: "0 2px 12px rgba(255, 0, 0, 0.15)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px"
                                    }}
                                />
                            </div>
                        ) : (
                            <>
                                <hr style={{ border: 0, borderTop: '1.5px solid #e0e0e0', margin: '40px 0' }} />
                                {/* Patient Info Section */}
                                <SectionHeader>Patient Info</SectionHeader>
                                <div style={{ marginBottom: 32, marginTop: 20 }}>
                                    <Input
                                        value={formData.age}
                                        onChange={handleNumChange("age")}
                                        label={<span style={{ color: '#222' }}>Patient Age (years)</span>}
                                    />
                                </div>
                                <div style={{ marginBottom: 32 }}>
                                    <Input
                                        value={formData.duration}
                                        onChange={handleNumChange("duration")}
                                        label={<span style={{ color: '#222' }}>Chest Pain Duration (hours)</span>}
                                    />
                                </div>
                            </>
                        )}
                      </div>
                      <div className="right-col" style={{ position: 'relative' }}>
                        {/* Horizontal divider for mobile only, before Troponin Testing header */}
                        {isMobile && <div className="horizontal-divider" aria-hidden="true"></div>}
                        {/* Overlay if left column not filled */}
                        {!leftRequiredFilled && (
                          <div className="right-col-overlay">
                            <div className="right-col-overlay-message">
                              {isMobile
                                ? <>Please complete the above sections first.<br />(ECG, Age, and Chest Pain Duration)</>
                                : <>Please complete the left column first.<br />(ECG, Age, and Chest Pain Duration)</>
                              }
                            </div>
                          </div>
                        )}
                        <div className={leftRequiredFilled ? '' : 'right-col-disabled'}>
                          {/* Troponin Testing Section */}
                          <SectionHeader>Troponin Testing</SectionHeader>
                          {formData.ecg !== "Option 4: STEMI" && (
                              <>
                                  <div className="mcq-container" style={{ marginBottom: 32 }}>
                                      <label style={{ fontWeight: 500, fontSize: '1rem', marginBottom: 16, display: 'block', color: '#222', paddingLeft: 0 }}>Troponin Test Type</label>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                                          <div 
                                              onClick={() => !formData.duration ? null : handleChange("tropType")({ target: { value: "hs" } })}
                                              style={{
                                                  padding: '16px 20px',
                                                  border: `2px solid ${formData.tropType === "hs" ? '#7B2CBF' : '#e0e0e0'}`,
                                                  borderRadius: '12px',
                                                  backgroundColor: formData.tropType === "hs" ? '#f8f4ff' : '#fff',
                                                  cursor: !formData.duration ? 'not-allowed' : 'pointer',
                                                  opacity: !formData.duration ? 0.5 : 1,
                                                  transition: 'all 0.2s ease-in-out',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '12px'
                                              }}
                                          >
                                              <div style={{
                                                  width: '20px',
                                                  height: '20px',
                                                  borderRadius: '50%',
                                                  border: `2px solid ${formData.tropType === "hs" ? '#7B2CBF' : '#ccc'}`,
                                                  backgroundColor: formData.tropType === "hs" ? '#7B2CBF' : '#fff',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  flexShrink: 0
                                              }}>
                                                  {formData.tropType === "hs" && (
                                                      <div style={{
                                                          width: '8px',
                                                          height: '8px',
                                                          borderRadius: '50%',
                                                          backgroundColor: '#fff'
                                                      }} />
                                                  )}
                                              </div>
                                              <span style={{ 
                                                  color: formData.tropType === "hs" ? '#7B2CBF' : '#222',
                                                  fontWeight: formData.tropType === "hs" ? 'bold' : 'normal',
                                                  fontSize: '1rem'
                                              }}>
                                                  HS-Troponin (ng/L)
                                              </span>
                                          </div>
                                          <div 
                                              onClick={() => !formData.duration ? null : handleChange("tropType")({ target: { value: "it" } })}
                                              style={{
                                                  padding: '16px 20px',
                                                  border: `2px solid ${formData.tropType === "it" ? '#7B2CBF' : '#e0e0e0'}`,
                                                  borderRadius: '12px',
                                                  backgroundColor: formData.tropType === "it" ? '#f8f4ff' : '#fff',
                                                  cursor: !formData.duration ? 'not-allowed' : 'pointer',
                                                  opacity: !formData.duration ? 0.5 : 1,
                                                  transition: 'all 0.2s ease-in-out',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '12px'
                                              }}
                                          >
                                              <div style={{
                                                  width: '20px',
                                                  height: '20px',
                                                  borderRadius: '50%',
                                                  border: `2px solid ${formData.tropType === "it" ? '#7B2CBF' : '#ccc'}`,
                                                  backgroundColor: formData.tropType === "it" ? '#7B2CBF' : '#fff',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  flexShrink: 0
                                              }}>
                                                  {formData.tropType === "it" && (
                                                      <div style={{
                                                          width: '8px',
                                                          height: '8px',
                                                          borderRadius: '50%',
                                                          backgroundColor: '#fff'
                                                      }} />
                                                  )}
                                              </div>
                                              <span style={{ 
                                                  color: formData.tropType === "it" ? '#7B2CBF' : '#222',
                                                  fontWeight: formData.tropType === "it" ? 'bold' : 'normal',
                                                  fontSize: '1rem'
                                              }}>
                                                  Troponin I/T (ng/mL)
                                              </span>
                                          </div>
                                      </div>
                                      {/* Prompt inside MCQ container */}
                                      <div style={(!formData.tropType && !formData.heartScoreCalculated && !risk) ? { ...fadeInStyle, marginTop: 12 } : fadeOutStyle}>
                                          <div style={{ color: '#888', fontSize: '0.97rem', display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
                                              <span style={{ fontSize: '1.2em', opacity: 0.7, marginRight: 6 }}>▼</span>
                                              Select a Troponin test type to continue…
                                          </div>
                                      </div>
                                  </div>
                                  {/* The rest of the Troponin Testing logic and fields remain in the right column */}
                                  <div style={formData.tropType === "hs" ? fadeInUpStyle : fadeOutDownStyle}>
                                      <div style={{ marginBottom: 32, width: '100%' }}>
                                          <DropDown 
                                              value={formData.tropTest} onChange={handleChange("tropTest")}
                                              itemone="BeckmanCoulter"
                                              itemtwo="Roche"
                                              itemthree="Abbott"
                                              itemfour="Siemens"
                                              label={<span style={{ color: '#222' }}>Select Troponin Assay</span>}
                                              style={{ color: '#222', width: '100%' }}
                                          />
                                          <div style={(formData.tropType === 'hs' && !formData.tropTest && !formData.heartScoreCalculated && !risk) ? fadeInStyle : fadeOutStyle}>
                                              <div style={{ color: '#888', fontSize: '0.97rem', marginTop: 8, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
                                                  <span style={{ fontSize: '1.2em', opacity: 0.7, marginRight: 6 }}>▼</span>
                                                  Select a Troponin assay to continue…
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                                  {/* Initial Troponin Level */}
                                  <div style={((formData.tropType === "hs" && formData.tropTest) || formData.tropType === "it") ? fadeInUpStyle : fadeOutDownStyle}>
                                      <div style={{ marginBottom: 32, width: '100%' }}>
                                          <Input
                                              value={formData.tropZero}
                                              onChange={handleTropChange("tropZero")}
                                              disabled={!formData.tropType}
                                              label={<span style={{ color: '#222' }}>Initial Troponin Level ({formData.tropType === "hs" ? "ng/L" : "ng/mL"})</span>}
                                          />
                                          <div style={formData.tropType && (formData.tropType !== 'hs' || formData.tropTest) && !formData.tropZero && !formData.heartScoreCalculated && !risk ? fadeInStyle : fadeOutStyle}>
                                              <div style={{ color: '#888', fontSize: '0.97rem', marginTop: 2, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
                                                  <span style={{ fontSize: '1.2em', opacity: 0.7, marginRight: 6 }}>▼</span>
                                                  Enter a value above to continue Troponin testing…
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                                  {/* ...rest of the Troponin/Heart Score logic remains in the right column... */}
                                  {formData.tropZero && (categories.tropZero === 1 || categories.tropZero === 2 || formData.heartScoreCalculated) && (
                                      <>
                                          {formData.tropType === "hs" && !(risk && riskSource === "tropZero") ? (
                                              <AnimatedField>
                                                  <div style={{ marginBottom: 32, width: '100%' }}>
                                                      <Input
                                                          value={formData.tropOne}
                                                          onChange={handleTropChange("tropOne")}
                                                          label={<span style={{ color: '#222' }}>Troponin at 1 Hour (ng/L)</span>}
                                                      />
                                                      {/* Indicator for Troponin at 3 Hours (HS) */}
                                                      {!formData.tropOne && !formData.heartScoreCalculated && !risk && (
                                                          <div style={fadeInStyle}>
                                                              <div style={{ color: '#888', fontSize: '0.97rem', marginTop: 2, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
                                                                  <span style={{ fontSize: '1.2em', opacity: 0.7, marginRight: 6 }}>▼</span>
                                                                  Enter a value above to continue Troponin testing…
                                                              </div>
                                                          </div>
                                                      )}
                                                  </div>
                                              </AnimatedField>
                                          ) : formData.tropType === "it" && (!risk || riskSource === "tropThree") && !(risk && riskSource === "tropZero") ? (
                                              <AnimatedField>
                                                  <div style={{ marginBottom: 32, width: '100%' }}>
                                                      <Input
                                                          value={formData.tropThree}
                                                          onChange={handleTropChange("tropThree")}
                                                          label={<span style={{ color: '#222' }}>Troponin at 3 Hours (ng/mL)</span>}
                                                      />
                                                      {/* Indicator for Heart Score (IT) */}
                                                      {!formData.tropThree && !formData.heartScoreCalculated && !risk && (
                                                          <div style={fadeInStyle}>
                                                              <div style={{ color: '#888', fontSize: '0.97rem', marginTop: 2, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
                                                                  <span style={{ fontSize: '1.2em', opacity: 0.7, marginRight: 6 }}>▼</span>
                                                                  Enter a value above to continue Troponin testing…
                                                              </div>
                                                          </div>
                                                      )}
                                                  </div>
                                              </AnimatedField>
                                          ) : null }
                                          {formData.tropType === "hs" && formData.tropOne && !(risk && (riskSource === "tropZero" || riskSource === "tropOne")) && (categories.tropOne === 2 || formData.heartScoreCalculated) ? (
                                              <AnimatedField>
                                                  <div style={{ marginBottom: 0, width: '100%' }}>
                                                      <Input
                                                          value={formData.tropThree}
                                                          onChange={handleTropChange("tropThree")}
                                                          label={<span style={{ color: '#222' }}>Troponin at 3 Hours (ng/L)</span>}
                                                      />
                                                      {/* Indicator for Heart Score (HS) */}
                                                      {!formData.tropThree && !formData.heartScoreCalculated && !risk && (
                                                          <div style={fadeInStyle}>
                                                              <div style={{ color: '#888', fontSize: '0.97rem', marginTop: 2, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
                                                                  <span style={{ fontSize: '1.2em', opacity: 0.7, marginRight: 6 }}>▼</span>
                                                                  Continue to HEART Score…
                                                              </div>
                                                          </div>
                                                      )}
                                                      {formData.tropThree && (categories.tropThree === 3 || formData.heartScoreCalculated) && risk === null && null}
                                                  </div>
                                              </AnimatedField>
                                          ) : formData.tropType === "it" && formData.tropThree && (categories.tropThree === 2 || formData.heartScoreCalculated) && !risk && null}
                                      </>
                                  )}
                              </>
                          )}
                          {/* Place the action button here on mobile */}
                          {isMobile && (
                            risk === 1 && (riskSource === "tropZero" || riskSource === "tropOne" || riskSource === "tropThree") ? (
                              <div style={{ width: '100%', marginTop: 32 }}>
                                <LowRiskButton style={{ width: '100%' }} />
                              </div>
                            ) : risk === 3 && (riskSource === "tropZero" || riskSource === "tropOne" || riskSource === "tropThree") ? (
                              <div style={{ width: '100%', marginTop: 32 }}>
                                <HighRiskButton style={{ width: '100%' }} />
                              </div>
                            ) : ( (formData.tropThree && (categories.tropThree === 3 || formData.heartScoreCalculated) && risk === null) ||
                                (formData.tropType === "it" && formData.tropThree && (categories.tropThree === 2 || formData.heartScoreCalculated) && !risk)
                              ) ? (
                              <div style={{ width: '100%', marginTop: 32 }}>
                                <HeartScoreButton 
                                    heartScore={heartScore}
                                    heartScoreCalculated={formData.heartScoreCalculated}
                                    heartScoreRef={heartScoreRef}
                                    onAction={onHeartScoreAction}
                                    style={{ width: '100%' }}
                                />
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>
                    {/* On desktop, keep the button centered at the bottom of the card */}
                    {!isMobile && (
                      risk === 1 && (riskSource === "tropZero" || riskSource === "tropOne" || riskSource === "tropThree") ? (
                        <div className="bottom-action-btn-container">
                          <LowRiskButton style={{ width: '100%' }} />
                        </div>
                      ) : risk === 3 && (riskSource === "tropZero" || riskSource === "tropOne" || riskSource === "tropThree") ? (
                        <div className="bottom-action-btn-container">
                          <HighRiskButton style={{ width: '100%' }} />
                        </div>
                      ) : ( (formData.tropThree && (categories.tropThree === 3 || formData.heartScoreCalculated) && risk === null) ||
                            (formData.tropType === "it" && formData.tropThree && (categories.tropThree === 2 || formData.heartScoreCalculated) && !risk)
                        ) ? (
                        <div className="bottom-action-btn-container">
                          <HeartScoreButton 
                              heartScore={heartScore}
                              heartScoreCalculated={formData.heartScoreCalculated}
                              heartScoreRef={heartScoreRef}
                              onAction={onHeartScoreAction}
                              style={{ width: '100%' }}
                          />
                        </div>
                      ) : null
                    )}
                  </>
                )}
            </div>
        </div>
    )
}

const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
        }
    }
`;
document.head.appendChild(style);