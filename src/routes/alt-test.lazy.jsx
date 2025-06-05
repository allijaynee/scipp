// Alternative testing page
import { useEffect, useRef } from "react";
import "../App.css";

import Checkbox from "../components/Checkbox.jsx";

import { useForm } from "../FormContext.jsx";
import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router'
import useIsMobile from '../hooks/useIsMobile.js';

export const Route = createLazyFileRoute('/alt-test')({
  component: AltTesting,
})

function AltTesting() {
    const { formData, setFormData, resetFormData } = useForm();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const crit = formData.stressTestCriteria;
    const handleCrit = (idx) => {
        const updated = crit.map((item, i) =>
            i === idx ? { ...item, checked: !item.checked } : item
        );
        setFormData(prev => ({ ...prev, stressTestCriteria: updated }));
    };

    const allTests = [
        { name: 'Coronary CT Angiography (CCTA)', type: 'imaging' },
        { name: 'Treadmill Echocardiogram', type: 'treadmill' },
        { name: 'Dobutamine Stress Echocardiogram', type: 'dobutamine' },
        { name: 'Treadmill Nuclear Perfusion (SPECT)', type: 'treadmill' },
        { name: 'Vasodilator Nuclear Perfusion (SPECT)', type: 'vasodilator' },
        { name: 'Dobutamine Nuclear Perfusion (SPECT)', type: 'dobutamine' },
        { name: 'Vasodilator Nuclear Perfusion (PET)', type: 'vasodilator' },
        { name: 'Vasodilator Stress MRI', type: 'vasodilator' },
        { name: 'Cardiology Consultation', type: 'consultation' }
    ];

    const isTestAvailable = (test) => {
        const cad = crit.find(c => c.key === "cad")?.checked;
        const irreg = crit.find(c => c.key === "irreg")?.checked;
        const iodinatedAllergy = crit.find(c => c.key === "iodinatedAllergy")?.checked;
        const noHold = crit.find(c => c.key === "noHold")?.checked;
        const cannotWalk = crit.find(c => c.key === "cannotWalk")?.checked;
        const leftBlock = crit.find(c => c.key === "leftBlock")?.checked;
        const severeDisease = crit.find(c => c.key === "severeDisease")?.checked;
        const block = crit.find(c => c.key === "block")?.checked;

        if (formData.age > 80 && test.type === 'imaging') return false;
        if (cad && test.type === 'imaging') return false;
        if (irreg && (test.type === 'imaging' || !(test.name.includes('SPECT') || 
        test.name.includes('PET') || test.type ==='consultation'))) return false;
        if (iodinatedAllergy && test.type === 'imaging') return false;
        if (noHold && (test.type === 'imaging')) return false;
        if (cannotWalk && test.type === 'treadmill') return false;
        if (leftBlock && test.name === 'Treadmill Nuclear Perfusion (SPECT)') return false;
        if (severeDisease && test.type === 'vasodilator') return false;
        if (block && test.type === 'vasodilator') return false;
        return true;
    };

    // Update recommended tests whenever criteria change
    useEffect(() => {
        const recommended = allTests.filter(test => isTestAvailable(test));
        setFormData(prev => ({ ...prev, recommendedStressTests: recommended }));
    }, [crit, formData.age]);

    const criteriaRef = useRef(null);
    useEffect(() => {
        if (criteriaRef.current) {
            criteriaRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    return (
        <div className="card-container">
            <div className="card">
                <header className="card-header">
                    <Link to="/" onClick={resetFormData} style={{ textDecoration: 'none' }}>
                        <h1>SCiPP Chest Pain Pathway</h1>
                    </Link>
                </header>
                <div ref={criteriaRef} className="card-section">
                    <div className="stress-test-row">
                        <div className="criteria-col panel">
                            <div className="panel-header">Stress Test Criteria</div>
                            <div className="panel-subtitle">Select all that apply to the patient</div>
                            <div style={{ marginBottom: 0, overflow: 'visible', minHeight: '1px', display: 'block' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minHeight: '1px' }}>
                                    {crit.map((item, idx) => (
                                        <Checkbox
                                            key={item.key}
                                            label={item.label}
                                            checked={item.checked}
                                            onChange={() => handleCrit(idx)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        {!isMobile && (
                          <div className="arrow-col">
                              <span className="animated-arrow" aria-hidden="true">→</span>
                          </div>
                        )}
                        <div className="suggested-col panel">
                            <div className="panel-header">Stress Tests Suggested</div>
                            <div className="panel-subtitle">Based on selected criteria</div>
                            <div style={{ marginBottom: 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                    {allTests.map((test) => (
                                        <div
                                            key={test.name}
                                            className={`card-hover${!isTestAvailable(test) ? ' card-disabled' : ''}`}
                                            aria-disabled={!isTestAvailable(test)}
                                        >
                                            {test.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-section">
                    <button
                        className="card-button card-hover"
                        style={{
                            background: '#1976d2',
                            color: '#fff',
                            boxShadow: '0 2px 12px rgba(25, 118, 210, 0.15)',
                            animation: 'heartPulse 1.5s infinite',
                        }}
                        onClick={() => navigate({ to: '/clinical-notes' })}
                    >
                        <span style={{ fontSize: '1.3em', marginRight: 6 }}>✓</span>
                        Complete Pathway
                    </button>
                </div>
            </div>
        </div>
    );
}
