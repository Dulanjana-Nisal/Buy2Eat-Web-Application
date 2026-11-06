const { z } = require('zod');
// Mask Email
function maskEmail(email) {

    // check email using zod
    const emailSchema = z.string().email().min(3);
    const result = emailSchema.safeParse(email || undefined)

    // check email is exist
    if(!result.success){
        return false;
    }

    let [localPart, domain] = email.split('@');

    // check if local and domain part have enough characters
    if(localPart?.length < 6 || domain?.length < 6){
        localPart = "******";
        domain = "******.***";
    }

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