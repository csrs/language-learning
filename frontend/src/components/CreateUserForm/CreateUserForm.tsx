import { useState, type FormEvent } from "react";
import { createUser } from "../../api/createUser";

export const CreateUserForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitButtonEnabled =
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createUser(username.trim(), email.trim(), password);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(`Error creating new user: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username: </label>
        <input
          className="border px-2 py-1 rounded disabled:bg-gray-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          id="username"
          name="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email">Email: </label>
        <input
          className="border px-2 py-1 rounded disabled:bg-gray-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password: </label>
        <input
          className="border px-2 py-1 rounded disabled:bg-gray-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          id="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded 
        disabled:text-black
         disabled:bg-gray-200 disabled:cursor-not-allowed"
        type="submit"
        disabled={!isSubmitButtonEnabled || isSubmitting}
      >
        Create new user
      </button>
    </form>
  );
};
