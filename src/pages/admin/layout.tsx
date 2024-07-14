import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { BiLogOut } from "react-icons/bi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: sessionData, status } = useSession();

    useEffect(() => {
        if (status === "unauthenticated"){
            void signIn()
        }
    },[
        status
    ])

    const handleLogout = async () => {
        signOut({
            callbackUrl: "/admin/login"
        })
        .catch(console.error)
    };
    return (
        <>
        {
            <div className="flex h-screen overflow-hidden bg-utopia-admin-bg">
                <nav className="flex flex-col gap-4 overflow-hidden w-48 p-5 border-r border-r-slate-800">
                    <div className="flex items-center p-3">
                        <Link href="/"><Image src="/images/logo-utopia.png" alt="logo utopia"  height={48} width={48} /></Link>
                    </div>
                    <div className="grow overflow-auto">
                        <p className="text-slate-400 text-xs font-normal px-3">Menu</p>
                        <Link href="/admin/upcoming-events" className="block text-slate-400 font-bold py-2 px-3">Upcoming Events</Link>
                        <Link href="/admin/events" className="block text-slate-400 font-bold py-2 px-3">Events</Link>
                        <Link href="/admin/partners" className="block text-slate-400 font-bold py-2 px-3">Partners</Link>
                        <Link href="/admin/gallery" className="block text-slate-400 font-bold py-2 px-3">Gallery</Link>
                        {/*<Link href="/admin/settings" className="block text-slate-400 font-bold py-2 px-3">Settings</Link>*/}
                        {
                            sessionData?.user.role === "SUPER_ADMIN" ? <Link href="/admin/users" className="block text-slate-400 font-bold py-2 px-3">Users</Link> : ''
                        }
                    </div>
                    <div>
                        <button className="flex items-center gap-2 text-slate-400 text-sm font-bold w-full rounded transition hover:bg-slate-800" onClick={handleLogout}>
                            <BiLogOut />
                            Logout
                        </button>
                    </div>
                </nav>
                <main className="grow overflow-hidden">
                    {children}
                </main>
            </div>
        }
        </>
    )
}