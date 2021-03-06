import axios from 'axios';
import { browserHistory } from 'react-router';
import actionTypes from '../actionTypes';

export default (userid) => {
  const token = window.localStorage.getItem('token');
  return function (dispatch) {
    return axios.delete(`/api/v1/users/${userid}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        dispatch({
          type: actionTypes.USER_DELETED,
          userid,
          status: 'success'
        });
        browserHistory.push('/users');
      }).catch((err) => {
        dispatch({
          type: actionTypes.USER_DELETION_FAILED,
          status: 'failed',
          error: err.message
        });
      });
  };
};

