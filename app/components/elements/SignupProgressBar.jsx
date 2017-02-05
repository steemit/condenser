import React from 'react';

export default function SignupProgressBar({steps, current}) {
    const lis = steps.map((s, i) => {
        const cn = i + 1 < current ? 'done' : (i + 1 == current ? 'current' : '');
        return <li className={cn} key={i + 1}>{s}</li>
    });
    return <div className="SignupProgressBar__container expanded row">
        <div className="column">
            <div className="SignupProgressBar">
                <ul>
                    {lis}
                </ul>
            </div>
        </div>
    </div>;
}
