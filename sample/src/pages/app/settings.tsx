import { useState, useEffect, useSyncExternalStore, FormEvent } from "react";

import { init } from "../../sdk/actions";
import { store } from "../../sdk/store";
import { setSessionStorage } from "../../sdk/session";
import { updatePreferences, updateProfile } from "../../sdk/actions";

/* Features
 * [x] DisplayNameの更新
 * [ ] Emailの更新
 * [ ] Passwordの更新
 * [ ] Themeの変更
 * [ ] Languageの変更
 * [ ] AutoSortの変更
 * [ ] Logoutの実装
 * [ ] DeleteAccountの実装
 */

setSessionStorage("web");

export default function SettingsPage() {
  const state = useSyncExternalStore(
    store.subscribe,
    () => store.data,
    () => store.data
  );

  const [displayName, setDisplayName] = useState<string>(
    state.profile.displayName
  );
  const [email, setEmail] = useState<string>(state.profile.email);
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");

  useEffect(() => {
    init().then((res) => {
      setDisplayName(res.profile.displayName);
      setEmail(res.profile.email);
    });
  }, []);

  return (
    <div>
      <h1>Settings</h1>
      <section>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateProfile({ displayName });
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
            console.log(email);
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
            if (password !== passwordConfirm) {
              alert("Password and password confirmation do not match");
              return;
            }
            console.log(password);
          }}
        >
          <h2>Password</h2>
          <input
            type="password"
            value={password}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              const password = target.value;
              setPassword(password);
            }}
          />
          <h2>Password Confirmation</h2>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              const passwordConfirm = target.value;
              setPasswordConfirm(passwordConfirm);
            }}
          />
          <p>{password !== passwordConfirm && "Does not match"}</p>
          <button>Save</button>
        </form>

        <div>
          <h2>Appearance</h2>
          <select
            value={state.preferences.theme}
            onChange={(e: FormEvent<HTMLSelectElement>) => {
              const target = e.target as HTMLSelectElement;
              const selectedTheme = target.value;
              console.log(selectedTheme);
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
              const target = e.target as HTMLSelectElement;
              const selectedLang = target.value;
              console.log(selectedLang);
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
              const target = e.target as HTMLInputElement;
              const isChecked = target.checked;
              console.log(isChecked);
            }}
          />
        </div>
      </section>
    </div>
  );
}
