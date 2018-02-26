import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { router } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Properties } from '../components';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../constants';

const PropertiesContainer = (props, context) => {
  const {
    fieldsGroupsQuery,
    history,
    fieldsGroupsRemove,
    fieldsRemove,
    fieldsGroupsUpdateVisible,
    fieldsUpdateVisible
  } = props;
  const { currentUser } = context;

  if (!router.getParam(history, 'type')) {
    router.setParams(history, { type: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER });
  }

  const removePropertyGroup = ({ _id }) => {
    fieldsGroupsRemove({
      variables: { _id }
    })
      .then(() => {
        Alert.success('Successfully Removed');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const removeProperty = ({ _id }) => {
    fieldsRemove({
      variables: { _id }
    })
      .then(() => {
        Alert.success('Succesfully Removed');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatePropertyVisible = ({ _id, visible }) => {
    fieldsUpdateVisible({
      variables: { _id, visible, lastUpdatedBy: currentUser._id }
    })
      .then(() => {
        Alert.success('Successfully Updated');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatePropertyGroupVisible = ({ _id, visible }) => {
    fieldsGroupsUpdateVisible({
      variables: { _id, visible, lastUpdatedBy: currentUser._id }
    })
      .then(() => {
        Alert.success('Successfully Updated');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const currentType = router.getParam(history, 'type');

  const updatedProps = {
    ...props,
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || [],
    currentType,
    removePropertyGroup,
    removeProperty,
    updatePropertyVisible,
    updatePropertyGroupVisible
  };

  return <Properties {...updatedProps} />;
};

PropertiesContainer.propTypes = {
  queryParams: PropTypes.object,
  fieldsGroupsQuery: PropTypes.object.isRequired,
  history: PropTypes.object,
  fieldsGroupsRemove: PropTypes.func.isRequired,
  fieldsRemove: PropTypes.func.isRequired,
  fieldsGroupsUpdateVisible: PropTypes.func.isRequired,
  fieldsUpdateVisible: PropTypes.func.isRequired
};

PropertiesContainer.contextTypes = {
  currentUser: PropTypes.object
};

const options = ({ queryParams }) => ({
  refetchQueries: [
    {
      query: gql`${queries.fieldsGroups}`,
      variables: { contentType: queryParams.type }
    }
  ]
});

export default compose(
  graphql(gql(queries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: ({ queryParams }) => ({
      variables: {
        contentType: queryParams.type
      }
    })
  }),
  graphql(gql(mutations.fieldsGroupsRemove), {
    name: 'fieldsGroupsRemove',
    options
  }),
  graphql(gql(mutations.fieldsRemove), {
    name: 'fieldsRemove',
    options
  }),
  graphql(gql(mutations.fieldsUpdateVisible), {
    name: 'fieldsUpdateVisible',
    options
  }),
  graphql(gql(mutations.fieldsGroupsUpdateVisible), {
    name: 'fieldsGroupsUpdateVisible',
    options
  })
)(withRouter(PropertiesContainer));
