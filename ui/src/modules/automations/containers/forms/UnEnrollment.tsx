import React from 'react';
import UnEnrollment from 'modules/automations/components/forms/UnEnrollment';

type Props = {};

const UnEnrollmentContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <UnEnrollment {...extendedProps} />;
};

export default UnEnrollmentContainer;