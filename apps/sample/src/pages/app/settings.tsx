import { useState, useEffect, useSyncExternalStore, FormEvent } from "react";

import {
  setSessionStorage,
  init,
  updatePreferences,
  updateEmail,
  updatePassword,
  logout,
  deleteUser,
  loadSession,
  store,
  type Preferences,
} from "sdk";

/* Features
 * [x] DisplayNameの更新
 * [x] Themeの変更
 * [x] Languageの変更
 * [x] AutoSortの変更
 * [x] Emailの更新
 * [x] Passwordの更新
 * [x] Logoutの実装
 * [x] DeleteAccountの実装
 */

setSessionStorage("web");

export default function SettingsPage() {
  const state = useSyncExternalStore(
    store.subscribe,
    () => store.data,
    () => store.data
  );

  const [displayName, setDisplayName] = useState<string>(
    state.preferences.displayName || ""
  );
  const [email, setEmail] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>("");

  useEffect(() => {
    setEmail(loadSession().user.email);
    init().then((res) => {
      setDisplayName(res.preferences.displayName);
    });
  }, []);

  return (
    <div>
      <a href="/app">App</a>
      <h1>Settings</h1>
      <section>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updatePreferences({ displayName });
          }}
        >
          <h2>Display Name</h2>
          <input
            type="text"
            value={displayName}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              const displayName = target.value;
              setDisplayName(displayName);
            }}
          />
          <button>Save</button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateEmail({ email });
          }}
        >
          <h2>Email</h2>
          <input
            type="email"
            value={email}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              const email = target.value;
              setEmail(email);
            }}
          />
          <button>Save</button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newPassword !== newPasswordConfirm) {
              alert("Password and password confirmation do not match");
              return;
            }
            if (newPassword === oldPassword) {
              alert("No change");
              return;
            }
            updatePassword({ currentPassword: oldPassword, newPassword });
          }}
        >
          <h2>Password</h2>
          <h3>Old Password</h3>
          <input
            type="password"
            value={oldPassword}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              const password = target.value;
              setOldPassword(password);
            }}
          />
          <h3>New Password</h3>
          <input
            type="password"
            value={newPassword}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              const password = target.value;
              setNewPassword(password);
            }}
          />
          <h3>Confirm new password</h3>
          <input
            type="password"
            value={newPasswordConfirm}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              const newPasswordConfirm = target.value;
              setNewPasswordConfirm(newPasswordConfirm);
            }}
          />
          <p>{newPassword !== newPasswordConfirm && "Does not match"}</p>
          <button>Save</button>
        </form>

        <div>
          <h2>Appearance</h2>
          <select
            value={state.preferences.theme}
            onChange={(e: FormEvent<HTMLSelectElement>) => {
              updatePreferences({
                theme: e.currentTarget.value as Preferences["theme"],
              });
            }}
          >
            {["SYSTEM", "LIGHT", "DARK"].map((theme) => {
              return (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <h2>Lang</h2>
          <select
            value={state.preferences.lang}
            onChange={(e: FormEvent<HTMLSelectElement>) => {
              updatePreferences({
                lang: e.currentTarget.value as Preferences["lang"],
              });
            }}
          >
            {["JA", "EN"].map((lang) => {
              return (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <h2>Auto Sort</h2>
          <input
            type="checkbox"
            checked={state.preferences.autoSort}
            onChange={(e) => {
              updatePreferences({
                autoSort: e.currentTarget.checked,
              });
            }}
          />
        </div>

        <div>
          <h2>Insert Posision</h2>
          <select
            value={state.preferences.taskInsertPosition}
            onChange={(e: FormEvent<HTMLSelectElement>) => {
              updatePreferences({
                taskInsertPosition: e.currentTarget
                  .value as Preferences["taskInsertPosition"],
              });
            }}
          >
            {["TOP", "BOTTOM"].map((pos) => {
              return (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <button
            onClick={() => {
              logout().then(() => {
                window.location.href = "/";
              });
            }}
          >
            Log Out
          </button>
        </div>

        <div>
          <button
            onClick={() => {
              deleteUser().then(() => {
                window.location.href = "/";
              });
            }}
          >
            Delete User
          </button>
        </div>
      </section>
    </div>
  );
}
