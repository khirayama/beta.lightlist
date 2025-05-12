import { useState } from "react";

import { register } from "sdk";

export default function RegisterPage() {
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password");

  return (
    <div>
      <h1>Register</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          register({
            email,
            password,
          })
            .then(() => {
              window.location.href = "/app";
            })
            .catch((err) => {
              if (err.message === "User already registered") {
                window.location.href = "/login";
              }
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
        <a href="/login">Log In</a>
      </div>
    </div>
  );
}
