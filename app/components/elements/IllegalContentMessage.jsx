import React from 'react';
import tt from 'counterpart';
import { TERMS_OF_SERVICE_URL } from 'app/client_config';

const IllegalContentMessage = () =>  {
	return (
		<div className="row">
			<div className="column small-12">
				{tt('illegal_content.unavailable')}&nbsp;
				{tt('illegal_content.due_to_illegal_content')}&nbsp;
				<a href={TERMS_OF_SERVICE_URL} target="_blank" rel="nofollow">
					{tt('illegal_content.terms_of_service')}
				</a>
				{tt('illegal_content.terms_of_service_section')}
			</div>
		</div>
	)
}

export default IllegalContentMessage
