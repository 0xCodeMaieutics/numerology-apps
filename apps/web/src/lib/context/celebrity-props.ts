'use client'
import { SQLDBQueries } from '@workspace/db/sql';
import { createContext, useContext } from 'react';

type CelebrityPropsType = {
    celebProfile: SQLDBQueries['select']['celebrities'];
};

export const CelebrityProps = createContext<CelebrityPropsType>({
    celebProfile: {} as SQLDBQueries['select']['celebrities'],
});

export const useCelebrityProps = () => {
    const context = useContext(CelebrityProps);
    if (!context)
        throw new Error(
            'useCelebrityProps must be used within a CelebrityProps.Provider',
        );
    return context;
};
