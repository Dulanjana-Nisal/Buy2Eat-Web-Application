// Mask Email
function maskEmail(email) {
    const [localPart, domain] = email.split('@');
    const domainParts = domain.split('.');
    const domainName = domainParts[0];
    const domainExt = domainParts.slice(1).join('.');

    const maskedLocal = maskString(localPart);
    const maskedDomain = maskString(domainName);

    return `${maskedLocal}@${maskedDomain}.${domainExt}`;
}

// Mask String
function maskString(str) {
    if (str.length <= 2) return str[0] + '*'.repeat(str.length - 1);
    if (str.length === 1) return '*';
    if (str.length === 2) return str[0] + '*';
    const visibleStart = str.slice(0, 3);
    const visibleEnd = str.slice(-2);
    const stars = '*'.repeat(Math.max(str.length - 3, 3)); 
    return visibleStart + stars + visibleEnd;
}

module.exports = maskEmail;