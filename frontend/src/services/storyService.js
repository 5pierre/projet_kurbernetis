import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;
// On pointe vers /api/story/stories sans port 5000
const API_URL =  `${BASE_URL}/api/story/stories`;

export const getStories = async () => {
  try {
    const response = await axios.get(API_URL);
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const postStories = async (story) => {
  try {
      const response = await axios.post(API_URL, story, {
          withCredentials: true 
      });
      return response;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};