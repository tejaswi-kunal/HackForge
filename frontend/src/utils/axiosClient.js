import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://hackforge-62y1.onrender.com',
  withCredentials:true,
  headers: { 'Content-Type': 'application/json' }
});
// we can easily reuest using additional url and data we want to send
// axiosClient.post('user/register',data)

export default axiosClient;