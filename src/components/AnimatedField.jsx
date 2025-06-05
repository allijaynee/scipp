import { useState, useEffect } from 'react';
import { useForm } from '../FormContext.jsx';

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

const AnimatedField = ({ children }) => {
    const [show, setShow] = useState(false);
    const { formData } = useForm();

    useEffect(() => {
        if (formData.heartScoreCalculated) {
            setShow(true);
        } else {
            setTimeout(() => setShow(true), 10);
        }
    }, [formData.heartScoreCalculated]);

    return (
        <div style={show ? fadeInStyle : fadeOutStyle}>
            {children}
        </div>
    );
};

export default AnimatedField; 