import client from './client';

export const authApi = {
  login: async (email, password) => {
    const res = await client.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return res;
  },
  me: () => client.get('/api/auth/me'),
  createUser: (userData) => client.post('/api/auth/create-user', userData),
  changePassword: (oldPassword, newPassword) =>
    client.put('/api/auth/change-password', { oldPassword, newPassword })
};
