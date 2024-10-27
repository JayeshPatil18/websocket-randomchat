// randomStringGenerator.ts

function generateRandomString(): string {
    const part1 = generateRandomChars(6);  // 6 alphanumeric characters
    const part2 = generateRandomChars(6);  // 6 alphanumeric characters
    const part3 = generateRandomChars(8);  // 8 alphanumeric characters
    const suffix = generateRandomChars(3, true); // 3 uppercase letters + optional number
    
    return `${part1}${part2}${part3}${suffix}`;
}

function generateRandomChars(length: number, isSuffix: boolean = false): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return isSuffix ? result.slice(0, 3) + Math.floor(Math.random() * 10) : result;
}

// Export the function
export default generateRandomString;
