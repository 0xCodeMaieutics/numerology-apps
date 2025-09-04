export const getMasterNumberTooltipElement = (lifePath: number) => {
    if (lifePath === 22 || lifePath === 33)
        return (
            <span>
                {lifePath} is a rare{' '}
                <span className="font-semibold">Master Number!</span>
            </span>
        );
    else if (lifePath === 11)
        return (
            <span>
                {lifePath} is a{' '}
                <span className="font-semibold">Master Number!</span>
            </span>
        );
    return null;
};
