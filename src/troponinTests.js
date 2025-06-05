// object for troponin test options 

export const troponinTests = {
    // very low, low, no 1hr delta, high, yes 1hr delta
    BeckmanCoulter: ["4", "5", "4", "50", "15"],
    Roche: ["5", "12", "3", "52", "5"],
    Abbott: ["4", "5", "2", "64", "6"],
    Siemens: ["3", "6", "3", "120", "12"],
    // maybe edit this universal trop i/t ones
    IT: ["0.04", "0.08", "-", "0.08", "-"],
}