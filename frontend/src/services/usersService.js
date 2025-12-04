import axios from 'axios';

const API_URL =  'http://localhost:4000/api/auth/users';

export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL, {
      withCredentials: true
    });
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      withCredentials: true
    });
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true
    });
    return response;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};