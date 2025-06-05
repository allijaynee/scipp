// for accessing the form across different pages

import { createContext, useContext, useState } from 'react';

// define stress test criteria item
interface StressTestCriteriaItem {
    key: string;
    label: string;
    checked: boolean;
}

// define the structure of form data 
interface FormData {
    ecg: string;
    age: string;
    duration: string;
    tropTest: string;
    tropZero: string;
    tropType: string;
    tropOne: string;
    tropThree: string;
    history: string;
    heartScoreCalculated: boolean;
    heartScore: number | null;
    riskFactors: string[];
    stressTestCriteria: StressTestCriteriaItem[];
}

// define the context type
interface FormContextType {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    resetFormData: () => void;
}

// define props for for FormProvider
interface FormProviderProps {
    children: React.ReactNode;
}

// create context
const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: FormProviderProps) => {
    const initialState: FormData = {
        ecg: "",
        age: "",
        duration: "",
        tropTest: "",
        tropZero: "",
        tropType: "",
        tropOne: "",
        tropThree: "",
        history: "",
        heartScoreCalculated: false,
        heartScore: null,
        riskFactors: [],
        stressTestCriteria: [
            { key: "cad", label: "Known obstructive coronary artery disease (>50% stenosis) or prior coronary revascularization", checked: false },
            { key: "irreg", label: "Frequent ectopy/irregular heart rate or atrial fibrillation", checked: false },
            { key: "iodinatedAllergy", label: "Iodinated contrast allergy", checked: false },
            { key: "noHold", label: "Can't hold breath for 10 seconds", checked: false },
            { key: "cannotWalk", label: "Cannot walk on a treadmill to peak stress", checked: false },
            { key: "leftBlock", label: "Left bundle branch block", checked: false },
            { key: "severeDisease", label: "Severe reactive airway disease with wheezing on examination", checked: false },
            { key: "block", label: "Advanced heart block", checked: false },
        ]
    };
    
    const [formData, setFormData] = useState(initialState);
    const resetFormData = () => setFormData(initialState);

    return (
        <FormContext.Provider value={{ formData, setFormData, resetFormData }}>
            {children}
        </FormContext.Provider>
    );
};

// custom hook useForm for accessing the form context
export const useForm = (): FormContextType => {
    const context = useContext(FormContext);
    if (context === undefined) {
        throw new Error('useForm must be used within a FormProvider');
    }
    return context;
};
