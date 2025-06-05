// Button component
import { Link } from "@tanstack/react-router";

export default function Button(props) {
    const isStemiButton = props.text === "Use Institution Specific STEMI Protocol";
    
    const buttonContent = (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%',
            marginTop: 16
        }}>
            <button
                onClick = {props.onClick} 
                style={{
                    ...props.style,
                    margin: 0, // Remove any default margins
                    ...(isStemiButton && {
                        backgroundColor: "#ff0000",
                        color: "white",
                        border: "none",
                        padding: "20px 24px",
                        minHeight: "56px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        width: "100%",
                        maxWidth: "320px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        fontSize: "1.2rem",
                        fontWeight: "600",
                        lineHeight: "1.2",
                        boxSizing: "border-box",
                        transition: "all 0.2s ease-in-out",
                        animation: "stemiPulse 1.5s infinite"
                    })
                }}
                onMouseEnter={(e) => {
                    if (isStemiButton) {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.filter = "brightness(1.05)";
                    }
                }}
                onMouseLeave={(e) => {
                    if (isStemiButton) {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.filter = "brightness(1)";
                    }
                }}
            >
                <i style={{ color: isStemiButton ? "white" : "inherit", fontSize: "1.2em" }}>{props.image}</i>
                <span style={{ color: isStemiButton ? "white" : "inherit" }}>{props.text}</span>
            </button>
        </div>
    );

    return props.toPage ? (
        <Link to={props.toPage}>
            {buttonContent}
        </Link>
    ) : buttonContent;
}