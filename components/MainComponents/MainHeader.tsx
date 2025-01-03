// Copyright 2024 justin
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
"use client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ConnectButton } from "web3uikit"
import { Container } from "./Container"
const imageLoader = ({ src, width, quality }: any) => {
    return `../tokamaklogo.png`
}

export function MainHeader() {
    const [rerender, setRerender] = useState(false)
    useEffect(() => {
        setRerender(true)
    }, [])
    return (
        <header className="py-10">
            <Container>
                <nav className="relative z-50 flex justify-between">
                    <div className="flex items-center md:gap-x-12">
                        <div className="h-10 w-auto">
                            <Link href="/" key="5">
                                <a className="flex flex-row items-center">
                                    <div className="min-w-fit mt-0.5">
                                        <Image
                                            src="../tokamaklogo.png"
                                            loader={imageLoader}
                                            width={45}
                                            height={35}
                                            alt="Picture of the author"
                                        />
                                    </div>
                                    <div className="pl-2 font-bold text-xl m-auto">
                                        <span className="hidden lg:inline whitespace-nowrap">
                                            Commit-Reveal2 Simple Demo
                                        </span>
                                    </div>
                                </a>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-3 md:gap-x-8 mt-0.5">
                        <Link href="/how-it-works">
                            <a className="rounded-lg font-semibold underline m-auto text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                                How It Works
                            </a>
                        </Link>
                        <Link href="/run-a-node">
                            <a className="rounded-lg font-semibold underline m-auto text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                                Run a Node
                            </a>
                        </Link>
                        <div className="md:block">
                            <ConnectButton moralisAuth={false} />
                        </div>
                        <div className="-mr-1 md:hidden">
                            {/* {rerender ? <MobileNavigation /> : <></>} */}
                        </div>
                    </div>
                </nav>
            </Container>
        </header>
    )
}
