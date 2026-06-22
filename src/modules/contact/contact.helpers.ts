const MILLISECONDS_IN_SECOND = 1000;

export function calculateAgeFromBirthTimestamp(
    birthTimestamp: number,
    currentDate = new Date(),
): number | null {
    if (!Number.isFinite(birthTimestamp) || birthTimestamp <= 0) {
        return null;
    }

    const birthDate = new Date(birthTimestamp * MILLISECONDS_IN_SECOND);

    if (Number.isNaN(birthDate.getTime())) {
        return null;
    }

    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const hasBirthdayPassed =
        currentDate.getMonth() > birthDate.getMonth() ||
        (currentDate.getMonth() === birthDate.getMonth() &&
            currentDate.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassed) {
        age -= 1;
    }

    return age >= 0 ? age : null;
}
