import "./App.css";
import { useState } from "react";
import axiosInstance from "./services/axsiox";

const getInfoUser = async ({ userId }: any) => {
  try {
    const response = await axiosInstance({
      method: 'GET',
      url: `/api/test/user`,
      params: { userId },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    return error.response?.data;
  }
};

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post(
        '/api/auth/signin',
        {
          username,
          password,
        },
        {
          withCredentials: true,
        },
      );

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
      setMessage(`Login successful!`);
    } catch (error) {
      setMessage('Login failed! Please check your username and password.');
    }
  };

  const getUserInfo = async () => {
    try {
      const response = await getInfoUser({ userId: '6686283658b8adce38ca49d7' });
      setUserInfo(response);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/refreshtoken', { withCredentials: true });
      axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.accessToken;
      setMessage('Token refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col w-screen h-screen justify-center items-center gap-6">
        <h2>Login Form</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-solid"
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-solid"
            />
          </div>
          <button type="submit" className="border border-solid px-6 py-2 mt-5">
            Login
          </button>
        </form>
        {message && <p>{message}</p>}

        {userInfo && (
          <div>
            <h2>User Information</h2>
            <p>ID: {userInfo._id}</p>
            <p>Username: {userInfo.username}</p>
            <p>Email: {userInfo.email}</p>
          </div>
        )}

        <button onClick={getUserInfo} className="border border-solid px-6 py-2 mt-5">
          Get User Info
        </button>
        <button onClick={refreshToken} className="border border-solid px-6 py-2 mt-5">
          Refresh Token
        </button>
      </div>
    </div>
  );
}

export default App;
