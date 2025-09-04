import { DBQueries } from '@workspace/db';
import { format } from 'date-fns';

const Info = (props: { value: string; label: string }) => (
    <div>
        <span className="text-muted-foreground">{props.label}</span>{' '}
        <span className="font-medium">{props.value}</span>
    </div>
);

export const Infos = (props: {
    celebProfile: DBQueries['select']['celebrities'];
}) => {
    return (
        <div>
            <Info
                label="Date of birth:"
                value={format(
                    new Date(
                        props.celebProfile.birthYear,
                        props.celebProfile.birthMonth - 1,
                        props.celebProfile.birthDay,
                    ),
                    'dd LLL, yyyy',
                )}
            />
            {props.celebProfile.nationality ? (
                <Info
                    label="Nationality:"
                    value={props.celebProfile.nationality}
                />
            ) : null}
            {props.celebProfile.placeOfBirth ? (
                <Info
                    label="Place of Birth:"
                    value={props.celebProfile.placeOfBirth}
                />
            ) : null}
        </div>
    );
};
