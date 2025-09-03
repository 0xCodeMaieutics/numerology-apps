const materialNumbers = Array.from({ length: 9 }, (_, i) => i + 1); // 1-9
const monthNumbers = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const yearNumbers = Array.from({ length: 2024 - 1900 + 1 }, (_, i) => i + 1900); // 1900-2024
const days = Array.from({ length: 31 }, (_, i) => i + 1); // 1-31

const masterNumbers = [11, 22, 33];

export const numerology = {
    calculateLifePath: (day: string, month: string, year: string) => {
        const [dayNumber, monthNumber, yearNumber] = [day, month, year].map(
            (part) => parseInt(part),
        );

        if (!dayNumber || !monthNumber || !yearNumber) {
            throw new Error('Invalid date');
        }

        if (!days.includes(dayNumber)) {
            throw new Error('Invalid day');
        }
        if (!monthNumbers.includes(monthNumber)) {
            throw new Error('Invalid month');
        }
        if (!yearNumbers.includes(yearNumber)) {
            throw new Error('Invalid year');
        }
        day = day.replace(/9/, '');
        month = month.replace(/9/, '');
        year = year.replace(/9/, '');

        let lifePathNumber = dayNumber + monthNumber + yearNumber;
        while (lifePathNumber > 9) {
            if (masterNumbers.includes(lifePathNumber)) {
                break;
            }
            lifePathNumber = lifePathNumber
                .toString()
                .split('')
                .reduce((acc, curr) => acc + parseInt(curr), 0);
        }
        if (![...materialNumbers, ...masterNumbers].includes(lifePathNumber)) {
            throw new Error('Invalid life path number');
        }
        return lifePathNumber;
    },
    calculateThePsychicNumber: (day: number) => {
        if (!days.includes(day)) {
            throw new Error('Invalid day');
        }

        let sum = day;
        while (sum > 9) {
            sum = sum
                .toString()
                .split('')
                .reduce((acc, curr) => acc + parseInt(curr), 0);
        }
        return sum;
    },

    isMasterNumber: (number: number) => {
        return masterNumbers.includes(number);
    }
};
