const SectionHeader = ({ children }) => {
    return (
        <h2 style={{ 
            fontSize: '1.15rem', 
            fontWeight: 600, 
            marginBottom: 8,
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: 0,
            color: '#111' 
        }}>
            {children}
        </h2>
    );
};

export default SectionHeader; 