// The page that occurs when the ecg results in stemi

import { useState } from "react";
import "./App.css"; // CSS for styling

import Button from "./components/Button";

export default function stemiOutput() {
    // this will export a stationary page with a back button to the AcuteOne page

    return ( 
        <div>
            <header className="header">
                <h1>SCiPP Chest Pain Pathway</h1>
            </header>

            <div className="container">
                <h4>Acute Chest Pain</h4>
                <h5>Please refer to institutional STEMI pathways. 
                    SciPP pathway not intended to guide STEMI management.</h5>
            </div>

            <div className = "footer"> 
                <Button 
                    text="Back"
                    // this is where the link / routing will go
                    />
            </div>

        </div>
    )


}