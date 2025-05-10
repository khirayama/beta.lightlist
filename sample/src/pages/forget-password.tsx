import { useState } from "react";

import { sendPasswordResetRequest } from "../sdk/actions";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const redirectTo = `${window.location.origin}/reset-password`;
          sendPasswordResetRequest({
            email,
            redirectTo,
          });
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <button>Send</button>
      </form>
    </div>
  );
}
