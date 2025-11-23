import React from 'react';
import Icon, { icons } from 'app/components/elements/Icon';

const styles = {
    textAlign: 'center',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'minmax(80px, auto)',
};

const Grid = ({ children }) => <div style={styles}>{children}</div>;

class Benchmark extends React.Component {
    render() {
        return (
            <Grid>
                {icons.map(icon => (
                    <div key={'icon_' + icon}>
                        <Icon name={icon} size={'2x'} />
                        <p> {icon} </p>
                    </div>
                ))}
            </Grid>
        );
    }
}

module.exports = {
    path: '/benchmark',
    component: Benchmark,
};
