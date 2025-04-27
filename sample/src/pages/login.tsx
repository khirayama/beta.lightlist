import { useState } from "react";

import { login } from "../services";

export default function LoginPage() {
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password");

  return (
    <div>
      <h1>Login</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login({
            email,
            password,
          })
            .then((r) => {
              window.location.href = "/app";
            })
            .catch((err) => {
              console.log(err);
            });
        }}
      >
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
        <div>
          <button>Submit</button>
        </div>
      </form>
      <div>
        <a href="/register">Register</a>
      </div>
      <div>
        <a href="/forget-password">Forgot password</a>
      </div>
    </div>
  );
}
