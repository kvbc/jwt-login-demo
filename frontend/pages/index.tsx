import FancyButton from "@/components/FancyButton";
import assert from "assert";
import { useRouter } from "next/router";
import { BACKEND_PORT, Response } from "nextjs-login-2-shared";
import { useEffect, useState } from "react";

export default function Home() {
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const token = window.localStorage.getItem("token");
        console.log(`Token: ${token}`);
        if (token)
            fetch(`http://localhost:${BACKEND_PORT}/`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }).then((res) => {
                res.json().then((data: Response) => {
                    const msg = `[${res.status}] ${res.statusText}${
                        data.msg ? `: ${data.msg}` : ""
                    }`;
                    if (data.errCode) {
                        console.error(msg);
                    } else {
                        console.log(msg);
                        if (data.loggedIn) {
                            assert(data.username !== undefined);
                            setLoggedIn(true);
                            setUsername(data.username);
                        }
                    }
                });
            });
    }, []);

    function handleUsersClicked() {
        router.push("/users");
    }

    function handleLoginClicked() {
        router.push("/login");
    }

    function handleRegisterClicked() {
        router.push("/register");
    }

    function handleLogoutClicked() {
        window.localStorage.removeItem("token");
        setLoggedIn(false);
    }

    return (
        <main className="h-screen flex flex-col justify-center items-center gap-4">
            <h1>Home Page</h1>
            {loggedIn ? (
                <div className="flex flex-col justify-center items-center gap-4">
                    <div className="flex gap-1 justify-center">
                        Logged in as{" "}
                        <em>
                            <strong
                                style={
                                    username == "admin" ? { color: "red" } : {}
                                }
                            >
                                {username}
                            </strong>
                        </em>
                    </div>
                    <p className="w-2/3 text-center">
                        Tokens expire in 60 seconds, which means you should
                        automatically be logged out after 1 minute
                        <p className="text-center text-slate-500">
                            (after refreshing the page)
                        </p>
                    </p>
                </div>
            ) : (
                <>
                    Not logged in
                    {/* <div className="text-center">
                        Log in as{" "}
                        <strong>
                            <em>admin</em>
                        </strong>{" "}
                        with password{" "}
                        <strong>
                            <em>admin</em>
                        </strong>
                        <br />
                        to check out more features
                    </div> */}
                </>
            )}
            {loggedIn ? (
                <>
                    {username == "admin" && (
                        <FancyButton onClick={handleUsersClicked}>
                            Users
                        </FancyButton>
                    )}
                    <FancyButton
                        onClick={handleLogoutClicked}
                        colorFrom="rgb(249 115 22)" // orange-500
                        colorTo="rgb(239 68 68)" // red-500
                    >
                        Log Out
                    </FancyButton>
                </>
            ) : (
                <>
                    <FancyButton onClick={handleLoginClicked}>
                        Login
                    </FancyButton>
                    <FancyButton onClick={handleRegisterClicked}>
                        Register
                    </FancyButton>
                </>
            )}
        </main>
    );
}
