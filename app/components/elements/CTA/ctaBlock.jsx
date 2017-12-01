import React, {PropTypes} from "react";

export default class CTABlock extends React.Component {
    render() {
        return (
            <div className='ctablock'>
            <div className='row'>
                <div className=' column large-2 medium-2 small-2'>
                <p className='right'><img
                        className='urerpic'
                        src='https://imgp.golos.io/64x64/https://images.golos.io/DQmQh3z15LkKqHcBUUfZedzed6Y263rvzJ9F7gn3beUgXrR/vv_ava.jpg'/></p>
                    
                </div>
                <div className='column large-7 medium-7 small-7'>
                    <p className='left cta-block-text'>
                        «Считаем «Голос» перспективным проектом и постараемся привлечь на него как можно
                        больше пользователей»
                    </p>
                </div>
                <div className='column large-3 medium-3 small-3'>
                    <a href="/create_account" className="button">Создать аккаунт</a>
                </div>
            </div>
            </div>
        )
    }
}