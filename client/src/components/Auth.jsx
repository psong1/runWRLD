import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { LOGIN_USER, REGISTER_USER } from "../utils/mutations";

export default function Auth({ onLoginSuccess }) {
  const [isRegistered, setIsRegistered] = useState(true);
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const [login, { error: loginError }] = useMutation(LOGIN_USER);
  const [register, { error: registerError }] = useMutation(REGISTER_USER);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const identifier = formState.email.trim();
      const isEmail = identifier.includes("@");

      if (isRegistered) {
        const { data } = await login({
          variables: {
            email: isEmail ? identifier : undefined,
            username: !isEmail ? identifier : undefined,
            password: formState.password,
          },
        });
        const { token } = data.login;
        localStorage.setItem("id_token", token);
      } else {
        const { data } = await register({ variables: { input: formState } });
        const { token } = data.register;
        localStorage.setItem("id_token", token);
      }
      onLoginSuccess();
    } catch (err) {
      console.error("Auth Error: ", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 uppercase tracking-tight">
          {isRegistered ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isRegistered && (
            <>
              <input
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                placeholder="Username"
                onChange={(e) =>
                  setFormState({ ...formState, username: e.target.value })
                }
              />
              <input
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                placeholder="First Name"
                onChange={(e) =>
                  setFormState({ ...formState, firstName: e.target.value })
                }
              />
              <input
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                placeholder="Last Name"
                onChange={(e) =>
                  setFormState({ ...formState, lastName: e.target.value })
                }
              />
            </>
          )}

          <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
            placeholder={isRegistered ? "Email or Username" : "Email"}
            onChange={(e) =>
              setFormState({ ...formState, email: e.target.value })
            }
          />
          <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
            placeholder="Password"
            onChange={(e) =>
              setFormState({ ...formState, password: e.target.value })
            }
          />
          <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors shadow-lg">
            {isRegistered ? "Login" : "Register"}
          </button>
        </form>

        {(loginError || registerError) && (
          <p className="text-red-600 text-xs mt-4 font-bold uppercase">
            Invalid credentials or user already exists
          </p>
        )}

        <button
          onClick={() => setIsRegistered(!isRegistered)}
          className="w-full mt-6 text-sm text-slate-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
        >
          {isRegistered
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
