import { SQLDBQueries } from '@workspace/db/sql';
import { format } from 'date-fns';

const Info = (props: { value: string; label: string }) => (
    <div>
        <span className="text-muted-foreground font-light">{props.label}</span>{' '}
        <span className="font-semibold">{props.value}</span>
    </div>
);

export const Infos = (props: {
    celebProfile: SQLDBQueries['select']['celebrities'];
}) => {
    return (
        <div>
            <Info
                label="Born on the"
                value={format(
                    new Date(
                        props.celebProfile.birthYear,
                        props.celebProfile.birthMonth - 1,
                        props.celebProfile.birthDay,
                    ),
                    'do LLL., yyyy',
                )}
            />
            {props.celebProfile.nationality ? (
                <Info
                    label="Nationality is"
                    value={props.celebProfile.nationality}
                />
            ) : null}
            {props.celebProfile.placeOfBirth ? (
                <Info label="Born in" value={props.celebProfile.placeOfBirth} />
            ) : null}
        </div>
    );
};
