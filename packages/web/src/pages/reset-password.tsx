import { useState } from "react";

import { resetPassword } from "sdk";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div>
      <h1>Reset Password</h1>
      <p>
        You have successfully reset your password. You can now log in with your
        new password.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
          }
          resetPassword({ password }).then(() => {
            window.location.href = "/app";
          });
        }}
      >
        <div>
          <label>
            New Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Confirm Password:
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
        </div>
        <button>Reset</button>
      </form>
    </div>
  );
}
