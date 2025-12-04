import axios from 'axios';

const API_URL =  'http://localhost:5000/api/story/stories';

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