import PropertyList from 'modules/segments/containers/form/PropertyList';
import { ISegment } from 'modules/segments/types';
import React from 'react';
import { OperatorList } from '../styles';

type Props = {
  segment: ISegment;
  contentType: string;
  index: number;
};

type State = {
  state: string;
};

class ConditionsList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { state: 'list' };
  }

  conditionsList = () => {
    const { segment, index, contentType } = this.props;
    const { conditions } = segment;

    if (!conditions && index === 0) {
      return <PropertyList contentType={contentType} />;
    }

    return <div>'asdsad'</div>;
  };

  renderContent = () => {
    const { state } = this.state;

    switch (state) {
      case 'list':
        return this.conditionsList();

      default:
        return this.conditionsList();
    }
  };

  render() {
    return <OperatorList>{this.renderContent()}</OperatorList>;
  }
}

export default ConditionsList;