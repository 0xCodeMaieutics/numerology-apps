import {
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
} from 'date-fns';

export const dates = {
    formatCommentDate: (date: Date, now: Date = new Date()): string => {
        const minutesDiff = differenceInMinutes(now, date);
        const hoursDiff = differenceInHours(now, date);
        const daysDiff = differenceInDays(now, date);
        if (minutesDiff < 1) return 'now';
        if (minutesDiff < 60)
            return `${minutesDiff} minute${minutesDiff === 1 ? '' : 's'} ago`;
        if (hoursDiff < 24)
            return `${hoursDiff} hour${hoursDiff === 1 ? '' : 's'} ago`;
        return `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago`;
    },
};
