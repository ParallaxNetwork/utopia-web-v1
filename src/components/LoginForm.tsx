import {signIn} from "next-auth/react";
import React, {type FormEventHandler, useState} from "react";
import Image from "next/image";

export default function LoginForm() {
    const [userInfo, setUserInfo] = useState({email: "", password: ""});

    const [alert, setAlert] = useState<{
        type: 'default' | 'destructive',
        message: string
    }>({
        type: 'default',
        message: ''
    });

    const showAlert = (type: 'default' | 'destructive', message: string) => {
        setAlert({
            type,
            message,
        });

        setTimeout(() => {
            setAlert({
                type: 'default',
                message: '',
            });
        }, 1500);
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        // await signIn('credentials', {
        //     email: userInfo.email,
        //     password: userInfo.password,
        //     callbackUrl: '/admin'
        // })

        const res = await signIn('credentials', {
            email: userInfo.email,
            password: userInfo.password,
            redirect: false
        })

        if (res?.ok) {
            console.log("res: ", res);
            await signIn('credentials', {
                email: userInfo.email,
                password: userInfo.password,
                callbackUrl: '/admin'
            })
        } else {
            showAlert('destructive', res?.error ?? "");
        }


    };

    return (
        <div className="sm:p-3 mt-5 text-white shadow-md text-center sm:w-full w-full md:w-1/3">
           <div className="w-full justify-center mb-5">
               <Image src="/images/logo-utopia.png" className="m-auto" alt="logo utopia"  height={56} width={56} />
           </div>
            <form className="border-utopia-admin-border border border-slate-900 w-full p-5 rounded-lg" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-slate-400 text-left"
                    >
                        Email
                    </label>
                    <input
                        value={userInfo.email}
                        onChange={({target}) =>
                            setUserInfo({...userInfo, email: target.value})
                        }
                        type="email"
                        className="block px-2 py-2 mt-2 border rounded-md text-center text-black focus:border-slate-900 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40 w-full"
                        autoComplete="nope"
                        placeholder="Enter Email"
                    />
                </div>
                <div className="mb-4 w-full">
                    <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-slate-400 text-left"
                    >
                        Password
                    </label>
                    <input
                        value={userInfo.password}
                        onChange={({target}) =>
                            setUserInfo({...userInfo, password: target.value})
                        }
                        type="password"
                        className="block px-2 py-2 mt-2 border rounded-md text-center focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40 text-black w-full"
                        autoComplete="nope"
                        placeholder="********"
                    />
                </div>
                <div className="mt-2">
                    <button
                        className="px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-slate-600 rounded-md hover:bg-slate-800 focus:outline-none focus:bg-slate-800"
                        type="submit"
                    >
                        Login
                    </button>
                </div>
            </form>
        </div>
    )
}