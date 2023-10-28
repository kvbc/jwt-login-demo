import FancyForm from "@/components/FancyForm";
import { useRouter } from "next/router";
import {
    BACKEND_PORT,
    LoginRequest,
    Response,
    verifyPassword,
    verifyUsername,
} from "nextjs-login-2-shared";

export default function Login() {
    const router = useRouter();

    return (
        <main className="h-screen flex flex-col justify-center items-center gap-8">
            <h1>Login</h1>
            <FancyForm
                fields={[
                    { name: "Username", required: true },
                    { name: "Password", inputType: "password", required: true },
                ]}
                onSubmit={async (fieldValues) => {
                    const [username, password] = fieldValues;

                    const usernameErr = verifyUsername(username);
                    if (usernameErr !== "") return usernameErr;
                    const passwordErr = verifyPassword(password);
                    if (passwordErr !== "") return passwordErr;

                    const err: string | undefined = await fetch(
                        `http://localhost:${BACKEND_PORT}/api/login`,
                        {
                            method: "POST",
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                username,
                                password,
                            } as LoginRequest),
                        }
                    ).then((res) => {
                        return res.json().then((data: Response) => {
                            const msg = `[${res.status}] ${res.statusText}${
                                data.msg ? `: ${data.msg}` : ""
                            }`;
                            if (data.errCode) {
                                console.error(msg);
                                return data.msg;
                            } else {
                                console.log(msg);
                                if (data.token)
                                    window.localStorage.setItem(
                                        "token",
                                        data.token
                                    );
                                else console.error("no token");
                            }
                        });
                    });
                    if (err) return err;

                    router.push("/");
                }}
            />
        </main>
    );
}
