// @flow
import React from 'react';
import PropTypes from 'prop-types'
import { getClasses } from './utils';

const FairyContainerColumnBody = (props) => {
  const classes = [
    "body"
  ];

  if (props.className) {
    classes.push(props.className)
  }

  return (
    <div className={getClasses(classes)}>
      {props.children}
    </div>);
};

FairyContainerColumnBody.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

FairyContainerColumnBody.defaultProps = {
  children: [],
  className: ""
};

export default FairyContainerColumnBody;