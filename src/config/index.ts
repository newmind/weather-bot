require('dotenv').config();

export default () => ({
  weather: {
    apiKey: process.env.API_KEY || 'CMRJW4WT7V3QA5AOIGPBC',
  },
});
